
import { FacturaUpdateRequestDto } from "src/infrastructure/adapters/inbound/http/dto/facturaUpdate.request.dto";
import { FacturaModel } from "../../models/factura.model";
import { UserOrganizacionProfileModel } from "../../models/usuario/userOrganizacionProfile.model";
import { UserProfileModel, UserImagesModel } from "../../models/usuario/userProfile.model";
import { SystemNavigationModel } from "../../models/usuario/value-object/SystemNavigation.model";
import { FacturaCreateRequestDto } from "src/infrastructure/adapters/inbound/http/dto/facturaCreate.request.dto";
import { VersionTerminosModel } from "src/infrastructure/adapters/outbound/services/dto/versionTerminos.coreResponse";


export const CORE_SERVICE_CLIENT = 'CORE_SERVICE_CLIENT';
export const PAYMENTS_CLIENT = 'PAYMENTS_CLIENT';

export interface ICoreService {

    GetUserProfile(uuid: string): Promise<UserProfileModel>;
    GetPortalMenuByUsuario(uuid: string): Promise<SystemNavigationModel>;
    GetUserImage(uuid: string): Promise<UserImagesModel>;
    UpdateUserProfile(uuid: string, body: UserProfileModel): Promise<UserProfileModel>;
    GetUserOrganizacionProfile(uuid: string): Promise<UserOrganizacionProfileModel>;
    getFacturasByUserUUID(uuid: string, organizacionUUID: string): Promise<FacturaModel[]>;
    updateFactura(body: FacturaUpdateRequestDto): Promise<{ campo: string, id: string, valor: any, isUpdate: any, mensaje: string }>;
    publicarFactura(body: FacturaCreateRequestDto): Promise<FacturaModel>;
    getUrlFactura(facturas: FacturaModel[], userUUID: string, organizacionUUID: string, correlationId: string): Promise<{ id: string, keyUrl: string }[]>;
    getVersionTerminosActiva(): Promise<VersionTerminosModel>;
    registrarAutorizacion(payload: { facturaId: string; versionTerminosId: string; acepto: boolean; usuarioUUID: string; ipAddress: string; userAgent: string; correlationId: string; }): Promise<void>;
    getFacturasMarketPlace(correlationId: string, scope: string, cursor?: string, limit?: number): Promise<any>;
}