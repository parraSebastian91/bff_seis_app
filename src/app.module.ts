import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import configurations from './../configs/app.config';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [
    InfrastructureModule,
    ConfigModule.forRoot({
      load: [configurations],
      isGlobal: true,
      envFilePath: ['.env']
    }),
  ],
  providers: [
  ],
})
export class AppModule { }
