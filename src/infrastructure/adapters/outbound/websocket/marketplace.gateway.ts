/*
https://docs.nestjs.com/websockets/gateways#gateways
*/

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

interface JoinMarketplaceDto {
  financieraId: string;
}

// Espejo de los tipos del frontend
export interface FacturaMarketplace {
  facturaId: string;
  folio: string;
  razonSocial: string;
  rutDeudor: string;
  monto: number;
  fechaVencimiento: string;
  diasRestantes: number;
  cantidadOfertas: number;
  tasaMinima: number | null;
  esPreferido: boolean;
  tieneOfertaPropia: boolean;
  publicadoEn: string;
}

// ─── Gateway ──────────────────────────────────────────────────────────────────

@WebSocketGateway({
  namespace: '/marketplace',
  cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') ?? false },
})
export class MarketplaceGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server!: Server;

  private readonly logger = new Logger(MarketplaceGateway.name);

  afterInit() {
    this.logger.log('MarketplaceGateway activo en /marketplace');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Cliente desconectado: ${client.id}`);
    // socket.io limpia las salas automáticamente al desconectar
  }

  // ── Sala de preferidos ──────────────────────────────────────────────────────

  @SubscribeMessage('join:marketplace:preferidos')
  async handleJoinPreferidos(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinMarketplaceDto,
  ) {
    const room = `marketplace:preferidos:${dto.financieraId}`;
    await client.join(room);
    this.logger.debug(`${client.id} se unió a ${room}`);
  }

  @SubscribeMessage('leave:marketplace:preferidos')
  async handleLeavePreferidos(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinMarketplaceDto,
  ) {
    const room = `marketplace:preferidos:${dto.financieraId}`;
    await client.leave(room);
  }

  // ── Sala de nuevos (clientes externos) ─────────────────────────────────────

  @SubscribeMessage('join:marketplace:nuevos')
  async handleJoinNuevos(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinMarketplaceDto,
  ) {
    await client.join(`marketplace:nuevos:${dto.financieraId}`);
  }

  @SubscribeMessage('leave:marketplace:nuevos')
  async handleLeaveNuevos(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinMarketplaceDto,
  ) {
    await client.leave(`marketplace:nuevos:${dto.financieraId}`);
  }

  // ── Métodos que llaman los servicios de negocio (no desde el cliente) ───────

  /**
   * Factura publicada: se emite solo a financieras que tienen relación con
   * ese deudor (sala preferidos). El servicio de negocio ya resolvió la lista.
   */
  emitFacturaPublicada(financieraIds: string[], factura: FacturaMarketplace) {
    for (const id of financieraIds) {
      this.server
        .to(`marketplace:preferidos:${id}`)
        .emit('marketplace:preferidos', {
          event: 'factura.publicada',
          factura,
        });
    }
  }

  /**
   * Factura nueva de cliente sin historial: metadata ligera al canal de nuevos.
   * financierasExcluidas son las que ya recibieron el evento por preferidos.
   */
  emitFacturaNuevaExterna(
    allFinancieraIds: string[],
    financierasExcluidas: string[],
    payload: { facturaId: string; razonSocial: string; monto: number },
  ) {
    const excluidas = new Set(financierasExcluidas);
    for (const id of allFinancieraIds) {
      if (excluidas.has(id)) { continue; }
      this.server
        .to(`marketplace:nuevos:${id}`)
        .emit('marketplace:nuevos', {
          event: 'factura.nueva.externa',
          ...payload,
        });
    }
  }

  /** Factura retirada: se avisa a ambas salas */
  emitFacturaRetirada(facturaId: string, financieraId: string) {
    const payload = { event: 'factura.retirada', facturaId };
    this.server.to(`marketplace:preferidos:${financieraId}`).emit('marketplace:preferidos', payload);
    this.server.to(`marketplace:nuevos:${financieraId}`).emit('marketplace:nuevos', payload);
  }

  /** Cambio en ofertas: se notifica a la sala preferidos de la financiera dueña */
  emitCambioOfertas(
    financieraId: string,
    facturaId: string,
    cantidadOfertas: number,
    tasaMinima: number | null,
    esModificacion: boolean,
  ) {
    this.server
      .to(`marketplace:preferidos:${financieraId}`)
      .emit('marketplace:preferidos', {
        event: esModificacion ? 'oferta.modificada' : 'oferta.nueva',
        facturaId,
        cantidadOfertas,
        tasaMinima,
      });
  }

  /** Oferta aceptada: solo a la financiera que ofertó */
  emitOfertaAceptada(financieraId: string, facturaId: string) {
    this.server
      .to(`marketplace:preferidos:${financieraId}`)
      .emit('marketplace:preferidos', {
        event: 'mi.oferta.aceptada',
        facturaId,
      });
  }
}