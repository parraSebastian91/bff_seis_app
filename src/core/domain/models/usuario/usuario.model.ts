
import { Correo } from "./value-object/correo.vo";
import { NombrePersona } from "./value-object/nombrePersona.vo";
import { DocumentoContacto } from "./value-object/documentoContacto.model";


export class UsuarioModel {
    uuid: string;
    username: string;
    nombres: NombrePersona;
    apellidoPaterno: NombrePersona;
    apellidoMaterno: NombrePersona;
    correo: Correo;
    direccion: string;
    celular: string;
    fechaNacimiento: Date;
    redesSociales: string;
    documentoContacto: DocumentoContacto;
    tipoContacto: string;
    avatar: string;
}