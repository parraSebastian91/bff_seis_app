/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Inject, Req, Res, UseFilters } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';
import { Public } from '../decorators/public.decorator';
import  type { IUsuarioUserCase } from './../../../core/domain/ports/inbound/UsuarioUseCase.interface';
import { UserProfileDTO } from 'src/infrastructure/dto/UserCoreService.dto';

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



        return response.status(200).json({  
            message: "UsuariosBffController is working!"
        });
    }

    @Get("/profile")
    async GetInformacionUsuario(
        @Req() request: Request,
        @Res() response: Response
    ) {

        const userSession = request["user"]; 
        const usuario = await this.usuarioUseCase.ExecuteGetInformacionUsuario(userSession["userUuid"]);

        return response.status(200).json({
            message: "Informacion del usuario obtenida correctamente",
            data: UserProfileDTO.fromModel(usuario),
        });

    }


}
