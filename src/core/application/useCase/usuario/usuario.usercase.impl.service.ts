/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { IUsuarioUserCase } from '../usecase.interface';
import { UsuarioModel } from 'src/core/domain/models/usuario/usuario.model';

@Injectable()
export class UsuarioUserCaseImplService implements IUsuarioUserCase {

    constructor() {}

    async ExecuteGetInformacionUsuario(): Promise<UsuarioModel> {
        return new UsuarioModel();
    }

}
