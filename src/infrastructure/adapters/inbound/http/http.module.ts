/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UsuariosBffController } from './controllers/usuarios-bff.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SecretsModule } from '../../../secrets/secrets.module';
import { TerminusModule } from '@nestjs/terminus';
import { LoggerInterceptor } from './middleware/loggin.interceptor';
import { HealthCheckController } from './controllers/healthcheck.controller';
import { AccessTokenInterceptor } from './middleware/access-token.interceptor';
import { AccessTokenContext } from './middleware/access-token.context';
import { PortalCoreController } from './controllers/portal-core.controller';
import { ObjectManagerController } from './controllers/object-manager.controller';

@Module({
    imports: [
        TerminusModule,
        ConfigModule,
        SecretsModule,
        JwtModule,
    ],
    controllers: [
        UsuariosBffController,
        PortalCoreController,
        HealthCheckController,
        ObjectManagerController
    ],
    providers: [
        AccessTokenContext,
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggerInterceptor,
        },
        AuthGuard,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: AccessTokenInterceptor,
        },

    ],
    exports: [AccessTokenContext],
})
export class HttpModule { }
