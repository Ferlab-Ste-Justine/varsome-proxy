import { Knex } from 'knex';

export const up = async (db: Knex) => {
  await db.schema.createTable('daily', (table) => {
    table.string('day');
    table.bigint('bytes').unsigned();
    table.primary(['day']);
  });
};

export const down = async (db: Knex) => {
  await db.schema.dropTable('daily');
};
