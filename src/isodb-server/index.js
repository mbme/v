/* eslint-disable no-param-reassign */
import path from 'path';
import urlParser from 'url';
import zlib from 'zlib';
import Server from '../http-server';
import {
  isValidAuth,
  extractToken,
  getFileStream,
  readFormData,
  writeJSONResponse,
} from './utils';

const STATIC_DIR = path.join(__dirname, '../client/static');
const DIST_DIR = path.join(__dirname, '../dist');

async function bootstrapMiddleware(context, next) {
  const { req, res, password } = context;

  res.setHeader('Referrer-Policy', 'no-referrer');

  context.url = urlParser.parse(req.url, true);
  context.isGzipSupported = /\bgzip\b/.test(req.headers['accept-encoding']);

  const isAuthorized = isValidAuth(extractToken(req.headers.cookie || ''), password);
  if (context.url.pathname.startsWith('/api') && !isAuthorized) {
    res.writeHead(403);
    return;
  }

  await next();
}

export default async function startServer(port, rootDir, password = '') {
  const server = new Server({ password });
  server.use(bootstrapMiddleware);

  server.post('/api/changes', async ({ res, req, isGzipSupported }) => {
    const isMultipartRequest = (req.headers['content-type'] || '').startsWith('multipart/form-data');
    if (!isMultipartRequest) {
      res.writeHead(415);
      return;
    }

    const {
      data,
      assets,
      baseDir,
    } = await readFormData(req);

    await writeJSONResponse(await processor.processAction(action, assets), res, isGzipSupported);
  });

  server.get('/api/patch', async ({ res, url, isGzipSupported }) => {
    const { rev } = url.query;
    if (!rev) {
      res.writeHead(400);
      return;
    }

    await writeJSONResponse(await processor.processAction(action, assets), res, isGzipSupported);
  });

  server.get('/api', async ({ res, url }) => {
    const { fileId } = url.query;
    if (!fileId) {
      res.writeHead(400);
      return;
    }

    const response = await processor.processAction({
      name: 'READ_ASSET',
      data: {
        id: fileId,
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
    }
  });

  server.get(() => true, async ({ url, res, isGzipSupported }) => {
    const fileName = url.path.substring(1); // skip leading /
    const file = await getFileStream(STATIC_DIR, fileName)
          || await getFileStream(DIST_DIR, fileName)
          || await getFileStream(STATIC_DIR, 'index.html'); // html5 history fallback

    if (file) {
      res.setHeader('Content-Type', file.mimeType);

      if (isGzipSupported) {
        res.setHeader('Content-Encoding', 'gzip');
        file.stream.pipe(zlib.createGzip()).pipe(res);
      } else {
        file.stream.pipe(res);
      }
    } else {
      res.writeHead(404);
    }
  });

  await server.start(port);

  return server;
}
