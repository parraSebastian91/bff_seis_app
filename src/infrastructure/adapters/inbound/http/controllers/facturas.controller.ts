/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, HttpStatus, Inject, Logger, Param, Patch, Post, Query, Req, Res, UseFilters } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';
import type { IFacturaUseCase } from 'src/core/domain/ports/inbound/facturaUseCase.port';
import type { Response, Request } from 'express';
import { ApiResponse } from '../model/api-response.model';
import { FacturaUpdateRequestDto } from '../dto/facturaUpdate.request.dto';
import { FacturaCreateRequestDto } from '../dto/facturaCreate.request.dto';
import { AutorizacionPublicacionRequestDto } from '../dto/autorizacionPublicacion.request.dto';
import type { IFacturaMarketPlaceUseCase } from 'src/core/domain/ports/inbound/facturaMarketPlace.usecase';
import { FACTURA_MARKETPLACE_USE_CASE } from 'src/core/application/application.module';
import { MarketplaceSseService } from 'src/infrastructure/adapters/outbound/sse/marketplace-sse.service';

@Controller('facturas')
@UseFilters(ErrorHandler)
export class FacturasController {
    private readonly logger = new Logger(FacturasController.name);
    constructor(
        @Inject('FACTURA_USE_CASE') private readonly facturaUseCase: IFacturaUseCase,
        @Inject(FACTURA_MARKETPLACE_USE_CASE) private readonly facturaMarketPlaceUseCase: IFacturaMarketPlaceUseCase,
        private readonly marketplaceSseService: MarketplaceSseService,
    ) { }

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
        this.marketplaceSseService.emitRefresh('factura.updated', body.id);
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
        this.marketplaceSseService.emitRefresh('factura.published', factura.facturaId);
        const endedAt = Date.now();
        this.logger.debug(`[END] publicarFactura - Usuario: ${request.body.gestor}, Organización: ${request.body.ownerUUID}, Duración: ${endedAt - startedAt}ms, CorrelationID: ${correlationId}`);
        return res.status(HttpStatus.CREATED).json(new ApiResponse(HttpStatus.CREATED, "Creación exitosa", factura));
    }

    @Post("autorizacion")
    @Roles("CLIENTE_CEDENTE",
        "ADMIN_CEDENTE",
        "SUPER_ADMIN")
    async registrarAutorizacion(
        @Req() req: Request,
        @Res() res: Response
    ): Promise<any> {
        const userSession = req["user"];
        const correlationId = req["correlationId"];
        const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        const body = req.body as AutorizacionPublicacionRequestDto;
        this.logger.debug(`[START] registrarAutorizacion - Usuario: ${userSession?.userUuid}, FacturaID: ${body.facturaId}, Acepto: ${body.acepto}, CorrelationID: ${correlationId}`);
        await this.facturaUseCase.ExecuteRegistrarAutorizacion(userSession["userUuid"], ipAddress, userAgent, correlationId, body);
        this.marketplaceSseService.emitRefresh('factura.authorization.updated', body.facturaId);
        this.logger.debug(`[END] registrarAutorizacion - Usuario: ${userSession?.userUuid}, FacturaID: ${body.facturaId}`);
        return res.status(HttpStatus.CREATED).json(new ApiResponse(HttpStatus.CREATED, "Autorización registrada", null));
    }

    @Get("marketPlace")
    @Roles(
        "EJECUTIVO_FINANCIADORA",
        "ADMIN_FINANCIADORA",        
        "SUPER_ADMIN")
    async getFacturasMarketPlace(
        @Query("scope") scope: string,
        @Query("cursor") cursor: string,
        @Query("limit") limit: number,
        @Req() req: Request,
        @Res() res: Response
    ): Promise<any> {
        const startedAt = Date.now();
        const correlationId = req["correlationId"];
        this.logger.debug(`[START] getFacturasMarketPlace - CorrelationID: ${correlationId}`);
        const facturas = await this.facturaMarketPlaceUseCase.ExecuteGetFacturasMarketPlace(correlationId, scope, cursor, limit);
        const endedAt = Date.now();
        this.logger.debug(`[END] getFacturasMarketPlace - CorrelationID: ${correlationId}, Duration: ${endedAt - startedAt}ms`);
        return res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, "Extracción exitosa", facturas));
    }
}

