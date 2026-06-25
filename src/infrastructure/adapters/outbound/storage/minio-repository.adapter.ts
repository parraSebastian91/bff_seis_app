/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as MinioClient } from 'minio';
import { IStorageRepository } from 'src/core/domain/ports/outbound/storage.repository';

@Injectable()
export class MinioRepositoryAdapter implements IStorageRepository, OnModuleInit {

    private readonly logger = new Logger(MinioRepositoryAdapter.name);
    private readonly client: MinioClient;
    private readonly buckets: {
        publicOriginal: string;
        privateOriginal: string;
        publicProcessed: string;
        privateProcessed: string;
    };
    private readonly presignedExpirySeconds: number;
    private readonly publicEndpoint: string;

    constructor(private readonly configService: ConfigService) {
        this.buckets = {
            publicOriginal:   this.configService.get<string>('minio.bucket.publicOriginal')   || 'seis-app-public-original',
            privateOriginal:  this.configService.get<string>('minio.bucket.privateOriginal')  || 'seis-app-private-original',
            publicProcessed:  this.configService.get<string>('minio.bucket.publicProcessed')  || 'seis-app-public-processed',
            privateProcessed: this.configService.get<string>('minio.bucket.privateProcessed') || 'seis-app-private-processed',
        };
        this.presignedExpirySeconds = this.configService.get<number>('minio.presignedExpirySeconds') || 900;
        this.publicEndpoint = this.configService.get<string>('minio.publicEndpoint') || '';

        this.client = new MinioClient({
            endPoint: this.configService.get<string>('minio.endpoint') || 'minio',
            port: this.configService.get<number>('minio.port') || 9000,
            useSSL: this.configService.get<boolean>('minio.useSSL') || false,
            accessKey: this.configService.get<string>('minio.accessKey') || 'minioadmin',
            secretKey: this.configService.get<string>('minio.secretKey') || 'minioadmin123',
        });
    }

    async onModuleInit(): Promise<void> {
      
    }

    private withPublicEndpoint(url: string): string {
        if (!this.publicEndpoint) {
            return url;
        }

        const target = new URL(url);
        const publicUrl = new URL(this.publicEndpoint);
        target.protocol = publicUrl.protocol;
        target.host = publicUrl.host;

        return target.toString();
    }

    async getPresignedUrl(objectKey: string, operation: 'getObject' | 'putObject'): Promise<string> {
        const bucket = this.resolveBucket(objectKey);
        const url = operation === 'getObject'
            ? await this.client.presignedGetObject(bucket, objectKey, this.presignedExpirySeconds)
            : await this.client.presignedPutObject(bucket, objectKey, this.presignedExpirySeconds);

        return this.withPublicEndpoint(url);
    }

    async saveObject(file: Buffer, objectType: string, userUuid: string): Promise<string> {
        const objectKey = `${objectType}/${userUuid}/${Date.now()}`;
        await this.client.putObject(this.buckets.privateOriginal, objectKey, file, file.length);
        return objectKey;
    }

    /**
     * Descarga un objeto directamente desde MinIO usando el cliente interno (minio:9000).
     * No genera ninguna URL pública — la transferencia es BFF → MinIO, nunca sale al exterior.
     */
    async getObjectBuffer(objectKey: string): Promise<{ buffer: Buffer; contentType: string }> {
        const bucket = this.resolveBucket(objectKey);
        this.logger.debug(`getObjectBuffer bucket=${bucket} key=${objectKey}`);

        const dataStream = await this.client.getObject(bucket, objectKey);
        const chunks: Buffer[] = [];
        await new Promise<void>((resolve, reject) => {
            dataStream.on('data', (chunk: Buffer | string) => {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            });
            dataStream.on('end', resolve);
            dataStream.on('error', reject);
        });

        const buffer = Buffer.concat(chunks);
        const contentType = this.contentTypeFromKey(objectKey);
        return { buffer, contentType };
    }

    /** Elige el bucket basado en el prefijo de la clave. */
    private resolveBucket(objectKey: string): string {
        if (objectKey.startsWith('private/')) return this.buckets.privateOriginal;
        if (objectKey.startsWith('public/'))  return this.buckets.privateProcessed; // processed variants
        return this.buckets.privateProcessed; // fallback
    }

    private contentTypeFromKey(key: string): string {
        const ext = key.split('.').pop()?.toLowerCase() ?? '';
        const map: Record<string, string> = {
            pdf:  'application/pdf',
            webp: 'image/webp',
            png:  'image/png',
            jpg:  'image/jpeg',
            jpeg: 'image/jpeg',
        };
        return map[ext] ?? 'application/octet-stream';
    }
}
