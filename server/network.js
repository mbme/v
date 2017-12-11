import http from 'http'
import urlParser from 'url'
import { readStream, aesEncrypt, sha256 } from 'server/utils'
import { serialize } from 'shared/protocol'
import { CONTENT_TYPE, AUTH_HEADER } from 'shared/api'

function request(method, url, headers, body) {
  return new Promise((resolve, reject) => {
    const { protocol, hostname, port, pathname, search } = urlParser.parse(url)

    http.request({
      method,
      protocol,
      hostname,
      port,
      path: pathname + (search || ''),
      headers,
    }, resolve).on('error', reject).end(body)
  })
}

export default function createNetwork() {
  let token = ''

  return {
    setPassword(password) {
      token = aesEncrypt(`valid ${Date.now()}`, sha256(password))
    },

    POST(url, action, files = []) {
      const data = serialize(action, files)

      return request('POST', url, {
        'Content-Type': CONTENT_TYPE,
        'Content-Length': data.length,
        [AUTH_HEADER]: token,
      }, data).then(async (resp) => {
        const body = (await readStream(resp)).toString('utf8')
        if (resp.statusCode === 200) {
          return JSON.parse(body).data
        }

        if (resp.statusCode === 400) {
          throw new Error(JSON.parse(body).error)
        }

        throw new Error(`Server returned ${resp.statusCode} ${resp.statusMessage}`)
      })
    },

    GET(url) {
      return request('GET', url, { [AUTH_HEADER]: token }).then((resp) => {
        if (resp.statusCode === 200) {
          return readStream(resp)
        }

        resp.resume() // consume response data to free up memory

        if (resp.statusCode === 404) {
          return null
        }

        return new Error(`Server returned ${resp.statusCode} ${resp.statusMessage}`)
      })
    },
  }
}
