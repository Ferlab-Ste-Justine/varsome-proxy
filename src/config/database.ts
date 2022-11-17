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
      host: String(process.env.PGHOST),
      port: Number(process.env.PGPORT),
      user: String(process.env.PGUSER),
      password: String(process.env.PGPASSWORD),
      database: String(process.env.PGDATABASE),
      ssl: Number(process.env.PGREQUIRESSL)
        ? { rejectUnauthorized: Boolean(Number(process.env.PGSSLVERIFY)) }
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
