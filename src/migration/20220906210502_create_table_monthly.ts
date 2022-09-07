import { Knex } from 'knex';
import { tableName } from 'config/database';

export const up = async (db: Knex) => {
  await db.schema.createTable(tableName('monthly'), (table) => {
    table.string('month');
    table.bigint('bytes').unsigned();
    table.primary(['month']);
  });
};

export const down = async (db: Knex) => {
  await db.schema.dropTable(tableName('monthly'));
};
