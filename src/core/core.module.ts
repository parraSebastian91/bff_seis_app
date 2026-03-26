/*
https://docs.nestjs.com/modules
*/

import { DynamicModule, Global, Module, Type } from '@nestjs/common';
import { ICacheRepository } from './domain/ports/outbound/CacheRepository.interface';
import { ApplicationModule } from './application/application.module';
import { DomainModule } from './domain/domain.module';

export type CoreModuleOptions = {
    modules: any[];
    adapters: {
        cacheRepositoryAdapter: Type<ICacheRepository>
    }
}

@Global()
@Module({})
export class CoreModule {

    static register(options: CoreModuleOptions): DynamicModule {
        const { adapters, modules } = options;
        const {
            cacheRepositoryAdapter,
        } = adapters;

        return {
            module: CoreModule,
            imports: [
                DomainModule,
                ApplicationModule.register({
                    modules,
                    adapters: {
                        cacheRepository: cacheRepositoryAdapter,
                    },
                }),
            ],
            exports: [ApplicationModule],
        };
    }
}
