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
    Patch,
    Post,
    Req,
    Res,
    UseFilters,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { GEO_USE_CASE } from 'src/core/application/application.module';
import type { GeoCatalogoUseCase } from 'src/core/application/useCase/catalogo/geoCatalogo.usecase';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';
import { ApiResponse } from '../model/api-response.model';

class CambiarRolBffDto {
    rolCodigo: string;
}

class CrearGrupoBffDto {
    nombre: string;
    descripcion?: string;
    liderUuid: string;
}

class ActualizarGrupoBffDto {
    nombre: string;
    descripcion?: string;
}

class AgregarMiembroGrupoBffDto {
    usuarioUuid: string;
    cargoEnGrupo?: string;
}

class GenerarTokenBffDto {
    adminUuid: string;
    rolDestino?: string;
}

/**
 * Panel de administración de organización (BFF).
 * Ruta base: /api/bff/organizacion/:id/admin/...
 *
 * Requiere autenticación (guard global del BFF).
 * El cliente debe pasar el organizacionId (BIGINT) en la URL,
 * tal como se usa en el resto del módulo de organización.
 */
@Controller('organizacion')
@UseFilters(ErrorHandler)
export class OrganizacionAdminBffController {

    private readonly logger = new Logger(OrganizacionAdminBffController.name);

    constructor(
        @Inject(GEO_USE_CASE)
        private readonly geo: GeoCatalogoUseCase,
    ) { }

    // ── Datos básicos ─────────────────────────────────────────────────────────

