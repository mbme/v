import { pubSub, apiClient } from '../../shared/utils';

export function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => resolve(new Uint8Array(e.target.result));
    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  });
}

const bytesToHexString = buffer => Array.from(new Uint8Array(buffer)).map(b => ('00' + b.toString(16)).slice(-2)).join('');

export const sha256 = buffer => crypto.subtle.digest('SHA-256', buffer).then(bytesToHexString);

export const text2buffer = text => new TextEncoder().encode(text);

export async function aesEncrypt(text, password) {
  const alg = { name: 'AES-CBC', iv: crypto.getRandomValues(new Uint8Array(16)) };
  const passwordHash = await crypto.subtle.digest('SHA-256', text2buffer(password));
  const key = await crypto.subtle.importKey('raw', passwordHash, alg, false, [ 'encrypt' ]);

  const encrypted = await crypto.subtle.encrypt(alg, key, text2buffer(text)).then(bytesToHexString);

  return bytesToHexString(alg.iv) + ':' + encrypted;
}

export async function authorize(password) {
  const token = await aesEncrypt(`valid ${Date.now()}`, await sha256(text2buffer(password)));
  document.cookie = `token=${token}; path=/`;
}

export async function deauthorize() {
  document.cookie = 'token=0; path=/';
}

export class UnauthorizedError extends Error {}


export const getFileUrl = fileId => `/api?fileId=${fileId}`;
export const networkEvents = pubSub();
export const api = apiClient(async (action, assets) => {
  if (action.name === 'READ_ASSET') {
    throw new Error('NYI');
  }

  networkEvents.emit('start');

  const data = new FormData();
  data.append('action', JSON.stringify(action));
  assets.forEach((file, i) => {
    data.append(`file-${i}`, file);
  });

  try {
    const res = await fetch('/api', {
      method: 'POST',
      credentials: 'include',
      body: data,
    });

    if (res.status === 403) throw new UnauthorizedError('Access denied');

    if (res.status === 400) {
      const { error } = await res.json();
      throw new Error(error);
    }

    if (res.status !== 200) throw new Error(`Server returned ${res.status} ${res.statusText}`);

    const response = await res.json().then(body => body.data);

    networkEvents.emit('end');

    return response;
  } catch (e) {
    networkEvents.emit('error', e);
    throw e;
  }
});
