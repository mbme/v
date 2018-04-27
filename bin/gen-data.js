import path from 'path';

import createApiClient from 'shared/api-client';
import { createArray, randomInt, shuffle } from 'shared/utils';
import { createImageLink } from 'shared/parser';
import { createTextGenerator } from 'tools/random';
import { readText, listFiles, readFile, sha256 } from 'core/utils';
import createNetwork from 'core/utils/platform';

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

function randowWords(generator, wordsCount) {
  return createArray(wordsCount, generator.word).join(' ');
}

export default async function genData(port, password, notesCount, tracksCount) {
  const api = createApiClient(`http://localhost:${port}`, createNetwork(password));

  const resourcesPath = path.join(__dirname, '../resources');
  const images = await listImage(resourcesPath);
  const text = await readText(path.join(resourcesPath, 'text.txt'));
  const generator = createTextGenerator(text);

  const notesPromises = createArray(notesCount, async () => {
    const { name, data } = await genText(generator, images);
    return api.createNote(name, data, images.map(image => image.file.data));
  });

  const trackData = await readFile(path.join(resourcesPath, 'track.mp3'));
  const trackId = sha256(trackData);
  const tracksPromises = createArray(tracksCount, async () => {
    const artist = randowWords(generator, randomInt(1, 2));
    const title = randowWords(generator, randomInt(1, 4));
    const rating = randomInt(1, 5);
    const categories = createArray(randomInt(0, 2), generator.word);

    return api.createTrack(artist, title, rating, categories, trackId, [ trackData ]);
  });

  await Promise.all([ ...notesPromises, ...tracksPromises ]);

  console.log('Generated %s fake notes & %s fake tracks', notesCount, tracksCount);
}
