import { facturaEstado } from "src/core/domain/models/constantes.model";
import { FacturaModel } from "src/core/domain/models/factura.model";

export class FacturaCoreResponse {
    publiInvoiceId: string;
    assetId: string;
    ownerUUID: string;
    gestor: {
        uuid: string;
        username: string;
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
    ofertas: string;

    constructor(ownerUUID: string, gestor: { uuid: string, username: string }, status: facturaEstado, correlationId: string) {
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
        this.ofertas = "0";
    }

    static toModel(data: FacturaCoreResponse): FacturaModel {
        console.log(data);
        const factura = new FacturaModel(
            data.ownerUUID,
            { uuid: data.gestor.uuid, username: data.gestor.username },
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
        factura.ofertas = data.ofertas;
        return factura;
    }

}