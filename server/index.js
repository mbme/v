import fs from 'fs'
import path from 'path'
import http from 'http'
import urlParser from 'url'

import Busboy from 'busboy'

import { readStream } from 'server/utils'
import createProcessor from './processor'

const MIME = {
  css: 'text/css',
  html: 'text/html',
  json: 'application/json',
}

const withContentType = type => MIME[type] ? { 'Content-Type': MIME[type] } : {}
const getFileType = name => name.substring(name.lastIndexOf('.') + 1)

function readAction(req) {
  const files = []
  let name
  let data

  const busboy = new Busboy({ headers: req.headers })

  busboy.on('file', (fieldName, file, fileName) => {
    readStream(file).then(fileData => files.push({ name: fileName, data: fileData }))
  })

  busboy.on('field', (fieldName, val) => {
    if (fieldName === 'name') {
      name && console.error('WARN: duplicate field "name"')
      name = val
      return
    }

    if (fieldName === 'data') {
      data && console.error('WARN: duplicate field "data"')
      data = val
      return
    }

    console.error(`WARN: unexpected field "${fieldName}"`)
  })

  return new Promise((resolve, reject) => {
    busboy.on('finish', () => {
      if (name && data) {
        resolve({ name, data: JSON.parse(data), files })
      } else {
        reject(new Error(`"name" is present: ${!!name}, "data" is present: ${!!data}`))
      }
    })
    req.pipe(busboy)
  })
}

const STATIC_DIR = path.join(__dirname, '../static')
const DIST_DIR = path.join(__dirname, '../dist')

const readFile = (dir, name) => fs.readdirSync(dir).includes(name) ? fs.readFileSync(path.join(dir, name)) : null

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

export default async function startServer(port) {
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
          const action = await readAction(req)
          const response = processor.processAction(action)
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
            name: 'READ_FILE',
            data: {
              id: url.query.fileId,
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
      console.error(e)
      res.writeHead(400, withContentType('json'))
      res.end(JSON.stringify({ error: e.toString() }))
    } finally {
      const hrend = process.hrtime(start)
      const ms = (hrend[0] * 1000) + Math.round(hrend[1] / 1000000)

      console.info('%s %s %d %s - %dms', req.method, req.url, res.statusCode, res.statusMessage, ms)
    }
  })

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server))
  })
}
