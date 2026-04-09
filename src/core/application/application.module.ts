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
import { PortalUseCaseService } from './useCase/portal/portal-use-case.service';
import { ObjectManagerService } from './useCase/objectManager/object-manager.usecase.impl.service';
import { IMessagePublisher } from '../domain/ports/outbound/message.publisher.interface';
import { IStorageRepository } from '../domain/ports/outbound/storage.repository';
import { IStorageService } from '../domain/ports/outbound/storage.service.interface';

export type ApplicationModuleOptions = {
    modules: any[];
    adapters: {
        cacheRepositoryAdapter: Type<ICacheRepository>;
        coreServiceClientAdapter: Type<ICoreService>;
        queueClientAdapter: Type<IMessagePublisher>;
        storageRepositoryAdapter: Type<IStorageRepository>;
        storageServiceAdapter: Type<IStorageService>;
    }
}

export const AUTH_USE_CASE = 'AUTH_USE_CASE';
export const USUARIO_USE_CASE = 'USUARIO_USE_CASE';
export const PORTAL_USE_CASE = 'PORTAL_USE_CASE';
export const OBJECT_MANAGER_USE_CASE = 'OBJECT_MANAGER_USE_CASE';

@Module({})
export class ApplicationModule {

    static register(options: ApplicationModuleOptions): DynamicModule {

        const { adapters, modules } = options;
        const {
            cacheRepositoryAdapter,
            coreServiceClientAdapter,
            queueClientAdapter,
            storageRepositoryAdapter,
            storageServiceAdapter,
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

        const portalUseCaseProvider = {
            provide: PORTAL_USE_CASE,
            inject: [
                coreServiceClientAdapter
            ],
            useFactory(
                coreServiceClient: ICoreService
            ) {
                return new PortalUseCaseService(
                    coreServiceClient
                );
            },
        };

        const ObjectManagerUseCaseProvider = {
            provide: OBJECT_MANAGER_USE_CASE,
            inject: [
                queueClientAdapter,
                storageRepositoryAdapter,
                storageServiceAdapter,
            ],
            useFactory(messagePublisher: IMessagePublisher, storageRepository: IStorageRepository, storageService: IStorageService) {
                return new ObjectManagerService(messagePublisher, storageRepository, storageService);
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
                authUseCaseProvider,
                portalUseCaseProvider,
                ObjectManagerUseCaseProvider
            ],
            exports: [
                AUTH_USE_CASE,
                USUARIO_USE_CASE,
                PORTAL_USE_CASE,
                OBJECT_MANAGER_USE_CASE
            ],
        };
    }
}
