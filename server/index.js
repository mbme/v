const http = require('http')
const formidable = require('formidable')
const Route = require('route-parser')

const createProcessor = require('./processor')

const fileUploadRoute = new Route('/api/files/:record_id')
const fileRoute = new Route('/api/files/:record_id/:file_name')
const apiRoute = new Route('/api')

function parseRequestBody (req) {
  return new Promise((resolve, reject) => {
    const data = []

    req.on('data', chunk => data.push(chunk))
      .on('end', () => resolve(JSON.parse(Buffer.concat(data).toString())))
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

function writeResponse (res, response) {
  res.writeHead(200, { 'content-type': 'application/json' })
  res.write(JSON.stringify(response))
}

async function createRequestHandler () {
  const processor = await createProcessor()

  return async function handleRequest (req, res) {
    const method = req.method.toLowerCase()

    const fileUploadRouteResult = fileUploadRoute.match(req.url)
    if (method === 'post' && fileUploadRouteResult) {
      const { fields, files } = await parseForm(req)

      // TODO save file

      const response = await processor.processAction({
        name: 'CREATE_FILE',
        data: {
          record_id: fileUploadRouteResult.record_id,
          name: '',
          data: ''
        }
      })

      writeResponse(res, response)

      return
    }

    const fileRouteResult = fileRoute.match(req.url)
    if (method === 'get' && fileRouteResult) {
      const response = await processor.processAction({
        name: 'READ_FILE',
        data: {
          record_id: fileRouteResult.record_id,
          name: fileRouteResult.file_name
        }
      })

      if (response instanceof Buffer) {
        res.writeHead(200, {}) // TODO write proper content type
        res.write(response)
      } else {
        res.writeHead(400, { 'content-type': 'application/json' })
        res.write(JSON.stringify(response))
      }

      return
    }

    if (method === 'post' && apiRoute.match(req.url)) {
      // handle api request
      const response = await processor.processAction(await parseRequestBody(req))

      writeResponse(res, response)
    }

    // TODO write static files
  }
}

async function startServer (port = 8080) {
  const handler = await createRequestHandler()
  const server = http.createServer(handler)

  return new Promise((resolve) => {
    server.on('error', (error) => {
      console.error(error)
    })

    server.listen(port, function () {
      console.log('Server listening on: http://localhost:%s', port)
      resolve(server)
    })
  })
}

startServer()
