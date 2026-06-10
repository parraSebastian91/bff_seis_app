import {
    Controller,
    Get,
    HttpStatus,
    Inject,
    Logger,
    ParseIntPipe,
    Query,
    Res,
    UseFilters,
} from '@nestjs/common';
import type { Response } from 'express';
import { GEO_USE_CASE } from 'src/core/application/application.module';
import type { GeoCatalogoUseCase } from 'src/core/application/useCase/catalogo/geoCatalogo.usecase';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';
import { ApiResponse } from '../model/api-response.model';
import { Public } from '../decorators/public.decorator';

/**
 * Proxy de catálogo geográfico y financiero.
 * No requiere sesión de usuario — los datos son públicos.
 *
 * Endpoints expuestos:
 *   GET /api/geo/regiones?pais=CL
 *   GET /api/geo/provincias?region_id={id}
 *   GET /api/geo/comunas?provincia_id={id}
 *   GET /api/bancos?pais=CL
 */
@Controller('catalogo')
@UseFilters(ErrorHandler)
@Public()
export class GeoController {

    private readonly logger = new Logger(GeoController.name);

    constructor(
        @Inject(GEO_USE_CASE)
        private readonly geoUseCase: GeoCatalogoUseCase,
    ) { }

    @Get('geo/regiones')
    async getRegiones(
        @Query('pais') pais: string = 'CL',
        @Res() res: Response,
    ) {
        this.logger.log(`[GET] geo/regiones pais=${pais}`);
        const data = await this.geoUseCase.getRegiones(pais);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Regiones obtenidas', data),
        );
    }

    @Get('geo/provincias')
    async getProvincias(
        @Query('region_id', ParseIntPipe) regionId: number,
        @Res() res: Response,
    ) {
        this.logger.log(`[GET] geo/provincias region_id=${regionId}`);
        const data = await this.geoUseCase.getProvincias(regionId);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Provincias obtenidas', data),
        );
    }

    @Get('geo/comunas')
    async getComunas(
        @Query('provincia_id', ParseIntPipe) provinciaId: number,
        @Res() res: Response,
    ) {
        this.logger.log(`[GET] geo/comunas provincia_id=${provinciaId}`);
        const data = await this.geoUseCase.getComunas(provinciaId);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Comunas obtenidas', data),
        );
    }

    @Get('bancos')
    async getBancos(
        @Query('pais') pais: string = 'CL',
        @Res() res: Response,
    ) {
        this.logger.log(`[GET] bancos pais=${pais}`);
        const data = await this.geoUseCase.getBancos(pais);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Bancos obtenidos', data),
        );
    }

    @Get('productos-financieros')
    async getProductosFinancieros(
        @Query('tipo_org') tipoOrg: string | undefined,
        @Res() res: Response,
    ) {
        this.logger.log(`[GET] productos-financieros tipo_org=${tipoOrg ?? 'all'}`);
        const data = await this.geoUseCase.getProductosFinancieros(tipoOrg);
        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, 'Productos financieros obtenidos', data),
        );
    }
}
