/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { SecretsModule } from './secrets/secrets.module';
import { HttpModule } from './http/http.module';

@Module({
    imports: [
        SecretsModule,
        HttpModule
    ],
    controllers: [],
    providers: [],
    exports: [
        SecretsModule
    ]
})
export class InfrastructureModule { }
