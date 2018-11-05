import http from 'http';
import log from '../logger';

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
    const ms = (hrend[0] * 1000) + Math.round(hrend[1] / 1_000_000);
    log.debug('%s %s %d %s - %dms', req.method, req.url, res.statusCode, res.statusMessage || 'OK', ms);
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

  _addRoute(method, path, cb) {
    this._routes.push({
      test: ({ req, url }) => req.method === method && url.pathname === path,
      cb,
    });
  }

  get(path, cb) {
    this._addRoute('GET', path, cb);
  }

  post(path, cb) {
    this._addRoute('POST', path, cb);
  }

  start(port) {
    this._middlewares.push(async function routerMiddleware(context) {
      const route = this._routes.find(item => item.test(context));

      if (route) {
        await Promise.resolve(route.cb(context));
      } else {
        context.res.writeHead(404);
      }

      context.res.end();
    });

    this._server = http.createServer(
      (req, res) => runMiddlewares(this._middlewares, { ...this._initialContext, req, res }, 0)
    );

    return new Promise(resolve => this._server.listen(port, resolve));
  }

  stop() {
    return new Promise(resolve => this._server.close(resolve));
  }
}
