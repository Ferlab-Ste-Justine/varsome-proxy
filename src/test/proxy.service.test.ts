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
  await db.migrate.rollback(migrationConfig);
  await db.destroy();
});

describe(`Making a request with a ${config.bytesLimit}b response`, () => {
  test('Response status is 200', async () => {
    response = await server.get(`?bytes=${config.bytesLimit}`).set('Authorization', 'token');
    expect(response.status).toBe(200);
  });
  test('Bytes consumed is 0b', async () => {
    expect(proxy.getBytesConsumed()).toBe(0);
  });
  test(`Bytes pending is ${config.bytesLimit}b`, async () => {
    expect(proxy.getBytesPending()).toBe(config.bytesLimit);
  });
  test(`After sync, bytes consumed is ${config.bytesLimit}b`, async () => {
    await proxy.sync();
    expect(proxy.getBytesConsumed()).toBe(config.bytesLimit);
  });
  test('After sync, bytes pending is 0b', async () => {
    expect(proxy.getBytesPending()).toBe(0);
  });
  test(`After sync, bytes monthly is ${config.bytesLimit}b`, async () => {
    await proxy.sync();
    expect(await proxy.getBytesMonthly()).toBe(config.bytesLimit);
  });
  test(`After sync, bytes daily is ${config.bytesLimit}b`, async () => {
    expect(await proxy.getBytesDaily()).toBe(config.bytesLimit);
  });
});

describe('Resetting proxy', () => {
  test('Bytes consumed is 0b', async () => {
    await proxy.reset();
    expect(proxy.getBytesConsumed()).toBe(0);
  });
  test('Bytes monthly is 0b', async () => {
    expect(await proxy.getBytesMonthly()).toBe(0);
  });
  test('Bytes daily is 0b', async () => {
    expect(await proxy.getBytesDaily()).toBe(0);
  });
});

describe(`Making a bad request with a ${config.bytesLimit}b response`, () => {
  test('Response status is 400', async () => {
    response = await server.get(`?bytes=${config.bytesLimit}&status=400`).set('Authorization', 'token');
    expect(response.status).toBe(400);
  });
  test('Bytes pending is 0b', async () => {
    expect(proxy.getBytesPending()).toBe(0);
  });
});

describe('Making a request when data limit is reached', () => {
  test('Response status is 403', async () => {
    await server.get(`?bytes=${config.bytesLimit}`).set('Authorization', 'token');
    await proxy.sync();
    response = await server.get('').set('Authorization', 'token');
    expect(response.status).toBe(403);
  });
  test('Response type is text/plain', async () => {
    expect(response.type).toBe('text/plain');
  });
  test('Response text is "Data Limit Reached"', async () => {
    expect(response.text).toBe('Data Limit Reached');
  });
  test('Bytes pending is 0b', async () => {
    expect(proxy.getBytesPending()).toBe(0);
  });
});
