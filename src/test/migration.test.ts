import { migrationConfig } from 'config/database';
import db from 'service/database';

afterAll(async () => {
  await db.destroy();
});

describe('Running latest migration', () => {
  test('Completes with no error', async () => {
    await db.migrate.latest(migrationConfig);
  });
});

describe('Rolling back migration', () => {
  test('Completes with no error', async () => {
    await db.migrate.rollback(migrationConfig);
  });
});
