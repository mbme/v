import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import readline from 'readline';
import zlib from 'zlib';
import childProcess from 'child_process';
import { promisify } from 'util';

export const hash = hashType => (buffer, encoding = 'hex') => crypto.createHash(hashType).update(buffer).digest(encoding);
export const sha256 = hash('sha256');

export function sha256File(filePath) {
  return new Promise(
    (resolve, reject) => fs.createReadStream(filePath)
      .on('error', reject)
      .pipe(crypto.createHash('sha256').setEncoding('hex'))
      .on('finish', function onFinish() {
        resolve(this.read()); // eslint-disable-line babel/no-invalid-this
      })
  );
}

export function aesEncrypt(text, password) {
  const iv = crypto.randomBytes(16); // always 16 for AES

  const cipher = crypto.createCipheriv('aes-256-cbc', sha256(password, null), iv);

  return iv.toString('hex') + ':' + cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

export function aesDecrypt(text, password) {
  const [ iv, encryptedText ] = text.split(':');

  const decipher = crypto.createDecipheriv('aes-256-cbc', sha256(password, null), Buffer.from(iv, 'hex'));

  return decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8');
}

export const readStream = stream => new Promise((resolve, reject) => {
  const body = [];
  stream.on('data', chunk => body.push(chunk));
  stream.on('end', () => resolve(Buffer.concat(body)));
  stream.on('error', reject);
});

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

// use sync version here cause fs.exists has been deprecated
export const existsFile = name => Promise.resolve(fs.existsSync(name));

export const readText = name => fs.promises.readFile(name, 'utf8');
export const readJSON = async name => JSON.parse(await readText(name));

export const writeText = (name, data) => fs.promises.writeFile(name, data, 'utf8');
export const writeJSON = (name, data) => writeText(name, JSON.stringify(data, null, 2));

export const gzip = promisify(zlib.gzip);

export function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise(resolve => rl.question(question, (answer) => {
    resolve(answer);
    rl.close();
  }));
}

export const execRaw = promisify(childProcess.exec);
export const exec = command => execRaw(command).then(({ stdout }) => stdout.trim());

const MIME = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};
export const getMimeType = async filePath => MIME[path.extname(filePath)] || exec(`file -b -i ${filePath}`);
