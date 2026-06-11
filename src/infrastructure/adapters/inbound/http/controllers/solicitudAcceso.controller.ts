import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Inject,
    Logger,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
    Res,
    UseFilters,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { GEO_USE_CASE } from 'src/core/application/application.module';
import type { GeoCatalogoUseCase } from 'src/core/application/useCase/catalogo/geoCatalogo.usecase';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';
import { ApiResponse } from '../model/api-response.model';
import { Public } from '../decorators/public.decorator';

class CrearSolicitudBffDto {
    /** UUID del usuario solicitante (extraído del token JWT en producción) */
    solicitanteUuid: string;
    rolSolicitado?: string;
    mensaje?: string;
}

class ResolverSolicitudBffDto {
    /** UUID del admin que resuelve */
    adminUuid: string;
    decision: 'APROBADA' | 'RECHAZADA';
    motivoRechazo?: string;
}

/**
 * Endpoints de solicitudes de acceso a organizaciones.
 * Ruta base: /organizations/:id/...  (plural, nomenclatura frontend)
 */
@Controller('organizations')
@UseFilters(ErrorHandler)
export class SolicitudAccesoBffController {

    private readonly logger = new Logger(SolicitudAccesoBffController.name);

    constructor(
        @Inject(GEO_USE_CASE)
        private readonly geoUseCase: GeoCatalogoUseCase,
    ) { }

    /**
     * POST /api/organizations/:id/solicitud-acceso
     * El colaborador solicita unirse a una organización.
     *
     * Body: { solicitanteUuid, rolSolicitado?, mensaje? }
     */
    @Post(':id/solicitud-acceso')
    async crear(
        @Param('id', ParseIntPipe) organizacionUUID: string,
        @Body() body: CrearSolicitudBffDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const cid = req['correlationId'] ?? crypto.randomUUID();
        this.logger.log(`[POST] solicitud-acceso org=${organizacionUUID} user=${body.solicitanteUuid} cid=${cid}`);
        const result = await this.geoUseCase.crearSolicitudAcceso(organizacionUUID, body);
        return res.status(HttpStatus.CREATED).json(
            new ApiResponse(HttpStatus.CREATED, 'Solicitud enviada. El administrador debe aprobarla.', result),
        );
    }

    /**
     * GET /api/organizations/:id/solicitudes-acceso?estado=PENDIENTE
     * Panel del admin — lista solicitudes de su organización.
     */
    @Get(':id/solicitudes-acceso')
    async listar(
        @Param('id', ParseIntPipe) organizacionUUID: string,
        @Query('estado') estado: string | undefined,
        @Res() res: Response,
    ) {
        this.logger.log(`[GET] solicitudes-acceso org=${organizacionUUID} estado=${estado ?? 'all'}`);
        const data = await this.geoUseCase.listarSolicitudesAcceso(organizacionUUID, estado);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Solicitudes obtenidas', data),
        );
    }

    /**
     * GET /api/organizations/solicitud-acceso/:token
     * Resuelve una solicitud por su token (abre el link del email).
     * Público — no requiere sesión.
     */
    @Get('solicitud-acceso/:token')
    @Public()
    async obtenerPorToken(
        @Param('token') token: string,
        @Res() res: Response,
    ) {
        this.logger.log(`[GET] solicitud-acceso token=${token.slice(0, 8)}…`);
        const data = await this.geoUseCase.obtenerSolicitudPorToken(token);
        if (!data) {
            return res.status(HttpStatus.NOT_FOUND).json(
                new ApiResponse(HttpStatus.NOT_FOUND, 'Solicitud no encontrada o token inválido.', null),
            );
        }
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Solicitud encontrada', data),
        );
    }

    /**
     * POST /api/organizations/solicitud-acceso/:token/resolver
     * Admin aprueba o rechaza (desde el panel o desde el link de email).
     *
     * Body: { adminUuid, decision: "APROBADA"|"RECHAZADA", motivoRechazo? }
     */
    @Post('solicitud-acceso/:token/resolver')
    async resolver(
        @Param('token') token: string,
        @Body() body: ResolverSolicitudBffDto,
        @Res() res: Response,
    ) {
        this.logger.log(`[POST] resolver token=${token.slice(0, 8)}… decision=${body.decision}`);
        const result = await this.geoUseCase.resolverSolicitudAcceso(token, body);
        const msg = body.decision === 'APROBADA'
            ? 'Colaborador añadido a la organización.'
            : 'Solicitud rechazada.';
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, msg, result),
        );
    }

    /**
     * DELETE /api/organizations/solicitud-acceso/:id/cancelar
     * El colaborador cancela su propia solicitud pendiente.
     *
     * Body: { solicitanteUuid }
     */
    @Delete('solicitud-acceso/:id/cancelar')
    async cancelar(
        @Param('id', ParseIntPipe) solicitudId: number,
        @Body() body: { solicitanteUuid: string },
        @Res() res: Response,
    ) {
        this.logger.log(`[DELETE] cancelar solicitud_id=${solicitudId} user=${body.solicitanteUuid}`);
        const result = await this.geoUseCase.cancelarSolicitudAcceso(solicitudId, body.solicitanteUuid);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Solicitud cancelada.', result),
        );
    }
}
