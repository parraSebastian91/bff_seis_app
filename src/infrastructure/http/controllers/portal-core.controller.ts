/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Inject, Req, Res, UseFilters } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Roles } from '../decorators/roles.decorator';
import { PORTAL_USE_CASE } from 'src/core/application/application.module';
import type { IPortalUseCase } from 'src/core/domain/ports/inbound/portalUsecase.port';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';

@Controller("portal")
@UseFilters(ErrorHandler)
export class PortalCoreController {

    constructor(@Inject(PORTAL_USE_CASE) private readonly portalUseCase: IPortalUseCase) { }

    @Get("menu")
    @Roles("USR_STD")
    async getMenuPortal(
        @Req() req: Request,
        @Res() res: Response
    ) {
        const userSession = req["user"];
        const menu = await this.portalUseCase.ExecuteGetMenuPortal({ userUuid: userSession["userUuid"] });
        res.json(menu);

    }

}
