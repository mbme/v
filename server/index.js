import path from 'path'
import fs from 'fs'
import http from 'http'
import urlParser from 'url'

import { readStream, existsFile, listFiles, sha256, aesDecrypt } from 'server/utils'
import { extend } from 'shared/utils'
import { CONTENT_TYPE } from 'shared/api-client'
import { parse } from 'shared/protocol'
import createProcessor from './processor'

const MIME = {
  css: 'text/css',
  html: 'text/html',
  json: 'application/json',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
}

const withContentType = type => MIME[type] ? { 'Content-Type': MIME[type] } : {}
const getFileType = name => name.substring(name.lastIndexOf('.') + 1)

const STATIC_DIR = path.join(__dirname, '../client/static')
const DIST_DIR = path.join(__dirname, '../dist')

async function getFileStream(dir, name) {
  if (!await existsFile(dir)) return null
  if (!await listFiles(dir).then(files => files.includes(name))) return null

  return fs.createReadStream(path.join(dir, name))
}

function extractToken(cookies) {
  const [ tokenCookie ] = cookies.split(';').filter(c => c.startsWith('token='))

  if (!tokenCookie) return ''

  return decodeURIComponent(tokenCookie.substring(6))
}

// return files from /static or /dist without subdirectories, use index.html as fallback
async function getStaticFile(name, fallback = 'index.html') {
  if (name) {
    const data = await getFileStream(STATIC_DIR, name) || await getFileStream(DIST_DIR, name)

    if (data) {
      return { name, data }
    }
  }

  const data = await getFileStream(STATIC_DIR, fallback)

  if (data) {
    return { name: fallback, data }
  }

  return null
}

const defaults = {
  rootDir: '',
  password: '',
  html5historyFallback: true,
  requestLogger: true,
}

export default async function startServer(port, customOptions) {
  const options = extend(defaults, customOptions)

  const processor = await createProcessor({ rootDir: options.rootDir })

  // token: AES("valid <generation timestamp>", SHA256(password))
  function isValidAuth(token) {
    try {
      return /^valid \d+$/.test(aesDecrypt(token || '', sha256(options.password)))
    } catch (ignored) {
      return false
    }
  }

  // POST /api
  // GET /api&fileId=asdfsadfasd
  // GET * -> static || dist
  const server = http.createServer(async (req, res) => {
    const start = process.hrtime()

    res.setHeader('Referrer-Policy', 'no-referrer')

    try {
      const url = urlParser.parse(req.url, true)

      if (url.pathname === '/api') {
        if (!isValidAuth(extractToken(req.headers.cookie || ''))) {
          res.writeHead(403)
          res.end()
          return
        }

        if (req.method === 'POST') {
          // validate content-type
          if (req.headers['content-type'] !== CONTENT_TYPE) {
            res.writeHead(415)
            res.end()
            return
          }

          // ensure there is a content-length
          const expectedLength = parseInt(req.headers['content-length'], 10)
          if (Number.isNaN(expectedLength)) {
            res.writeHead(411)
            res.end()
            return
          }

          const buffer = await readStream(req)

          // ensure we read all the data
          if (buffer.length !== expectedLength) {
            res.writeHead(400)
            res.end()
            return
          }

          const response = await processor.processAction(parse(buffer))
          res.writeHead(200, withContentType('json'))
          res.end(JSON.stringify({ data: response }))
          return
        }

        if (req.method === 'GET') {
          if (!url.query.fileId) {
            res.writeHead(400)
            res.end()
            return
          }

          const response = await processor.processAction({
            action: {
              name: 'READ_FILE',
              data: {
                id: url.query.fileId,
              },
            },
          })

          if (response) {
            res.writeHead(200, { 'Content-Disposition': `inline; filename=${response.name}`, ...withContentType(getFileType(response.name)) })
            response.data.pipe(res)
          } else {
            res.writeHead(404)
            res.end()
          }

          return
        }

        res.writeHead(405)
        res.end()
        return
      }

      if (!options.html5historyFallback) {
        res.writeHead(404)
        res.end()
        return
      }

      if (req.method !== 'GET') {
        res.writeHead(405)
        res.end()
        return
      }


      const file = await getStaticFile(url.path.substring(1))

      if (file) {
        res.writeHead(200, withContentType(getFileType(file.name)))
        file.data.pipe(res)
      } else {
        res.writeHead(404)
        res.end()
      }
    } catch (e) {
      options.requestLogger && console.error(e)
      res.writeHead(400, withContentType('json'))
      res.end(JSON.stringify({ error: e.toString() }))
    } finally {
      const hrend = process.hrtime(start)
      const ms = (hrend[0] * 1000) + Math.round(hrend[1] / 1000000)

      if (options.requestLogger) {
        console.info('%s %s %d %s - %dms', req.method, req.url, res.statusCode, res.statusMessage, ms)
      }
    }
  })

  const api = {
    async close() {
      await processor.close()

      await new Promise(resolve => server.close(resolve))
    },
  }

  return new Promise((resolve) => {
    server.listen(port, () => resolve(api))
  })
}
