export interface FacturaCreateRequestDto {
    facturaId: string;
    ownerUUID: string;
    numeroFactura: string;
    rutDeudor: string;
    nombreDeudor: string;
    correlationId: string;
    montoTotal: number;
    fechaVencimiento: Date;
    gestor: {
        uuid: string;
        username: string;
    };
}