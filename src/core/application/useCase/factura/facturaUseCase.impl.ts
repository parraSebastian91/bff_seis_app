import { Logger } from "@nestjs/common";
import { FacturaModel } from "src/core/domain/models/factura.model";
import { IFacturaUseCase } from "src/core/domain/ports/inbound/facturaUseCase.port";
import { ICoreService } from "src/core/domain/ports/outbound/core.service.interface";
import { IStorageService } from "src/core/domain/ports/outbound/storage.service.interface";
import { FacturaCreateRequestDto } from "src/infrastructure/adapters/inbound/http/dto/facturaCreate.request.dto";
import { FacturaUpdateRequestDto } from "src/infrastructure/adapters/inbound/http/dto/facturaUpdate.request.dto";
import { AutorizacionPublicacionRequestDto } from "src/infrastructure/adapters/inbound/http/dto/autorizacionPublicacion.request.dto";

export class FacturaUseCaseImpl implements IFacturaUseCase {

    private readonly logger = new Logger(FacturaUseCaseImpl.name);
    // private readonly urlBatchSize = Math.max(1, Number(process.env.FACTURA_URL_BATCH_SIZE ?? 10));
    // private readonly urlBatchDelayMs = Math.max(0, Number(process.env.FACTURA_URL_BATCH_DELAY_MS ?? 0));

    constructor(
        private readonly facturaCoreService: ICoreService,
        private readonly storageService: IStorageService,
    ) { }

    async ExecuteGetFacturas(userUUID: string, organizacionUUID: string, correlationId: string, filtro: string): Promise<FacturaModel[]> {
        const startedAt = Date.now();
        this.logger.log(`[START] GetFacturas | userUuid=${userUUID} | organizacionUUID=${organizacionUUID} | correlationId=${correlationId} | filtro=${filtro}`);

        try {
            const facturas = await this.facturaCoreService.getFacturasByUserUUID(userUUID, organizacionUUID, filtro);            
            this.logger.log(`[OK] GetFacturas | userUuid=${userUUID} | totalFacturas=${facturas.length} | durationMs=${Date.now() - startedAt}`);
            return facturas;
        } catch (error: any) {
            this.logger.error(`Error en GetFacturas | userUuid=${userUUID} | organizacionUUID=${organizacionUUID} | correlationId=${correlationId} | error=${error?.message} | durationMs=${Date.now() - startedAt}`, error.stack);
            throw error;
        }
    }

    async ExecuteUpdateFacturas(userUUID: string, body: FacturaUpdateRequestDto): Promise<{ campo: string, id: string, valor: any, isUpdate: any, mensaje: string }> {
        const startedAt = Date.now();
        this.logger.log(`[START] Update Facturas | userUuid=${userUUID} | body=${JSON.stringify(body)}`);

        const FacturaEditada = await this.facturaCoreService.updateFactura(body);
        this.logger.log(`[OK] Update Facturas | durationMs=${Date.now() - startedAt}`);
        return FacturaEditada;
    }

    async ExecutePublicarFactura(gestor: { userUuid: string, username: string }, correlationId: string, body: FacturaCreateRequestDto): Promise<FacturaModel> {
        const startedAt = Date.now();
        this.logger.log(`[START] Publicar Factura | userUuid=${gestor.userUuid} | body=${JSON.stringify(body)} | correlationId=${correlationId}`);
        body.correlationId = correlationId;
        body.gestor.uuid = gestor.userUuid;
        body.gestor.username = gestor.username;
        console.log(body);
        const factura = await this.facturaCoreService.publicarFactura(body);

        this.logger.log(`[OK] Factura publicada | userUuid=${gestor.userUuid} | facturaId=${factura.facturaId} | durationMs=${Date.now() - startedAt}`);
        return factura;
    }

    async ExecuteRegistrarAutorizacion(
        userUUID: string,
        ipAddress: string,
        userAgent: string,
        correlationId: string,
        body: AutorizacionPublicacionRequestDto
    ): Promise<void> {
        this.logger.log(`[START] RegistrarAutorizacion | userUuid=${userUUID} | facturaId=${body.facturaId} | acepto=${body.acepto} | correlationId=${correlationId}`);
        await this.facturaCoreService.registrarAutorizacion({
            facturaId: body.facturaId,
            versionTerminosId: body.versionTerminosId,
            acepto: body.acepto,
            usuarioUUID: userUUID,
            ipAddress,
            userAgent,
            correlationId: body.correlationId || correlationId,
        });
        this.logger.log(`[OK] RegistrarAutorizacion | userUuid=${userUUID} | facturaId=${body.facturaId}`);
    }

}