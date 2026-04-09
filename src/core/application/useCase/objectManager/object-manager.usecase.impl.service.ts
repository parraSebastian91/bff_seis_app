/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { IObjectManagerUseCase, ObjectUploadPayload } from './../../../../core/domain/ports/inbound/ObjectManagerUseCase.port';
import type { IMessagePublisher } from 'src/core/domain/ports/outbound/message.publisher.interface';

@Injectable()
export class ObjectManagerService implements IObjectManagerUseCase {

    constructor(private readonly messagePublisher: IMessagePublisher) { }

    async ExecuteCreateObject(file: ObjectUploadPayload, objectType: string, userUuid: string): Promise<any> {
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

}