    /** GET /api/bff/organizacion/:id */
    @Get(':id')
    async getOrganizacion(
        @Param('id', ParseIntPipe) organizacionId: number,
        @Res() res: Response,
    ) {
        this.logger.log(`[GET] organizacion id=${organizacionId}`);
        const data = await this.geo.getOrganizacionById(organizacionId);
        if (!data) {
            return res.status(HttpStatus.NOT_FOUND).json(
                new ApiResponse(HttpStatus.NOT_FOUND, 'Organización no encontrada', null),
            );
        }
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Organización obtenida', data),
        );
    }

    /** GET /api/bff/organizacion/:id/mi-rol — extrae el userUuid del JWT */
    @Get(':id/mi-rol')
    async getMiRol(
        @Param('id', ParseIntPipe) organizacionId: number,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const usuarioUuid: string = (req as any)['user']?.['userUuid'] ?? (req as any)['user']?.['sub'];
        this.logger.log(`[GET] mi-rol org=${organizacionId} user=${usuarioUuid}`);
        if (!usuarioUuid) {
            return res.status(HttpStatus.UNAUTHORIZED).json(
                new ApiResponse(HttpStatus.UNAUTHORIZED, 'Usuario no identificado en token', null),
            );
        }
        const result = await this.geo.getRolMiembro(organizacionId, usuarioUuid);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Rol obtenido', result),
        );
    }

    // ── Miembros ──────────────────────────────────────────────────────────────

    /** GET /api/bff/organizacion/:id/miembros */
    @Get(':id/miembros')
    async listarMiembros(
        @Param('id', ParseIntPipe) organizacionId: number,
        @Res() res: Response,
    ) {
        this.logger.log(`[GET] miembros org=${organizacionId}`);
        const data = await this.geo.listarMiembrosOrg(organizacionId);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Miembros obtenidos', data),
        );
    }

    /** PATCH /api/bff/organizacion/:id/miembros/:uuid/rol */
    @Patch(':id/miembros/:uuid/rol')
    async cambiarRol(
        @Param('id', ParseIntPipe) organizacionId: number,
        @Param('uuid', ParseUUIDPipe) usuarioUuid: string,
        @Body() body: CambiarRolBffDto,
        @Res() res: Response,
    ) {
        this.logger.log(`[PATCH] cambiarRol org=${organizacionId} user=${usuarioUuid} rol=${body.rolCodigo}`);
        const result = await this.geo.cambiarRolMiembro(organizacionId, usuarioUuid, body.rolCodigo);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Rol actualizado', result),
        );
    }

    /** DELETE /api/bff/organizacion/:id/miembros/:uuid */
    @Delete(':id/miembros/:uuid')
    async removerMiembro(
        @Param('id', ParseIntPipe) organizacionId: number,
        @Param('uuid', ParseUUIDPipe) usuarioUuid: string,
        @Res() res: Response,
    ) {
        this.logger.log(`[DELETE] removerMiembro org=${organizacionId} user=${usuarioUuid}`);
        const result = await this.geo.removerMiembro(organizacionId, usuarioUuid);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Miembro removido', result),
        );
    }

    // ── Grupos ────────────────────────────────────────────────────────────────

    /** GET /api/bff/organizacion/:id/grupos */
    @Get(':id/grupos')
    async listarGrupos(
        @Param('id', ParseIntPipe) organizacionId: number,
        @Res() res: Response,
    ) {
        this.logger.log(`[GET] grupos org=${organizacionId}`);
        const data = await this.geo.listarGruposOrg(organizacionId);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Grupos obtenidos', data),
        );
    }

    /** POST /api/bff/organizacion/:id/grupos */
    @Post(':id/grupos')
    async crearGrupo(
        @Param('id', ParseIntPipe) organizacionId: number,
        @Body() body: CrearGrupoBffDto,
        @Res() res: Response,
    ) {
        this.logger.log(`[POST] crearGrupo org=${organizacionId} nombre=${body.nombre}`);
        const result = await this.geo.crearGrupoOrg(organizacionId, body);
        return res.status(HttpStatus.CREATED).json(
            new ApiResponse(HttpStatus.CREATED, 'Grupo creado', result),
        );
    }

    /** PATCH /api/bff/organizacion/grupos/:grupoId */
    @Patch('grupos/:grupoId')
    async actualizarGrupo(
        @Param('grupoId', ParseUUIDPipe) grupoId: string,
        @Body() body: ActualizarGrupoBffDto,
        @Res() res: Response,
    ) {
        this.logger.log(`[PATCH] actualizarGrupo grupo=${grupoId}`);
        const result = await this.geo.actualizarGrupo(grupoId, body);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Grupo actualizado', result),
        );
    }

    /** DELETE /api/bff/organizacion/grupos/:grupoId */
    @Delete('grupos/:grupoId')
    async eliminarGrupo(
        @Param('grupoId', ParseUUIDPipe) grupoId: string,
        @Res() res: Response,
    ) {
        this.logger.log(`[DELETE] eliminarGrupo grupo=${grupoId}`);
        const result = await this.geo.eliminarGrupo(grupoId);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Grupo eliminado', result),
        );
    }

    /** POST /api/bff/organizacion/grupos/:grupoId/miembros */
    @Post('grupos/:grupoId/miembros')
    async agregarMiembro(
        @Param('grupoId', ParseUUIDPipe) grupoId: string,
        @Body() body: AgregarMiembroGrupoBffDto,
        @Res() res: Response,
    ) {
        this.logger.log(`[POST] agregarMiembro grupo=${grupoId} user=${body.usuarioUuid}`);
        const result = await this.geo.agregarMiembroGrupo(grupoId, body);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Miembro agregado al grupo', result),
        );
    }

    /** DELETE /api/bff/organizacion/grupos/:grupoId/miembros/:uuid */
    @Delete('grupos/:grupoId/miembros/:uuid')
    async removerMiembroGrupo(
        @Param('grupoId', ParseUUIDPipe) grupoId: string,
        @Param('uuid', ParseUUIDPipe) usuarioUuid: string,
        @Res() res: Response,
    ) {
        this.logger.log(`[DELETE] removerMiembroGrupo grupo=${grupoId} user=${usuarioUuid}`);
        const result = await this.geo.removerMiembroGrupo(grupoId, usuarioUuid);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Miembro removido del grupo', result),
        );
    }

    // ── Enrolamiento ──────────────────────────────────────────────────────────

    /** POST /api/bff/organizacion/:id/generar-token-enrolamiento */
    @Post(':id/generar-token-enrolamiento')
    async generarToken(
        @Param('id', ParseIntPipe) organizacionId: number,
        @Body() body: GenerarTokenBffDto,
        @Res() res: Response,
    ) {
        this.logger.log(`[POST] generarToken org=${organizacionId} admin=${body.adminUuid}`);
        const result = await this.geo.generarTokenEnrolamiento(organizacionId, body);
        return res.status(HttpStatus.CREATED).json(
            new ApiResponse(HttpStatus.CREATED, 'Token de enrolamiento generado', result),
        );
    }
}
