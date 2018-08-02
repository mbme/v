import {
  pubSub,
  apiClient,
  isString,
  isObject,
} from '../../shared/utils';

export function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => resolve(new Uint8Array(e.target.result));
    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  });
}

export const bytesToHexString = buffer => Array.from(new Uint8Array(buffer)).map(b => ('00' + b.toString(16)).slice(-2)).join('');

export const sha256 = buffer => crypto.subtle.digest('SHA-256', buffer).then(bytesToHexString);

export const getFileUrl = fileId => `/api?fileId=${fileId}`;
export const networkEvents = pubSub();
export const api = apiClient(async (action, assets) => {
  if (action.name === 'READ_ASSET') throw new Error('NYI');

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

    if (res.status === 403) {
      networkEvents.emit('unauthorized');
      throw new Error('Unauthorized');
    }

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

export function classNames(...args) {
  return args.reduce((acc, val) => {
    if (isString(val)) {
      acc.push(val);
    } else if (isObject(val)) {
      Object.entries(val).forEach(([ key, assertion ]) => {
        if (assertion) acc.push(key);
      });
    }

    return acc;
  }, []).join(' ');
}
