import { Knex } from 'knex';

export const up = async (db: Knex) => {
  await db.schema.createTable('monthly', (table) => {
    table.string('month');
    table.bigint('bytes').unsigned();
    table.primary(['month']);
  });
};

export const down = async (db: Knex) => {
  await db.schema.dropTable('monthly');
};
