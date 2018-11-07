import path from 'path';
import { getRandomId, RECORD_TYPES } from '../isodb/utils';
import { createArray } from '../utils';
import { createImageLink } from '../v-parser';
import { randomInt, shuffle, randomArrValue } from './index';
import { sha256File } from '../utils/node';
import { readText, listFiles } from '../fs/utils';
import createTextGenerator from './text-generator';

/**
 * @param {[hash: filePath]} imageUrls images to use
 */
async function getFakeNote(generator, images) {
  const name = generator.sentence(1, 8);

  const refs = new Set();

  const data = createArray(
    randomInt(1, 7), // paragraphs
    () => {
      const sentences = createArray(
        randomInt(1, 7), // sentences
        () => generator.sentence(),
      );

      if (Math.random() < 0.34) {
        const hash = randomArrValue(Object.keys(images));
        refs.add(hash);

        const link = createImageLink(path.basename(images[hash]), hash);
        sentences.push(` ${link} `);
      }

      return shuffle(sentences).join(' ');
    }
  ).join('\n\n');

  return {
    _id: getRandomId(),
    _refs: Array.from(refs),
    _rev: 0,
    type: RECORD_TYPES.note,
    name: name.substring(0, name.length - 1),
    data,
  };
}

async function listImages(basePath) {
  const files = await listFiles(basePath);
  const images = files.filter(name => name.match(/\.(jpg|jpeg)$/i));

  const result = {};

  await Promise.all(images.map(async (name) => {
    const filePath = path.join(basePath, name);
    const hash = await sha256File(filePath);
    result[hash] = filePath;
  }));

  return result;
}

export async function getFakeNotes(count) {
  const resourcesPath = path.join(__dirname, '../../resources');
  const images = await listImages(resourcesPath);
  const text = await readText(path.join(resourcesPath, 'text.txt'));
  const generator = createTextGenerator(text);

  return {
    attachments: images,
    records: await createArray(count, () => getFakeNote(generator, images), true),
  };
}
