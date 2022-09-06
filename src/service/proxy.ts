import { formatBytes } from 'utils';
import config, { serverOptions } from 'config/proxy';
import http from 'http';
import httpProxy, { ProxyReqCallback, ProxyResCallback } from 'http-proxy';
import model from 'model/proxy';
import node from 'config/node';

let dataConsumed = 0;
let dataPending = 0;
let syncTimeout: NodeJS.Timeout | undefined;

const onProxyReq: ProxyReqCallback = (proxyReq, req, res) => {
  if (dataConsumed + dataPending >= config.dataLimit) {
    res.writeHead(403, { 'content-type': 'text/plain' });
    res.end('Data Limit Reached');
  }
};

const onProxyRes: ProxyResCallback = (proxyRes, req, res) => {
  if (proxyRes.statusCode === 200 && res.statusCode === 200) {
    proxyRes.on('data', (chunk) => {
      dataPending += Buffer.byteLength(chunk);
    });
  }
  process.stdout.write(`Proxy request status=${res.statusCode} url=${req.url}\n`);
};

const proxy = httpProxy.createProxy()
  .on('proxyReq', onProxyReq)
  .on('proxyRes', onProxyRes);

const server = http.createServer((req, res) => {
  proxy.web(req, res, serverOptions);
});

const reset = async () => {
  await model.resetDataConsumed();
  process.stdout.write('Proxy reset\n');
  dataConsumed = 0;
};

const sync = async () => {
  if (dataPending > 0) {
    await model.incrementDataConsumed(dataPending);
  }
  dataConsumed = await model.getDataConsumed();
  process.stdout.write(`Proxy synced pending=${formatBytes(dataPending)} consumed=${formatBytes(dataConsumed)}\n`);
  dataPending = 0;
};

const syncInterval = async () => {
  await sync();
  syncTimeout = setTimeout(syncInterval, config.syncInterval);
};

const start = async () => {
  syncInterval();
  server.listen(config.port);
  process.stdout.write(`Proxy started env=${node.env} port=${config.port}\n`);
};

const stop = () => {
  clearTimeout(syncTimeout);
  server.removeAllListeners();
  server.close();
};

const getDataConsumed = () => dataConsumed;
const getDataPending = () => dataPending;

export default {
  server, reset, sync, start, stop, getDataConsumed, getDataPending,
};
