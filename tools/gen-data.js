import fs from 'fs';
import path from 'path';

import { createArray, randomInt, shuffle } from '../shared/utils';
import { createImageLink } from '../shared/parser';
import { readText, listFiles, sha256 } from '../core/utils';
import log from '../shared/log';
import { createTextGenerator } from './random';

async function listImages(basePath) {
  const files = await listFiles(basePath);
  const images = files.filter(name => name.match(/\.(jpg|jpeg)$/i));

  return Promise.all(images.map(async (name) => {
    const data = await fs.promises.readFile(path.join(basePath, name));
    const link = createImageLink(name, sha256(data));

    return { link, file: { name, data } };
  }));
}

async function genText(generator, images) {
  const name = generator.sentence(1, 8);

  const data = createArray(
    randomInt(1, 7), // paragraphs
    () => {
      const sentences = createArray(
        randomInt(1, 7), // sentences
        () => generator.sentence(),
      );

      if (Math.random() < 0.34) {
        const image = images[randomInt(0, images.length, false)];
        sentences.push(` ${image.link} `);
      }

      return shuffle(sentences).join(' ');
    }
  ).join('\n\n');

  return { name: name.substring(0, name.length - 1), data };
}

export default async function genData(api, notesCount) {
  const resourcesPath = path.join(__dirname, '../resources');
  const images = await listImages(resourcesPath);
  const text = await readText(path.join(resourcesPath, 'text.txt'));
  const generator = createTextGenerator(text);

  const notesPromises = createArray(notesCount, async () => {
    const { name, data } = await genText(generator, images);
    return api.CREATE_NOTE({ name, data }, images.map(image => image.file.data));
  });

  await Promise.all(notesPromises);

  log.info('Generated %s fake notes', notesCount);
}
