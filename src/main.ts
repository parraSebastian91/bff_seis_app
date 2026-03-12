import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // Permitir todas las fuentes (en producción, restringir a dominios específicos)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  await app.listen(process.env.PORT ?? 3000).then(() => {
    console.log(`🚀 Server is running on port ${process.env.PORT ?? 3000}`);
  });
}
bootstrap();
