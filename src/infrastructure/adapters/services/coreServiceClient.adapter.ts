/*
https://docs.nestjs.com/providers#services
*/


import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import { isAxiosError } from 'axios';
import { UsuarioModel } from './../../../core/domain/models/usuario/usuario.model';
import { Correo } from './../../../core/domain/models/usuario/value-object/correo.vo';
import { NombrePersona } from './../../../core/domain/models/usuario/value-object/nombrePersona.vo';
import { ICoreService, CORE_SERVICE_CLIENT } from './../../../core/domain/ports/outbound/core.service.interface';
import { UserProfileDTO } from 'src/infrastructure/dto/UserCoreService.dto';


type CoreUserResponse = {
    uuid: string;
    username: string;
    nombres: string;
    ap_paterno: string;
    ap_materno: string;
    email: string;
    password?: string;
};

@Injectable()
export class CoreServiceClientAdapter implements ICoreService {
    private readonly logger = new Logger(CoreServiceClientAdapter.name);
    constructor(
        @Inject(CORE_SERVICE_CLIENT) private readonly usersClient: AxiosInstance,
    ) { }
    async GetUserProfile(uuid: string): Promise<UsuarioModel> {
        try {
            console.log(`Consultando servicio Core para obtener perfil del usuario ${uuid}`);
            const { data } = await this.usersClient.get<UserProfileDTO>(`/usuario/profile/${uuid}`);
            this.logger.debug(`Respuesta del servicio Core: ${JSON.stringify(data)}`);
            const user = new UsuarioModel();
            user.uuid = uuid; // Convertir string a UUID usando URL
            user.username = data.username;
            user.nombres = new NombrePersona(data.nombres);
            user.ap_paterno = new NombrePersona(data.apellido_paterno);
            user.ap_materno = new NombrePersona(data.apellido_materno);
            user.email = new Correo(data.correo);
            return user;
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