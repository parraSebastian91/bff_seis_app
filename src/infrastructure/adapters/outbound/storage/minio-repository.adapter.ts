/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { IStorageRepository } from 'src/core/domain/ports/outbound/storage.repository';

@Injectable()
export class MinioRepositoryAdapter implements IStorageRepository {
    async getPresignedUrl(objectKey: string, operation: 'getObject' | 'putObject'): Promise<string> {
        // Implementación para obtener una URL pre-firmada de MinIO
        // Esto es solo un ejemplo y debe ser adaptado a tu configuración de MinIO
        const presignedUrl = `https://minio.example.com/${objectKey}?operation=${operation}`;
        return presignedUrl;
    }

    async saveObject(file: Buffer, objectType: string, userUuid: string): Promise<string> {
        // Implementación para guardar un objeto en MinIO
        // Esto es solo un ejemplo y debe ser adaptado a tu configuración de MinIO
        const objectKey = `${objectType}/${userUuid}/${Date.now()}`;
        // Aquí deberías usar el SDK de MinIO para subir el archivo usando el buffer
        // Por ejemplo: await minioClient.putObject('bucket-name', objectKey, file);
        return objectKey; // Retorna la clave del objeto guardado
    }
}
