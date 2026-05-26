import { Controller, Get, HttpStatus, Inject, Logger, Req, Res, UseFilters } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { ErrorHandler } from 'src/infrastructure/errors/error.handler';
import type { ITerminosUseCase } from 'src/core/domain/ports/inbound/terminosUseCase.port';
import type { Response, Request } from 'express';
import { ApiResponse } from '../model/api-response.model';

@Controller('terminos')
@UseFilters(ErrorHandler)
export class TerminosController {
    private readonly logger = new Logger(TerminosController.name);

    constructor(@Inject('TERMINOS_USE_CASE') private readonly terminosUseCase: ITerminosUseCase) { }

    @Get('activo')
    @Roles(
        'USR_STD',
        'CLIENTE_CEDENTE',
        'EJECUTIVO_FINANCIADORA',
        'ADMIN_FINANCIADORA',
        'ADMIN_CEDENTE',
        'SUPER_ADMIN'
    )
    async getVersionTerminosActiva(
        @Req() req: Request,
        @Res() res: Response
    ): Promise<any> {
        const correlationId = req['correlationId'];
        this.logger.debug(`[START] getVersionTerminosActiva - CorrelationID: ${correlationId}`);
        const terminos = await this.terminosUseCase.ExecuteGetVersionTerminosActiva();
        this.logger.debug(`[END] getVersionTerminosActiva - CorrelationID: ${correlationId}`);
        return res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, 'Términos obtenidos', terminos));
    }
}
