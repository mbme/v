import http from 'http';
import urlParser from 'url';
import { flatten, apiClient } from '../shared/utils';
import log from '../shared/log';
import { readStream, aesEncrypt, sha256, spawn, withTempFiles } from '../core/utils';

function getAsset(baseUrl, fileId, token) {
  return new Promise((resolve, reject) => {
    const { protocol, hostname, port, pathname, search } = urlParser.parse(`${baseUrl}/api?fileId=${fileId}`);

    http.request({
      method: 'GET',
      protocol,
      hostname,
      port,
      path: pathname + (search || ''),
      headers: {
        'Cookie': `token=${token}`,
      },
    }, resolve).on('error', reject).end();
  });
}

export default function createApiClient(baseUrl, password) {
  const token = aesEncrypt(`valid ${Date.now()}`, sha256(password));

  return apiClient(async (action, assets) => {
    if (action.name === 'READ_ASSET') {
      const resp = await getAsset(baseUrl, action.data.id, token);

      if (resp.statusCode === 200) return readStream(resp);

      resp.resume(); // consume response data to free up memory

      if (resp.statusCode === 404) return null;

      return new Error(`Server returned ${resp.statusCode} ${resp.statusMessage}`);
    }

    const response = await withTempFiles(assets, (paths) => {
      const args = flatten([
        'curl',
        '-L', // follow redirects
        '-w', '|%{http_code}', // print "|" and status code in the last line, like |404 or |200
        '-H', `Cookie: token=${token}`,
        '-F', `action=${JSON.stringify(action)}`,
        ...paths.map((path, i) => [ '-F', `file${i}=@${path}` ]),
        `${baseUrl}/api`,
      ]);

      return spawn(...args);
    }).catch((e) => {
      log.warn('curl request failed', e.code || e);
      return e.result;
    });

    if (!response) throw new Error('curl request failed');

    const splitterPos = response.lastIndexOf('|');
    const status = parseInt(response.substring(splitterPos + 1), 10);
    const body = response.substring(0, splitterPos);

    if (status === 200) return JSON.parse(body).data;

    if (status === 400) throw new Error(JSON.parse(body).error);

    throw new Error(`Server returned ${status}`);
  });
}
