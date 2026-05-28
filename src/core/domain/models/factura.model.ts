import { createdBy, facturaEstado } from "./constantes.model";

export class FacturaModel {
    facturaId: string;
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
    constructor(ownerUUID: string, gestor: { uuid: string, username: string }, status: facturaEstado, correlationId: string) {
        this.facturaId = "";
        this.assetId = "";
        this.ownerUUID = ownerUUID;
        this.nombre_cliente_cedente = "";
        this.rut_cliente_cedente = "";
        this.gestor = gestor;
        this.deudorNombre = "";
        this.deudorRut = "";
        this.facturaNumero = "";
        this.montoTotal = 0;
        this.fechaVencimiento = new Date();
        this.status = status;
        this.correlationId = correlationId;
        this.url_factura = null;        
        this.total_ofertas = 0;
        this.ofertas_enviadas = 0;
        this.ofertas_revisadas = 0;
        this.ofertas_aceptadas = 0;
        this.ofertas_rechazadas = 0;
        this.createdBy = createdBy.FORM;
        this.notas = [];
    }

}

