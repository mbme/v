const http = require('http')
const formidable = require('formidable')
const Route = require('route-parser')
const fileType = require('file-type')
const fs = require('fs')

const createProcessor = require('./processor')

const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const compiler = webpack({
  output: { path: '/' },
})


function parseRequestBody (req) {
  return new Promise(function (resolve, reject) {
    const data = []

    req.on('data', chunk => data.push(chunk))
      .on('end', () => {
        const body = Buffer.concat(data).toString()

        try {
          resolve(JSON.parse(body))
        } catch (e) {
          reject(e)
        }
      })
  })
}

async function parseForm (req) {
  const form = new formidable.IncomingForm()

  return new Promise((resolve, reject) => {
    form.parse(req, function (err, fields, files) {
      if (err) {
        reject(err)
      } else {
        resolve({ fields, files })
      }
    })
  })
}

function readFile (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => err ? reject(err) : resolve(data))
  })
}

function writeResponse (res, response) {
  res.writeHead(200, { 'content-type': 'application/json' })
  res.end(JSON.stringify(response))
}

async function createRequestHandler () {
  const processor = await createProcessor()

  const fileUploadRoute = new Route('/api/files/:record_id')
  const fileRoute = new Route('/api/files/:record_id/:file_name')
  const apiRoute = new Route('/api')

  return async function handleRequest (req, res) {
    const method = req.method.toLowerCase()

    const fileUploadRouteResult = fileUploadRoute.match(req.url)
    if (method === 'post' && fileUploadRouteResult) {
      const { fields, files } = await parseForm(req)

      const data = await readFile(files.data.path)

      const response = await processor.processAction({
        name: 'CREATE_FILE',
        data: {
          record_id: parseInt(fileUploadRouteResult.record_id, 10),
          name: fields.name,
          data: data,
        },
      })

      writeResponse(res, response)

      return
    }

    const fileRouteResult = fileRoute.match(req.url)
    if (method === 'get' && fileRouteResult) {
      const response = await processor.processAction({
        name: 'READ_FILE',
        data: {
          record_id: parseInt(fileRouteResult.record_id, 10),
          name: fileRouteResult.file_name,
        },
      })

      if (Buffer.isBuffer(response)) {
        res.writeHead(200, { 'content-type': fileType(response).mime })
        res.end(response)
      } else {
        res.writeHead(400, { 'content-type': 'application/json' })
        res.end(JSON.stringify(response))
      }

      return
    }

    if (method === 'post' && apiRoute.match(req.url)) {
      // handle api request
      try {
        const action = await parseRequestBody(req)
        const response = await processor.processAction(action)

        writeResponse(res, response)
      } catch (e) {
        console.error('API REQUEST ERROR', e)
        res.writeHead(400)
        res.end(e.stack.toString())
      }

      return
    }

    // TODO write static files
    res.writeHead(404)
    res.end()
  }
}

async function startServer (port = 8080) {
  const handler = await createRequestHandler()
  const server = http.createServer(handler)

  return new Promise((resolve) => {
    server.on('error', (error) => {
      console.error('SERVER ERROR', error)
    })

    server.listen(port, function () {
      console.log('Server listening on: http://localhost:%s', port)
      resolve(server)
    })
  })
}

startServer()
