import { facturaEstado } from "src/core/domain/models/constantes.model";

export interface FacturaCreateRequestDto {
    facturaId: string;
    ownerUUID: string;
    numeroFactura: string;
    rutDeudor: string;
    nombreDeudor: string;
    correlationId: string;
    montoTotal: number;
    fechaVencimiento: Date;    
    status: facturaEstado;
    
    gestor: {
        uuid: string;
        username: string;
    };
}