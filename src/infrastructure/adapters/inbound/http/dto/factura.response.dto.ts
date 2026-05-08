

export class FacturaResponseDTO {
    id: string;
    assetURL: string;
    folio: string;
    deudor: string;
    monto_total: number;
    estado: string;
    organizacionUuid: string;
    ofertas_count: number;
    fecha_publicacion: Date;
    fecha_vencimiento: Date;

    constructor() {
        this.id = "";
        this.assetURL = "";
        this.folio = "";
        this.deudor = "";
        this.monto_total = 0;
        this.estado = "";
        this.organizacionUuid = "";
        this.ofertas_count = 0;
        this.fecha_publicacion = new Date();
        this.fecha_vencimiento = new Date();
    }
}


export class FacturasSummaryDTO {
    total_publicado: number;
    ofertas_pendientes: number;
    
    constructor() {
        this.total_publicado = 0;
        this.ofertas_pendientes = 0;
    }
}

export class FactuasDTO {
    facturas: FacturaResponseDTO[];
    resumen: FacturasSummaryDTO;

    constructor() {
        this.facturas = [];
        this.resumen = new FacturasSummaryDTO();
    }
}