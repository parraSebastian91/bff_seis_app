import { GiroComercialCoreResponse, OrganizacionCreatedCoreResponse } from "src/infrastructure/adapters/outbound/services/dto/organizacionCreated.coreResponse";

export interface IOrganizacion {
    crearOrganizacion(payload: {
        tipoPersona: string;
        tipoParticipacion: string;
        rut: string;
        razonSocial: string;
        giro?: string;
    }): Promise<OrganizacionCreatedCoreResponse>;
    checkRutRegistrado(rut: string): Promise<{
        exists: boolean;
        organizacion?: OrganizacionCreatedCoreResponse;
    } | undefined>;

    loadVerificacionTributaria(payload: { organizacionId: number; rawResponse: Record<string, any>; fuente: string }): Promise<{ id: number }>;

    getOrganizacionById(organizacionUUID: string): Promise<{
        id: number;
        razonSocial: string;
        descripcion: string | null;
        logoUrl: string | null;
        rut: string;
        dv: string;
    } | null>;
}