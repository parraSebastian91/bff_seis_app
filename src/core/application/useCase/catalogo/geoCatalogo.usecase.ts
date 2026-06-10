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

    crearSolicitudAcceso(organizacionId: number, payload: {
        solicitanteUuid: string;
        rolSolicitado?: string;
        mensaje?: string;
    }) {
        return this.coreService.crearSolicitudAcceso(organizacionId, payload);
    }

    listarSolicitudesAcceso(organizacionId: number, estado?: string) {
        return this.coreService.listarSolicitudesAcceso(organizacionId, estado);
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

    listarMiembrosOrg(organizacionId: number) {
        return this.coreService.listarMiembrosOrg(organizacionId);
    }

    cambiarRolMiembro(organizacionId: number, usuarioUuid: string, rolCodigo: string) {
        return this.coreService.cambiarRolMiembro(organizacionId, usuarioUuid, rolCodigo);
    }

    removerMiembro(organizacionId: number, usuarioUuid: string) {
        return this.coreService.removerMiembro(organizacionId, usuarioUuid);
    }

    // ── Admin: Grupos ─────────────────────────────────────────────────────────

    listarGruposOrg(organizacionId: number) {
        return this.coreService.listarGruposOrg(organizacionId);
    }

    crearGrupoOrg(organizacionId: number, payload: { nombre: string; descripcion?: string; liderUuid: string }) {
        return this.coreService.crearGrupoOrg(organizacionId, payload);
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

    generarTokenEnrolamiento(organizacionId: number, payload: { adminUuid: string; rolDestino?: string }) {
        return this.coreService.generarTokenEnrolamiento(organizacionId, payload);
    }

    // ── Datos básicos de organización ─────────────────────────────────────────

    getOrganizacionById(organizacionId: number) {
        return this.coreService.getOrganizacionById(organizacionId);
    }

    getRolMiembro(organizacionId: number, usuarioUuid: string) {
        return this.coreService.getRolMiembro(organizacionId, usuarioUuid);
    }
}
