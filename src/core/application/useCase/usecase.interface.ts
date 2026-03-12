import { UsuarioModel } from "src/core/domain/models/usuario/usuario.model";

export interface IUsuarioUserCase {
    
    ExecuteGetInformacionUsuario(): Promise<UsuarioModel>;

}