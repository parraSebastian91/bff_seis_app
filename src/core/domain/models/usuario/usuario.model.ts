import { UUID } from "crypto";
import { Correo } from "./value-object/correo.vo";
import { NombrePersona } from "./value-object/nombrePersona.vo";


export class UsuarioModel {
    uuid: string;
    username: string;
    nombres: NombrePersona;
    ap_paterno: NombrePersona;
    ap_materno: NombrePersona;
    email: Correo;
}

