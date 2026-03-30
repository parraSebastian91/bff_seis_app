import { validateQuery } from "src/core/application/useCase/session/query/validate.query";

export interface ISessionUseCase {
    executeValidateSession(query: validateQuery): Promise<{ userUuid: string, username: string, accessToken: string }>;
}