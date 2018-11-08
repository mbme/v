import path from 'path';
import fs from 'fs';
import Busboy from 'busboy';
import * as utils from '../utils/node';
import { listFiles, createTempDir } from '../fs/utils';
import createQueue from '../utils/queue';
import { createProxy } from '../utils';

export async function resolveAsset(dir, name) {
  if (!fs.existsSync(dir)) return null;
  if (!await listFiles(dir).then(files => files.includes(name))) return null;

  return path.join(dir, name);
}

// extract auth token from cookies
export function extractToken(cookies) {
  const [ tokenCookie ] = cookies.split(';').filter(c => c.startsWith('token='));

  if (!tokenCookie) return '';

  return decodeURIComponent(tokenCookie.substring(6));
}

// token: AES("valid <generation timestamp>", SHA256(password))
export function isValidAuth(token, password) {
  try {
    return /^valid \d+$/.test(utils.aesDecrypt(token || '', utils.sha256(password)));
  } catch (ignored) {
    return false;
  }
}

// Extract action & assets from multipart/form-data POST request
export function readFormData(req) {
  const assets = {};
  const data = {};
  let tmpDir;

  const busboy = new Busboy({ headers: req.headers });

  busboy.on('file', async (fieldName, file) => {
    if (assets[fieldName]) {
      throw new Error(`request contains duplicate file "${fieldName}"`);
    }

    if (!tmpDir) {
      tmpDir = await createTempDir();
    }

    const asset = path.join(tmpDir, fieldName);
    assets[fieldName] = asset;
    file.pipe(fs.createWriteStream(asset));
  });

  busboy.on('field', (fieldName, val) => {
    if (data[fieldName]) {
      throw new Error(`request contains duplicate field "${fieldName}"`);
    }

    data[fieldName] = val;
  });

  return new Promise((resolve) => {
    busboy.on('finish', () => resolve({ data, assets, tmpDir }));
    req.pipe(busboy);
  });
}

const CLOSE_PROCESSOR = Symbol('close-processor');

export function closeProcessor(processor) {
  return processor[CLOSE_PROCESSOR]();
}

export function createProcessor(db) {
  const queue = createQueue();

  const proxy = createProxy(db, prop => (...params) => queue.push(async () => db[prop](...params)));
  proxy[CLOSE_PROCESSOR] = () => queue.close();

  return proxy;
}
