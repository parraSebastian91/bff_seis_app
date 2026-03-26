/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Req, Res, UseFilters } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';
import { Public } from '../decorators/public.decorator';

@Controller("usuarios")
@UseFilters(ErrorHandler)
export class UsuariosBffController {

    @Get("/")
    async TestController(
        @Req() request: Request,
        @Res() response: Response
    ) {
        return response.status(200).json({  
            message: "UsuariosBffController is working!"
        });
    }


}
