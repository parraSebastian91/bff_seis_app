import { Logger } from "@nestjs/common";
import { url } from "node:inspector";
import { facturaEstado } from "src/core/domain/models/constantes.model";
import { FacturaModel } from "src/core/domain/models/factura.model";
import { IFacturaUseCase } from "src/core/domain/ports/inbound/facturaUseCase.port";
import { ICoreService } from "src/core/domain/ports/outbound/core.service.interface";
import { IStorageService } from "src/core/domain/ports/outbound/storage.service.interface";
import { FacturaCreateRequestDto } from "src/infrastructure/adapters/inbound/http/dto/facturaCreate.request.dto";
import { FacturaUpdateRequestDto } from "src/infrastructure/adapters/inbound/http/dto/facturaUpdate.request.dto";

export class FacturaUseCaseImpl implements IFacturaUseCase {

    private readonly logger = new Logger(FacturaUseCaseImpl.name);
    // private readonly urlBatchSize = Math.max(1, Number(process.env.FACTURA_URL_BATCH_SIZE ?? 10));
    // private readonly urlBatchDelayMs = Math.max(0, Number(process.env.FACTURA_URL_BATCH_DELAY_MS ?? 0));

    constructor(
        private readonly facturaCoreService: ICoreService,
        private readonly storageService: IStorageService,
    ) { }

    async ExecuteGetFacturas(userUUID: string, organizacionUUID: string, correlationId: string): Promise<FacturaModel[]> {
        const startedAt = Date.now();
        this.logger.log(`[START] GetFacturas | userUuid=${userUUID} | organizacionUUID=${organizacionUUID} | correlationId=${correlationId}`);
        
        try {
            const facturas = await this.facturaCoreService.getFacturasByUserUUID(userUUID, organizacionUUID);
            const facturasConStorageKey = facturas.filter((factura) => this.hasValidStorageKey(factura.status));
            
            if (facturasConStorageKey.length === 0) {
                this.logger.log(`[OK] GetFacturas | userUuid=${userUUID} | totalFacturas=${facturas.length} | facturasConURL=0 | durationMs=${Date.now() - startedAt}`);
                return facturas;
            }
            
            const urlByIdRequest = await this.facturaCoreService.getUrlFactura(facturasConStorageKey, userUUID, organizacionUUID, correlationId);

            const result = facturas.map((factura) => {
                if (!this.hasValidStorageKey(factura.status)) {
                    factura.storage_key = 'N/A';
                    return factura;
                }
                
                const urlData = urlByIdRequest.find(url => url.id === factura.facturaId);
                console.log(urlData)
                if (urlData) {
                    factura.storage_key = urlData.keyUrl;
                    this.logger.debug(`URL asignada para factura ${factura.facturaId}`);
                } else {
                    factura.storage_key = 'N/A';
                    this.logger.warn(`No se encontró URL para factura con ID ${factura.facturaId} | organizacionUUID=${organizacionUUID} | correlationId=${correlationId}`);
                }
                console.log(`FacturaID: ${factura.facturaId}, StorageKey: ${factura.storage_key}`);
                return factura;
            });
            
            this.logger.log(`[OK] GetFacturas | userUuid=${userUUID} | totalFacturas=${facturas.length} | facturasConURL=${facturasConStorageKey.length} | durationMs=${Date.now() - startedAt}`);
            return result;
        } catch (error: any) {
            this.logger.error(`Error en GetFacturas | userUuid=${userUUID} | organizacionUUID=${organizacionUUID} | correlationId=${correlationId} | error=${error?.message} | durationMs=${Date.now() - startedAt}`, error.stack);
            throw error;
        }
    }

    async ExecuteUpdateFacturas(userUUID: string, body: FacturaUpdateRequestDto): Promise<{ campo: string, id: string, valor: any, isUpdate: any, mensaje: string }> {
        const startedAt = Date.now();
        const campoEditado = body.campoEditado;
        this.logger.log(`[START] Update Facturas | userUuid=${userUUID} | body=${JSON.stringify(body)}`);

        const FacturaEditada = await this.facturaCoreService.updateFactura(userUUID, body);

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

    // private async resolveFacturaUrlsInBatches(facturas: FacturaModel[]): Promise<void> {
    //     if (!facturas.length) {
    //         return;
    //     }

    //     this.logger.log(`[START] Obtener URLs facturas | total=${facturas.length} | batchSize=${this.urlBatchSize} | batchDelayMs=${this.urlBatchDelayMs}`);

    //     const facturasConStorageKey = facturas.filter((factura) => this.hasValidStorageKey(factura.storage_key));
    //     const skipped = facturas.length - facturasConStorageKey.length;

    //     if (skipped > 0) {
    //         this.logger.warn(`[SKIP] Facturas sin storage_key válido | skipped=${skipped} | regla=storage_key!=N/A`);
    //     }

    //     for (let start = 0; start < facturasConStorageKey.length; start += this.urlBatchSize) {
    //         const batch = facturasConStorageKey.slice(start, start + this.urlBatchSize);

    //         await Promise.all(batch.map(async (factura) => {
    //             try {
    //                 const url = await this.storageService.getPresignedGetUrl(factura.storage_key, factura.correlationId);
    //                 factura.storage_key = url;
    //             } catch (error: any) {
    //                 factura.storage_key = 'N/A';
    //                 this.logger.error(`Error obteniendo URL para factura ${factura.assetId} | storageKey=${factura.storage_key} | correlationId=${factura.correlationId} | reason=${error?.message ?? error}`);
    //             }
    //         }));

    //         const hasMore = start + this.urlBatchSize < facturasConStorageKey.length;
    //         if (hasMore && this.urlBatchDelayMs > 0) {
    //             await this.sleep(this.urlBatchDelayMs);
    //         }
    //     }

    //     this.logger.log(`[OK] URLs facturas procesadas | total=${facturasConStorageKey.length} | skipped=${skipped}`);
    // }

    private hasValidStorageKey(status: string | null | undefined): boolean {
        return status === facturaEstado.PENDIENTE_VALIDACION;
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

}