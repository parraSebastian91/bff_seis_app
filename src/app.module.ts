
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import configurations from './../configs/app.config';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { CoreModule } from './core/core.module';
import { CacheRepositoryAdapter } from './infrastructure/adapters/outbound/cache/cacheRepository.adapter';
import { CoreServiceClientAdapter } from './infrastructure/adapters/services/coreServiceClient.adapter';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configurations],
      isGlobal: true,
      envFilePath: ['.env']
    }),
    CoreModule.register({
      modules: [InfrastructureModule],
      adapters: {
        cacheRepositoryAdapter: CacheRepositoryAdapter,
        coreServiceClientAdapter: CoreServiceClientAdapter, // Aquí debes proporcionar la implementación concreta del adaptador para el servicio core
      },
    }),
  ],
  providers: [
  ],
})
export class AppModule { }
