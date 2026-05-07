/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, Logger } from '@nestjs/common';
import { IObjectManagerUseCase } from './../../../../core/domain/ports/inbound/ObjectManagerUseCase.port';
import type { IMessagePublisher } from './../../../../core/domain/ports/outbound/message.publisher.interface';
import type { IStorageRepository } from './../../../../core/domain/ports/outbound/storage.repository';
import { ObjectUploadPayload } from './command/uploadObject.command';
import type { IStorageService } from 'src/core/domain/ports/outbound/storage.service.interface';

const PATH_TYPES = {
    USER_AVATAR: 'user-avatar',
    USER_BANNER: 'user-banner',
    DOCUMENT: 'documents',
};

@Injectable()
export class ObjectManagerService implements IObjectManagerUseCase {
    private readonly logger = new Logger(ObjectManagerService.name);

    constructor(
        private readonly messagePublisher: IMessagePublisher,
        private readonly storageRepository: IStorageRepository,
        private readonly storageService: IStorageService,
    ) { }

    async ExecuteCreateObject(file: ObjectUploadPayload, objectType: string, userUuid: string): Promise<any> {
        const startedAt = Date.now();
        this.logger.log(`[START] Crear objeto | userUuid=${userUuid} | objectType=${objectType} | size=${file?.size ?? 0}`);

        const objectKey = await this.storageRepository.saveObject(file.buffer, objectType, userUuid);
        this.logger.log(`[INFO] Objeto persistido en storage | objectKey=${objectKey}`);

        const eventPayload = {
            objectType,
            userUuid,
            file: {
                originalname: file?.originalname,
                mimetype: file?.mimetype,
                size: file?.size,
            },
            emittedAt: new Date().toISOString(),
        };

        await this.messagePublisher.publish('object.created', eventPayload);
        this.logger.log(`[OK] Evento object.created publicado | userUuid=${userUuid} | objectType=${objectType} | durationMs=${Date.now() - startedAt}`);

        return {
            status: 'published',
            event: 'object.created',
            payload: eventPayload,
        };
    }

    async ExecuteGetPresignedPutUrl(objectType: string, userUuid: string, name: string, fileType: string, organization?: string): Promise<string> {
        const startedAt = Date.now();
        const fileName = name.split('.')[0].toLowerCase();
        const normalizedFileType = this.normalizeFormatFileType(fileType);
        this.logger.log(`[START] Solicitar presigned URL | userUuid=${userUuid} | objectType=${objectType} | fileName=${fileName} | fileType=${normalizedFileType} | organization=${organization}`);

        try {
            const url = await this.storageService.getPresignedPutUrl(userUuid, objectType, fileName, normalizedFileType, organization);
            this.logger.log(`[OK] Presigned URL obtenida | userUuid=${userUuid} | objectType=${objectType} | durationMs=${Date.now() - startedAt}`);
            return url;
        } catch (error: any) {
            this.logger.error(`[FAIL] Solicitar presigned URL | userUuid=${userUuid} | objectType=${objectType} | durationMs=${Date.now() - startedAt} | reason=${error?.message ?? error}`);
            throw error;
        }
    }

    normalizeFormatFileType(fileType: string): string {
        const mapping: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'application/pdf': 'pdf',
        };
        return mapping[fileType] || 'bin';
    }

    async ExecuteUploadObject(file: ObjectUploadPayload, objectType: string, userUuid: string): Promise<any> {
        const startedAt = Date.now();
        this.logger.log(`[START] Subir objeto directo | userUuid=${userUuid} | objectType=${objectType} | size=${file?.size ?? 0}`);

        try {
            const objectKey = await this.storageRepository.saveObject(file.buffer, objectType, userUuid);
            this.logger.log(`[OK] Objeto subido directo | userUuid=${userUuid} | objectType=${objectType} | objectKey=${objectKey} | durationMs=${Date.now() - startedAt}`);
            return {
                objectKey
            };
        } catch (error: any) {
            this.logger.error(`[FAIL] Subir objeto directo | userUuid=${userUuid} | objectType=${objectType} | durationMs=${Date.now() - startedAt} | reason=${error?.message ?? error}`);
            throw error;
        }
    }

}
