/*
https://docs.nestjs.com/providers#services
*/


import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import { isAxiosError } from 'axios';
import { ICoreService, CORE_SERVICE_CLIENT } from '../../../../core/domain/ports/outbound/core.service.interface'
import { SystemNavigationDTO } from 'src/infrastructure/http/dto/systemNavigation.dto';
import { ApiResponse } from 'src/infrastructure/http/model/api-response.model';
import { UserProfileDTO } from './dto/UserProfile.core-service.dto';
import { UserImagesModel, UserProfileModel } from 'src/core/domain/models/usuario/userProfile.model';

@Injectable()
export class CoreServiceClientAdapter implements ICoreService {
    private readonly logger = new Logger(CoreServiceClientAdapter.name);
    constructor(
        @Inject(CORE_SERVICE_CLIENT) private readonly coreClient: AxiosInstance,
    ) { }

    async GetUserProfile(uuid: string): Promise<UserProfileModel> {
        const startedAt = Date.now();
        this.logger.log(`[START] Core.GetUserProfile | userUuid=${uuid}`);

        try {
            const { data } = await this.coreClient.get<ApiResponse<UserProfileDTO>>(`/usuario/profile/${uuid}`);
            this.logger.log(`[OK] Core.GetUserProfile | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
            return UserProfileDTO.toModel(data.data as UserProfileDTO);
        } catch (error: any) {
            if (isAxiosError(error) && error.response?.status === 404) {
                this.logger.warn(`[MISS] Core.GetUserProfile 404 | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
                throw new NotFoundException(`Usuario ${uuid} no encontrado en Core`);
            }
            this.logger.error(`Error consultando servicio Core para usuario ${uuid}: ${error.message} | durationMs=${Date.now() - startedAt}`, error.stack);
            this.logger.debug(error.response ? `Respuesta del servicio Core: ${JSON.stringify(error.response.data)}` : 'No response data');
            throw new InternalServerErrorException('Error consultando servicio Core');
        }
    }

    async GetPortalMenuByUsuario(uuid: string): Promise<any> {
        const startedAt = Date.now();
        this.logger.log(`[START] Core.GetPortalMenuByUsuario | userUuid=${uuid}`);

        try {
            const { data } = await this.coreClient.get<ApiResponse<SystemNavigationDTO>>(`/usuario/profile/navigation/${uuid}`);
            this.logger.log(`[OK] Core.GetPortalMenuByUsuario | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
            return SystemNavigationDTO.toModel(data.data as SystemNavigationDTO);
        } catch (error: any) {
            if (isAxiosError(error) && error.response?.status === 404) {
                this.logger.warn(`[MISS] Core.GetPortalMenuByUsuario 404 | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
                throw new NotFoundException(`Usuario ${uuid} no encontrado en Core`);
            }
            this.logger.error(`Error consultando servicio Core para usuario ${uuid}: ${error.message} | durationMs=${Date.now() - startedAt}`, error.stack);
            this.logger.debug(error.response ? `Respuesta del servicio Core: ${JSON.stringify(error.response.data)}` : 'No response data');
            throw new InternalServerErrorException('Error consultando servicio Core');
        }
    }

    async GetUserImage(uuid: string): Promise<UserImagesModel> {
        const startedAt = Date.now();
        this.logger.log(`[START] Core.GetUserImage | userUuid=${uuid}`);
        try {
            const { data } = await this.coreClient.get<ApiResponse<any>>(`/usuario/profile/image/${uuid}`);
            this.logger.log(`[OK] Core.GetUserImage | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
            return data.data.avatar;
        } catch (error: any) {
            if (isAxiosError(error) && error.response?.status === 404) {
                this.logger.warn(`[MISS] Core.GetUserImage 404 | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
                throw new NotFoundException(`Imagen de usuario ${uuid} no encontrada en Core`);
            }
            this.logger.error(`Error consultando servicio Core para imagen de usuario ${uuid}: ${error.message} | durationMs=${Date.now() - startedAt}`, error.stack);
            this.logger.debug(error.response ? `Respuesta del servicio Core: ${JSON.stringify(error.response.data)}` : 'No response data');
            throw new InternalServerErrorException('Error consultando servicio Core');
        }
    }

}