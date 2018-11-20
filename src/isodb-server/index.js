/* eslint-disable no-param-reassign */
import path from 'path';
import fs from 'fs';
import urlParser from 'url';
import zlib from 'zlib';
import * as utils from '../utils/node';
import { rmrfSync } from '../fs/utils';
import { extend } from '../utils';
import { getMimeType } from '../file-prober';
import Server from '../http-server';
import {
  isValidAuth,
  extractToken,
  resolveAsset,
  readFormData,
  createProcessor,
  closeProcessor,
} from './utils';

const STATIC_DIR = path.join(__dirname, '../client/static');
const DIST_DIR = path.join(__dirname, '../../dist');

export default async function startServer(db, port, password = '') {
  const processor = createProcessor(db);

  const server = new Server();

  server.use(async function bootstrapMiddleware(context, next) {
    const { req, res } = context;

    res.setHeader('Referrer-Policy', 'no-referrer');

    context.url = urlParser.parse(req.url, true);
    context.isGzipSupported = /\bgzip\b/.test(req.headers['accept-encoding']);

    const isAuthorized = isValidAuth(extractToken(req.headers.cookie || ''), password);
    if (context.url.pathname.startsWith('/api') && !isAuthorized) {
      res.writeHead(403);
      return;
    }

    await next();
  });

  server.post('/api/changes', async ({ res, req }) => {
    const isMultipartRequest = (req.headers['content-type'] || '').startsWith('multipart/form-data');
    if (!isMultipartRequest) {
      res.writeHead(415);
      return;
    }

    const {
      data,
      assets,
      tmpDir,
    } = await readFormData(req);

    try {
      const rev = parseInt(data.rev, 10);
      const records = JSON.parse(data.records);

      const success = await processor.applyChanges(rev, records, assets);
      res.writeHead(success ? 200 : 409);
      // FIXME send patch in response
    } finally {
      if (tmpDir) rmrfSync(tmpDir);
    }
  });

  server.get('/api/patch', async ({ res, url, isGzipSupported }) => {
    const { rev } = url.query;
    if (!rev) {
      res.writeHead(400);
      return;
    }

    const patch = await processor.getPatch(parseInt(rev, 10));
    const patchStr = JSON.stringify(patch);

    res.setHeader('Content-Type', 'application/json');

    if (isGzipSupported) {
      res.setHeader('Content-Encoding', 'gzip');
      res.end(await utils.gzip(patchStr));
    } else {
      res.end(patchStr);
    }
  });

  server.get('/api', async ({ res, url }) => {
    const { fileId } = url.query;
    if (!fileId) {
      res.writeHead(400);
      return;
    }

    const filePath = await processor.getAttachment(fileId);

    if (filePath) {
      res.writeHead(200, {
        'Content-Disposition': `inline; filename=${fileId}`,
        'Content-Type': await getMimeType(filePath),
        'Cache-Control': 'immutable, private, max-age=31536000', // max caching
      });
      await utils.pipePromise(fs.createReadStream(filePath), res);
    } else {
      res.writeHead(404);
    }
  });

  server.get(() => true, async ({ url, res, isGzipSupported }) => {
    const fileName = url.path.substring(1); // skip leading /
    const filePath = await resolveAsset(STATIC_DIR, fileName)
          || await resolveAsset(DIST_DIR, fileName)
          || await resolveAsset(STATIC_DIR, 'index.html'); // html5 history fallback

    if (filePath) {
      res.setHeader('Content-Type', await getMimeType(filePath));

      const stream = fs.createReadStream(filePath);

      if (isGzipSupported) {
        res.setHeader('Content-Encoding', 'gzip');
        await utils.pipePromise(stream.pipe(zlib.createGzip()), res);
      } else {
        await utils.pipePromise(stream, res);
      }
    } else {
      res.writeHead(404);
    }
  });

  await server.start(port);

  return extend(server, {
    stop() {
      return Promise.all([ server.stop(), closeProcessor(processor) ]);
    },
  });
}
