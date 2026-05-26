export interface AutorizacionPublicacionRequestDto {
    facturaId: string;
    versionTerminosId: string;
    acepto: boolean;
    correlationId?: string;
}
