/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { UsuarioModel } from 'src/core/domain/models/usuario/usuario.model';
import { IUsuarioUserCase } from 'src/core/domain/ports/inbound/UsuarioUseCase.interface';

@Injectable()
export class UsuarioUserCaseImplService implements IUsuarioUserCase {

    constructor() {}

    async ExecuteGetInformacionUsuario(): Promise<UsuarioModel> {
        return new UsuarioModel();
    }

}
