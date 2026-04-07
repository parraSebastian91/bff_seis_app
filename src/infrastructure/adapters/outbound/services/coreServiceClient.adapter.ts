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
import { UserProfileModel } from 'src/core/domain/models/usuario/userProfile.model';

@Injectable()
export class CoreServiceClientAdapter implements ICoreService {
    private readonly logger = new Logger(CoreServiceClientAdapter.name);
    constructor(
        @Inject(CORE_SERVICE_CLIENT) private readonly coreClient: AxiosInstance,
    ) { }
    async GetUserProfile(uuid: string): Promise<UserProfileModel> {
        try {
            const { data } = await this.coreClient.get<ApiResponse<UserProfileDTO>>(`/usuario/profile/${uuid}`);
            this.logger.debug(`Respuesta del servicio Core: ${JSON.stringify(data)}`);
            return UserProfileDTO.toModel(data.data as UserProfileDTO);
        } catch (error: any) {
            if (isAxiosError(error) && error.response?.status === 404) {
                throw new NotFoundException(`Usuario ${uuid} no encontrado en Core`);
            }
            this.logger.error(`Error consultando servicio Core para usuario ${uuid}: ${error.message}`, error.stack);
            this.logger.debug(error.response ? `Respuesta del servicio Core: ${JSON.stringify(error.response.data)}` : 'No response data');
            throw new InternalServerErrorException('Error consultando servicio Core');
        }
    }

    async GetPortalMenuByUsuario(uuid: string): Promise<any> {
        try {
            const { data } = await this.coreClient.get<ApiResponse<SystemNavigationDTO>>(`/usuario/profile/navigation/${uuid}`);

            return SystemNavigationDTO.toModel(data.data as SystemNavigationDTO);
        } catch (error: any) {
            if (isAxiosError(error) && error.response?.status === 404) {
                throw new NotFoundException(`Usuario ${uuid} no encontrado en Core`);
            }
            this.logger.error(`Error consultando servicio Core para usuario ${uuid}: ${error.message}`, error.stack);
            this.logger.debug(error.response ? `Respuesta del servicio Core: ${JSON.stringify(error.response.data)}` : 'No response data');
            throw new InternalServerErrorException('Error consultando servicio Core');
        }
    }

}