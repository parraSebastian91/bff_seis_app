/*
https://docs.nestjs.com/modules
*/

import { DynamicModule, Module, Type } from '@nestjs/common';
import { ICacheRepository } from '../domain/ports/outbound/CacheRepository.interface';
import { SessionUseCase } from './useCase/session/session.usecase';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

export type ApplicationModuleOptions = {
    modules: any[];
    adapters: {
        cacheRepository: Type<ICacheRepository>;
    }
}

export const AUTH_USE_CASE = 'AUTH_USE_CASE';

@Module({})
export class ApplicationModule {

    static register(options: ApplicationModuleOptions): DynamicModule {

        const { adapters, modules } = options;
        const {
            cacheRepository,
        } = adapters;

        const authUseCaseProvider = {
            provide: AUTH_USE_CASE,
            inject: [
                cacheRepository,
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
                authUseCaseProvider
            ],
            exports: [
                AUTH_USE_CASE
            ],
        };
    }
}
