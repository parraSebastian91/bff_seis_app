import { FacturaUpdateRequestDto } from "src/infrastructure/adapters/inbound/http/dto/facturaUpdate.request.dto";
import { FacturaModel } from "../../models/factura.model";

export interface IFacturaUseCase {
    ExecuteGetFacturas(userUUID: string, organizacionUUID: string): Promise<FacturaModel[]>;
    ExecuteUpdateFacturas(userUUID: string, body: FacturaUpdateRequestDto): Promise<{ campo: string, id: string, valor: any, isUpdate: any, mensaje: string }>;
}