/*
https://docs.nestjs.com/modules
*/

import { Logger, Module } from '@nestjs/common';
import { SecretsModule } from './secrets/secrets.module';
import { HttpModule } from './http/http.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AxiosHeaders } from 'axios';
import { CacheRepositoryAdapter } from './adapters/outbound/cache/cacheRepository.adapter';
import { CoreServiceClientAdapter } from './adapters/outbound/services/coreServiceClient.adapter';
import { PAYMENTS_CLIENT, CORE_SERVICE_CLIENT } from './../core/domain/ports/outbound/core.service.interface';
import { AccessTokenContext } from './http/middleware/access-token.context';



@Module({
    imports: [
        ConfigModule,
        CacheModule.registerAsync({
            isGlobal: true,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const redisHost = configService.get<string>('redis.host') || 'localhost';
                const redisPort = configService.get<number>('redis.port') || 6379;
                const redisDb = configService.get<number>('redis.db') ?? 0;

                return {
                    stores: [new KeyvRedis(`redis://${redisHost}:${redisPort}/${redisDb}`)],
                    ttl: configService.get<number>('redis.ttl') || 3600, // 1 hora por defecto
                };
            },
        }),
        SecretsModule,
        HttpModule,
    ],
    controllers: [],
    providers: [
        CacheRepositoryAdapter,
        CoreServiceClientAdapter,
        {
            provide: CORE_SERVICE_CLIENT,
            inject: [ConfigService, AccessTokenContext],
            useFactory: (configService: ConfigService, accessTokenContext: AccessTokenContext) => {
                const baseUrl = configService.get<string>('externalServices.core.baseUrl');
                const logger = new Logger('InfrastructureModule');
                logger.debug(`Configurando cliente Axios para servicio Core con baseURL: ${baseUrl}`);
                const client = axios.create({
                    baseURL: baseUrl,
                    timeout: configService.get<number>('externalServices.core.timeout') ?? 8000,
                });

                client.interceptors.request.use((config) => {
                    const token = accessTokenContext.getAccessToken();
                    if (!token) {
                        return config;
                    }

                    if (config.headers && typeof (config.headers as any).set === 'function') {
                        (config.headers as any).set('access_token', token);
                        if (!(config.headers as any).has?.('Authorization')) {
                            (config.headers as any).set('Authorization', `Bearer ${token}`);
                        }
                        return config;
                    }

                    const headers = AxiosHeaders.from(config.headers ?? {});
                    headers.set('access_token', token);
                    if (!headers.has('Authorization')) {
                        headers.set('Authorization', `Bearer ${token}`);
                    }
                    config.headers = headers;

                    return config;
                });

                return client;
            }
        },
        {
            provide: PAYMENTS_CLIENT,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) =>
                axios.create({
                    baseURL: configService.get<string>('externalServices.payments.baseUrl'),
                    timeout: configService.get<number>('externalServices.payments.timeout') ?? 8000,
                }),
        },
    ],
    exports: [
        SecretsModule,
        CacheModule,
        CacheRepositoryAdapter,
        CoreServiceClientAdapter,
        CORE_SERVICE_CLIENT,
        PAYMENTS_CLIENT,
    ],
})
export class InfrastructureModule { }
