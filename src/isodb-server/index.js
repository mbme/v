import http from 'http';
import { createLogger } from '../logger';

const log = createLogger('isodb-server');

export default async function startServer(port, rootDir, password = '') {

  const server = http.createServer(async (req, res) => {
    const start = process.hrtime();

    try {
      res.setHeader('Referrer-Policy', 'no-referrer');

      const url = urlParser.parse(req.url, true);
      const gzipSupported = /\bgzip\b/.test(req.headers['accept-encoding']);

    } catch (e) {
      log.warn('failed to handle request', e);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.toString() }));
    } finally {
      const hrend = process.hrtime(start);
      const ms = (hrend[0] * 1000) + Math.round(hrend[1] / 1000000);
      log.debug('%s %s %d %s - %dms', req.method, req.url, res.statusCode, res.statusMessage || 'OK', ms);
    }
  });

  const close = () => new Promise(resolve => server.close(resolve));

  return new Promise((resolve) => {
    server.listen(port, () => resolve(close));
  });
}
