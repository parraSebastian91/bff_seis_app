
import { UserOrganizacionProfileModel } from "../../models/usuario/userOrganizacionProfile.model";
import { UserProfileModel, UserImagesModel } from "../../models/usuario/userProfile.model";
import { SystemNavigationModel } from "../../models/usuario/value-object/SystemNavigation.model";


export const CORE_SERVICE_CLIENT = 'CORE_SERVICE_CLIENT';
export const PAYMENTS_CLIENT = 'PAYMENTS_CLIENT';

export interface ICoreService {

    GetUserProfile(uuid: string): Promise<UserProfileModel>;
    GetPortalMenuByUsuario(uuid: string): Promise<SystemNavigationModel>;
    GetUserImage(uuid: string): Promise<UserImagesModel>;
    UpdateUserProfile(uuid: string, body: UserProfileModel): Promise<UserProfileModel>;
    GetUserOrganizacionProfile(uuid: string): Promise<UserOrganizacionProfileModel>;

}