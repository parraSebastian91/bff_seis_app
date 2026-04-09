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
    private readonly bucket: string;
    private readonly presignedExpirySeconds: number;
    private readonly publicEndpoint: string;

    constructor(private readonly configService: ConfigService) {
        this.bucket = this.configService.get<string>('minio.bucket') || 'seis-app';
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
        const bucketExists = await this.client.bucketExists(this.bucket);

        if (!bucketExists) {
            await this.client.makeBucket(this.bucket, 'us-east-1');
            this.logger.log(`Bucket created: ${this.bucket}`);
        }
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
        const url = operation === 'getObject'
            ? await this.client.presignedGetObject(this.bucket, objectKey, this.presignedExpirySeconds)
            : await this.client.presignedPutObject(this.bucket, objectKey, this.presignedExpirySeconds);

        return this.withPublicEndpoint(url);
    }

    async saveObject(file: Buffer, objectType: string, userUuid: string): Promise<string> {
        const objectKey = `${objectType}/${userUuid}/${Date.now()}`;

        await this.client.putObject(this.bucket, objectKey, file, file.length);

        return objectKey;
    }
}
