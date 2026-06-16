import { IOrganizacion } from "src/core/domain/ports/inbound/organizacion.interface";
import { ICoreService } from "src/core/domain/ports/outbound/core.service.interface";
import { OrganizacionCreatedCoreResponse } from "src/infrastructure/adapters/outbound/services/dto/organizacionCreated.coreResponse";

export class OrganizacionUseCase implements IOrganizacion {


    constructor(private readonly coreService: ICoreService) { }

    async crearOrganizacion(payload: {
        tipoPersona: string;
        tipoParticipacion: string;
        rut: string;
        razonSocial: string;
        giro?: string;
    }): Promise<OrganizacionCreatedCoreResponse> {
        return await this.coreService.crearOrganizacion(payload);
    }

    async checkRutRegistrado(rut: string): Promise<{
        exists: boolean;
        organizacion?: OrganizacionCreatedCoreResponse | undefined;
    }> {
        return await this.coreService.checkRutRegistrado(rut);
    }

    async loadVerificacionTributaria(payload: { organizacionId: number; rawResponse: Record<string, any>; fuente: string }): Promise<{ id: number }> {
        return await this.coreService.guardarVerificacionTributaria(payload);
    }

    async getOrganizacionById(organizacionUUID: string): Promise<{
        id: number;
        razonSocial: string;
        descripcion: string | null;
        logoUrl: string | null;
        rut: string;
        dv: string;
    } | null> {
        return await this.coreService.getOrganizacionById(organizacionUUID);
    }
}