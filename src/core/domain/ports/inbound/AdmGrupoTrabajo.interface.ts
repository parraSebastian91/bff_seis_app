export interface IAdministracionGrupoTrabajo {
    listarMiembrosOrg(organizacionUUID: string): Promise<{ usuarioUuid: string; nombre: string; email: string; rolCodigo: string }[]>;
    cambiarRolMiembro(organizacionUUID: string, usuarioUuid: string, rolCodigo: string): Promise<{
        ok: boolean;
    }>;
    removerMiembro(organizacionUUID: string, usuarioUuid: string): Promise<{ ok: boolean }>;
    listarGruposOrg(organizacionUUID: string): Promise<{ grupoId: string; nombre: string; descripcion?: string; liderUuid: string }[]>;
    crearGrupoOrg(organizacionUUID: string, payload: { nombre: string; descripcion?: string; liderUuid: string }): Promise<{ grupoId: string; nombre: string; descripcion?: string; liderUuid: string }>;
    actualizarGrupo(grupoId: string, payload: { nombre: string; descripcion?: string }): Promise<{
        ok: boolean;
    }>;
    eliminarGrupo(grupoId: string): Promise<{ ok: boolean }>;
    agregarMiembroGrupo(grupoId: string, payload: { usuarioUuid: string; cargoEnGrupo?: string }): Promise<{ ok: boolean }>;
    removerMiembroGrupo(grupoId: string, usuarioUuid: string): Promise<{ ok: boolean }>;
    getRolMiembro(organizacionUUID: string, usuarioUuid: string): Promise<{
        rol: string | null;
    }>;
}