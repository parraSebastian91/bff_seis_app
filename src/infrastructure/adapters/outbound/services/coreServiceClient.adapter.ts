/*
https://docs.nestjs.com/providers#services
*/


import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import { isAxiosError } from 'axios';
import { ICoreService, CORE_SERVICE_CLIENT } from '../../../../core/domain/ports/outbound/core.service.interface'
import { SystemNavigationDTO } from '../../inbound/http/dto/systemNavigation.dto';
import { ApiResponse } from 'src/infrastructure/adapters/inbound/http/model/api-response.model';
import { UserProfileCoreDTO } from './dto/UserProfile.core-service.dto';
import { UserImagesModel, UserProfileModel } from 'src/core/domain/models/usuario/userProfile.model';
import { ProfileImageCoreQueryResponse } from './dto/ProfileImageCoreResponse.dto';
import { ConfigService } from '@nestjs/config';
import { ProfileImageError } from 'src/core/domain/errors/ProfileImage.error';
import { UserProfileReqResDTO } from 'src/infrastructure/adapters/inbound/http/dto/userProfile.req.res.dto';
import { SystemNavigationModel } from 'src/core/domain/models/usuario/value-object/SystemNavigation.model';
import { UserOrganizacionProfileModel } from 'src/core/domain/models/usuario/userOrganizacionProfile.model';
import { UserOrganizacionProfileCoreDto } from './dto/userOrganizacionProfile.core.dto';
import { FacturaCoreResponse } from './dto/factura.coreResponse';
import { FacturaModel } from 'src/core/domain/models/factura.model';

@Injectable()
export class CoreServiceClientAdapter implements ICoreService {
    private readonly logger = new Logger(CoreServiceClientAdapter.name);
    constructor(
        private configService: ConfigService,
        @Inject(CORE_SERVICE_CLIENT) private readonly coreClient: AxiosInstance,
    ) { }

