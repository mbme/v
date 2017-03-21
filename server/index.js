const http = require('http')
const formidable = require('formidable')
const Route = require('route-parser')

const createProcessor = require('./processor')

const PORT = 8080

const fileUploadRoute = new Route('/api/files/:record_id')
const fileRoute = new Route('/api/files/:record_id/:file_name')
const apiRoute = new Route('/api')

const processor = await createProcessor()

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    const data = []

    req.on('data', chunk => data.push(chunk))
      .on('end', () => resolve(JSON.parse(Buffer.concat(data).toString())))
  })
}

function handleRequest (req, res) {
  const method = req.method.toLowerCase()

  const fileUploadRouteResult = fileUploadRoute.match(req.url)
  if (method === 'post' && fileUploadRouteResult) {
    const form = new formidable.IncomingForm()

    form.parse(req, function (err, fields, files) {
      res.writeHead(200, { 'content-type': 'text/plain' })
      res.write('received upload:\n\n', files)
      // res.end(util.inspect({fields: fields, files: files}))
    })

    const response = await processor.processAction({
      name: 'CREATE_FILE',
      data: {
        record_id: fileUploadRouteResult.record_id,
        name: '',
        data: '',
      }
    })
    // write response

    return
  }

  const fileRouteResult = fileRoute.match(req.url)
  if (method === 'get' && fileRouteResult) {
    const response = await processor.processAction({
      name: 'READ_FILE',
      data: {
        record_id: fileRouteResult.record_id,
        name: fileRouteResult.file_name,
      }
    })
    // send response

    return
  }

  if (method === 'post' && apiRoute.match(req.url)) {
    // handle api request
    const response = await processor.processAction(await parseRequestBody(req))

    return
  }

  // write static files
}

const server = http.createServer(handleRequest)

server.listen(PORT, function () {
  console.log('Server listening on: http://localhost:%s', PORT)
})

server.on('error', (error) => {
  console.error(error)
})
