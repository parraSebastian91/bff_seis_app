import { Body, Controller, Delete, Get, HttpStatus, Inject, Logger, Param, ParseUUIDPipe, Patch, Post, Req, Res, UseFilters } from "@nestjs/common";
import type { Request, Response } from "express";
import { ErrorHandler } from "src/infrastructure/errors/error.handler";
import { ApiResponse } from "../model/api-response.model";
import { ADM_GRUPOS_ORG_USE_CASE } from "src/core/application/application.module";
import type { IAdministracionGrupoTrabajo } from "src/core/domain/ports/inbound/AdmGrupoTrabajo.interface";

class CambiarRolBffDto {
    rolCodigo: string;
    constructor(rolCodigo: string) {
        this.rolCodigo = rolCodigo;
    }
}

class CrearGrupoBffDto {
    nombre: string;
    descripcion?: string;
    liderUuid: string;
    constructor(nombre: string, liderUuid: string, descripcion?: string) {
        this.nombre = nombre;
        this.liderUuid = liderUuid;
        this.descripcion = descripcion;
    }
}

class ActualizarGrupoBffDto {
    nombre: string;
    descripcion?: string;
    constructor(nombre: string, descripcion?: string) {
        this.nombre = nombre;
        this.descripcion = descripcion;
    }
}

class AgregarMiembroGrupoBffDto {
    usuarioUuid: string;
    cargoEnGrupo?: string;
    constructor(usuarioUuid: string, cargoEnGrupo?: string) {
        this.usuarioUuid = usuarioUuid;
        this.cargoEnGrupo = cargoEnGrupo;
    }
}

@Controller('organizacion')
@UseFilters(ErrorHandler)
export class AdmGrupoTrabajoOrgController {
    private readonly logger = new Logger(AdmGrupoTrabajoOrgController.name);

    constructor(
        @Inject(ADM_GRUPOS_ORG_USE_CASE) private readonly admGrupoTrabajo: IAdministracionGrupoTrabajo,
    ) { }


    /** GET /api/bff/organizacion/:id/mi-rol — extrae el userUuid del JWT */
    @Get(':id/mi-rol')
    async getMiRol(
        @Param('id', ParseUUIDPipe) organizacionUUID: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const usuarioUuid: string = (req as any)['user']?.['userUuid'] ?? (req as any)['user']?.['sub'];
        this.logger.log(`[GET] mi-rol org=${organizacionUUID} user=${usuarioUuid}`);
        if (!usuarioUuid) {
            return res.status(HttpStatus.UNAUTHORIZED).json(
                new ApiResponse(HttpStatus.UNAUTHORIZED, 'Usuario no identificado en token', null),
            );
        }
        const result = await this.admGrupoTrabajo.getRolMiembro(organizacionUUID, usuarioUuid);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Rol obtenido', result),
        );
    }

    // ── Miembros ──────────────────────────────────────────────────────────────

    /** GET /api/bff/organizacion/:id/miembros */
    @Get(':id/miembros')
    async listarMiembros(
        @Param('id', ParseUUIDPipe) organizacionUUID: string,
        @Res() res: Response,
    ) {
        this.logger.log(`[GET] miembros org=${organizacionUUID}`);
        const data = await this.admGrupoTrabajo.listarMiembrosOrg(organizacionUUID);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Miembros obtenidos', data),
        );
    }

    /** PATCH /api/bff/organizacion/:id/miembros/:uuid/rol */
    @Patch(':id/miembros/:uuid/rol')
    async cambiarRol(
        @Param('id', ParseUUIDPipe) organizacionUUID: string,
        @Param('uuid', ParseUUIDPipe) usuarioUuid: string,
        @Body() body: CambiarRolBffDto,
        @Res() res: Response,
    ) {
        this.logger.log(`[PATCH] cambiarRol org=${organizacionUUID} user=${usuarioUuid} rol=${body.rolCodigo}`);
        const result = await this.admGrupoTrabajo.cambiarRolMiembro(organizacionUUID, usuarioUuid, body.rolCodigo);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Rol actualizado', result),
        );
    }

    /** DELETE /api/bff/organizacion/:id/miembros/:uuid */
    @Delete(':id/miembros/:uuid')
    async removerMiembro(
        @Param('id', ParseUUIDPipe) organizacionUUID: string,
        @Param('uuid', ParseUUIDPipe) usuarioUuid: string,
        @Res() res: Response,
    ) {
        this.logger.log(`[DELETE] removerMiembro org=${organizacionUUID} user=${usuarioUuid}`);
        const result = await this.admGrupoTrabajo.removerMiembroGrupo(organizacionUUID, usuarioUuid);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Miembro removido', result),
        );
    }

    // ── Grupos ────────────────────────────────────────────────────────────────

    /** GET /api/bff/organizacion/:id/grupos */
    @Get(':id/grupos')
    async listarGrupos(
        @Param('id', ParseUUIDPipe) organizacionUUID: string,
        @Res() res: Response,
    ) {
        this.logger.log(`[GET] grupos org=${organizacionUUID}`);
        const data = await this.admGrupoTrabajo.listarGruposOrg(organizacionUUID);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Grupos obtenidos', data),
        );
    }

    /** POST /api/bff/organizacion/:id/grupos */
    @Post(':id/grupos')
    async crearGrupo(
        @Param('id', ParseUUIDPipe) organizacionUUID: string,
        @Body() body: CrearGrupoBffDto,
        @Res() res: Response,
    ) {
        this.logger.log(`[POST] crearGrupo org=${organizacionUUID} nombre=${body.nombre}`);
        const result = await this.admGrupoTrabajo.crearGrupoOrg(organizacionUUID, body);
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
        const result = await this.admGrupoTrabajo.actualizarGrupo(grupoId, body);
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
        const result = await this.admGrupoTrabajo.eliminarGrupo(grupoId);
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
        const result = await this.admGrupoTrabajo.agregarMiembroGrupo(grupoId, body);
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
        const result = await this.admGrupoTrabajo.removerMiembroGrupo(grupoId, usuarioUuid);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Miembro removido del grupo', result),
        );
    }

    



}