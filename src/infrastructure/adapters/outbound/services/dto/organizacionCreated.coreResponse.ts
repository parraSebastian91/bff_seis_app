export class GiroComercialCoreResponse {
    codigo: string;
    fuente: string;
    descripcion: string;
    categoriaTributaria?: string;
    afectoIva?: boolean;
    fechaInicio?: Date;
    esPrincipal?: boolean;

    constructor() {
        this.codigo = "";
        this.fuente = "";
        this.descripcion = "";
        this.categoriaTributaria = undefined;
        this.afectoIva = undefined;
        this.fechaInicio = undefined;
        this.esPrincipal = undefined;
    }
}

export class OrganizacionCreatedCoreResponse {
    id: string;
    razonSocial: string;
    tipoOrganizacion: string;
    tipoParticipante: string;
    giros: GiroComercialCoreResponse[];

    constructor() {
        this.id = "";
        this.razonSocial = "";
        this.tipoOrganizacion = "";
        this.tipoParticipante = "";
        this.giros = [];
    }
}