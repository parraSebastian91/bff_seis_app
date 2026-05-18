import { UserProfileModel } from "src/core/domain/models/usuario/userProfile.model";

export class UserProfileCoreDTO {
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

    constructor(init?: Partial<UserProfileCoreDTO>) {
        Object.assign(this, init);
    }

    static toModel(data: UserProfileCoreDTO): UserProfileModel {
        console.log("UserProfileCoreDTO.toModel | data:", data);
        const model = new UserProfileModel();
        model.username = data.username;
        model.ingreso = data.ingreso;
        model.activo = data.activo;
        model.nombres = data.nombres;
        model.apellido_paterno = data.apellido_paterno;
        model.apellido_materno = data.apellido_materno;
        model.direccion = data.direccion;
        model.celular = data.celular;
        model.correo = data.correo;
        model.fecha_nacimiento = data.fecha_nacimiento;
        model.redes_sociales = data.redes_sociales;
        model.tipo_documento = data.tipo_documento;
        model.numero_documento = data.numero_documento;
        model.tipo_contacto = data.tipo_contacto;
        return model;
    }
}

