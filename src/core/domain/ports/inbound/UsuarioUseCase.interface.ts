import { UsuarioModel } from "../../models/usuario/usuario.model";

export interface IUsuarioUserCase {
    
    ExecuteGetInformacionUsuario(uuid: string): Promise<UsuarioModel>;

}