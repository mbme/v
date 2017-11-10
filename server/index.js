import fs from 'fs'
import path from 'path'
import http from 'http'
import urlParser from 'url'

import { readStream } from 'server/utils'
import { CONTENT_TYPE } from 'shared/api'
import { parse } from 'shared/serializer'
import createProcessor from './processor'

const MIME = {
  css: 'text/css',
  html: 'text/html',
  json: 'application/json',
}

const withContentType = type => MIME[type] ? { 'Content-Type': MIME[type] } : {}
const getFileType = name => name.substring(name.lastIndexOf('.') + 1)

const STATIC_DIR = path.join(__dirname, '../static')
const DIST_DIR = path.join(__dirname, '../dist')

// FIXME async
const readFile = (dir, name) => fs.existsSync(dir) && fs.readdirSync(dir).includes(name) ? fs.readFileSync(path.join(dir, name)) : null

// return files from /static or /dist without subdirectories, use index.html as fallback
function getStaticFile(name, fallback = 'index.html') {
  if (name) {
    const data = readFile(STATIC_DIR, name) || readFile(DIST_DIR, name)

    if (data) {
      return { name, data }
    }
  }

  const data = readFile(STATIC_DIR, fallback)

  if (data) {
    return { name: fallback, data }
  }

  return null
}

export default async function startServer(port, options = { html5historyFallback: true, requestLogger: true }) {
  const processor = createProcessor()

  // POST /api
  // GET /api&fileId=asdfsadfasd
  // GET * -> static || dist
  const server = http.createServer(async (req, res) => {
    const start = process.hrtime()

    try {
      const url = urlParser.parse(req.url, true)

      if (url.pathname === '/api') {
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

          const response = processor.processAction(parse(buffer))
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

          const response = processor.processAction({
            action: {
              name: 'READ_FILE',
              data: {
                id: url.query.fileId,
              },
            },
          })

          if (response) {
            res.writeHead(200, { 'Content-Disposition': `inline; filename=${response.name}`, ...withContentType(getFileType(response.name)) })
            res.end(response.data)
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


      const file = getStaticFile(url.path.substring(1))

      if (file) {
        res.writeHead(200, withContentType(getFileType(file.name)))
        res.end(file.data)
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

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server))
  })
}
