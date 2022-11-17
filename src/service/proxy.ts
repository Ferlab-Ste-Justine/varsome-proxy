import { formatBytes, isoDay, isoMonth } from 'utils';
import config, { serverOptions } from 'config/proxy';
import daily from 'model/daily';
import http from 'http';
import httpProxy, { ProxyReqCallback, ProxyResCallback } from 'http-proxy';
import monthly from 'model/monthly';
import node from 'config/node';

let bytesConsumed = 0;
let bytesPending = 0;
let syncTimeout: NodeJS.Timeout | undefined;

const onProxyReq: ProxyReqCallback = (proxyReq, req, res) => {
  res.setHeader('proxy-data-limit', formatBytes(config.bytesLimit));
  res.setHeader('proxy-data-consumed', formatBytes(bytesConsumed + bytesPending));
  res.setHeader('proxy-bytes-limit', config.bytesLimit);
  res.setHeader('proxy-bytes-consumed', bytesConsumed + bytesPending);
  if (bytesConsumed + bytesPending >= config.bytesLimit) {
    res.writeHead(403, { 'content-type': 'text/plain' });
    res.end('Data Limit Reached');
  }
};

const onProxyRes: ProxyResCallback = (proxyRes, req, res) => {
  if (proxyRes.statusCode === 200 && res.statusCode === 200) {
    proxyRes.on('data', (chunk) => {
      bytesPending += Buffer.byteLength(chunk);
    });
  }
  process.stdout.write(`Proxy request url=${req.url} status=${res.statusCode}\n`);
};

const proxy = httpProxy.createProxy()
  .on('proxyReq', onProxyReq)
  .on('proxyRes', onProxyRes);

const server = http.createServer((req, res) => {
  proxy.web(req, res, serverOptions);
});

const sync = async () => {
  if (bytesPending) {
    await Promise.all([
      monthly.incrementBytes(isoMonth(), bytesPending),
      daily.incrementBytes(isoDay(), bytesPending),
    ]);
  }
  bytesConsumed = await monthly.getBytes(isoMonth());
  bytesPending = 0;
};

const syncInterval = async () => {
  await sync();
  syncTimeout = setTimeout(syncInterval, config.syncInterval);
};

const reset = async () => {
  await Promise.all([
    monthly.resetBytes(),
    daily.resetBytes(),
  ]);
  bytesConsumed = 0;
  process.stdout.write('Proxy reset\n');
};

const start = async () => {
  syncInterval();
  server.listen(config.port);
  process.stdout.write(`Proxy started env=${node.env} port=${config.port}\n`);
};

const stop = () => {
  clearTimeout(syncTimeout);
  server.close();
};

const getBytesConsumed = () => bytesConsumed;
const getBytesPending = () => bytesPending;

const getBytesMonthly = () => monthly.getBytes(isoMonth());
const getBytesDaily = () => daily.getBytes(isoDay());

export default {
  server,
  sync,
  reset,
  start,
  stop,
  getBytesConsumed,
  getBytesPending,
  getBytesMonthly,
  getBytesDaily,
};
