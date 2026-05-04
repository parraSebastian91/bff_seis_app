export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10) || 5432,
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'desarrollo123',
    database: process.env.DATABASE_NAME || 'postgres',
    schema: 'core',
    synchronize: true,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10) || 6379,
    db: parseInt(process.env.REDIS_DB ?? '0', 10) || 0,
    ttl: parseInt(process.env.REDIS_TTL ?? '3600', 10) || 3600, // 1 hora por defecto
  },
  rabbitmq: {
    host: process.env.RABBITMQ_HOST || 'rabbitmq',
    port: parseInt(process.env.RABBITMQ_PORT ?? '5672', 10) || 5672,
    user: process.env.RABBITMQ_USER || 'bff_seis_app',
    pass: process.env.RABBITMQ_PASS || 'bff-123',
    queue: process.env.RABBITMQ_QUEUE || 'notify_queue',
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'minio',
    port: parseInt(process.env.MINIO_PORT ?? '9000', 10) || 9000,
    useSSL: (process.env.MINIO_USE_SSL || 'false').toLowerCase() === 'true',
    accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
    secretKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin123',
    bucket: process.env.MINIO_BUCKET || 'seis-app',
    presignedExpirySeconds: parseInt(process.env.MINIO_PRESIGNED_EXPIRY_SECONDS ?? '900', 10) || 900,
    publicEndpoint: process.env.MINIO_PUBLIC_ENDPOINT || 'http://localhost:9000',
  },
  vault: {
    addr: process.env.VAULT_ADDR || 'http://vault:8200',
    token: process.env.VAULT_TOKEN || 'myroot',
  },
  jwtConfig: {
    refresh_secret: process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret',
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '86400',
    access_secret: process.env.JWT_ACCESS_SECRET || 'jwt_access_secret',
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '3600',
    admin_expires_in: process.env.JWT_ACCESS_ADMIN_EXPIRES_IN || '7200',
  },
  externalServices: {
    core: {
      baseUrl: process.env.CORE_SERVICE_BASE_URL || 'http://ms_core:3001',
      timeout: parseInt(process.env.CORE_SERVICE_TIMEOUT ?? '8000', 10),
    },
    payments: {
      baseUrl: process.env.PAYMENTS_SERVICE_URL || 'http://ms_payments_service:3002',
      timeout: parseInt(process.env.PAYMENTS_SERVICE_TIMEOUT ?? '8000', 10),
    },
    storage: {
      baseUrl: process.env.STORAGE_SERVICE_URL || 'http://ms-storage-service:3100',
      timeout: parseInt(process.env.STORAGE_SERVICE_TIMEOUT ?? '8000', 10),
    }
  }
});

