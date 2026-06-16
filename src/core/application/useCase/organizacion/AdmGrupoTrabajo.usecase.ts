import { IAdministracionGrupoTrabajo } from "src/core/domain/ports/inbound/AdmGrupoTrabajo.interface";
import { ICoreService } from "src/core/domain/ports/outbound/core.service.interface";

export class AdministracionGrupoTrabajo implements IAdministracionGrupoTrabajo {

    constructor(private readonly coreService: ICoreService) { }


    // ── Admin: Miembros ───────────────────────────────────────────────────────

    listarMiembrosOrg(organizacionUUID: string) {
        return this.coreService.listarMiembrosOrg(organizacionUUID);
    }

    cambiarRolMiembro(organizacionUUID: string, usuarioUuid: string, rolCodigo: string)  {
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

    getRolMiembro(organizacionUUID: string, usuarioUuid: string) {
        return this.coreService.getRolMiembro(organizacionUUID, usuarioUuid);
    }
}