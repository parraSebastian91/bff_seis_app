/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { UsuarioModel } from 'src/core/domain/models/usuario/usuario.model';
import { ICoreService } from 'src/core/domain/ports/outbound/core.service.interface';

@Injectable()
export class UsuarioCoreServiceImpl implements ICoreService {

    async GetUserInformation(uuid: string): Promise<UsuarioModel> {
        return new UsuarioModel();
    }

}