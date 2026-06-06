import { MarketplacePage } from "../../models/facturaMarketPlace.mode";

export interface IFacturaMarketPlaceUseCase {
    ExecuteGetFacturasMarketPlace(correlationId: string, scope: string, cursor?: string, limit?: number): Promise<MarketplacePage>;
}