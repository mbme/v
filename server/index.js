import path from 'path';
import fs from 'fs';
import http from 'http';
import urlParser from 'url';
import zlib from 'zlib';

import * as utils from 'server/utils';
import { extend } from 'shared/utils';
import { CONTENT_TYPE } from 'shared/api-client';
import { parse } from 'shared/protocol';
import createProcessor from './processor';

const STATIC_DIR = path.join(__dirname, '../client/static');
const DIST_DIR = path.join(__dirname, '../dist');

async function getFileStream(dir, name) {
  if (!await utils.existsFile(dir)) return null;
  if (!await utils.listFiles(dir).then(files => files.includes(name))) return null;

  const filePath = path.join(dir, name);

  return {
    stream: fs.createReadStream(filePath),
    mimeType: await utils.getMimeType(filePath),
  };
}

function extractToken(cookies) {
  const [ tokenCookie ] = cookies.split(';').filter(c => c.startsWith('token='));

  if (!tokenCookie) return '';

  return decodeURIComponent(tokenCookie.substring(6));
}

const defaults = {
  rootDir: '',
  password: '',
  html5historyFallback: true,
  requestLogger: true,
};

export default async function startServer(port, customOptions) {
  const options = extend(defaults, customOptions);

  const processor = await createProcessor({ rootDir: options.rootDir });

  // token: AES("valid <generation timestamp>", SHA256(password))
  function isValidAuth(token) {
    try {
      return /^valid \d+$/.test(utils.aesDecrypt(token || '', utils.sha256(options.password)));
    } catch (ignored) {
      return false;
    }
  }

  // POST /api
  // GET /api&fileId=asdfsadfasd
  // GET * -> static || dist
  const server = http.createServer(async (req, res) => {
    const start = process.hrtime();

    res.setHeader('Referrer-Policy', 'no-referrer');

    const gzipSupported = /\bgzip\b/.test(req.headers['accept-encoding']);

    try {
      const url = urlParser.parse(req.url, true);

      if (url.pathname === '/api') {
        if (!isValidAuth(extractToken(req.headers.cookie || ''))) {
          res.writeHead(403);
          res.end();
          return;
        }

        if (req.method === 'POST') {
          // validate content-type
          if (req.headers['content-type'] !== CONTENT_TYPE) {
            res.writeHead(415);
            res.end();
            return;
          }

          // ensure there is a content-length
          const expectedLength = parseInt(req.headers['content-length'], 10);
          if (Number.isNaN(expectedLength)) {
            res.writeHead(411);
            res.end();
            return;
          }

          const buffer = await utils.readStream(req);

          // ensure we read all the data
          if (buffer.length !== expectedLength) {
            res.writeHead(400);
            res.end();
            return;
          }

          const response = JSON.stringify({ data: await processor.processAction(parse(buffer)) });
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // turn off caches

          if (gzipSupported) {
            res.setHeader('Content-Encoding', 'gzip');
            res.end(await utils.gzip(response));
          } else {
            res.end(response);
          }
          return;
        }

        if (req.method === 'GET') {
          if (!url.query.fileId) {
            res.writeHead(400);
            res.end();
            return;
          }

          const response = await processor.processAction({
            action: {
              name: 'READ_FILE',
              data: {
                id: url.query.fileId,
              },
            },
          });

          if (response) {
            res.writeHead(200, {
              'Content-Disposition': `inline; filename=${response.file.id}`,
              'Content-Type': response.file.mimeType,
              'Cache-Control': 'immutable, private, max-age=31536000', // max caching
            });
            response.stream.pipe(res);
          } else {
            res.writeHead(404);
            res.end();
          }

          return;
        }

        res.writeHead(405);
        res.end();
        return;
      }

      if (!options.html5historyFallback) {
        res.writeHead(404);
        res.end();
        return;
      }

      if (req.method !== 'GET') {
        res.writeHead(405);
        res.end();
        return;
      }

      const fileName = url.path.substring(1);
      const file = await getFileStream(STATIC_DIR, fileName)
            || await getFileStream(DIST_DIR, fileName)
            || await getFileStream(STATIC_DIR, 'index.html');

      if (file) {
        res.setHeader('Content-Type', file.mimeType);

        if (gzipSupported) {
          res.setHeader('Content-Encoding', 'gzip');
          file.stream.pipe(zlib.createGzip()).pipe(res);
        } else {
          file.stream.pipe(res);
        }
      } else {
        res.writeHead(404);
        res.end();
      }
    } catch (e) {
      if (options.requestLogger) console.error(e);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.toString() }));
    } finally {
      const hrend = process.hrtime(start);
      const ms = (hrend[0] * 1000) + Math.round(hrend[1] / 1000000);

      if (options.requestLogger) {
        console.info('%s %s %d %s - %dms', req.method, req.url, res.statusCode, res.statusMessage || 'OK', ms);
      }
    }
  });

  const api = {
    async close() {
      await processor.close();

      await new Promise(resolve => server.close(resolve));
    },
  };

  return new Promise((resolve) => {
    server.listen(port, () => resolve(api));
  });
}
