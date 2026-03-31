/*
https://docs.nestjs.com/providers#services
*/


import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import { isAxiosError } from 'axios';
import { UsuarioModel } from './../../../core/domain/models/usuario/usuario.model';
import { ICoreService, CORE_SERVICE_CLIENT } from './../../../core/domain/ports/outbound/core.service.interface';
import { UserProfileDTO } from 'src/infrastructure/dto/UserCoreService.dto';
import { SystemNavigationDTO } from 'src/infrastructure/dto/systemNavigation.dto';

@Injectable()
export class CoreServiceClientAdapter implements ICoreService {
    private readonly logger = new Logger(CoreServiceClientAdapter.name);
    constructor(
        @Inject(CORE_SERVICE_CLIENT) private readonly coreClient: AxiosInstance,
    ) { }
    async GetUserProfile(uuid: string): Promise<UsuarioModel> {
        try {
            const { data } = await this.coreClient.get<UserProfileDTO>(`/usuario/profile/${uuid}`);
            this.logger.debug(`Respuesta del servicio Core: ${JSON.stringify(data)}`);
            return UserProfileDTO.toModel(data);;
        } catch (error) {
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
            const { data } = await this.coreClient.get<SystemNavigationDTO>(`/usuario/profile/navigation/${uuid}`);
            
            return SystemNavigationDTO.toModel(data);
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) {
                throw new NotFoundException(`Usuario ${uuid} no encontrado en Core`);
            }
            this.logger.error(`Error consultando servicio Core para usuario ${uuid}: ${error.message}`, error.stack);
            this.logger.debug(error.response ? `Respuesta del servicio Core: ${JSON.stringify(error.response.data)}` : 'No response data');
            throw new InternalServerErrorException('Error consultando servicio Core');
        }
    }

}