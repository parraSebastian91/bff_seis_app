/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, HttpStatus, Inject, Put, Req, Res, UseFilters } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';
import type { IUsuarioUserCase } from '../../../../../core/domain/ports/inbound/UsuarioUseCase.interface';
import { UserProfileReqResDTO } from '../dto/userProfile.req.res.dto';
import { ApiResponse } from '../model/api-response.model';
import { ImageProfileResponseDto } from '../dto/imageProfile.response.dto';
import { UserOrganizacionProfileResponseDTO } from '../dto/userOrganizacionProfile.dto';

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
        return response.status(200).json(new ApiResponse(HttpStatus.OK, "Informacion del usuario obtenida correctamente", UserProfileReqResDTO.builder(usuario)));
    }

    @Put("/profile")
    async UpdateInformacionUsuario(
        @Body() body: UserProfileReqResDTO,
        @Req() request: Request,
        @Res() response: Response
    ) {
        const userSession = request["user"];

        const userModel = UserProfileReqResDTO.toModel(body);
        const usuario = await this.usuarioUseCase.ExecuteUpdateInformacionUsuario(userSession["userUuid"], userModel);

        return response.status(200).json(new ApiResponse(HttpStatus.OK, "Informacion del usuario obtenida correctamente", UserProfileReqResDTO.builder(usuario)));
    }

    @Get("/profile/img")
    async GetImagenUsuario(
        @Req() request: Request,
        @Res() response: Response
    ) {

        const userSession = request["user"];
        const usuario = await this.usuarioUseCase.ExecuteGetImagenUsuario(userSession["userUuid"]);

        return response.status(200).json(new ApiResponse(HttpStatus.OK, "Imagen del usuario obtenida correctamente", ImageProfileResponseDto.builder(usuario)));
    }

    @Get("/profile/organizacion")
    async GetOrganizacionUsuario(
        @Req() request: Request,
        @Res() response: Response
    ) {

        const userSession = request["user"];
        const usuario = await this.usuarioUseCase.ExecuteGetProfileOrganizacionUsuario(userSession["userUuid"]);

        return response.status(200).json(new ApiResponse(HttpStatus.OK, "Organizacion del usuario obtenida correctamente", UserOrganizacionProfileResponseDTO.fromModel(usuario)));
    }

}
