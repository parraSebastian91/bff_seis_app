/*
https://docs.nestjs.com/providers#services
*/

import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import { isAxiosError } from 'axios'
import { IStorageService, STORAGE_SERVICE } from 'src/core/domain/ports/outbound/storage.service.interface';
import { ApiResponse } from 'src/infrastructure/adapters/inbound/http/model/api-response.model';

@Injectable()
export class StorageServiceAdapter implements IStorageService {
    private readonly logger = new Logger(StorageServiceAdapter.name);
    constructor(
        @Inject(STORAGE_SERVICE) private readonly storageClient: AxiosInstance,
    ) { }

    async getPresignedPutUrl(userUuid: string, objectType: string, fileName: string, fileType: string, userName: string, organization?: string): Promise<string> {
        const startedAt = Date.now();
        this.logger.log(`[START] Storage.getPresignedPutUrl | userUuid=${userUuid} | objectType=${objectType} | fileName=${fileName} | fileType=${fileType} | userName=${userName} | organization=${organization}`);

        try {
            const { data } = await this.storageClient.get<ApiResponse<any>>(`api/v1/put-url?UUID=${userUuid}&object_type=${objectType}&file_name=${fileName}&content_type=${fileType}&gestor=${userName}&organization=${organization}`);
            this.logger.log(`[OK] Storage.getPresignedPutUrl | userUuid=${userUuid} | objectType=${objectType} | durationMs=${Date.now() - startedAt}`);
            const url = data['url'];
            return url as string;
        } catch (error: any) {
            if (isAxiosError(error) && error.response?.status === 404) {
                this.logger.warn(`[MISS] Storage.getPresignedPutUrl 404 | userUuid=${userUuid} | objectType=${objectType} | durationMs=${Date.now() - startedAt}`);
                throw new NotFoundException(`Presigned URL not found for user ${userUuid} and object type ${objectType}`);
            }
            this.logger.error(`Error consultando servicio Storage para usuario ${userUuid} y tipo de objeto ${objectType}: ${error.message} | durationMs=${Date.now() - startedAt}`, error.stack);
            this.logger.debug(error.response ? `Respuesta del servicio Storage: ${JSON.stringify(error.response.data)}` : 'No response data');
            throw new InternalServerErrorException('Error consultando servicio Storage');
        }
    }

    async getPresignedGetUrl(storageKey: string, correlationId: string): Promise<string> {
        const startedAt = Date.now();
        this.logger.log(`[START] Storage.getPresignedGetUrl | storageKey=${storageKey} | correlationId=${correlationId}`);
        try {
            const { data } = await this.storageClient.get<ApiResponse<any>>(`api/v1/get-url?storage_key=${storageKey}&correlation_id=${correlationId}`);
            this.logger.log(`[OK] Storage.getPresignedGetUrl | storageKey=${storageKey} | correlationId=${correlationId} | durationMs=${Date.now() - startedAt}`);
            const url = data['url'];
            return url as string;
        } catch (error: any) {
            if (isAxiosError(error) && error.response?.status === 404) {
                this.logger.warn(`[MISS] Storage.getPresignedGetUrl 404 | storageKey=${storageKey} | correlationId=${correlationId} | durationMs=${Date.now() - startedAt}`);
                throw new NotFoundException(`Presigned URL not found for storage key ${storageKey} and correlation ID ${correlationId}`);
            }
            this.logger.error(`Error consultando servicio Storage para storage key ${storageKey} y correlation ID ${correlationId}: ${error.message} | durationMs=${Date.now() - startedAt}`, error.stack);
            this.logger.debug(error.response ? `Respuesta del servicio Storage: ${JSON.stringify(error.response.data)}` : 'No response data');
            throw new InternalServerErrorException('Error consultando servicio Storage');
        }
    }
}
