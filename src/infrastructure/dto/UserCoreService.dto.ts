import { DocumentoContacto } from "src/core/domain/models/usuario/value-object/documentoContacto.model";
import { UsuarioModel } from "src/core/domain/models/usuario/usuario.model";
import { Correo } from "src/core/domain/models/usuario/value-object/correo.vo";
import { NombrePersona } from "src/core/domain/models/usuario/value-object/nombrePersona.vo";

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

    static toModel(data: UserProfileDTO): UsuarioModel {
        const dto = new UsuarioModel();
        dto.username = data.username;
        dto.nombres = new NombrePersona(data.nombres);
        dto.apellidoPaterno = new NombrePersona(data.apellido_paterno);
        dto.apellidoMaterno = new NombrePersona(data.apellido_materno || '');
        dto.direccion = data.direccion;
        dto.celular = data.celular;
        dto.correo = new Correo(data.correo);
        dto.fechaNacimiento = data.fecha_nacimiento;
        dto.redesSociales = data.redes_sociales;
        dto.documentoContacto = DocumentoContacto.create(data.tipo_documento, data.numero_documento);
        dto.avatar = data.avatar;
        dto.tipoContacto = data.tipo_contacto;
        return dto;
    }

    static fromModel(model: UsuarioModel): UserProfileDTO {
        const dto = new UserProfileDTO();
        dto.username = model.username;
        dto.nombres = model.nombres.getValue();
        dto.apellido_paterno = model.apellidoPaterno.getValue();
        dto.apellido_materno = model.apellidoMaterno.getValue();
        dto.direccion = model.direccion;
        dto.celular = model.celular;
        dto.correo = model.correo.getValue();
        dto.fecha_nacimiento = model.fechaNacimiento;
        dto.redes_sociales = model.redesSociales;
        dto.tipo_documento = model.documentoContacto.tipoDocumento.getValue();
        dto.numero_documento = model.documentoContacto.numeroDocumento.getValue();
        dto.avatar = model.avatar;
        dto.tipo_contacto = model.tipoContacto;
        return dto;
    }

}