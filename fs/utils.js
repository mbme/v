import os from 'os';
import path from 'path';
import fs from 'fs';

// Recursively synchronously list files in a dir (except skip dirs)
export function walkSync(dir, skipDir = [ '.git', 'node_modules' ]) {
  const fileList = [];

  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      if (!skipDir.includes(file)) fileList.push(...walkSync(filePath));
    } else {
      fileList.push(filePath);
    }
  }

  return fileList;
}

export function rmrfSync(dir) {
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      rmrfSync(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
  }

  fs.rmdirSync(dir);
}

export const isFile = filePath => fs.promises.lstat(filePath).then(stats => stats.isFile());
export const isDirectory = filePath => fs.promises.lstat(filePath).then(stats => stats.isDirectory());
export async function listFiles(filePath) {
  const dirContent = await fs.promises.readdir(filePath);
  const fileCheckResults = await Promise.all(dirContent.map(item => isFile(path.join(filePath, item))));
  return dirContent.filter((_, i) => fileCheckResults[i]);
}

export const createTempDir = () => fs.promises.mkdtemp(path.join(os.tmpdir(), 'v-'));

export async function withTempFiles(files, cb) {
  if (!files.length) {
    return cb([]);
  }

  let dir;
  try {
    // create temp dir
    dir = await createTempDir();

    // write temp files
    const paths = files.map((_, i) => path.join(dir, `temp-file-${i}`));
    await Promise.all(paths.map((filePath, i) => fs.promises.writeFile(filePath, files[i])));

    return await Promise.resolve(cb(paths));
  } finally { // do cleanup in any case
    if (dir) rmrfSync(dir);
  }
}

export const readText = name => fs.promises.readFile(name, 'utf8');
export const readJSON = async name => JSON.parse(await readText(name));

export const writeText = (name, data) => fs.promises.writeFile(name, data, 'utf8');
export const writeJSON = (name, data) => writeText(name, JSON.stringify(data, null, 2));
