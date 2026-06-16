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
    ParseUUIDPipe,
    Post,
    Query,
    Req,
    Res,
    UseFilters,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ADM_ACCESO_ORG_USE_CASE } from 'src/core/application/application.module';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';
import { ApiResponse } from '../model/api-response.model';
import { Public } from '../decorators/public.decorator';
import type { IAdministracionAccesoOrganizacion } from 'src/core/domain/ports/inbound/AdmAcceso.interface';

class CrearSolicitudBffDto {
    /** UUID del usuario solicitante (extraído del token JWT en producción) */
    solicitanteUuid: string;
    rolSolicitado?: string;
    mensaje?: string;

    constructor(solicitanteUuid: string, rolSolicitado?: string, mensaje?: string) {
        this.solicitanteUuid = solicitanteUuid;
        this.rolSolicitado = rolSolicitado;
        this.mensaje = mensaje;
    }
}

class ResolverSolicitudBffDto {
    /** UUID del admin que resuelve */
    adminUuid: string;
    decision: 'APROBADA' | 'RECHAZADA';
    motivoRechazo?: string;

    constructor(adminUuid: string, decision: 'APROBADA' | 'RECHAZADA', motivoRechazo?: string) {
        this.adminUuid = adminUuid;
        this.decision = decision;
        this.motivoRechazo = motivoRechazo;
    }
}

class GenerarTokenBffDto {
    adminUuid: string;
    rolDestino?: string;
    constructor(adminUuid: string, rolDestino?: string) {
        this.adminUuid = adminUuid;
        this.rolDestino = rolDestino;
    }
}


/**
 * Endpoints de solicitudes de acceso a organizaciones.
 * Ruta base: /organizacion/:id/...  (plural, nomenclatura frontend)
 */
@Controller('organizacion')
@UseFilters(ErrorHandler)
export class SolicitudAccesoBffController {

    private readonly logger = new Logger(SolicitudAccesoBffController.name);

    constructor(
        @Inject(ADM_ACCESO_ORG_USE_CASE) private readonly admAccesoOrganizacion: IAdministracionAccesoOrganizacion,

    ) { }

    /**
     * POST /api/organizacion/:id/solicitud-acceso
     * El colaborador solicita unirse a una organización.
     *
     * Body: { solicitanteUuid, rolSolicitado?, mensaje? }
     */
    @Post(':id/solicitud-acceso')
    async crear(
        @Param('id', ParseUUIDPipe) organizacionUUID: string,
        @Body() body: CrearSolicitudBffDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const cid = req['correlationId'] ?? crypto.randomUUID();
        this.logger.log(`[POST] solicitud-acceso org=${organizacionUUID} user=${body.solicitanteUuid} cid=${cid}`);
        const result = await this.admAccesoOrganizacion.crearSolicitudAcceso(organizacionUUID, body);
        return res.status(HttpStatus.CREATED).json(
            new ApiResponse(HttpStatus.CREATED, 'Solicitud enviada. El administrador debe aprobarla.', result),
        );
    }

    /**
     * GET /api/organizacion/:id/solicitudes-acceso?estado=PENDIENTE
     * Panel del admin — lista solicitudes de su organización.
     */
    @Get(':id/solicitudes-acceso')
    async listar(
        @Param('id', ParseUUIDPipe) organizacionUUID: string,
        @Query('estado') estado: string | undefined,
        @Res() res: Response,
    ) {
        this.logger.log(`[GET] solicitudes-acceso org=${organizacionUUID} estado=${estado ?? 'all'}`);
        const data = await this.admAccesoOrganizacion.listarSolicitudesAcceso(organizacionUUID, estado);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Solicitudes obtenidas', data),
        );
    }

    /**
     * GET /api/organizacion/solicitud-acceso/:token
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
        const data = await this.admAccesoOrganizacion.obtenerSolicitudPorToken(token);
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
     * POST /api/organizacion/solicitud-acceso/:token/resolver
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
        const result = await this.admAccesoOrganizacion.resolverSolicitudAcceso(token, body);
        const msg = body.decision === 'APROBADA'
            ? 'Colaborador añadido a la organización.'
            : 'Solicitud rechazada.';
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, msg, result),
        );
    }

    /**
     * DELETE /api/organizacion/solicitud-acceso/:id/cancelar
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
        const result = await this.admAccesoOrganizacion.cancelarSolicitudAcceso(solicitudId, body.solicitanteUuid);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Solicitud cancelada.', result),
        );
    }

    /**
     * POST /api/bff/organizacion/:id/solicitud-ingreso
     * EB-01: el usuario solicita unirse a una organización ya existente.
     * :id es el organizacion_uuid.
     * El solicitante se extrae del JWT (req['user']['userUuid']).
     */
    @Post(':id/solicitud-ingreso')
    async solicitarIngreso(
        @Param('id') organizacionUuid: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const solicitanteUuid = (req as any)['user']['userUuid'] as string;
        const cid = (req as any)['correlationId'] ?? crypto.randomUUID();
        this.logger.log(`[POST] ${organizacionUuid}/solicitud-ingreso | user=${solicitanteUuid} cid=${cid}`);
        const result = await this.admAccesoOrganizacion.crearSolicitudAccesoPorUuid(organizacionUuid, { solicitanteUuid });
        return res.status(HttpStatus.CREATED).json(
            new ApiResponse(HttpStatus.CREATED, 'Solicitud de ingreso enviada. Un administrador debe aprobarla.', result),
        );
    }

    /** POST /api/bff/organizacion/:id/generar-token-enrolamiento */
    @Post(':id/generar-token-enrolamiento')
    async generarToken(
        @Param('id', ParseUUIDPipe) organizacionUUID: string,
        @Body() body: GenerarTokenBffDto,
        @Res() res: Response,
    ) {
        this.logger.log(`[POST] generarToken org=${organizacionUUID} admin=${body.adminUuid}`);
        const result = await this.admAccesoOrganizacion.generarTokenEnrolamiento(organizacionUUID, body);
        return res.status(HttpStatus.CREATED).json(
            new ApiResponse(HttpStatus.CREATED, 'Token de enrolamiento generado', result),
        );
    }
}
