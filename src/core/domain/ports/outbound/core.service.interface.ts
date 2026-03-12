import { UsuarioModel } from "../../models/usuario/usuario.model";

export interface ICoreService {
    
    GetUserInformation(uuid: string): Promise<UsuarioModel>;

}