import { UserOrganizacionProfileModel } from "src/core/domain/models/usuario/userOrganizacionProfile.model";

export class orgProfile {
    razon_social: string;
    organizacion_uuid: string;
    tipo_participante: string;
    constructor() {
        this.razon_social = "";
        this.organizacion_uuid = "";
        this.tipo_participante = "";
    }
}

export class UserOrganizacionProfileResponseDTO {
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

    static fromModel(model: UserOrganizacionProfileModel): UserOrganizacionProfileResponseDTO {
        const dto = new UserOrganizacionProfileResponseDTO();
        dto.nombre_contacto = model.nombre_contacto;
        dto.cargo = model.cargo;
        dto.usuario_uuid = model.usuario_uuid;
        dto.username = model.username;
        dto.organizaciones = model.organizaciones.map(org => {
            const orgDto = new orgProfile();
            orgDto.razon_social = org.razon_social;
            orgDto.organizacion_uuid = org.organizacion_uuid;
            orgDto.tipo_participante = org.tipo_participante;
            return orgDto;
        });
        return dto;
    }
}