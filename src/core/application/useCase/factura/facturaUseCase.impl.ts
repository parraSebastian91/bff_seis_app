import { Logger } from "@nestjs/common";
import { FacturaModel } from "src/core/domain/models/factura.model";
import { IFacturaUseCase } from "src/core/domain/ports/inbound/facturaUseCase.port";
import { ICoreService } from "src/core/domain/ports/outbound/core.service.interface";

export class FacturaUseCaseImpl implements IFacturaUseCase {

    private readonly logger = new Logger(FacturaUseCaseImpl.name);

    constructor(private readonly facturaCoreService: ICoreService) { }

    async ExecuteGetFacturas(userUUID: string, organizacionUUID: string): Promise<FacturaModel[]> {
        const startedAt = Date.now();
        this.logger.log(`[START] Obtener Facturas | userUuid=${userUUID} | organizacionUUID=${organizacionUUID}`);
        try {
            const facturas = await this.facturaCoreService.getFacturasByUserUUID(userUUID, organizacionUUID);
            this.logger.log(`[OK] Facturas obtenidas | userUuid=${userUUID} | organizacionUUID=${organizacionUUID} | durationMs=${Date.now() - startedAt}`);
            return facturas;
        } catch (error: any) {
            this.logger.error(`[FAIL] Obtener Facturas | userUuid=${userUUID} | organizacionUUID=${organizacionUUID} | durationMs=${Date.now() - startedAt} | reason=${error?.message ?? error}`);
            throw error;
        }
    }

}