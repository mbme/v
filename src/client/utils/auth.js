import { bytesToHexString, sha256 } from './index';

const text2buffer = text => new TextEncoder().encode(text);

async function aesEncrypt(text, password) {
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
