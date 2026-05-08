import { FacturaModel } from "../../models/factura.model";

export interface IFacturaUseCase {
    ExecuteGetFacturas(userUUID: string, organizacionUUID: string): Promise<FacturaModel[]>;
}