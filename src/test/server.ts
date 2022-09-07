import http from 'http';
import url from 'url';

const json = (bytes: number) => {
  const min = JSON.stringify({ x: '' }).length;
  const length = Math.max(bytes, min);
  return JSON.stringify({ x: 'y'.repeat(length - min) });
};

export default http.createServer((req, res) => {
  const params = url.parse(String(req.url), true).query;
  const bytes = Number(params.bytes);
  const status = Number(params.status);
  res.writeHead(status || 200, { 'content-type': 'application/json' });
  res.end(json(bytes));
});
