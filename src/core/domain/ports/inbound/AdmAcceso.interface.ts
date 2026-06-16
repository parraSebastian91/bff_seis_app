export interface IAdministracionAccesoOrganizacion {

    crearSolicitudAcceso(organizacionUUID: string, payload: {
        solicitanteUuid: string;
        rolSolicitado?: string;
        mensaje?: string;
    }): Promise<any>;

    listarSolicitudesAcceso(organizacionUUID: string, estado?: string): Promise<any>;
    obtenerSolicitudPorToken(token: string): Promise<any>;
    resolverSolicitudAcceso(token: string, payload: {
        adminUuid: string;
        decision: 'APROBADA' | 'RECHAZADA';
        motivoRechazo?: string;
    }): Promise<any>;
    cancelarSolicitudAcceso(solicitudId: number, solicitanteUuid: string): Promise<any>;
    crearSolicitudAccesoPorUuid(uuid: string, payload: {
        solicitanteUuid: string;
        rolSolicitado?: string;
        mensaje?: string;
    }): Promise<any>;
    generarTokenEnrolamiento(organizacionUUID: string, payload: { adminUuid: string; rolDestino?: string }): Promise<{
        token: string;
        expiraEn: string;
    }>;
}