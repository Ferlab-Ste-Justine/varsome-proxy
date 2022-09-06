import { Knex } from 'knex';
import { Proxy } from 'model/proxy';
import { tableName } from 'config/database';

export const up = async (db: Knex) => {
  await db.schema.createTable(tableName, (table) => {
    table.bigint('data_consumed').unsigned();
  });
  await db<Proxy>(tableName).insert({ data_consumed: 0 });
};

export const down = async (db: Knex) => {
  await db.schema.dropTable(tableName);
};
