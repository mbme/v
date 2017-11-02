import fs from 'fs'
import path from 'path'
import http from 'http'
import urlParser from 'url'

import Busboy from 'busboy'

import createProcessor from './processor'

function readAction(req) {
  const files = []
  let name
  let data

  const busboy = new Busboy({ headers: req.headers })

  busboy.on('file', (fieldName, file, fileName) => {
    const fileData = []
    file.on('data', chunk => fileData.push(chunk))
    file.on('end', () => files.push({ name: fileName, data: Buffer.concat(fileData) }))
  })

  busboy.on('field', (fieldName, val) => {
    if (fieldName === 'name') {
      if (name) {
        console.error('WARN: duplicate field "name"')
      }
      name = val
      return
    }

    if (fieldName === 'data') {
      if (data) {
        console.error('WARN: duplicate field "data"')
      }
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

function getFile(dir, name) {
  const names = fs.readDirSync(dir)
  if (!names.includes(name)) {
    return null
  }

  return fs.readFileSync(path.join(dir, name))
}

export default async function startServer(port = 8080) {
  const STATIC_DIR = path.join(__dirname, '../static')
  const DIST_DIR = path.join(__dirname, '../dist')

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
          res.writeHead(200)
          res.write(JSON.stringify({ data: response }))
          res.end()
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
            res.writeHead(200, { 'Content-Disposition': `inline; filename=${response.name}` })
            res.write(response.data)
          } else {
            res.writeHead(404)
          }

          res.end()
          return
        }

        res.writeHead(405)
        res.end()
      }

      if (req.method !== 'GET') {
        res.writeHead(405)
        res.end()
        return
      }

      // return files from /static or /dist without subdirectories
      const file = getFile(STATIC_DIR, url.path) || getFile(DIST_DIR, url.path)
      if (file) {
        res.writeHead(200)
        res.end(file)
      } else {
        res.writeHead(404)
        res.end()
      }
    } catch (e) {
      console.error(e)
      res.writeHead(400)
      res.end(JSON.stringify({ error: e.toString() }))
    }

    const hrend = process.hrtime(start)
    const ms = (hrend[0] * 1000) + Math.round(hrend[1] / 1000000)

    console.info('%s %s %d %s - %dms', req.method, req.url, res.statusCode, res.statusMessage, ms)
  })

  return new Promise((resolve) => {
    console.log('Starting server...')
    server.listen(port, () => {
      console.log('Server listening on: http://localhost:%s', port)
      resolve(server)
    })
  })
}
