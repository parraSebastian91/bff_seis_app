import { UserProfileModel } from "../../models/usuario/userProfile.model";

export interface IUsuarioUserCase {
    
    ExecuteGetInformacionUsuario(uuid: string): Promise<UserProfileModel>;

}