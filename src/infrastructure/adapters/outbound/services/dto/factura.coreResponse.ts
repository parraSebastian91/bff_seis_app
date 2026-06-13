import { createdBy, facturaEstado } from "src/core/domain/models/constantes.model";
import { AdjuntoModel, FacturaModel } from "src/core/domain/models/factura.model";

export class AdjuntoCoreResponse {
    id: string;
    tipo: string;
    orden: number;
    asset_id: string;
    url_path: string;
    descripcion: string;
    es_principal: boolean;

    constructor(id: string, tipo: string, orden: number, asset_id: string, url_path: string, descripcion: string, es_principal: boolean) {
        this.id = id;
        this.tipo = tipo;
        this.orden = orden;
        this.asset_id = asset_id;
        this.url_path = url_path;
        this.descripcion = descripcion;
        this.es_principal = es_principal;
    }

    static toModel(data: AdjuntoCoreResponse): AdjuntoModel {
        return new AdjuntoModel(
            data.id,
            data.tipo,
            data.orden,
            data.asset_id,
            data.url_path,
            data.descripcion,
            data.es_principal
        );
    }
}


export class FacturaCoreResponse {
    publiInvoiceId: string;
    assetId: string;
    ownerUUID: string; // cedente_org_id
    gestor: {
        uuid: string;
        username: string;
    };
    nombre_cliente_cedente: string; // deudor_nombre
    rut_cliente_cedente: string; // deudor_rut
    deudorNombre: string;
    deudorRut: string;
    facturaNumero: string;
    montoTotal: number;
    fechaVencimiento: Date;
    status: facturaEstado;
    correlationId: string;
    total_ofertas: number;
    ofertas_enviadas: number;
    ofertas_revisadas: number;
    ofertas_aceptadas: number;
    ofertas_rechazadas: number;
    url_factura: string | null;    
    createdBy: createdBy;
    notas?: string[];
    adjuntos?: AdjuntoCoreResponse[];

    constructor(ownerUUID: string, gestor: { uuid: string, username: string }, status: facturaEstado, correlationId: string) {
        this.publiInvoiceId = "";
        this.assetId = "";
        this.ownerUUID = ownerUUID;
        this.gestor = gestor;
        this.nombre_cliente_cedente = "";
        this.rut_cliente_cedente = "";
        this.deudorNombre = "";
        this.deudorRut = "";
        this.facturaNumero = "";
        this.montoTotal = 0;
        this.fechaVencimiento = new Date();
        this.status = status;
        this.correlationId = correlationId;
        this.total_ofertas = 0;
        this.ofertas_enviadas = 0;
        this.ofertas_revisadas = 0;
        this.ofertas_aceptadas = 0;
        this.ofertas_rechazadas = 0;
        this.url_factura = null;
        this.createdBy = createdBy.FORM;
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
        factura.nombre_cliente_cedente = data.nombre_cliente_cedente;
        factura.rut_cliente_cedente = data.rut_cliente_cedente;
        factura.deudorNombre = data.deudorNombre;
        factura.deudorRut = data.deudorRut;
        factura.facturaNumero = data.facturaNumero;
        factura.montoTotal = data.montoTotal;
        factura.fechaVencimiento = new Date(data.fechaVencimiento);
        factura.total_ofertas = data.total_ofertas;
        factura.ofertas_enviadas = data.ofertas_enviadas;
        factura.ofertas_revisadas = data.ofertas_revisadas;
        factura.ofertas_aceptadas = data.ofertas_aceptadas;
        factura.ofertas_rechazadas = data.ofertas_rechazadas;
        factura.url_factura = data.url_factura;
        factura.createdBy = data.createdBy;
        factura.notas = data.notas;
        factura.adjuntos = data.adjuntos?.map(AdjuntoCoreResponse.toModel);
        return factura;
    }

}