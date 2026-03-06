export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10) || 5432,
    // username: process.env.DATABASE_USER || 'postgres',
    // password: process.env.DATABASE_PASSWORD || 'desarrollo123',
    database: process.env.DATABASE_NAME || 'postgres',
    schema: 'core',
    synchronize: true,
  },
  vault: {
    addr: process.env.VAULT_ADDR || 'http://vault:8200',
    token: process.env.VAULT_TOKEN || 'myroot',
  },

});

