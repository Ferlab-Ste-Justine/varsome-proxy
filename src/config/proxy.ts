import { parseBytes, parseMillis } from 'utils';
import dotenv from 'dotenv';
import http from 'http';
import httpProxy from 'http-proxy';
import https from 'https';
import node, { Env } from 'config/node';

dotenv.config();

const config = node.env === Env.test
  ? {
    port: 3000,
    targetHost: 'localhost',
    targetPort: 3003,
    targetHttps: false,
    dataLimit: parseBytes('100b'),
    syncInterval: parseMillis('10s'),
  } : {
    port: Number(process.env.PROXY_PORT),
    targetHost: String(process.env.PROXY_TARGET_HOST),
    targetPort: Number(process.env.PROXY_TARGET_PORT),
    targetHttps: Boolean(Number(process.env.PROXY_TARGET_HTTPS)),
    dataLimit: parseBytes(String(process.env.PROXY_DATA_LIMIT)),
    syncInterval: Math.max(parseMillis(String(process.env.PROXY_SYNC_INTERVAL)), 1000),
  };

export const serverOptions: httpProxy.ServerOptions = {
  target: {
    protocol: config.targetHttps ? 'https:' : 'http:',
    host: config.targetHost,
    port: config.targetPort,
  },
  agent: config.targetHttps ? https.globalAgent : http.globalAgent,
  headers: { host: config.targetHost },
};

export default config;
