import { Logger, UnauthorizedException } from "@nestjs/common";
import { ISessionUseCase } from "src/core/domain/ports/inbound/sessionUseCase.interface";
import { validateQuery } from "./query/validate.query";
import { ICacheRepository } from "./../../../../core/domain/ports/outbound/CacheRepository.interface";
import { JwtService } from "@nestjs/jwt";
import { AccessTokenPayload } from "./../../../../core/domain/models/jwt.model";

export class SessionUseCase implements ISessionUseCase {
    private readonly logger = new Logger(SessionUseCase.name);

    constructor(
        private cacheRepository: ICacheRepository,
        private jwtService: JwtService,
    ) { }

    async executeValidateSession(query: validateQuery): Promise<{ userUuid: string, username: string, accessToken: string }> {
        const startedAt = Date.now();
        this.logger.log(`[START] Validar sesion | sessionIdPresent=${Boolean(query.sessionId)}`);

        const session = await this.cacheRepository.getAccessToken(query.sessionId);
        if (!session) {
            this.logger.error(`[FAIL] Sesion no encontrada | durationMs=${Date.now() - startedAt}`);
            throw new UnauthorizedException('Por favor inicia sesión.');
        }

        if (!this.jwtService.verify(session)) {
            this.logger.error(`[FAIL] JWT expirado o invalido | durationMs=${Date.now() - startedAt}`);
            throw new UnauthorizedException('Por favor inicia sesión.');
        }

        const payload = this.jwtService.decode<AccessTokenPayload>(session);
        if (!payload) {
            this.logger.error(`[FAIL] Access token corrupto | durationMs=${Date.now() - startedAt}`);
            throw new UnauthorizedException('Por favor inicia sesión.');
        }
        // const ahora = Math.floor(Date.now() / 1000); // timestamp actual en segundos
        // const iat = payload.iat || ahora; // issued at
        // const exp = payload.exp; // expiration time

        // const tiempoLogeado = ahora - iat; // segundos desde que se emitió
        // const tiempoRestante = exp - ahora; // segundos hasta expiración

        // this.logger.log(`⏱️ Token - Logeado: ${tiempoLogeado}s | Expira en: ${tiempoRestante}s`);
        // this.logger.log(`✅ Usuario autenticado: ${request['user'].username} (ID: ${request['user'].userId})`);

        this.logger.log(`[OK] Sesion validada | userUuid=${payload.userUuid} | durationMs=${Date.now() - startedAt}`);

        return {
            userUuid: payload.userUuid,
            username: payload.username,
            accessToken: session,
        };
    }
}