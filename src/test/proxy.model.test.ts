import { migrationConfig, tableName } from 'config/database';
import db from 'service/database';
import model, { Proxy } from 'model/proxy';

beforeAll(async () => {
  await db.migrate.latest(migrationConfig);
});

afterAll(async () => {
  await db.destroy();
});

describe('Having multiple rows in proxy table', () => {
  describe('Getting data consumed', () => {
    test('Throws an error', async () => {
      await db<Proxy>(tableName).insert({ data_consumed: 0 });
      await expect(model.getDataConsumed).rejects.toThrow(Error);
    });
  });
});
