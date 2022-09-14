import config, { Env } from 'config/node';
import pg from 'pg';

pg.types.setTypeParser(pg.types.builtins.INT8, parseInt);

export default config.env === Env.test
  ? {
    client: 'sqlite3',
    connection: {
      filename: ':memory:',
    },
    useNullAsDefault: true,
  }
  : {
    client: 'pg',
    connection: {
      host: String(process.env.DATABASE_HOST),
      port: Number(process.env.DATABASE_PORT),
      user: String(process.env.DATABASE_USER),
      password: String(process.env.DATABASE_PASSWORD),
      database: String(process.env.DATABASE_NAME),
      ssl: Number(process.env.DATABASE_TLS)
        ? { rejectUnauthorized: Boolean(Number(process.env.DATABASE_TLS_VERIFY_CERT)) }
        : undefined,
    },
    pool: { min: 2, max: 10 },
  };

export const migrationConfig = {
  tableName: 'migration',
  directory: `${config.path}/migration`,
  extension: config.ext,
  stub: 'migration.stub',
};
