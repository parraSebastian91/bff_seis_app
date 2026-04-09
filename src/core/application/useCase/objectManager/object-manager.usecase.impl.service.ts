/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
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

    constructor(
        private readonly messagePublisher: IMessagePublisher,
        private readonly storageRepository: IStorageRepository,
        private readonly storageService: IStorageService,
    ) { }

    async ExecuteCreateObject(file: ObjectUploadPayload, objectType: string, userUuid: string): Promise<any> {
        const objectKey = await this.storageRepository.saveObject(file.buffer, objectType, userUuid);

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

        return {
            status: 'published',
            event: 'object.created',
            payload: eventPayload,
        };
    }

    async ExecuteGetPresignedPutUrl(objectType: string, userUuid: string, name: string, fileType: string): Promise<string> {
        const fileName = name.split('.')[0].toLowerCase();
        return await this.storageService.getPresignedPutUrl(userUuid, objectType, fileName, this.normalizeFormatFileType(fileType));
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
        const objectKey = await this.storageRepository.saveObject(file.buffer, objectType, userUuid);
        return {
            objectKey
        };
    }

}
