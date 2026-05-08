import { UserOrganizacionProfileModel } from "src/core/domain/models/usuario/userOrganizacionProfile.model";

export class orgProfile {
    razon_social: string;
    organizacion_uuid: string;

    constructor() {
        this.razon_social = "";
        this.organizacion_uuid = "";
    }

}

export class UserOrganizacionProfileResponseDTO {
    nombre_contacto: string;
    cargo: string;
    organizaciones: orgProfile[];

    constructor() {
        this.nombre_contacto = "";
        this.cargo = "";
        this.organizaciones = [];
    }

    static fromModel(model: UserOrganizacionProfileModel): UserOrganizacionProfileResponseDTO {
        const dto = new UserOrganizacionProfileResponseDTO();
        dto.nombre_contacto = model.nombre_contacto;
        dto.cargo = model.cargo;
        dto.organizaciones = model.organizaciones.map(org => {
            const orgDto = new orgProfile();
            orgDto.razon_social = org.razon_social;
            orgDto.organizacion_uuid = org.organizacion_uuid;
            return orgDto;
        });
        return dto;
    }
}