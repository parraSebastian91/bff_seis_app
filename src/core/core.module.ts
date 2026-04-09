/*
https://docs.nestjs.com/modules
*/

import { DynamicModule, Global, Module, Type } from '@nestjs/common';
import { ICacheRepository } from './domain/ports/outbound/CacheRepository.interface';
import { ApplicationModule } from './application/application.module';
import { DomainModule } from './domain/domain.module';
import { ICoreService } from './domain/ports/outbound/core.service.interface';
import { IMessagePublisher } from './domain/ports/outbound/message.publisher.interface';

export type CoreModuleOptions = {
    modules: any[];
    adapters: {
        cacheRepositoryAdapter: Type<ICacheRepository>,
        coreServiceClientAdapter: Type<ICoreService>,
        queueClientAdapter: Type<IMessagePublisher>,
    }
}

@Global()
@Module({})
export class CoreModule {

    static register(options: CoreModuleOptions): DynamicModule {
        const { adapters, modules } = options;
        const {
            cacheRepositoryAdapter,
            coreServiceClientAdapter,
            queueClientAdapter,
        } = adapters;

        return {
            module: CoreModule,
            imports: [
                DomainModule,
                ApplicationModule.register({
                    modules,
                    adapters: {
                        cacheRepositoryAdapter: cacheRepositoryAdapter,
                        coreServiceClientAdapter: coreServiceClientAdapter,
                        queueClientAdapter: queueClientAdapter,
                    },
                }),
            ],
            exports: [ApplicationModule],
        };
    }
}
