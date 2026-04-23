export class orgProfile {
    razon_social: string;
    organizacion_uuid: string;

    constructor() {
        this.razon_social = "";
        this.organizacion_uuid = "";
    }

}

export class UserOrganizacionProfileModel {
    nombre_contacto: string;
    cargo: string;
    organizaciones: orgProfile[];

    constructor() {
        this.nombre_contacto = "";
        this.cargo = "";
        this.organizaciones = [];
    }
}