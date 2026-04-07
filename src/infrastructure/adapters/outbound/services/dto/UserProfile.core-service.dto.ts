import { UserProfileModel } from "src/core/domain/models/usuario/userProfile.model";

export class UserProfileDTO {
    username: string;
    ingreso: Date;
    activo: boolean;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    direccion: string;
    celular: string;
    correo: string;
    fecha_nacimiento: Date;
    redes_sociales: string;
    tipo_documento: string;
    numero_documento: string;
    avatar: string;
    tipo_contacto: string;

    constructor(init?: Partial<UserProfileDTO>) {
        Object.assign(this, init);
    }

    static toModel(data: UserProfileDTO): UserProfileModel {
        return Object.assign(new UserProfileModel(), data);
    }
}