    async GetUserProfile(uuid: string): Promise<UserProfileModel> {
        const startedAt = Date.now();
        this.logger.log(`[START] Core.GetUserProfile | userUuid=${uuid}`);

        try {
            const { data } = await this.coreClient.get<ApiResponse<UserProfileCoreDTO>>(`/usuario/profile/${uuid}`);
            this.logger.log(`[OK] Core.GetUserProfile | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
            return UserProfileCoreDTO.toModel(data.data as UserProfileCoreDTO);
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

    async GetPortalMenuByUsuario(uuid: string): Promise<SystemNavigationModel> {
        const startedAt = Date.now();
        this.logger.log(`[START] Core.GetPortalMenuByUsuario | userUuid=${uuid}`);

        try {
            const { data } = await this.coreClient.get<ApiResponse<SystemNavigationDTO>>(`/usuario/profile/navigation/${uuid}`);
            this.logger.log(`[OK] Core.GetPortalenuByUsuario | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
            console.log(data)
            return SystemNavigationDTO.toModel(data.data as SystemNavigationModel);
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
            const { data } = await this.coreClient.get<ApiResponse<ProfileImageCoreQueryResponse[]>>(`/usuario/profile/image/${uuid}`);
            this.logger.log(`[OK] Core.GetUserImage | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
            const urlBase = `${this.configService.get<string>("minio.publicEndpoint")}/${this.configService.get<string>("minio.bucket.publicProcessed")}` as string;
            return data.data ? ProfileImageCoreQueryResponse.toDomainModel(data.data, urlBase) : new UserImagesModel();
        } catch (error: any) {
            if (isAxiosError(error) && error.response?.status === 404) {
                this.logger.warn(`[MISS] Core.GetUserImage 404 | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
                throw new ProfileImageError(`Imagen de usuario ${uuid} no encontrada en Core`);
            }
            this.logger.error(`Error consultando servicio Core para imagen de usuario ${uuid}: ${error.message} | durationMs=${Date.now() - startedAt}`, error.stack);
            this.logger.debug(error.response ? `Respuesta del servicio Core: ${JSON.stringify(error.response.data)}` : 'No response data');
            throw new InternalServerErrorException('Error consultando servicio Core');
        }
    }

    async UpdateUserProfile(uuid: string, body: UserProfileModel): Promise<UserProfileModel> {
        const startedAt = Date.now();
        this.logger.log(`[START] Core.UpdateUserProfile | userUuid=${uuid}`);
        const bodyForCore = UserProfileReqResDTO.builder(body);
        try {
            const { data } = await this.coreClient.put<ApiResponse<UserProfileReqResDTO>>(`/usuario/profile/${uuid}`, bodyForCore);
            this.logger.log(`[OK] Core.UpdateUserProfile | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
            return UserProfileReqResDTO.toModel(data.data as UserProfileReqResDTO);
        } catch (error: any) {
            if (isAxiosError(error) && error.response?.status === 404) {
                this.logger.warn(`[MISS] Core.UpdateUserProfile 404 | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
                throw new NotFoundException(`Usuario ${uuid} no encontrado en Core`);
            }
            this.logger.error(`Error consultando servicio Core para usuario ${uuid}: ${error.message} | durationMs=${Date.now() - startedAt}`, error.stack);
            this.logger.debug(error.response ? `Respuesta del servicio Core: ${JSON.stringify(error.response.data)}` : 'No response data');
            throw new InternalServerErrorException('Error consultando servicio Core');
        }
    }

    async GetUserOrganizacionProfile(uuid: string): Promise<UserOrganizacionProfileModel> {
        const startedAt = Date.now();
        this.logger.log(`[START] Core.GetUserOrganizacionProfile | userUuid=${uuid}`);
        try {
            const { data } = await this.coreClient.get<ApiResponse<UserOrganizacionProfileCoreDto[]>>(`/usuario/profile/organization/${uuid}`);
            this.logger.log(`[OK] Core.GetUserOrganizacionProfile | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
            return UserOrganizacionProfileCoreDto.toModel(data.data as UserOrganizacionProfileCoreDto[]);
        }
        catch (error: any) {
            if (isAxiosError(error) && error.response?.status === 404) {
                this.logger.warn(`[MISS] Core.GetUserOrganizacionProfile 404 | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
                throw new NotFoundException(`Usuario ${uuid} no encontrado en Core`);
            }
            this.logger.error(`Error consultando servicio Core para usuario ${uuid}: ${error.message} | durationMs=${Date.now() - startedAt}`, error.stack);
            this.logger.debug(error.response ? `Respuesta del servicio Core: ${JSON.stringify(error.response.data)}` : 'No response data');
            throw new InternalServerErrorException('Error consultando servicio Core');
        }
    }

    async getFacturasByUserUUID(uuid: string, organizacionUUID: string): Promise<FacturaModel[]> {
        const startedAt = Date.now();
        this.logger.log(`[START] Core.getFacturasByUserUUID | userUuid=${uuid} | organizacionUUID=${organizacionUUID}`);
        try {
            const { data } = await this.coreClient.get<ApiResponse<FacturaCoreResponse[]>>(`/factura/list/${uuid}/${organizacionUUID}`);
            this.logger.log(`[OK] Core.getFacturasByUserUUID | userUuid=${uuid} | organizacionUUID=${organizacionUUID} | durationMs=${Date.now() - startedAt}`);
            return FacturaCoreResponse.toModel(data.data as FacturaCoreResponse[]);
        }
        catch (error: any) {
            if (isAxiosError(error) && error.response?.status === 404) {
                this.logger.warn(`[MISS] Core.getFacturasByUserUUID 404 | userUuid=${uuid} | organizacionUUID=${organizacionUUID} | durationMs=${Date.now() - startedAt}`);
                throw new NotFoundException(`Usuario ${uuid} no encontrado en Core`);
            }
            this.logger.error(`Error consultando servicio Core para usuario ${uuid} | organizacionUUID=${organizacionUUID}: ${error.message} | durationMs=${Date.now() - startedAt}`, error.stack);
            this.logger.debug(error.response ? `Respuesta del servicio Core: ${JSON.stringify(error.response.data)}` : 'No response data');
            throw new InternalServerErrorException('Error consultando servicio Core');
        }
    }
}