import { orgProfile, UserOrganizacionProfileModel } from "src/core/domain/models/usuario/userOrganizacionProfile.model";

export class UserOrganizacionProfileCoreDto {
    nombre_contacto: string;
    cargo: string;
    razon_social: string;
    organizacion_uuid: string;
    usuario_uuid: string;
    username: string;
    tipo_participante: string;

    constructor() {
        this.nombre_contacto = "";
        this.cargo = "";
        this.razon_social = "";
        this.organizacion_uuid = "";
        this.usuario_uuid = "";
        this.username = "";
        this.tipo_participante = "";
    }

    static toModel(data: UserOrganizacionProfileCoreDto[]): UserOrganizacionProfileModel {
        const model = new UserOrganizacionProfileModel();
        if (data && data.length > 0) {
            const first = data[0];
            model.nombre_contacto = first.nombre_contacto;
            model.cargo = first.cargo;
            model.username = first.username;
            model.usuario_uuid = first.usuario_uuid;
        }
        model.organizaciones = data.map(item => {
            const org = new orgProfile();
            org.razon_social = item.razon_social;
            org.organizacion_uuid = item.organizacion_uuid;
            org.tipo_participante = item.tipo_participante || "Todas";
            return org;
        });
        return model;
    }

}