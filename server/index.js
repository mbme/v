const express = require('express')
const http = require('http')
const fileType = require('file-type')

const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackConfig = require('../webpack.config')

const createProcessor = require('./processor')

function getRequestBody (req) {
  return new Promise(function (resolve, reject) {
    const data = []

    req.on('data', chunk => data.push(chunk))
      .on('end', () => resolve(Buffer.concat(data)))
  })
}

function log (start, req, res, isFinished = true) {
  const hrend = process.hrtime(start)
  const ms = hrend[0] * 1000 + Math.round(hrend[1] / 1000000)

  console.info('%s %s %d %s - %dms %s', req.method, req.url, res.statusCode, res.statusMessage, ms, isFinished ? '' : '[CLOSED]')
}

module.exports = async function startServer (port = 8080, dev = false) {
  const app = express()

  const processor = await createProcessor()

  app.use(function logger (req, res, next) {
    const start = process.hrtime()

    res.on('close', () => log(start, req, res, false))
    res.on('finish', () => log(start, req, res))

    next()
  })

  app.post('/api/files/:record_id/:file_name', async function (req, res) {
    try {
      const data = await getRequestBody(req)

      await processor.processAction({
        name: 'CREATE_FILE',
        data: {
          record_id: parseInt(req.params.record_id, 10),
          name: req.params.file_name,
          data,
        },
      })

      res.end()
    } catch (e) {
      console.error(e)
      res.status(400).json({ error: e })
    }
  })

  app.get('/api/files/:record_id/:file_name', async function (req, res) {
    try {
      const response = await processor.processAction({
        name: 'READ_FILE',
        data: {
          record_id: parseInt(req.params.record_id, 10),
          name: req.params.file_name,
        },
      })

      const type = fileType(response)
      if (type) {
        res.set('Content-Type', type.mime)
      }

      res.send(response)
    } catch (e) {
      console.error(e)
      res.status(400).json({ error: e })
    }
  })

  app.delete('/api/files/:record_id/:file_name', async function (req, res) {
    try {
      await processor.processAction({
        name: 'DELETE_FILE',
        data: {
          record_id: parseInt(req.params.record_id, 10),
          name: req.params.file_name,
        },
      })

      res.end()
    } catch (e) {
      console.error(e)
      res.status(400).json({ error: e })
    }
  })

  app.post('/api', async function (req, res) {
    try {
      const body = await getRequestBody(req)
      const action = JSON.parse(body.toString())
      const response = await processor.processAction(action)

      res.json(response)
    } catch (e) {
      console.error(e)
      res.status(400).json({ error: e })
    }
  })

  app.get('/', function (req, res) {
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>QuantumV</title>
          <script src="bundle.js" defer></script>
          <style id="stylesheet"></style>
        </head>
        <body>
          <div id="root" />
        </body>
      </html>
    `)
  })

  if (dev) {
    const compiler = webpack(webpackConfig)

    app.use(webpackDevMiddleware(compiler, {
      noInfo: false,
      stats: {
        colors: true,
      },
    }))

    app.use(webpackHotMiddleware(compiler))
  }

  const server = http.createServer(app)

  return new Promise(function (resolve, reject) {
    console.log('Starting server...')
    server.listen(port, function () {
      console.log('Server listening on: http://localhost:%s', port)
      resolve(server)
    })
  })
}
