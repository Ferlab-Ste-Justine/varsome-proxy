import { migrationConfig } from 'config/database';
import config from 'config/proxy';
import db from 'service/database';
import proxy from 'service/proxy';
import supertest, { Response, SuperTest, Test } from 'supertest';
import testServer from 'test/server';

let server: SuperTest<Test>;
let response: Response;

beforeAll(async () => {
  await db.migrate.latest(migrationConfig);
  testServer.listen(config.targetPort);
  await proxy.start();
  server = supertest(proxy.server);
});

afterAll(async () => {
  proxy.stop();
  testServer.close();
  await db.destroy();
});

describe(`Making a request with ${config.dataLimit}b data response`, () => {
  test('Response status is 200', async () => {
    response = await server.get(`?bytes=${config.dataLimit}`);
    expect(response.status).toBe(200);
  });
  test('Data consumed is 0b', async () => {
    expect(proxy.getDataConsumed()).toBe(0);
  });
  test(`Data pending is ${config.dataLimit}b`, async () => {
    expect(proxy.getDataPending()).toBe(config.dataLimit);
  });
  test(`After sync, data consumed is ${config.dataLimit}b`, async () => {
    await proxy.sync();
    expect(proxy.getDataConsumed()).toBe(config.dataLimit);
  });
  test('After sync, data pending is 0b', async () => {
    expect(proxy.getDataPending()).toBe(0);
  });
  test('After reset, data consumed is 0b', async () => {
    await proxy.reset();
    expect(proxy.getDataConsumed()).toBe(0);
  });
});

describe(`Making a bad request with ${config.dataLimit}b data response`, () => {
  test('Response status is 400', async () => {
    response = await server.get(`?bytes=${config.dataLimit}&status=400`);
    expect(response.status).toBe(400);
  });
  test('Data consumed is 0b', async () => {
    expect(proxy.getDataConsumed()).toBe(0);
  });
  test('Data pending is 0b', async () => {
    expect(proxy.getDataPending()).toBe(0);
  });
});

describe(`Making a request when ${config.dataLimit}b data limit is reached`, () => {
  test('Response status is 403', async () => {
    await server.get(`?bytes=${config.dataLimit}`);
    await proxy.sync();
    response = await server.get('');
    expect(response.status).toBe(403);
  });
  test('Response type is text/plain', async () => {
    expect(response.type).toBe('text/plain');
  });
  test('Response text is Data Limit Reached', async () => {
    expect(response.text).toBe('Data Limit Reached');
  });
  test(`Data consumed is ${config.dataLimit}b`, async () => {
    expect(proxy.getDataConsumed()).toBe(config.dataLimit);
  });
  test('Data pending is 0b', async () => {
    expect(proxy.getDataPending()).toBe(0);
  });
});
