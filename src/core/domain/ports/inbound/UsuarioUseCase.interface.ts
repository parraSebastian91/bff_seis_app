import { UserImagesModel, UserProfileModel } from "../../models/usuario/userProfile.model";

export interface IUsuarioUserCase {
    
    ExecuteGetInformacionUsuario(uuid: string): Promise<UserProfileModel>;
    ExecuteGetImagenUsuario(uuid: string): Promise<UserImagesModel>;
}