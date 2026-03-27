/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { SecretsModule } from './secrets/secrets.module';
import { HttpModule } from './http/http.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheRepositoryAdapter } from './adapters/DB/cache/cacheRepository.adapter';

@Module({
    imports: [
        ConfigModule,
        // CacheModule debe ir primero, con isGlobal: true

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
        CacheRepositoryAdapter
    ],
    exports: [
        SecretsModule,
        CacheModule,
        CacheRepositoryAdapter,
    ]
})
export class InfrastructureModule { }
