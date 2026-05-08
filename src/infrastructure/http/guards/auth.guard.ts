import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { ISessionUseCase } from 'src/core/domain/ports/inbound/sessionUseCase.interface';
import { validateQuery } from 'src/core/application/useCase/session/query/validate.query';
import { AUTH_USE_CASE } from 'src/core/application/application.module';
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    @Inject(AUTH_USE_CASE) private authService: ISessionUseCase,
    private reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    if (isPublic || request.path === '/metrics') {
      return true;
    }
    const queryValidate: validateQuery = {
      sessionId: await this.extractSession(request)
    }

    request["user"] = await this.authService.executeValidateSession(queryValidate)
    request["correlationId"] = request.headers?.['x-correlation-id'];

    return !!request["user"];
  }

  private async extractSession(request: Request): Promise<string> {
    const sessionCookie = request.cookies;
    if (!sessionCookie) {
      this.logger.warn('No session cookie found in the request');
      throw new UnauthorizedException('No session cookie found');
    }

    const rawSession = sessionCookie['auth.session'];
    if (!rawSession || typeof rawSession !== 'string') {
      this.logger.warn('Cookie auth.session ausente o inválida');
      throw new UnauthorizedException('No session cookie found');
    }

    const decodedSession = decodeURIComponent(rawSession);
    const unsigned = decodedSession.startsWith('s:') ? decodedSession.slice(2) : decodedSession;
    const sessionId = unsigned.split('.')[0];

    if (!sessionId) {
      this.logger.warn('No fue posible extraer sessionId desde auth.session');
      throw new UnauthorizedException('Invalid session cookie format');
    }

    this.logger.log(`Session Activa: ${sessionId}`);
    return sessionId;
  }
}