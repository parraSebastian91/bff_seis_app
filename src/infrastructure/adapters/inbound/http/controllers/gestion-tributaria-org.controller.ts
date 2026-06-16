import { Body, Controller, Get, HttpStatus, Inject, Logger, Post, Query, Req, Res, UseFilters } from "@nestjs/common";
import type { Response } from "express";
import { ORGANIZACION_USE_CASE } from "src/core/application/application.module";
import type { IOrganizacion } from "src/core/domain/ports/inbound/organizacion.interface";
import { SiiLookupService } from "src/infrastructure/adapters/outbound/services/siiLookup.service";
import { ErrorHandler } from "src/infrastructure/errors/error.handler";
import { SiiLookupDto } from "../dto/organizacion.dto";
import { ApiResponse } from "../model/api-response.model";

@Controller('organizacion')
@UseFilters(ErrorHandler)
export class GestionTributariaOrgController {

    private readonly logger = new Logger(GestionTributariaOrgController.name);
    constructor(
        private readonly siiService: SiiLookupService,
        @Inject(ORGANIZACION_USE_CASE) private readonly organizacion: IOrganizacion
    ) {

    }

    /**
       * GET /api/bff/organizacion/check-rut?rut=178414453
       * EB-01: verifica si el RUT ya está registrado en la plataforma antes de crear org.
       * @param rut dígitos + DV concatenados sin puntos ni guión (ej: "178414453" o "1234567K")
       */
    @Get('check-rut')
    async checkRut(
        @Query('rut') rut: string,
        @Res() res: Response,
    ) {
        this.logger.log(`[GET] check-rut | rut=${rut?.slice(0, 6)}…`);
        if (!rut || rut.length < 2) {
            return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Parámetro rut requerido.' });
        }
        const result = await this.organizacion.checkRutRegistrado(rut);
        return res.status(HttpStatus.OK).json(result);
    }

    /**
        * GET /organizacion/sii/lookup?rut={rut}&dv={dv}
        *
        * Consulta información del contribuyente en el SII.
        * No persiste datos — el organizacionId no existe aún en el paso 1 del wizard.
        * Retorna SiiLookupResult mapeado al formato que espera el frontend.
        */
    @Get('sii/lookup')
    async siiLookupGet(
        @Query('rut') rut: string,
        @Query('dv') dv: string,
        @Res() res: Response,
    ) {
        this.logger.log(`[GET] sii/lookup RUT=${rut}-${dv}`);

        if (!rut || !dv) {
            return res.status(HttpStatus.BAD_REQUEST).json(
                { estado: 'ERROR_RED', mensaje: 'Parámetros rut y dv requeridos.' },
            );
        }

        try {
            const raw = await this.siiService.consultarContribuyente(rut, dv);

            const alertasGraves = raw.alertaTablas
                ?.flatMap(t => t.alertas?.filter(a => a.grave === 'S') ?? []) ?? [];

            let estado: 'VALIDO' | 'ADVERTENCIA' | 'BLOQUEADO' | 'NO_ENCONTRADO' | 'ERROR_RED';
            let mensaje: string;

            if (!raw.registrado) {
                estado = 'NO_ENCONTRADO';
                mensaje = 'RUT no encontrado en el SII.';
            } else if (alertasGraves.length > 0) {
                estado = 'BLOQUEADO';
                mensaje = alertasGraves.map((a: any) => a.texto).join('. ');
            } else if (raw.cumpleObligacionTributaria !== 'SI') {
                estado = 'ADVERTENCIA';
                mensaje = 'El contribuyente no cumple su obligación tributaria vigente.';
            } else {
                estado = 'VALIDO';
                mensaje = 'RUT válido y activo en el SII.';
            }

            return res.status(HttpStatus.OK).json({
                estado,
                mensaje,
                razonSocial: raw.nombre ?? undefined,
                girosNegocio: raw.girosNegocio ?? [],
                fechaInicioActividades: raw.fechaInicioActividades ?? undefined,
                tieneFacturaElectronica: raw.timbrajes?.some((t: any) => t.codigo === '0033') ?? false,
                tieneObservacionTributaria: alertasGraves.length > 0,
                raw
            });

        } catch (error: any) {
            this.logger.warn(`[GET] sii/lookup error RUT=${rut}-${dv}: ${error?.message}`);
            // Error de red o SII no disponible — no bloquear avance
            return res.status(HttpStatus.OK).json({
                estado: 'ERROR_RED',
                mensaje: 'No se pudo consultar el SII en este momento. Puedes continuar igualmente.',
            });
        }
    }

    /**
     * POST /api/bff/organizacion/sii/lookup
     *
     * Flujo:
     *   1. BFF consulta SII con el RUT recibido
     *   2. BFF envía la respuesta cruda a ms-core para normalizar y persistir
     *   3. BFF retorna el resultado normalizado al frontend
     *
     * Body: { rut: "77908337", dv: "3", organizacionId: 42 }
     */
    @Post('sii/lookup')
    async siiLookup(
        @Body() body: SiiLookupDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const correlationId = req['correlationId'] ?? crypto.randomUUID();
        this.logger.log(`[START] sii/lookup RUT=${body.rut}-${body.dv} orgId=${body.organizacionId} cid=${correlationId}`);

        // 1. Consultar SII (solo el BFF sale a internet)
        const rawSii = await this.siiService.consultarContribuyente(body.rut, body.dv);

        // 2. Persistir en ms-core (normalización + guardado ocurre allá)
        const resultado = await this.organizacion.loadVerificacionTributaria({
            organizacionId: body.organizacionId,
            rawResponse: rawSii as unknown as Record<string, any>,
            fuente: 'SII',
        });

        this.logger.log(`[END] sii/lookup RUT=${body.rut}-${body.dv} verificacionId=${resultado.id}`);

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Verificación tributaria completada', {
                verificacionId: resultado.id,
                registrado: rawSii.registrado,
                nombre: rawSii.nombre,
                cumpleObligacion: rawSii.cumpleObligacionTributaria === 'SI',
                emisorDte: rawSii.tieneEMTP,
                tieneFacturaElectronica: rawSii.timbrajes?.some(t => t.codigo === '0033') ?? false,
            }),
        );
    }


}