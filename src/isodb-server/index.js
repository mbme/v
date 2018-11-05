/* eslint-disable no-param-reassign */
import urlParser from 'url';
import { createLogger } from '../logger';
import * as utils from '../utils/node';
import Server from '../http-server';

const log = createLogger('isodb-server');

// extract auth token from cookies
function extractToken(cookies) {
  const [ tokenCookie ] = cookies.split(';').filter(c => c.startsWith('token='));

  if (!tokenCookie) return '';

  return decodeURIComponent(tokenCookie.substring(6));
}

// token: AES("valid <generation timestamp>", SHA256(password))
function isValidAuth(token, password) {
  try {
    return /^valid \d+$/.test(utils.aesDecrypt(token || '', utils.sha256(password)));
  } catch (ignored) {
    return false;
  }
}

function bootstrapMiddleware(context, next) {
  const { req, res, password } = context;

  res.setHeader('Referrer-Policy', 'no-referrer');

  context.url = urlParser.parse(req.url, true);
  context.isGzipSupported = /\bgzip\b/.test(req.headers['accept-encoding']);
  context.isAuthorized = isValidAuth(extractToken(req.headers.cookie || ''), password);

  return next();
}

export default async function startServer(port, rootDir, password = '') {
  const server = new Server({ password });
  server.use(bootstrapMiddleware);

  server.post('/api', ({ res, req, isAuthorized }) => {
    if (!isAuthorized) {
      res.writeHead(403);
      return;
    }


    const isMultipartRequest = (req.headers['content-type'] || '').startsWith('multipart/form-data');
    if (!isMultipartRequest) {
      res.writeHead(415);
      return;
    }

  });

  server.get('/api', ({ res, isAuthorized, url }) => {
    if (!isAuthorized) {
      res.writeHead(403);
      return;
    }

    const { fileId } = url.query;
    if (!fileId) {
      res.writeHead(400);
      return;
    }

  });

  await server.start(port);

  return server;
}
