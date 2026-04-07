/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { UserProfileModel } from '../../../domain/models/usuario/userProfile.model';
import { IUsuarioUserCase } from './../../../../core/domain/ports/inbound/UsuarioUseCase.interface';
import type { ICoreService } from './../../../../core/domain/ports/outbound/core.service.interface';

@Injectable()
export class UsuarioUserCaseImplService implements IUsuarioUserCase {

    constructor(
        private UsuarioCoreService: ICoreService,
    ) {}

    async ExecuteGetInformacionUsuario(uuid: string): Promise<UserProfileModel> {
        const usuario = await this.UsuarioCoreService.GetUserProfile(uuid);
        if (!usuario) {
            throw new Error(`Usuario con uuid ${uuid} no encontrado`);
        }
        return usuario;
    }

}
