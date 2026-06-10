import type { ICoreService } from 'src/core/domain/ports/outbound/core.service.interface';

export class VerificacionTributariaUseCase {

    constructor(private readonly coreService: ICoreService) { }

    guardar(payload: { organizacionId: number; rawResponse: Record<string, any>; fuente: string }) {
        return this.coreService.guardarVerificacionTributaria(payload);
    }
}
