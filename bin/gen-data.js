import path from 'path';

import createApiClient from 'shared/api-client';
import { createArray, randomInt, shuffle } from 'shared/utils';
import { createImageLink } from 'shared/parser';
import { createTextGenerator } from 'tools/random';
import { readText, listFiles, readFile, sha256 } from 'server/utils';
import createNetwork from 'server/platform';

async function listImage(basePath) {
  const files = await listFiles(basePath);
  const images = files.filter(name => name.match(/\.(jpg|jpeg)$/i));

  return Promise.all(images.map(async (name) => {
    const data = await readFile(path.join(basePath, name));
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

export default async function genData(port, password, recordsCount = 23) {
  const api = createApiClient(`http://localhost:${port}`, createNetwork(password));

  const resourcesPath = path.join(__dirname, '../resources');
  const images = await listImage(resourcesPath);
  const text = await readText(path.join(resourcesPath, 'text.txt'));
  const generator = createTextGenerator(text);

  await Promise.all(createArray(recordsCount, async () => {
    const { name, data } = await genText(generator, images);
    return api.createRecord('note', name, data, images.map(image => image.file.data));
  }));

  console.log('Generated %s fake records', recordsCount);
}
