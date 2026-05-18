/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, HttpStatus, Inject, Logger, Param, Patch, Post, Req, Res, UseFilters } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';
import type { IFacturaUseCase } from 'src/core/domain/ports/inbound/facturaUseCase.port';
import type { Response, Request } from 'express';
import { ApiResponse } from '../model/api-response.model';
import { FacturaUpdateRequestDto } from '../dto/facturaUpdate.request.dto';
import { FacturaCreateRequestDto } from '../dto/facturaCreate.request.dto';

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
        const startedAt = Date.now();
        const correlationId = req["correlationId"];
        const userSession = req["user"];
        this.logger.debug(`[START] getFacturas - CorrelationID: ${correlationId}`);
        const facturas = await this.facturaUseCase.ExecuteGetFacturas(userSession["userUuid"], organizacionUUID, correlationId);
        const endedAt = Date.now();
        this.logger.debug(`[END] getFacturas - CorrelationID: ${correlationId}, Duration: ${endedAt - startedAt}ms`);
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
        const correlationId = request["correlationId"];
        const body = request.body as FacturaUpdateRequestDto;
        this.logger.debug(`[START] updateFactura - Usuario: ${request.body.gestor}, Organización: ${request.body.ownerUUID}, FacturaID: ${request.body.id}, CorrelationID: ${correlationId}`);
        const facturas = await this.facturaUseCase.ExecuteUpdateFacturas(userSession, body);
        const endedAt = Date.now();
        this.logger.debug(`[END] updateFactura - Usuario: ${request.body.gestor}, Organización: ${request.body.ownerUUID}, FacturaID: ${request.body.id}, Duración: ${endedAt - startedAt}ms, CorrelationID: ${correlationId}`);
        return res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, "Actualización exitosa", facturas));
    }

    @Post()
    @Roles("CLIENTE_CEDENTE",
        "EJECUTIVO_FINANCIADORA",
        "ADMIN_FINANCIADORA",
        "ADMIN_CEDENTE",
        "SUPER_ADMIN")
    async publicarFactura(
        @Req() request: Request,
        @Res() res: Response
    ): Promise<any> {
        const startedAt = Date.now();
        const userSession = request["user"];
        const correlationId = request["correlationId"];
        const body = request.body as FacturaCreateRequestDto;
        this.logger.debug(`[START] publicarFactura - Usuario: ${request.body.gestor}, Organización: ${request.body.ownerUUID}, CorrelationID: ${correlationId}`);
        const factura = await this.facturaUseCase.ExecutePublicarFactura(userSession, correlationId, body);
        const endedAt = Date.now();
        this.logger.debug(`[END] publicarFactura - Usuario: ${request.body.gestor}, Organización: ${request.body.ownerUUID}, Duración: ${endedAt - startedAt}ms, CorrelationID: ${correlationId}`);
        return res.status(HttpStatus.CREATED).json(new ApiResponse(HttpStatus.CREATED, "Creación exitosa", factura));
    }


}

