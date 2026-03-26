import { UsuarioModel } from "../../models/usuario/usuario.model";

export interface IUsuarioUserCase {
    
    ExecuteGetInformacionUsuario(): Promise<UsuarioModel>;

}