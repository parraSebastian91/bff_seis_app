/*
https://docs.nestjs.com/modules
*/

import { DynamicModule, Module, Type } from '@nestjs/common';
import { ICacheRepository } from '../domain/ports/outbound/CacheRepository.interface';
import { SessionUseCase } from './useCase/session/session.usecase';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuarioUserCaseImplService } from './useCase/usuario/usuario.usercase.impl.service';
import { ICoreService } from '../domain/ports/outbound/core.service.interface';

export type ApplicationModuleOptions = {
    modules: any[];
    adapters: {
        cacheRepositoryAdapter: Type<ICacheRepository>;
        coreServiceClientAdapter: Type<ICoreService>;

    }
}

export const AUTH_USE_CASE = 'AUTH_USE_CASE';
export const USUARIO_USE_CASE = 'USUARIO_USE_CASE';

@Module({})
export class ApplicationModule {

    static register(options: ApplicationModuleOptions): DynamicModule {

        const { adapters, modules } = options;
        const {
            cacheRepositoryAdapter,
            coreServiceClientAdapter
        } = adapters;

        const usuarioUseCaseProvider = {
            provide: USUARIO_USE_CASE,
            inject: [
                coreServiceClientAdapter
            ],
            useFactory(
                coreServiceClient: ICoreService
            ) {
                return new UsuarioUserCaseImplService(
                    coreServiceClient
                );
            },
        };

        const authUseCaseProvider = {
            provide: AUTH_USE_CASE,
            inject: [
                cacheRepositoryAdapter,
                JwtService,
            ],
            useFactory(
                cacheRepository: ICacheRepository,
                jwtService: JwtService,
            ) {
                return new SessionUseCase(
                    cacheRepository,
                    jwtService,
                );
            },
        };

        return {
            module: ApplicationModule,
            imports: [
                ConfigModule,
                JwtModule.registerAsync({
                    imports: [ConfigModule],
                    inject: [ConfigService],
                    useFactory: async (configService: ConfigService) => ({
                        secret:
                            configService.get<string>('jwtConfig.access_secret') ||
                            configService.get<string>('JWT_ACCESS_SECRET') ||
                            'jwt_access_secret',
                    }),
                }),
                ...modules,
            ],
            providers: [
                usuarioUseCaseProvider,
                authUseCaseProvider
            ],
            exports: [
                AUTH_USE_CASE,
                USUARIO_USE_CASE,
            ],
        };
    }
}
