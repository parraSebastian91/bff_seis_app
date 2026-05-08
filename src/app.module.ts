import { StorageServiceAdapter } from './infrastructure/adapters/outbound/storage/storage.service';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import configurations from './../configs/app.config';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { CoreModule } from './core/core.module';
import { CacheRepositoryAdapter } from './infrastructure/adapters/outbound/cache/cacheRepository.adapter';
import { CoreServiceClientAdapter } from './infrastructure/adapters/outbound/services/coreServiceClient.adapter';
import { QueueClientAdapter } from './infrastructure/adapters/outbound/queue/queue-client.adapter';
import { MinioRepositoryAdapter } from './infrastructure/adapters/outbound/storage/minio-repository.adapter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
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
        queueClientAdapter: QueueClientAdapter,
        storageRepositoryAdapter: MinioRepositoryAdapter, // Aquí debes proporcionar la implementación concreta del adaptador para el repositorio de almacenamiento
        storageServiceAdapter: StorageServiceAdapter, // Aquí debes proporcionar la implementación concreta del adaptador para el servicio de almacenamiento
      },
    }),
  ],
})
export class AppModule { }
