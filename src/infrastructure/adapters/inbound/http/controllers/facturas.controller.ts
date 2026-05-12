/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, HttpStatus, Inject, Logger, Param, Req, Res, UseFilters } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';
import type { IFacturaUseCase } from 'src/core/domain/ports/inbound/facturaUseCase.port';
import type { Response, Request } from 'express';
import { ApiResponse } from '../model/api-response.model';

@Controller('facturas')
@UseFilters(ErrorHandler)
export class FacturasController {
    private readonly logger = new Logger(FacturasController.name);
    constructor(@Inject('FACTURA_USE_CASE') private readonly facturaUseCase: IFacturaUseCase) { }

    @Get("list/:organizacionUUID")
    @Roles("USR_STD")
    async getFacturas(
        @Param("organizacionUUID") organizacionUUID: string,
        @Req() req: Request,
        @Res() res: Response
    ): Promise<any> {
        this.logger.log(`listar facturas | organizacionUUID=${organizacionUUID}`);
        const userSession = req["user"];
        const facturas = await this.facturaUseCase.ExecuteGetFacturas(userSession["userUuid"], organizacionUUID);
        return res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, "Extracción exitosa", facturas));
    }



}

