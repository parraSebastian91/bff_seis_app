export class orgProfile {
    razon_social: string;
    organizacion_uuid: string;
    tipo_participante: string;
    tipo_organizacion: string;
    constructor() {
        this.razon_social = "";
        this.organizacion_uuid = "";
        this.tipo_participante = "";
        this.tipo_organizacion = "";
    }

}

export class UserOrganizacionProfileModel {
    nombre_contacto: string;
    cargo: string;
    organizaciones: orgProfile[];
    usuario_uuid: string;
    username: string;
    constructor() {
        this.nombre_contacto = "";
        this.cargo = "";
        this.organizaciones = [];
        this.usuario_uuid = "";
        this.username = "";
    }
}