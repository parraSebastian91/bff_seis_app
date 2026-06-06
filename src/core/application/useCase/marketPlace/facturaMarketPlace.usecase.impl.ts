import { Inject } from "@nestjs/common/decorators/core/inject.decorator";
import { MarketplacePage } from "src/core/domain/models/facturaMarketPlace.mode";
import { IFacturaMarketPlaceUseCase } from "src/core/domain/ports/inbound/facturaMarketPlace.usecase";
import { ICoreService } from "src/core/domain/ports/outbound/core.service.interface";

export class FacturaMarketPlaceUseCase implements IFacturaMarketPlaceUseCase {
    constructor(
        private readonly facturaCoreService: ICoreService,
    ) { }

    async ExecuteGetFacturasMarketPlace(correlationId: string, scope: string, cursor?: string, limit?: number): Promise<MarketplacePage> {
        return await this.facturaCoreService.getFacturasMarketPlace(correlationId, scope, cursor, limit);
    }
}