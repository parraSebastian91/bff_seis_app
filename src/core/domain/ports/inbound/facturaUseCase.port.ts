import { FacturaUpdateRequestDto } from "src/infrastructure/adapters/inbound/http/dto/facturaUpdate.request.dto";
import { FacturaModel } from "../../models/factura.model";
import { FacturaCreateRequestDto } from "src/infrastructure/adapters/inbound/http/dto/facturaCreate.request.dto";

export interface IFacturaUseCase {
    ExecuteGetFacturas(userUUID: string, organizacionUUID: string): Promise<FacturaModel[]>;
    ExecuteUpdateFacturas(userUUID: string, body: FacturaUpdateRequestDto): Promise<{ campo: string, id: string, valor: any, isUpdate: any, mensaje: string }>;
    ExecutePublicarFactura(gestor: { userUuid: string, username: string }, correlationId: string, body: FacturaCreateRequestDto): Promise<FacturaModel>;
}