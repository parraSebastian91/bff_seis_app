import { Correo } from "./value-object/correo.vo";
import { NombrePersona } from "./value-object/nombrePersona.vo";
import { TipoDocumento } from "./value-object/tipoDocumento.vo";

export class ContactoModel{
    nombres: NombrePersona;
    ap_paterno: NombrePersona;
    ap_materno: NombrePersona;
    email: Correo;
    password: string;
    direccion: string;
    telefono: string;
    tipoDocumento: TipoDocumento;
}