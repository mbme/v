import http from 'http'
import urlParser from 'url'
import { readStream } from 'server/utils'
import { serialize } from 'shared/protocol'
import { CONTENT_TYPE } from 'shared/api'

function POST(url, action, files = []) {
  const data = serialize(action, files)

  return new Promise((resolve, reject) => {
    const { protocol, hostname, port, pathname } = urlParser.parse(url)
    const request = http.request({
      method: 'POST',
      protocol,
      hostname,
      port,
      path: pathname,
      headers: {
        'Content-Type': CONTENT_TYPE,
        'Content-Length': data.length,
      },
    }, async (resp) => {
      const body = (await readStream(resp)).toString('utf8')
      if (resp.statusCode === 200) {
        resolve(JSON.parse(body).data)
        return
      }

      if (resp.statusCode === 400) {
        reject(new Error(JSON.parse(body).error))
        return
      }

      reject(new Error(`Server returned ${resp.statusCode} ${resp.statusMessage}`))
    })
    request.on('error', reject)
    request.end(data)
  })
}

function GET(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (resp) => {
      if (resp.statusCode === 200) {
        resolve(readStream(resp))
        return
      }

      resp.resume() // consume response data to free up memory

      if (resp.statusCode === 404) {
        resolve(null)
        return
      }

      reject(new Error(`Server returned ${resp.statusCode} ${resp.statusMessage}`))
    }).on('error', reject)
  })
}

export default { POST, GET }
