import { Logger } from "@nestjs/common";
import { ITerminosUseCase } from "src/core/domain/ports/inbound/terminosUseCase.port";
import { ICoreService } from "src/core/domain/ports/outbound/core.service.interface";
import { VersionTerminosModel } from "src/infrastructure/adapters/outbound/services/dto/versionTerminos.coreResponse";

export class TerminosUseCaseImpl implements ITerminosUseCase {
    private readonly logger = new Logger(TerminosUseCaseImpl.name);

    constructor(private readonly coreService: ICoreService) { }

    async ExecuteGetVersionTerminosActiva(): Promise<VersionTerminosModel> {
        this.logger.log('[START] GetVersionTerminosActiva');
        return this.coreService.getVersionTerminosActiva();
    }
}
