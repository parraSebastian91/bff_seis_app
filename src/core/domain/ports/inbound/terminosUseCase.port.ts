import { VersionTerminosModel } from "src/infrastructure/adapters/outbound/services/dto/versionTerminos.coreResponse";

export interface ITerminosUseCase {
    ExecuteGetVersionTerminosActiva(): Promise<VersionTerminosModel>;
}
