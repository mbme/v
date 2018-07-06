import http from 'http';
import urlParser from 'url';
import { readStream, aesEncrypt, sha256, exec, withTempFiles } from './index';

function request(method, url, headers, body) {
  return new Promise((resolve, reject) => {
    const { protocol, hostname, port, pathname, search } = urlParser.parse(url);

    http.request({
      method,
      protocol,
      hostname,
      port,
      path: pathname + (search || ''),
      headers,
    }, resolve).on('error', reject).end(body);
  });
}

export default function createNetwork(password) {
  const token = aesEncrypt(`valid ${Date.now()}`, sha256(password));

  return {
    async post(url, action, assets = []) {
      const response = await withTempFiles(assets, (paths) => {
        const command = [
          'curl',
          '-L', // follow redirects
          '-w "|%{http_code}"', // print "|" and status code in the last line, like |404 or |200
          `-H Cookie=token=${token}`,
          `-F action=${JSON.stringify(action)}`,
          ...paths.map((path, i) => `-F file${i}=@${path}`),
          url,
        ];

        return exec(command.join(' '));
      });

      // console.error('RESPONSE');
      // console.error(response);
      const splitterPos = response.lastIndexOf('|');
      const status = parseInt(response.substring(splitterPos + 1), 10);
      const body = response.substring(0, splitterPos);

      if (status === 200) return JSON.parse(body).data;

      if (status === 400) throw new Error(JSON.parse(body).error);

      throw new Error(`Server returned ${status}`);
    },

    async get(url) {
      const resp = await request('GET', url, { 'Cookie': `token=${token}` });

      if (resp.statusCode === 200) return readStream(resp);

      resp.resume(); // consume response data to free up memory

      if (resp.statusCode === 404) return null;

      return new Error(`Server returned ${resp.statusCode} ${resp.statusMessage}`);
    },
  };
}
