/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { SecretsModule } from './secrets/secrets.module';
import { HttpModule } from './http/http.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        // CacheModule debe ir primero, con isGlobal: true
        CacheModule.registerAsync({
            isGlobal: true,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                store: new KeyvRedis(`redis://${configService.get('redis.host')}:${configService.get('redis.port')}`),
                ttl: configService.get('redis.ttl') || 3600, // 1 hora por defecto
            }),
        }),
        SecretsModule,
        HttpModule,
    ],
    controllers: [],
    providers: [],
    exports: [
        SecretsModule,
        CacheModule
    ]
})
export class InfrastructureModule { }
