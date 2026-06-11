/*
https://docs.nestjs.com/providers#services
*/


import { HttpException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import { isAxiosError } from 'axios';
import { ICoreService, CORE_SERVICE_CLIENT } from '../../../../core/domain/ports/outbound/core.service.interface'
import { SystemNavigationDTO } from '../../inbound/http/dto/systemNavigation.dto';
import { ApiResponse } from 'src/infrastructure/adapters/inbound/http/model/api-response.model';
import { UserProfileCoreDTO } from './dto/UserProfile.core-service.dto';
import { UserImagesModel, UserProfileModel } from 'src/core/domain/models/usuario/userProfile.model';
import { ProfileImageCoreQueryResponse } from './dto/ProfileImageCoreResponse.dto';
import { ConfigService } from '@nestjs/config';
import { ProfileImageError } from 'src/core/domain/errors/ProfileImage.error';
import { UserProfileReqResDTO } from 'src/infrastructure/adapters/inbound/http/dto/userProfile.req.res.dto';
import { SystemNavigationModel } from 'src/core/domain/models/usuario/value-object/SystemNavigation.model';
import { UserOrganizacionProfileModel } from 'src/core/domain/models/usuario/userOrganizacionProfile.model';
import { UserOrganizacionProfileCoreDto } from './dto/userOrganizacionProfile.core.dto';
import { FacturaCoreResponse } from './dto/factura.coreResponse';
import { FacturaModel } from 'src/core/domain/models/factura.model';
import { FacturaUpdateRequestDto } from '../../inbound/http/dto/facturaUpdate.request.dto';
import { FacturaCreateRequestDto } from '../../inbound/http/dto/facturaCreate.request.dto';
import { VersionTerminosCoreResponse, VersionTerminosModel } from './dto/versionTerminos.coreResponse';

@Injectable()
export class CoreServiceClientAdapter implements ICoreService {
    private readonly logger = new Logger(CoreServiceClientAdapter.name);
    constructor(
        private configService: ConfigService,
        @Inject(CORE_SERVICE_CLIENT) private readonly coreClient: AxiosInstance,
    ) { }

    /**
     * Re-lanza el error HTTP original de ms-core preservando status y mensaje.
     * Si no hay respuesta Axios, lanza InternalServerErrorException.
     */
    private rethrowCoreError(error: any, context: string): never {
        if (isAxiosError(error) && error.response) {
            const status = error.response.status;
            const body = error.response.data;
            const message = body?.message ?? error.message;
            this.logger.warn(`[CORE ERROR] ${context} | status=${status} | message=${message}`);
            throw new HttpException({ status, message }, status);
        }
        this.logger.error(`[CORE UNEXPECTED] ${context} | ${error.message}`, error.stack);
        throw new InternalServerErrorException('Error consultando servicio Core');
    }

    async GetUserProfile(uuid: string): Promise<UserProfileModel> {
        const startedAt = Date.now();
        this.logger.log(`[START] Core.GetUserProfile | userUuid=${uuid}`);

        try {
            const { data } = await this.coreClient.get<ApiResponse<UserProfileCoreDTO>>(`/usuario/profile/${uuid}`);
            this.logger.log(`[OK] Core.GetUserProfile | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
            return UserProfileCoreDTO.toModel(data.data as UserProfileCoreDTO);
        } catch (error: any) {
            this.rethrowCoreError(error, `GetUserProfile | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
        }
    }

    async GetPortalMenuByUsuario(uuid: string): Promise<SystemNavigationModel> {
        const startedAt = Date.now();
        this.logger.log(`[START] Core.GetPortalMenuByUsuario | userUuid=${uuid}`);

        try {
            const { data } = await this.coreClient.get<ApiResponse<SystemNavigationDTO>>(`/usuario/profile/navigation/${uuid}`);
            this.logger.log(`[OK] Core.GetPortalenuByUsuario | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
            return SystemNavigationDTO.toModel(data.data as SystemNavigationModel);
        } catch (error: any) {
            this.rethrowCoreError(error, `GetPortalMenuByUsuario | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
        }
    }

    async GetUserImage(uuid: string): Promise<UserImagesModel> {
        const startedAt = Date.now();
        this.logger.log(`[START] Core.GetUserImage | userUuid=${uuid}`);
        try {
            const { data } = await this.coreClient.get<ApiResponse<ProfileImageCoreQueryResponse[]>>(`/usuario/profile/image/${uuid}`);
            this.logger.log(`[OK] Core.GetUserImage | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
            const urlBase = `${this.configService.get<string>("minio.publicEndpoint")}/${this.configService.get<string>("minio.bucket.publicProcessed")}` as string;
            return data.data ? ProfileImageCoreQueryResponse.toDomainModel(data.data, urlBase) : new UserImagesModel();
        } catch (error: any) {
            this.rethrowCoreError(error, `GetUserImage | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
        }
    }

    async UpdateUserProfile(uuid: string, body: UserProfileModel): Promise<UserProfileModel> {
        const startedAt = Date.now();
        this.logger.log(`[START] Core.UpdateUserProfile | userUuid=${uuid}`);
        const bodyForCore = UserProfileReqResDTO.builder(body);
        try {
            const { data } = await this.coreClient.put<ApiResponse<UserProfileReqResDTO>>(`/usuario/profile/${uuid}`, bodyForCore);
            this.logger.log(`[OK] Core.UpdateUserProfile | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
            return UserProfileReqResDTO.toModel(data.data as UserProfileReqResDTO);
        } catch (error: any) {
            this.rethrowCoreError(error, `UpdateUserProfile | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
        }
    }

    async GetUserOrganizacionProfile(uuid: string): Promise<UserOrganizacionProfileModel> {
        const startedAt = Date.now();
        this.logger.log(`[START] Core.GetUserOrganizacionProfile | userUuid=${uuid}`);
        try {
            const { data } = await this.coreClient.get<ApiResponse<UserOrganizacionProfileCoreDto[]>>(`/usuario/profile/organization/${uuid}`);
            this.logger.log(`[OK] Core.GetUserOrganizacionProfile | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
            return UserOrganizacionProfileCoreDto.toModel(data.data as UserOrganizacionProfileCoreDto[]);
        }
        catch (error: any) {
            this.rethrowCoreError(error, `GetUserOrganizacionProfile | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
        }
    }

    async getFacturasByUserUUID(uuid: string, organizacionUUID: string): Promise<FacturaModel[]> {
        const startedAt = Date.now();
        try {
            const { data } = await this.coreClient.get<ApiResponse<FacturaCoreResponse[]>>(`/factura/list/${uuid}/${organizacionUUID}`);
            return (data.data as FacturaCoreResponse[]).map(FacturaCoreResponse.toModel);
        }
        catch (error: any) {
            this.rethrowCoreError(error, `getFacturasByUserUUID | userUuid=${uuid} | organizacionUUID=${organizacionUUID}`);
        }
    }

    async updateFactura(body: FacturaUpdateRequestDto): Promise<{ campo: string, id: string, valor: any, isUpdate: any, mensaje: string }> {
        try {
            const { data } = await this.coreClient.patch<ApiResponse<{ campo: string, id: string, valor: any, isUpdate: any, mensaje: string }>>(`/factura`, body);
            return data.data as { campo: string, id: string, valor: any, isUpdate: any, mensaje: string };
        }
        catch (error: any) {
            this.rethrowCoreError(error, `updateFactura | facturaId=${body.id}`);
        }
    }

    async publicarFactura(body: FacturaCreateRequestDto): Promise<FacturaModel> {
        try {
            const { data } = await this.coreClient.post<ApiResponse<FacturaCoreResponse>>(`/factura`, body);
            return FacturaCoreResponse.toModel(data.data as FacturaCoreResponse);
        }
        catch (error: any) {
            this.rethrowCoreError(error, `publicarFactura | ownerUUID=${body.ownerUUID} | facturaId=${body.facturaId}`);
        }
    }

    async getUrlFactura(facturas: FacturaModel[], userUUID: string, organizacionUUID: string, correlationId: string): Promise<{ id: string, keyUrl: string }[]> {
        const body = {
            userUUID,
            organizacionUUID,
            facturas: facturas.map(factura => (
                factura.facturaId
            ))
        }
        try {
            const { data } = await this.coreClient.post<ApiResponse<{ id: string, keyUrl: string }[]>>(`/factura/url`, body);
            return data.data as { id: string, keyUrl: string }[];
        }
        catch (error: any) {
            this.rethrowCoreError(error, `getUrlFactura | organizacionUUID=${body.organizacionUUID}`);
        }
    }

    async getVersionTerminosActiva(): Promise<VersionTerminosModel> {
        try {
            const { data } = await this.coreClient.get<ApiResponse<VersionTerminosCoreResponse>>(`/factura/terminos/activo`);
            return VersionTerminosCoreResponse.toModel(data.data as VersionTerminosCoreResponse);
        } catch (error: any) {
            this.rethrowCoreError(error, 'getVersionTerminosActiva');
        }
    }

    async registrarAutorizacion(payload: {
        facturaId: string;
        versionTerminosId: string;
        acepto: boolean;
        usuarioUUID: string;
        ipAddress: string;
        userAgent: string;
        correlationId: string;
    }): Promise<void> {4 
        try {
            await this.coreClient.post<ApiResponse<void>>(`/factura/autorizacion`, payload);
        } catch (error: any) {
            this.rethrowCoreError(error, `registrarAutorizacion | facturaId=${payload.facturaId} | usuarioUUID=${payload.usuarioUUID}`);
        }
    }

    async getFacturasMarketPlace(correlationId: string, scope: string, cursor?: string, limit?: number): Promise<any> {
        try {
            const params = { correlationId, scope, cursor, limit };
            const { data } = await this.coreClient.get<ApiResponse<any>>(`/factura/marketplace`, { params });
            return data.data;
        } catch (error: any) {
            this.rethrowCoreError(error, `getFacturasMarketPlace | correlationId=${correlationId} | scope=${scope}`);
        }
    }

    // ── Organización ─────────────────────────────────────────────────────────

    async checkRutRegistrado(rut: string): Promise<{ exists: boolean; organizacion?: { id: string; razonSocial: string; tipoPersona: string; tipoParticipante: string; giros: any[] } }> {
        try {
            const { data } = await this.coreClient.get<ApiResponse<{ exists: boolean; organizacion?: { id: string; razonSocial: string; tipoPersona: string; tipoParticipante: string; giros: any[] } }>>(
                `/organizacion/check-rut`,
                { params: { rut } },
            );
            return data.data as { exists: boolean; organizacion?: { id: string; razonSocial: string; tipoPersona: string; tipoParticipante: string; giros: any[] } };
        } catch (error: any) {
            this.rethrowCoreError(error, `checkRutRegistrado | rut=${rut.slice(0, 6)}…`);
        }
    }

    async crearOrganizacion(payload: {
        tipoPersona: string;
        tipoParticipacion: string;
        rut: string;
        razonSocial: string;
        giro?: string;
    }): Promise<any> {
        try {
            const { data } = await this.coreClient.post<ApiResponse<any>>(`/organizacion`, payload);
            return data.data;
        } catch (error: any) {
            this.rethrowCoreError(error, `crearOrganizacion | rut=${payload.rut}`);
        }
    }

    // ── Catálogo geográfico ──────────────────────────────────────────────────

    async getRegiones(pais: string = 'CL'): Promise<any[]> {
        try {
            const { data } = await this.coreClient.get<ApiResponse<any[]>>(`/catalogo/geo/regiones`, { params: { pais } });
            return data.data as any[];
        } catch (error: any) {
            this.rethrowCoreError(error, `getRegiones | pais=${pais}`);
        }
    }

    async getProvincias(regionId: number): Promise<any[]> {
        try {
            const { data } = await this.coreClient.get<ApiResponse<any[]>>(`/catalogo/geo/provincias`, { params: { region_id: regionId } });
            return data.data as any[];
        } catch (error: any) {
            this.rethrowCoreError(error, `getProvincias | regionId=${regionId}`);
        }
    }

    async getComunas(provinciaId: number): Promise<any[]> {
        try {
            const { data } = await this.coreClient.get<ApiResponse<any[]>>(`/catalogo/geo/comunas`, { params: { provincia_id: provinciaId } });
            return data.data as any[];
        } catch (error: any) {
            this.rethrowCoreError(error, `getComunas | provinciaId=${provinciaId}`);
        }
    }

    async getBancos(pais: string = 'CL'): Promise<any[]> {
        try {
            const { data } = await this.coreClient.get<ApiResponse<any[]>>(`/catalogo/bancos`, { params: { pais } });
            return data.data as any[];
        } catch (error: any) {
            this.rethrowCoreError(error, `getBancos | pais=${pais}`);
        }
    }

    async getProductosFinancieros(tipoOrg?: string): Promise<any[]> {
        try {
            const params = tipoOrg ? { tipo_org: tipoOrg } : {};
            const { data } = await this.coreClient.get<ApiResponse<any[]>>(`/catalogo/productos-financieros`, { params });
            return data.data as any[];
        } catch (error: any) {
            this.rethrowCoreError(error, `getProductosFinancieros | tipoOrg=${tipoOrg}`);
        }
    }

    async guardarVerificacionTributaria(payload: {
        organizacionId: number;
        rawResponse: Record<string, any>;
        fuente: string;
    }): Promise<{ id: number }> {
        try {
            const { data } = await this.coreClient.post<ApiResponse<{ id: number }>>(
                `/organizacion/verificacion-tributaria`,
                payload,
            );
            return data.data as { id: number };
        } catch (error: any) {
            this.rethrowCoreError(error, `guardarVerificacionTributaria | organizacionId=${payload.organizacionId}`);
        }
    }

    // ── Solicitudes de acceso ─────────────────────────────────────────────────

    async crearSolicitudAccesoPorUuid(uuid: string, payload: {
        solicitanteUuid: string;
        rolSolicitado?: string;
        mensaje?: string;
    }): Promise<any> {
        try {
            const { data } = await this.coreClient.post<ApiResponse<any>>(
                `/organizacion/uuid/${uuid}/solicitud-ingreso`,
                payload,
            );
            return data.data;
        } catch (error: any) {
            this.rethrowCoreError(error, `crearSolicitudAccesoPorUuid | uuid=${uuid}`);
        }
    }

    async crearSolicitudAcceso(organizacionUUID: string, payload: {
        solicitanteUuid: string;
        rolSolicitado?: string;
        mensaje?: string;
    }): Promise<any> {
        try {
            const { data } = await this.coreClient.post<ApiResponse<any>>(
                `/organizacion/${organizacionUUID}/solicitud-acceso`,
                payload,
            );
            return data.data;
        } catch (error: any) {
            this.rethrowCoreError(error, `crearSolicitudAcceso | org=${organizacionUUID}`);
        }
    }

    async listarSolicitudesAcceso(organizacionUUID: string, estado?: string): Promise<any[]> {
        try {
            const params = estado ? { estado } : {};
            const { data } = await this.coreClient.get<ApiResponse<any[]>>(
                `/organizacion/${organizacionUUID}/solicitudes-acceso`,
                { params },
            );
            return data.data as any[];
        } catch (error: any) {
            this.rethrowCoreError(error, `listarSolicitudesAcceso | org=${organizacionUUID}`);
        }
    }

    async obtenerSolicitudPorToken(token: string): Promise<any | null> {
        try {
            const { data } = await this.coreClient.get<ApiResponse<any>>(
                `/organizacion/solicitud-acceso/${token}`,
            );
            return data.data;
        } catch (error: any) {
            this.rethrowCoreError(error, `obtenerSolicitudPorToken | token=${token.slice(0, 8)}…`);
        }
    }

    async resolverSolicitudAcceso(token: string, payload: {
        adminUuid: string;
        decision: 'APROBADA' | 'RECHAZADA';
        motivoRechazo?: string;
    }): Promise<{ ok: boolean }> {
        try {
            const { data } = await this.coreClient.post<ApiResponse<{ ok: boolean }>>(
                `/organizacion/solicitud-acceso/${token}/resolver`,
                payload,
            );
            return data.data as { ok: boolean };
        } catch (error: any) {
            this.rethrowCoreError(error, `resolverSolicitudAcceso | token=${token.slice(0, 8)}…`);
        }
    }

    async cancelarSolicitudAcceso(solicitudId: number, solicitanteUuid: string): Promise<{ ok: boolean }> {
        try {
            const { data } = await this.coreClient.delete<ApiResponse<{ ok: boolean }>>(
                `/organizacion/solicitud-acceso/${solicitudId}/cancelar`,
                { data: { solicitanteUuid } },
            );
            return data.data as { ok: boolean };
        } catch (error: any) {
            this.rethrowCoreError(error, `cancelarSolicitudAcceso | solicitudId=${solicitudId}`);
        }
    }

    // ── Admin: Miembros ───────────────────────────────────────────────────────

    async listarMiembrosOrg(organizacionUUID: string): Promise<any[]> {
        try {
            const { data } = await this.coreClient.get<ApiResponse<any[]>>(
                `/organizacion/${organizacionUUID}/miembros`,
            );
            return data.data as any[];
        } catch (error: any) {
            this.rethrowCoreError(error, `listarMiembrosOrg | org=${organizacionUUID}`);
        }
    }

    async cambiarRolMiembro(organizacionUUID: string, usuarioUuid: string, rolCodigo: string): Promise<{ ok: boolean }> {
        try {
            const { data } = await this.coreClient.patch<ApiResponse<{ ok: boolean }>>(
                `/organizacion/${organizacionUUID}/miembros/${usuarioUuid}/rol`,
                { rolCodigo },
            );
            return data.data as { ok: boolean };
        } catch (error: any) {
            this.rethrowCoreError(error, `cambiarRolMiembro | org=${organizacionUUID} user=${usuarioUuid}`);
        }
    }

    async removerMiembro(organizacionUUID: string, usuarioUuid: string): Promise<{ ok: boolean }> {
        try {
            const { data } = await this.coreClient.delete<ApiResponse<{ ok: boolean }>>(
                `/organizacion/${organizacionUUID}/miembros/${usuarioUuid}`,
            );
            return data.data as { ok: boolean };
        } catch (error: any) {
            this.rethrowCoreError(error, `removerMiembro | org=${organizacionUUID} user=${usuarioUuid}`);
        }
    }

    // ── Admin: Grupos ─────────────────────────────────────────────────────────

    async listarGruposOrg(organizacionUUID: string): Promise<any[]> {
        try {
            const { data } = await this.coreClient.get<ApiResponse<any[]>>(
                `/organizacion/${organizacionUUID}/grupos`,
            );
            return data.data as any[];
        } catch (error: any) {
            this.rethrowCoreError(error, `listarGruposOrg | org=${organizacionUUID}`);
        }
    }

    async crearGrupoOrg(organizacionUUID: string, payload: { nombre: string; descripcion?: string; liderUuid: string }): Promise<any> {
        try {
            const { data } = await this.coreClient.post<ApiResponse<any>>(
                `/organizacion/${organizacionUUID}/grupos`,
                payload,
            );
            return data.data;
        } catch (error: any) {
            this.rethrowCoreError(error, `crearGrupoOrg | org=${organizacionUUID}`);
        }
    }

    async actualizarGrupo(grupoId: string, payload: { nombre: string; descripcion?: string }): Promise<{ ok: boolean }> {
        try {
            const { data } = await this.coreClient.patch<ApiResponse<{ ok: boolean }>>(
                `/organizacion/grupos/${grupoId}`,
                payload,
            );
            return data.data as { ok: boolean };
        } catch (error: any) {
            this.rethrowCoreError(error, `actualizarGrupo | grupo=${grupoId}`);
        }
    }

    async eliminarGrupo(grupoId: string): Promise<{ ok: boolean }> {
        try {
            const { data } = await this.coreClient.delete<ApiResponse<{ ok: boolean }>>(
                `/organizacion/grupos/${grupoId}`,
            );
            return data.data as { ok: boolean };
        } catch (error: any) {
            this.rethrowCoreError(error, `eliminarGrupo | grupo=${grupoId}`);
        }
    }

    async agregarMiembroGrupo(grupoId: string, payload: { usuarioUuid: string; cargoEnGrupo?: string }): Promise<{ ok: boolean }> {
        try {
            const { data } = await this.coreClient.post<ApiResponse<{ ok: boolean }>>(
                `/organizacion/grupos/${grupoId}/miembros`,
                payload,
            );
            return data.data as { ok: boolean };
        } catch (error: any) {
            this.rethrowCoreError(error, `agregarMiembroGrupo | grupo=${grupoId}`);
        }
    }

    async removerMiembroGrupo(grupoId: string, usuarioUuid: string): Promise<{ ok: boolean }> {
        try {
            const { data } = await this.coreClient.delete<ApiResponse<{ ok: boolean }>>(
                `/organizacion/grupos/${grupoId}/miembros/${usuarioUuid}`,
            );
            return data.data as { ok: boolean };
        } catch (error: any) {
            this.rethrowCoreError(error, `removerMiembroGrupo | grupo=${grupoId} user=${usuarioUuid}`);
        }
    }

    // ── Admin: Enrolamiento ───────────────────────────────────────────────────

    async generarTokenEnrolamiento(
        organizacionUUID: string,
        payload: { adminUuid: string; rolDestino?: string },
    ): Promise<{ token: string; expiraEn: string }> {
        try {
            const { data } = await this.coreClient.post<ApiResponse<{ token: string; expiraEn: string }>>(
                `/organizacion/${organizacionUUID}/generar-token-enrolamiento`,
                payload,
            );
            return data.data as { token: string; expiraEn: string };
        } catch (error: any) {
            this.rethrowCoreError(error, `generarTokenEnrolamiento | org=${organizacionUUID}`);
        }
    }

    // ── Datos básicos de organización ─────────────────────────────────────────

    async getOrganizacionById(organizacionUUID: string): Promise<any | null> {
        try {
            const { data } = await this.coreClient.get<ApiResponse<any>>(
                `/organizacion/${organizacionUUID}`,
            );
            return data.data;
        } catch (error: any) {
            if ((error as any)?.response?.status === 404) return null;
            this.rethrowCoreError(error, `getOrganizacionById | id=${organizacionUUID}`);
        }
    }

    async getRolMiembro(organizacionUUID: string, usuarioUuid: string): Promise<{ rol: string | null }> {
        try {
            const { data } = await this.coreClient.get<ApiResponse<{ rol: string | null }>>(
                `/organizacion/${organizacionUUID}/mi-rol`,
                { params: { usuarioUuid } },
            );
            return data.data as { rol: string | null };
        } catch (error: any) {
            this.rethrowCoreError(error, `getRolMiembro | org=${organizacionUUID} user=${usuarioUuid}`);
        }
    }

}