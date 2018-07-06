import createApiClient from 'shared/api-client';
import { createPubSub } from 'shared/utils';
import { sha256, text2buffer, aesEncrypt } from 'client/utils';

export async function authorize(password) {
  const token = await aesEncrypt(`valid ${Date.now()}`, await sha256(text2buffer(password)));
  document.cookie = `token=${token}; path=/`;
}

export async function deauthorize() {
  document.cookie = 'token=0; path=/';
}

export class UnauthorizedError extends Error {}

function createNetwork() {
  const events = createPubSub();

  return {
    events,

    async post(url, action, files = []) {
      events.emit('start');

      const data = new FormData();
      data.append('action', JSON.stringify(action));
      files.forEach((file, i) => {
        data.append(`file-${i}`, file);
      });

      try {
        const res = await fetch(url, {
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

        events.emit('end');

        return response;
      } catch (e) {
        events.emit('error', e);
        throw e;
      }
    },

    async get(url) {
      const res = await fetch(url, { credentials: 'include' });

      if (res.status === 404) return null;

      if (res.status !== 200) throw new Error(`Server returned ${res.status} ${res.statusText}`);

      return res.buffer();
    },
  };
}

export const network = createNetwork();

export const apiClient = createApiClient('', network);
