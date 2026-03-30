import { UsuarioModel } from "../../models/usuario/usuario.model";


export const CORE_SERVICE_CLIENT = 'CORE_SERVICE_CLIENT';
export const PAYMENTS_CLIENT = 'PAYMENTS_CLIENT';

export interface ICoreService {

    GetUserProfile(uuid: string): Promise<UsuarioModel>;

}