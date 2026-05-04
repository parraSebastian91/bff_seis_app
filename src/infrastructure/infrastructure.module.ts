/*
https://docs.nestjs.com/modules
*/

import { Logger, Module } from '@nestjs/common';
import { SecretsModule } from './secrets/secrets.module';
import { HttpModule } from './http/http.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ClientsModule, Transport } from '@nestjs/microservices';
import KeyvRedis from '@keyv/redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AxiosHeaders } from 'axios';
import { CacheRepositoryAdapter } from './adapters/outbound/cache/cacheRepository.adapter';
import { CoreServiceClientAdapter } from './adapters/outbound/services/coreServiceClient.adapter';
import { PAYMENTS_CLIENT, CORE_SERVICE_CLIENT } from './../core/domain/ports/outbound/core.service.interface';
import { AccessTokenContext } from './http/middleware/access-token.context';
import { QueueClientAdapter } from './adapters/outbound/queue/queue-client.adapter';
import { MESSAGE_PUBLISHER } from 'src/core/domain/ports/outbound/message.publisher.interface';
import { MinioRepositoryAdapter } from './adapters/outbound/storage/minio-repository.adapter';
import { STORAGE_SERVICE } from 'src/core/domain/ports/outbound/storage.service.interface';
import { StorageServiceAdapter } from './adapters/outbound/storage/storage.service';
import { NotificationListenerController } from './adapters/inbound/queue/notification-listener.controller';

const NOTIFICATION_MODULE = 'NOTIFICATION_SERVICE';

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
        ClientsModule.registerAsync([
            {
                name: NOTIFICATION_MODULE,
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => {
                    const host = configService.get<string>('rabbitmq.host') || 'rabbitmq';
                    const port = configService.get<number>('rabbitmq.port') || 5672;
                    const user = configService.get<string>('rabbitmq.user') || 'bff_seis_app';
                    const pass = configService.get<string>('rabbitmq.pass') || 'bff-123';
                    const queue = configService.get<string>('rabbitmq.queue') || 'notify_queue';

                    return {
                        transport: Transport.RMQ,
                        options: {
                            urls: [`amqp://${user}:${pass}@${host}:${port}`],
                            queue,
                            queueOptions: {
                                durable: true,
                            },
                        },
                    };
                },
            },
        ]),
    ],
    controllers: [NotificationListenerController],
    providers: [
        CacheRepositoryAdapter,
        CoreServiceClientAdapter,
        QueueClientAdapter,
        MinioRepositoryAdapter,
        StorageServiceAdapter,
        {
            provide: MESSAGE_PUBLISHER,
            useExisting: QueueClientAdapter,
        },
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
                    const correlationId = accessTokenContext.getCorrelationId();
                    if (!token && !correlationId) {
                        return config;
                    }

                    if (config.headers && typeof (config.headers as any).set === 'function') {
                        if (correlationId) {
                            (config.headers as any).set('X-Correlation-Id', correlationId);
                        }
                        if (token) {
                            (config.headers as any).set('access_token', token);
                            if (!(config.headers as any).has?.('Authorization')) {
                                (config.headers as any).set('Authorization', `Bearer ${token}`);
                            }
                        }
                        return config;
                    }

                    const headers = AxiosHeaders.from(config.headers ?? {});
                    if (correlationId) {
                        headers.set('X-Correlation-Id', correlationId);
                    }
                    if (token) {
                        headers.set('access_token', token);
                        if (!headers.has('Authorization')) {
                            headers.set('Authorization', `Bearer ${token}`);
                        }
                    }
                    config.headers = headers;

                    return config;
                });

                return client;
            }
        },
        {
            provide: PAYMENTS_CLIENT,
            inject: [ConfigService, AccessTokenContext],
            useFactory: (configService: ConfigService, accessTokenContext: AccessTokenContext) => {
                const client = axios.create({
                    baseURL: configService.get<string>('externalServices.payments.baseUrl'),
                    timeout: configService.get<number>('externalServices.payments.timeout') ?? 8000,
                });

                client.interceptors.request.use((config) => {
                    const correlationId = accessTokenContext.getCorrelationId();
                    if (!correlationId) {
                        return config;
                    }

                    if (config.headers && typeof (config.headers as any).set === 'function') {
                        (config.headers as any).set('X-Correlation-Id', correlationId);
                        return config;
                    }

                    const headers = AxiosHeaders.from(config.headers ?? {});
                    headers.set('X-Correlation-Id', correlationId);
                    config.headers = headers;

                    return config;
                });

                return client;
            },
        },
        {
            provide: STORAGE_SERVICE,
            inject: [ConfigService, AccessTokenContext],
            useFactory: (configService: ConfigService, accessTokenContext: AccessTokenContext) => {
                const baseUrl = configService.get<string>('externalServices.storage.baseUrl');
                const logger = new Logger('InfrastructureModule');
                logger.debug(`Configurando cliente Axios para servicio Storage con baseURL: ${baseUrl}`);
                const client = axios.create({
                    baseURL: baseUrl,
                    timeout: configService.get<number>('externalServices.storage.timeout') ?? 8000,
                });

                client.interceptors.request.use((config) => {
                    const token = accessTokenContext.getAccessToken();
                    const correlationId = accessTokenContext.getCorrelationId();
                    if (!token && !correlationId) {
                        return config;
                    }

                    if (config.headers && typeof (config.headers as any).set === 'function') {
                        if (correlationId) {
                            (config.headers as any).set('X-Correlation-Id', correlationId);
                        }
                        if (token) {
                            (config.headers as any).set('access_token', token);
                            if (!(config.headers as any).has?.('Authorization')) {
                                (config.headers as any).set('Authorization', `Bearer ${token}`);
                            }
                        }
                        return config;
                    }

                    const headers = AxiosHeaders.from(config.headers ?? {});
                    if (correlationId) {
                        headers.set('X-Correlation-Id', correlationId);
                    }
                    if (token) {
                        headers.set('access_token', token);
                        if (!headers.has('Authorization')) {
                            headers.set('Authorization', `Bearer ${token}`);
                        }
                    }
                    config.headers = headers;

                    return config;
                });
                return client;
            }
        },
    ],
    exports: [
        SecretsModule,
        CacheModule,
        CacheRepositoryAdapter,
        CoreServiceClientAdapter,
        QueueClientAdapter,
        MinioRepositoryAdapter,
        StorageServiceAdapter,
        MESSAGE_PUBLISHER,
        CORE_SERVICE_CLIENT,
        PAYMENTS_CLIENT,
        STORAGE_SERVICE
    ],
})
export class InfrastructureModule { }
