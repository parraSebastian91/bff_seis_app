
export interface IStorageRepository {
    getPresignedUrl(objectKey: string, operation: 'getObject' | 'putObject'): Promise<string>;
    saveObject(file: Buffer, objectType: string, userUuid: string): Promise<string>;
    /**
     * Descarga el objeto directamente desde MinIO usando el cliente interno.
     * Nunca genera una URL pública — la transferencia es interna BFF → MinIO.
     * @param objectKey  Clave del objeto (ej: "public/documents/uuid/file.webp")
     * @param bucketHint Prefijo para elegir el bucket (default: auto-detectado desde la clave)
     */
    getObjectBuffer(objectKey: string): Promise<{ buffer: Buffer; contentType: string }>;
}