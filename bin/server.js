import startServer from 'server';
import webpack from 'webpack'; // eslint-disable-line import/no-extraneous-dependencies
import webpackConfig from 'webpack.config.babel';
import genData from './gen-data';

const isDevelopment = process.env.NODE_ENV === 'development';
// FIXME port, rootDir & password in prod mode
const port = 8080;
const password = '';

const compiler = webpack(webpackConfig);
const compilationPromise = new Promise((resolve, reject) => {
  compiler.watch({ ignored: /(node_modules|dist)/ }, (err, stats) => {
    err ? reject(err) : resolve();
    console.log(stats.toString({ colors: true }));
  });
});

async function run(args) {
  const [ server ] = await Promise.all([
    startServer(port, { rootDir: '/tmp/db', password }),
    compilationPromise,
  ]);

  if (isDevelopment && args.includes('--gen-data')) await genData(port, password, 30, 10);

  console.log(`Server listening on http://localhost:${port}`);

  async function close() {
    console.log('Stopping...');
    try {
      await server.close();
      process.exit(0);
    } catch (e) {
      console.error('Failed to stop server:', e);
      process.exit(1);
    }
  }

  process.on('SIGINT', close);
  process.on('SIGTERM', close);
}

run(process.argv.slice(3)).catch((e) => {
  console.error('Failed to start server:', e);
  process.exit(2);
});
