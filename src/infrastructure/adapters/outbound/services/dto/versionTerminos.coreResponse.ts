export interface VersionTerminosModel {
    id: string;
    codigo: string;
    descripcion: string;
    textCompleto: string;
    hashSha256: string;
}

export class VersionTerminosCoreResponse {
    id: string;
    codigo: string;
    descripcion: string;
    texto_completo: string;
    hash_sha256: string;

    static toModel(dto: VersionTerminosCoreResponse): VersionTerminosModel {
        return {
            id: dto.id,
            codigo: dto.codigo,
            descripcion: dto.descripcion,
            textCompleto: dto.texto_completo,
            hashSha256: dto.hash_sha256,
        };
    }
}
