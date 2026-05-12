import { Logger } from "@nestjs/common";
import { FacturaModel } from "src/core/domain/models/factura.model";
import { IFacturaUseCase } from "src/core/domain/ports/inbound/facturaUseCase.port";
import { ICoreService } from "src/core/domain/ports/outbound/core.service.interface";
import { IStorageService } from "src/core/domain/ports/outbound/storage.service.interface";

export class FacturaUseCaseImpl implements IFacturaUseCase {

    private readonly logger = new Logger(FacturaUseCaseImpl.name);
    // private readonly urlBatchSize = Math.max(1, Number(process.env.FACTURA_URL_BATCH_SIZE ?? 10));
    // private readonly urlBatchDelayMs = Math.max(0, Number(process.env.FACTURA_URL_BATCH_DELAY_MS ?? 0));

    constructor(
        private readonly facturaCoreService: ICoreService,
        private readonly storageService: IStorageService,
    ) { }

    async ExecuteGetFacturas(userUUID: string, organizacionUUID: string): Promise<FacturaModel[]> {
        const startedAt = Date.now();
        this.logger.log(`[START] Obtener Facturas | userUuid=${userUUID} | organizacionUUID=${organizacionUUID}`);
        try {
            const facturas = await this.facturaCoreService.getFacturasByUserUUID(userUUID, organizacionUUID);

            const facturasConStorageKey = facturas.filter((factura) => this.hasValidStorageKey(factura.storage_key));
            const skipped = facturas.length - facturasConStorageKey.length;

            this.logger.log(`[START] Resolver URLs | total=${facturas.length} | elegibles=${facturasConStorageKey.length} | skipped=${skipped}`);

            const requests = facturasConStorageKey.map((factura) =>
                this.storageService.getPresignedGetUrl(factura.storage_key, factura.correlationId)
            );
            const results = await Promise.allSettled(requests);

            let fulfilled = 0;
            let rejected = 0;

            results.forEach((result, index) => {
                const factura = facturasConStorageKey[index];

                if (result.status === "fulfilled") {
                    fulfilled += 1;
                    factura.storage_key = result.value;
                    return;
                }

                rejected += 1;
                factura.storage_key = "N/A";
                const reason = result.reason?.message ?? result.reason;
                this.logger.error(`[FAIL] URL factura | assetId=${factura.assetId} | correlationId=${factura.correlationId} | reason=${reason}`);
            });

            this.logger.log(`[OK] Resolver URLs | fulfilled=${fulfilled} | rejected=${rejected} | skipped=${skipped}`);

            this.logger.log(`[OK] Facturas obtenidas | userUuid=${userUUID} | organizacionUUID=${organizacionUUID} | durationMs=${Date.now() - startedAt}`);
            return facturas;
        } catch (error: any) {
            this.logger.error(`[FAIL] Obtener Facturas | userUuid=${userUUID} | organizacionUUID=${organizacionUUID} | durationMs=${Date.now() - startedAt} | reason=${error?.message ?? error}`);
            throw error;
        }
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

    private hasValidStorageKey(storageKey: string | null | undefined): boolean {
        if (!storageKey) {
            return false;
        }

        return storageKey.trim().toUpperCase() !== "N/A";
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

}