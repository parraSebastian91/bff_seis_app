/*
https://docs.nestjs.com/providers#services
*/

import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import { isAxiosError } from 'axios'
import { IStorageService, STORAGE_SERVICE } from 'src/core/domain/ports/outbound/storage.service.interface';
import { ApiResponse } from 'src/infrastructure/http/model/api-response.model';

@Injectable()
export class StorageServiceAdapter implements IStorageService {
    private readonly logger = new Logger(StorageServiceAdapter.name);
    constructor(
        @Inject(STORAGE_SERVICE) private readonly storageClient: AxiosInstance,
    ) { }

    async getPresignedPutUrl(userUuid: string, objectType: string, fileName: string, fileType: string, organization?: string): Promise<string> {
        const startedAt = Date.now();
        this.logger.log(`[START] Storage.getPresignedPutUrl | userUuid=${userUuid} | objectType=${objectType} | fileName=${fileName} | fileType=${fileType} | organization=${organization}`);

        try {
            const { data } = await this.storageClient.get<ApiResponse<any>>(`api/v1/url?UUID=${userUuid}&object_type=${objectType}&file_name=${fileName}&content_type=${fileType}&organization=${organization}`);
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
}
