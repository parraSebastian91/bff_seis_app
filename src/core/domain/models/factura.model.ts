import { facturaEstado } from "./constantes.model";

export class FacturaModel {
    facturaId: string;
    assetId: string;
    ownerUUID: string;
    nombre_mandante: string;
    rut_mandante: string;
    gestor: string;
    deudorNombre: string;
    deudorRut: string;
    facturaNumero: string;
    montoTotal: number;
    fechaVencimiento: Date;
    status: facturaEstado;
    correlationId: string;
    storage_key: string;
    ofertas: string;
    constructor(ownerUUID: string, gestor: string, status: facturaEstado, correlationId: string) {
        this.facturaId = "";
        this.assetId = "";
        this.ownerUUID = ownerUUID;
        this.nombre_mandante = "";
        this.rut_mandante = "";
        this.gestor = gestor;
        this.deudorNombre = "";
        this.deudorRut = "";
        this.facturaNumero = "";
        this.montoTotal = 0;
        this.fechaVencimiento = new Date();
        this.status = status;
        this.correlationId = correlationId;
        this.storage_key = "";
        this.ofertas = "0";
    }

}

