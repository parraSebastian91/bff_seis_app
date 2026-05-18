import { facturaEstado } from "src/core/domain/models/constantes.model";

export class FacturaDTO {
    publiInvoiceId: string;
    assetId: string;
    ownerUUID: string;
    gestor: {
        uuid: string;
        userName: string;
    };
    nombre_mandante: string;
    rut_mandante: string;
    deudorNombre: string;
    deudorRut: string;
    facturaNumero: string;
    montoTotal: number;
    fechaVencimiento: Date;
    status: facturaEstado;
    correlationId: string;
    storage_key: string;
    ofertas: number;
    constructor(ownerUUID: string, gestor: { uuid: string, userName: string }, status: facturaEstado, correlationId: string) {
        this.publiInvoiceId = "";
        this.assetId = "";
        this.ownerUUID = ownerUUID;
        this.gestor = gestor;
        this.nombre_mandante = "";
        this.rut_mandante = "";
        this.deudorNombre = "";
        this.deudorRut = "";
        this.facturaNumero = "";
        this.montoTotal = 0;
        this.fechaVencimiento = new Date();
        this.status = status;
        this.correlationId = correlationId;
        this.storage_key = "";
        this.ofertas = 0;
    }
}