import webpack from 'webpack'; // eslint-disable-line import/no-extraneous-dependencies
import webpackConfig from '../webpack.config.babel';
import startServer from '../server';
import log from '../shared/log';
import genData from '../tools/gen-data';
import createApiClient from '../server/api-client';

const isDevelopment = process.env.NODE_ENV === 'development';
// FIXME port, rootDir & password in prod mode
const port = 8080;
const password = '';

const compiler = webpack(webpackConfig);
const compilationPromise = new Promise((resolve, reject) => {
  compiler.watch({ ignored: /(node_modules|dist)/ }, (err, stats) => {
    err ? reject(err) : resolve();
    log.simple(stats.toString({ colors: true }));
  });
});

async function run(args) {
  const [ server ] = await Promise.all([
    startServer(port, { rootDir: '/tmp/db', password }),
    compilationPromise,
  ]);

  if (isDevelopment && args.includes('--gen-data')) {
    await genData(createApiClient(`http://localhost:${port}`, password), 30, 10);
  }

  log.info(`Server listening on http://localhost:${port}`);

  async function close() {
    log.debug('server: stopping...');
    try {
      await server.close();
      process.exit(0);
    } catch (e) {
      log.error('server: failed to stop', e);
      process.exit(1);
    }
  }

  process.on('SIGINT', close);
  process.on('SIGTERM', close);
}

run(process.argv.slice(3)).catch((e) => {
  log.error('server: failed to start', e);
  process.exit(2);
});
