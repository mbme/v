import fs from 'fs';
import path from 'path';

import webpack from 'webpack';
import webpackConfig from '../webpack.config.babel';

import startServer from '../server';
import createApiClient from '../server/api-client';
import log from '../shared/log';
import { createArray } from '../shared/utils';
import { createImageLink } from '../shared/parser';
import { readText, listFiles, sha256 } from '../core/utils';
import createTextGenerator from '../randomizer/text-generator';

const isDevelopment = process.env.NODE_ENV === 'development';

async function listImages(basePath) {
  const files = await listFiles(basePath);
  const images = files.filter(name => name.match(/\.(jpg|jpeg)$/i));

  return Promise.all(images.map(async (name) => {
    const data = await fs.promises.readFile(path.join(basePath, name));
    const link = createImageLink(name, sha256(data));

    return { link, file: { name, data } };
  }));
}

async function genData(api, notesCount) {
  const resourcesPath = path.join(__dirname, '../resources');
  const images = await listImages(resourcesPath);
  const text = await readText(path.join(resourcesPath, 'text.txt'));
  const generator = createTextGenerator(text);

  const notesPromises = createArray(notesCount, async () => {
    const { name, data } = await generator.genText(images.map(item => item.link));
    return api.CREATE_NOTE({ name, data }, images.map(image => image.file.data));
  });

  await Promise.all(notesPromises);

  log.info('Generated %s fake notes', notesCount);
}


async function run(port, password, rootDir, ...args) {
  if (!port || !password || !rootDir) throw new Error('port, password & rootDir are required');

  const compiler = webpack(webpackConfig);
  const compilationPromise = new Promise((resolve, reject) => {
    compiler.watch({ ignored: /(node_modules|dist)/ }, (err, stats) => {
      err ? reject(err) : resolve();
      log.simple(stats.toString({ colors: true }));
    });
  });

  const [ server ] = await Promise.all([
    startServer(port, { rootDir, password }),
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
