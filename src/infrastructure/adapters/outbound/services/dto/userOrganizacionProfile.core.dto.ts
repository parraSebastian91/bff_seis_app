import { orgProfile, UserOrganizacionProfileModel } from "src/core/domain/models/usuario/userOrganizacionProfile.model";

export class UserOrganizacionProfileCoreDto {
    nombre_contacto: string;
    cargo: string;
    razon_social: string;
    organizacion_uuid: string;

    constructor() {
        this.nombre_contacto = "";
        this.cargo = "";
        this.razon_social = "";
        this.organizacion_uuid = "";
    }

    static toModel(data: UserOrganizacionProfileCoreDto[]): UserOrganizacionProfileModel {
        const model = new UserOrganizacionProfileModel();
        if (data && data.length > 0) {
            const first = data[0];
            model.nombre_contacto = first.nombre_contacto;
            model.cargo = first.cargo;
        }
        model.organizaciones = data.map(item => {
            const org = new orgProfile();
            org.razon_social = item.razon_social;
            org.organizacion_uuid = item.organizacion_uuid;
            return org;
        });
        return model;
    }

}