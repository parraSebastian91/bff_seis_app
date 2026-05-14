/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, HttpStatus, Inject, Logger, Param, Patch, Req, Res, UseFilters } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';
import type { IFacturaUseCase } from 'src/core/domain/ports/inbound/facturaUseCase.port';
import type { Response, Request } from 'express';
import { ApiResponse } from '../model/api-response.model';
import { FacturaUpdateRequestDto } from '../dto/facturaUpdate.request.dto';

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

    @Patch()
    @Roles("CLIENTE_CEDENTE",
        "EJECUTIVO_FINANCIADORA",
        "ADMIN_FINANCIADORA",
        "ADMIN_CEDENTE",
        "SUPER_ADMIN")
    async updateFactura(
        @Req() request: Request,
        @Res() res: Response
    ): Promise<any> {
        const startedAt = Date.now();
        const userSession = request["user"];
        const body = request.body as FacturaUpdateRequestDto;
        this.logger.debug(`[START] updateFactura - Usuario: ${request.body.gestor}, Organización: ${request.body.ownerUUID}, FacturaID: ${request.body.id}`);
        const facturas = await this.facturaUseCase.ExecuteUpdateFacturas(userSession, body);
        const endedAt = Date.now();
        this.logger.debug(`[END] updateFactura - Usuario: ${request.body.gestor}, Organización: ${request.body.ownerUUID}, FacturaID: ${request.body.id}, Duración: ${endedAt - startedAt}ms`);
        return res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, "Actualización exitosa", facturas));
    }


}

