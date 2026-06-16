import { IAdministracionAccesoOrganizacion } from "src/core/domain/ports/inbound/AdmAcceso.interface";
import { ICoreService } from "src/core/domain/ports/outbound/core.service.interface";

export class AdministracionAccesoOrganizacionUseCase implements IAdministracionAccesoOrganizacion {

    constructor(private readonly coreService: ICoreService) { }

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

    generarTokenEnrolamiento(organizacionUUID: string, payload: { adminUuid: string; rolDestino?: string }) {
        return this.coreService.generarTokenEnrolamiento(organizacionUUID, payload);
    }

}