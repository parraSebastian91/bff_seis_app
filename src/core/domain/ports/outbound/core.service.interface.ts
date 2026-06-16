
import { FacturaUpdateRequestDto } from "src/infrastructure/adapters/inbound/http/dto/facturaUpdate.request.dto";
import { FacturaModel } from "../../models/factura.model";
import { UserOrganizacionProfileModel } from "../../models/usuario/userOrganizacionProfile.model";
import { UserProfileModel, UserImagesModel } from "../../models/usuario/userProfile.model";
import { SystemNavigationModel } from "../../models/usuario/value-object/SystemNavigation.model";
import { FacturaCreateRequestDto } from "src/infrastructure/adapters/inbound/http/dto/facturaCreate.request.dto";
import { VersionTerminosModel } from "src/infrastructure/adapters/outbound/services/dto/versionTerminos.coreResponse";
import { OrganizacionCreatedCoreResponse } from "src/infrastructure/adapters/outbound/services/dto/organizacionCreated.coreResponse";


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

    // ── Catálogo geográfico ─────────────────────────────────────────────
    getRegiones(pais: string): Promise<any[]>;
    getProvincias(regionId: number): Promise<any[]>;
    getComunas(provinciaId: number): Promise<any[]>;
    getBancos(pais: string): Promise<any[]>;
    getProductosFinancieros(tipoOrg?: string): Promise<any[]>;

    // ── Organización ──────────────────────────────────────────────────────    /** Verifica si un RUT ya está registrado en la plataforma.
    /* @param rut dígitos + DV concatenados sin puntos ni guión (ej: "178414453") */
    checkRutRegistrado(rut: string): Promise<{ exists: boolean; organizacion?: OrganizacionCreatedCoreResponse }>;
    crearOrganizacion(payload: {
        tipoPersona: string;
        tipoParticipacion: string;
        rut: string;
        razonSocial: string;
        giro?: string;
    }): Promise<OrganizacionCreatedCoreResponse>;
    /** Obtiene datos básicos de una organización por BIGINT id */
    getOrganizacionById(organizacionUUID: string): Promise<{ id: number; razonSocial: string; descripcion: string | null; logoUrl: string | null; rut: string; dv: string } | null>;

    /** Retorna el rol del usuario en la organización, o null si no es miembro */
    getRolMiembro(organizacionUUID: string, usuarioUuid: string): Promise<{ rol: string | null }>;
    // ── Solicitudes de acceso ────────────────────────────────────────────
    crearSolicitudAcceso(organizacionUUID: string, payload: {
        solicitanteUuid: string;
        rolSolicitado?: string;
        mensaje?: string;
    }): Promise<{ solicitudId: number; token: string; expiraEn: string }>;

    /** Crea una solicitud de ingreso usando el UUID de la organización. */
    crearSolicitudAccesoPorUuid(uuid: string, payload: {
        solicitanteUuid: string;
        rolSolicitado?: string;
        mensaje?: string;
    }): Promise<{ solicitudId: number; token: string; expiraEn: string }>;

    listarSolicitudesAcceso(organizacionUUID: string, estado?: string): Promise<any[]>;

    obtenerSolicitudPorToken(token: string): Promise<any | null>;

    resolverSolicitudAcceso(token: string, payload: {
        adminUuid: string;
        decision: 'APROBADA' | 'RECHAZADA';
        motivoRechazo?: string;
    }): Promise<{ ok: boolean }>;

    cancelarSolicitudAcceso(solicitudId: number, solicitanteUuid: string): Promise<{ ok: boolean }>;

    // ── Admin: Miembros de organización ─────────────────────────────────────
    listarMiembrosOrg(organizacionUUID: string): Promise<any[]>;
    cambiarRolMiembro(organizacionUUID: string, usuarioUuid: string, rolCodigo: string): Promise<{ ok: boolean }>;
    removerMiembro(organizacionUUID: string, usuarioUuid: string): Promise<{ ok: boolean }>;

    // ── Admin: Grupos de trabajo ────────────────────────────────────────────
    listarGruposOrg(organizacionUUID: string): Promise<any[]>;
    crearGrupoOrg(organizacionUUID: string, payload: { nombre: string; descripcion?: string; liderUuid: string }): Promise<any>;
    actualizarGrupo(grupoId: string, payload: { nombre: string; descripcion?: string }): Promise<{ ok: boolean }>;
    eliminarGrupo(grupoId: string): Promise<{ ok: boolean }>;
    agregarMiembroGrupo(grupoId: string, payload: { usuarioUuid: string; cargoEnGrupo?: string }): Promise<{ ok: boolean }>;
    removerMiembroGrupo(grupoId: string, usuarioUuid: string): Promise<{ ok: boolean }>;

    // ── Admin: Enrolamiento ─────────────────────────────────────────────────
    generarTokenEnrolamiento(organizacionUUID: string, payload: { adminUuid: string; rolDestino?: string }): Promise<{ token: string; expiraEn: string }>;

    // ── Verificación tributaria ─────────────────────────────────────────
    /** Persiste en ms-core la respuesta cruda ya normalizada del organismo tributario */
    guardarVerificacionTributaria(payload: {
        organizacionId: number;
        rawResponse: Record<string, any>;
        fuente: string;
    }): Promise<{ id: number }>;

    // Catalogos de MEDIA schema
    getMediaCategory(mediaType: string): Promise<any[]>;

}