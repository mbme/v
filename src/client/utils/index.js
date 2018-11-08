import { aesEncrypt, text2buffer } from '../../utils/browser';
import pubSub from '../../utils/pubsub';
import apiProxy from '../../server/api-proxy';


export const getFileUrl = fileId => `/api?fileId=${fileId}`;
export const networkEvents = pubSub();
export const api = apiProxy(async (action, assets) => {
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

export async function authorize(password) {
  const token = await aesEncrypt(`valid ${Date.now()}`, await sha256(text2buffer(password)));
  document.cookie = `token=${token}; path=/`;
}

export async function deauthorize() {
  document.cookie = 'token=0; path=/';
}
