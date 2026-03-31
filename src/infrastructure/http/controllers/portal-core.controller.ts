/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller("portal")
export class PortalCoreController { 

    @Get("menu")
    async getMenuPortal(
        @Req() req: Request,
        @Res() res: Response
    ) {
    }

}
