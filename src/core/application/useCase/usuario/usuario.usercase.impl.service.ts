/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, Logger } from '@nestjs/common';
import { UserImagesModel, UserProfileModel } from '../../../domain/models/usuario/userProfile.model';
import { IUsuarioUserCase } from './../../../../core/domain/ports/inbound/UsuarioUseCase.interface';
import type { ICoreService } from './../../../../core/domain/ports/outbound/core.service.interface'

@Injectable()
export class UsuarioUserCaseImplService implements IUsuarioUserCase {
    private readonly logger = new Logger(UsuarioUserCaseImplService.name);

    constructor(
        private UsuarioCoreService: ICoreService,
    ) { }

    async ExecuteGetInformacionUsuario(uuid: string): Promise<UserProfileModel> {
        const startedAt = Date.now();
        this.logger.log(`[START] Obtener informacion usuario | userUuid=${uuid}`);
        try {
            const usuario = await this.UsuarioCoreService.GetUserProfile(uuid);
            if (!usuario) {
                this.logger.warn(`[MISS] Usuario no encontrado | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
                throw new Error(`Usuario con uuid ${uuid} no encontrado`);
            }

            this.logger.log(`[OK] Informacion usuario obtenida | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
            return usuario;
        } catch (error: any) {
            this.logger.error(`[FAIL] Obtener informacion usuario | userUuid=${uuid} | durationMs=${Date.now() - startedAt} | reason=${error?.message ?? error}`);
            throw error;
        }
    }


    async ExecuteGetImagenUsuario(uuid: string): Promise<UserImagesModel> {
        const startedAt = Date.now();
        this.logger.log(`[START] Obtener imagen usuario | userUuid=${uuid}`);

        try {
            const imagen = await this.UsuarioCoreService.GetUserImage(uuid);
            if (!imagen) {
                this.logger.warn(`[MISS] Imagen de usuario no encontrada | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
                throw new Error(`Imagen de usuario con uuid ${uuid} no encontrada`);
            }

            this.logger.log(`[OK] Imagen de usuario obtenida | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
            return imagen;
        } catch (error: any) {
            this.logger.error(`[FAIL] Obtener imagen usuario | userUuid=${uuid} | durationMs=${Date.now() - startedAt} | reason=${error?.message ?? error}`);
            throw error;
        }
    }

    async ExecuteUpdateInformacionUsuario(uuid: string, body: UserProfileModel): Promise<UserProfileModel> {
        const startedAt = Date.now();
        this.logger.log(`[START] Actualizar informacion usuario | userUuid=${uuid}`);
        console.log("UsuarioUserCaseImplService.ExecuteUpdateInformacionUsuario | body:", body);
        try {
            const usuario = await this.UsuarioCoreService.UpdateUserProfile(uuid, body);
            if (!usuario) {
                this.logger.warn(`[MISS] Usuario no encontrado | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
                throw new Error(`Usuario con uuid ${uuid} no encontrado`);
            }

            this.logger.log(`[OK] Informacion usuario actualizada | userUuid=${uuid} | durationMs=${Date.now() - startedAt}`);
            return usuario;
        } catch (error: any) {
            this.logger.error(`[FAIL] Actualizar informacion usuario | userUuid=${uuid} | durationMs=${Date.now() - startedAt} | reason=${error?.message ?? error}`);
            throw error;
        }
    }

}