import { UserOrganizacionProfileModel } from "../../models/usuario/userOrganizacionProfile.model";
import { UserImagesModel, UserProfileModel } from "../../models/usuario/userProfile.model";

export interface IUsuarioUserCase {
    
    ExecuteGetInformacionUsuario(uuid: string): Promise<UserProfileModel>;
    ExecuteGetImagenUsuario(uuid: string): Promise<UserImagesModel>;
    ExecuteUpdateInformacionUsuario(uuid: string, body: UserProfileModel): Promise<UserProfileModel>;
    ExecuteGetProfileOrganizacionUsuario(uuid: string): Promise<UserOrganizacionProfileModel>;
}