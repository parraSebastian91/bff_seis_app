import { facturaEstado } from "src/core/domain/models/constantes.model";
import { FacturaModel } from "src/core/domain/models/factura.model";

export class FacturaCoreResponse {
    publiInvoiceId: string;
    assetId: string;
    ownerUUID: string;
    gestor: string;
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
    ofertas: string;

    constructor(ownerUUID: string, gestor: string, status: facturaEstado, correlationId: string) {
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
        this.ofertas = "0";
    }

    static toModel(data: FacturaCoreResponse): FacturaModel {
        const factura = new FacturaModel(
            data.ownerUUID,
            data.gestor,
            data.status,
            data.correlationId
        );

        factura.facturaId = data.publiInvoiceId;
        factura.assetId = data.assetId;
        factura.nombre_mandante = data.nombre_mandante;
        factura.rut_mandante = data.rut_mandante;
        factura.deudorNombre = data.deudorNombre;
        factura.deudorRut = data.deudorRut;
        factura.facturaNumero = data.facturaNumero;
        factura.montoTotal = data.montoTotal;
        factura.fechaVencimiento = new Date(data.fechaVencimiento);
        factura.storage_key = data.storage_key;
        factura.ofertas = data.ofertas;
        console.log("FacturaModel resultante de la transformación", { factura });
        return factura;
    }

}