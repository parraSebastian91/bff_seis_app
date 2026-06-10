import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { Observable, Subject, interval, map, merge } from 'rxjs';

export type MarketplaceScope = 'preferidos' | 'nuevos' | 'all';

export interface MarketplaceSsePayload {
  event: string;
  [key: string]: unknown;
}

@Injectable()
export class MarketplaceSseService {
  private readonly logger = new Logger(MarketplaceSseService.name);
  private readonly streams = new Map<string, Subject<MarketplaceSsePayload>>();

  stream(scope: MarketplaceScope, financieraId?: string): Observable<MessageEvent> {
    const channel = this.getChannelKey(scope, financieraId);
    const channel$ = this.getOrCreateStream(channel).asObservable().pipe(
      map((payload) => ({
        type: payload.event,
        data: payload,
      })),
    );

    const heartbeat$ = interval(25000).pipe(
      map(() => ({
        type: 'heartbeat',
        data: { event: 'heartbeat', ts: new Date().toISOString() },
      })),
    );

    this.logger.debug(`SSE subscriber connected | channel=${channel}`);
    return merge(channel$, heartbeat$);
  }

  emitFacturaPublicada(financieraIds: string[], factura: Record<string, unknown>): void {
    for (const financieraId of financieraIds) {
      this.publish('preferidos', financieraId, {
        event: 'factura.publicada',
        factura,
      });
    }
  }

  emitFacturaNuevaExterna(
    allFinancieraIds: string[],
    financierasExcluidas: string[],
    payload: { facturaId: string; razonSocial: string; monto: number },
  ): void {
    const excluded = new Set(financierasExcluidas);
    for (const financieraId of allFinancieraIds) {
      if (excluded.has(financieraId)) {
        continue;
      }

      this.publish('nuevos', financieraId, {
        event: 'factura.nueva.externa',
        ...payload,
      });
    }
  }

  emitFacturaRetirada(facturaId: string, financieraId: string): void {
    const payload = { event: 'factura.retirada', facturaId };
    this.publish('preferidos', financieraId, payload);
    this.publish('nuevos', financieraId, payload);
  }

  emitCambioOfertas(
    financieraId: string,
    facturaId: string,
    cantidadOfertas: number,
    tasaMinima: number | null,
    esModificacion: boolean,
  ): void {
    this.publish('preferidos', financieraId, {
      event: esModificacion ? 'oferta.modificada' : 'oferta.nueva',
      facturaId,
      cantidadOfertas,
      tasaMinima,
    });
  }

  emitOfertaAceptada(financieraId: string, facturaId: string): void {
    this.publish('preferidos', financieraId, {
      event: 'mi.oferta.aceptada',
      facturaId,
    });
  }

  emitRefresh(reason: string, facturaId?: string): void {
    this.publish('all', undefined, {
      event: 'marketplace.refresh',
      reason,
      facturaId: facturaId ?? null,
      ts: new Date().toISOString(),
    });
  }

  private publish(scope: MarketplaceScope, financieraId: string | undefined, payload: MarketplaceSsePayload): void {
    const targets = new Set<string>([
      this.getChannelKey(scope, financieraId),
      this.getChannelKey(scope),
      this.getChannelKey('all'),
    ]);

    for (const target of targets) {
      const stream = this.streams.get(target);
      if (!stream) {
        continue;
      }
      stream.next(payload);
    }
  }

  private getOrCreateStream(channel: string): Subject<MarketplaceSsePayload> {
    const existing = this.streams.get(channel);
    if (existing) {
      return existing;
    }

    const stream = new Subject<MarketplaceSsePayload>();
    this.streams.set(channel, stream);
    return stream;
  }

  private getChannelKey(scope: MarketplaceScope, financieraId?: string): string {
    return `${scope}:${financieraId ?? 'all'}`;
  }
}
