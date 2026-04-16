import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import vault from 'node-vault';
import { INestApplication, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

const cookieParser = require('cookie-parser');

async function preloadVaultToEnv() {
  const client = vault({
    apiVersion: 'v1',
    endpoint: process.env.VAULT_ADDR || 'http://vault:8200',
    token: process.env.VAULT_TOKEN || 'myroot',
  });

  const paths = ['JWT', 'DB-SEIS-POSTGRES', 'REDIS', 'SHARED'];

  for (const path of paths) {
    try {
      const res = await client.read(`secret/data/${path}`);
      const data = res?.data?.data ?? {};
      for (const [k, v] of Object.entries(data)) {
        const envKey = String(k).toUpperCase();
        if (!process.env[envKey] && v !== undefined && v !== null) {
          process.env[envKey] = String(v);
        }
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'production') throw e;
    }
  }
}

async function checkRedisOnStartup(app: INestApplication<any>) {
  const logger = new Logger('RedisStartupCheck');
  try {
    const cache = app.get<Cache>(CACHE_MANAGER);
    const key = '__health:redis:ping';
    const value = `pong-${Date.now()}`;

    await cache.set(key, value, 5_000);
    const read = await cache.get<string>(key);

    if (read !== value) throw new Error('Redis write/read mismatch');
    logger.log('✅ Redis connection OK (cache ping)');
  } catch (error) {
    logger.error('❌ Redis connection failed', error);
  }
}

async function bootstrap() {
  await preloadVaultToEnv();
  const app = await NestFactory.create(AppModule);
  await checkRedisOnStartup(app);
  app.use(cookieParser());
  const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const defaultOrigins = ['http://localhost:4200', 'http://localhost:4201', 'http://localhost:4300', 'http://localhost:3000'];
  const corsOrigins = configuredOrigins.length > 0 ? configuredOrigins : defaultOrigins;

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, X-Correlation-Id',
    exposedHeaders: 'X-Correlation-Id',
  });

  await app.listen(process.env.PORT ?? 3000).then(() => {
    console.log(`🚀 Server is running on port ${process.env.PORT ?? 3000}`);
  });
}
bootstrap();


