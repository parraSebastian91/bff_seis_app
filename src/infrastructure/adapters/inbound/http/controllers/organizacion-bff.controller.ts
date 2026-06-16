import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Inject,
    Logger,
    Param,
    ParseUUIDPipe,
    Post,
    Req,
    Res,
    UseFilters,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';
import { ApiResponse } from '../model/api-response.model';
import { CrearOrganizacionDto } from '../dto/organizacion.dto';
import type { IOrganizacion } from 'src/core/domain/ports/inbound/organizacion.interface';
import { ORGANIZACION_USE_CASE } from 'src/core/application/application.module';


/**
 * Endpoints de gestión de organización en el BFF.
 * Responsabilidad: orquestar llamadas externas (SII) + persistir en ms-core.
 * ms-core NUNCA llama directamente a SII.
 */
@Controller('organizacion')
@UseFilters(ErrorHandler)
export class OrganizacionBffController {

    private readonly logger = new Logger(OrganizacionBffController.name);

    constructor(
        @Inject(ORGANIZACION_USE_CASE) private readonly organizacion: IOrganizacion
    ) { }

    /**
    * POST /api/organizations
    * Crea el registro base de una organización y retorna { id, uuid }.
    * Idempotente: si el RUT ya existe, retorna el registro existente.
    *
    * Body: { tipoPersona, tipoParticipacion, rut, razonSocial, giro? }
    */
    @Post()
    async crearOrganizacion(
        @Body() body: CrearOrganizacionDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const correlationId = req['correlationId'] ?? crypto.randomUUID();
        this.logger.log(`[POST] organizations | rut=${body.rut} razonSocial=${body.razonSocial} cid=${correlationId}`);

        const result = await this.organizacion.crearOrganizacion(body);

        return res.status(HttpStatus.CREATED).json(
            new ApiResponse(HttpStatus.CREATED, 'Organización creada', { id: result.id }),
        );
    }

    @Get(':id')
    async getOrganizacion(
        @Param('id', ParseUUIDPipe) organizacionUUID: string,
        @Res() res: Response,
    ) {
        this.logger.log(`[GET] organizacion id=${organizacionUUID}`);
        const data = await this.organizacion.getOrganizacionById(organizacionUUID);
        if (!data) {
            return res.status(HttpStatus.NOT_FOUND).json(
                new ApiResponse(HttpStatus.NOT_FOUND, 'Organización no encontrada', null),
            );
        }
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Organización obtenida', data),
        );
    }

}