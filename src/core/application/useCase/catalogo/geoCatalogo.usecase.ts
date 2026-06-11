import type { ICoreService } from 'src/core/domain/ports/outbound/core.service.interface';

export class GeoCatalogoUseCase {

    constructor(private readonly coreService: ICoreService) { }

    getRegiones(pais: string) {
        return this.coreService.getRegiones(pais);
    }

    getProvincias(regionId: number) {
        return this.coreService.getProvincias(regionId);
    }

    getComunas(provinciaId: number) {
        return this.coreService.getComunas(provinciaId);
    }

    getBancos(pais: string) {
        return this.coreService.getBancos(pais);
    }

    getProductosFinancieros(tipoOrg?: string) {
        return this.coreService.getProductosFinancieros(tipoOrg);
    }

    crearOrganizacion(payload: {
        tipoPersona: string;
        tipoParticipacion: string;
        rut: string;
        razonSocial: string;
        giro?: string;
    }) {
        return this.coreService.crearOrganizacion(payload);
    }

    checkRutRegistrado(rut: string) {
        return this.coreService.checkRutRegistrado(rut);
    }

    // ── Solicitudes de acceso ──────────────────────────────────────────────

    crearSolicitudAcceso(organizacionUUID: string, payload: {
        solicitanteUuid: string;
        rolSolicitado?: string;
        mensaje?: string;
    }) {
        return this.coreService.crearSolicitudAcceso(organizacionUUID, payload);
    }

    listarSolicitudesAcceso(organizacionUUID: string, estado?: string) {
        return this.coreService.listarSolicitudesAcceso(organizacionUUID, estado);
    }

    obtenerSolicitudPorToken(token: string) {
        return this.coreService.obtenerSolicitudPorToken(token);
    }

    resolverSolicitudAcceso(token: string, payload: {
        adminUuid: string;
        decision: 'APROBADA' | 'RECHAZADA';
        motivoRechazo?: string;
    }) {
        return this.coreService.resolverSolicitudAcceso(token, payload);
    }

    cancelarSolicitudAcceso(solicitudId: number, solicitanteUuid: string) {
        return this.coreService.cancelarSolicitudAcceso(solicitudId, solicitanteUuid);
    }

    crearSolicitudAccesoPorUuid(uuid: string, payload: {
        solicitanteUuid: string;
        rolSolicitado?: string;
        mensaje?: string;
    }) {
        return this.coreService.crearSolicitudAccesoPorUuid(uuid, payload);
    }

    // ── Admin: Miembros ───────────────────────────────────────────────────────

    listarMiembrosOrg(organizacionUUID: string) {
        return this.coreService.listarMiembrosOrg(organizacionUUID);
    }

    cambiarRolMiembro(organizacionUUID: string, usuarioUuid: string, rolCodigo: string) {
        return this.coreService.cambiarRolMiembro(organizacionUUID, usuarioUuid, rolCodigo);
    }

    removerMiembro(organizacionUUID: string, usuarioUuid: string) {
        return this.coreService.removerMiembro(organizacionUUID, usuarioUuid);
    }

    // ── Admin: Grupos ─────────────────────────────────────────────────────────

    listarGruposOrg(organizacionUUID: string) {
        return this.coreService.listarGruposOrg(organizacionUUID);
    }

    crearGrupoOrg(organizacionUUID: string, payload: { nombre: string; descripcion?: string; liderUuid: string }) {
        return this.coreService.crearGrupoOrg(organizacionUUID, payload);
    }

    actualizarGrupo(grupoId: string, payload: { nombre: string; descripcion?: string }) {
        return this.coreService.actualizarGrupo(grupoId, payload);
    }

    eliminarGrupo(grupoId: string) {
        return this.coreService.eliminarGrupo(grupoId);
    }

    agregarMiembroGrupo(grupoId: string, payload: { usuarioUuid: string; cargoEnGrupo?: string }) {
        return this.coreService.agregarMiembroGrupo(grupoId, payload);
    }

    removerMiembroGrupo(grupoId: string, usuarioUuid: string) {
        return this.coreService.removerMiembroGrupo(grupoId, usuarioUuid);
    }

    // ── Admin: Enrolamiento ───────────────────────────────────────────────────

    generarTokenEnrolamiento(organizacionUUID: string, payload: { adminUuid: string; rolDestino?: string }) {
        return this.coreService.generarTokenEnrolamiento(organizacionUUID, payload);
    }

    // ── Datos básicos de organización ─────────────────────────────────────────

    getOrganizacionById(organizacionUUID: string) {
        return this.coreService.getOrganizacionById(organizacionUUID);
    }

    getRolMiembro(organizacionUUID: string, usuarioUuid: string) {
        return this.coreService.getRolMiembro(organizacionUUID, usuarioUuid);
    }
}
