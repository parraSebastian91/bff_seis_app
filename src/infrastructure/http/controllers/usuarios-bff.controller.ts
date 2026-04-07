/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, HttpStatus, Inject, Req, Res, UseFilters } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';
import { Public } from '../decorators/public.decorator';
import type { IUsuarioUserCase } from './../../../core/domain/ports/inbound/UsuarioUseCase.interface';
import { UserProfileDTO } from '../dto/userProfile.response.dto';
import { ApiResponse } from '../model/api-response.model';

@Controller("usuario")
@UseFilters(ErrorHandler)
export class UsuariosBffController {

    constructor(
        @Inject('USUARIO_USE_CASE') private readonly usuarioUseCase: IUsuarioUserCase,
    ) { }

    @Get("/")
    async TestController(
        @Req() request: Request,
        @Res() response: Response
    ) {
        return response.status(200).json(new ApiResponse(HttpStatus.OK, "UsuariosBffController is working!", null));
    }

    @Get("/profile")
    async GetInformacionUsuario(
        @Req() request: Request,
        @Res() response: Response
    ) {

        const userSession = request["user"];
        const usuario = await this.usuarioUseCase.ExecuteGetInformacionUsuario(userSession["userUuid"]);

        return response.status(200).json(new ApiResponse(HttpStatus.OK, "Informacion del usuario obtenida correctamente", UserProfileDTO.builder(usuario)));

    }


}
