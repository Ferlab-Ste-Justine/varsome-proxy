import { Knex } from 'knex';
import { tableName } from 'config/database';

export const up = async (db: Knex) => {
  await db.schema.createTable(tableName('daily'), (table) => {
    table.string('day');
    table.bigint('bytes').unsigned();
    table.primary(['day']);
  });
};

export const down = async (db: Knex) => {
  await db.schema.dropTable(tableName('daily'));
};
