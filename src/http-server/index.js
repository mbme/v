import http from 'http';
import log from '../logger';
import { isString } from '../utils';

async function runMiddlewares(middlewares, context, pos) {
  const middleware = middlewares[pos];

  if (!middleware) return; // no more middlewares, stop evaluation

  const next = () => runMiddlewares(middlewares, context, pos + 1);
  await Promise.resolve(middleware(context, next));
}

async function loggerMiddleware({ req, res }, next) {
  const hrstart = process.hrtime();
  try {
    await next();
  } finally {
    const hrend = process.hrtime(hrstart);
    const ms = (hrend[0] * 1000) + Math.round(hrend[1] / 1000000);
    log.debug('%s %s %d %s - %dms', req.method.padEnd(4), req.url, res.statusCode, res.statusMessage || 'OK', ms);
  }
}


export default class Server {
  _server = null;

  _middlewares = [ loggerMiddleware ];
  _routes = [];

  constructor(initialContext = {}) {
    this._initialContext = initialContext;
  }

  use(cb) {
    this._middlewares.push(cb);
  }

  addRoute(method, pathTest, cb) {
    this._routes.push({
      test({ req, url }) {
        if (req.method !== method) return false;
        if (isString(pathTest)) return url.pathname === pathTest;
        return pathTest(url.pathname);
      },
      cb,
    });
  }

  get(pathTest, cb) {
    this.addRoute('GET', pathTest, cb);
  }

  post(pathTest, cb) {
    this.addRoute('POST', pathTest, cb);
  }

  start(port) {
    // router middleware
    this._middlewares.push(async (context) => {
      const route = this._routes.find(item => item.test(context));

      if (route) {
        await Promise.resolve(route.cb(context));
      } else {
        context.res.writeHead(404);
      }
    });

    this._server = http.createServer(async (req, res) => {
      try {
        await runMiddlewares(this._middlewares, { ...this._initialContext, req, res }, 0)
        res.end();
      } catch (e) {
        log.warn('failed to handle request', e);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.toString() }));
      }
    });

    return new Promise(resolve => this._server.listen(port, resolve));
  }

  stop() {
    return new Promise(resolve => this._server.close(resolve));
  }
}
