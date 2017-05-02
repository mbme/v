const express = require('express')
const formidable = require('formidable')
const fileType = require('file-type')
const fs = require('fs')

const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackConfig = require('../webpack.config')

const createProcessor = require('./processor')

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

function log (start, req, res, isFinished = true) {
  const hrend = process.hrtime(start)
  const ms = hrend[0] * 1000 + Math.round(hrend[1] / 1000000)

  console.info('%s %s %d %s - %dms %s', req.method, req.url, res.statusCode, res.statusMessage, ms, isFinished ? '' : '[CLOSED]')
}

async function startServer (port = 8080) {
  const app = express()

  const processor = await createProcessor()

  app.use(function logger (req, res, next) {
    const start = process.hrtime()

    res.on('close', () => log(start, req, res, false))
    res.on('finish', () => log(start, req, res))

    next()
  })

  app.post('/api/files/:record_id', async function (req, res) {
    const { fields, files } = await parseForm(req)

    const data = await readFile(files.data.path)

    const response = await processor.processAction({
      name: 'CREATE_FILE',
      data: {
        record_id: parseInt(req.params.record_id, 10),
        name: fields.name,
        data: data,
      },
    })

    res.json(response)
  })

  app.get('/api/files/:record_id/:file_name', async function (req, res) {
    const response = await processor.processAction({
      name: 'READ_FILE',
      data: {
        record_id: parseInt(req.params.record_id, 10),
        name: req.params.file_name,
      },
    })

    if (Buffer.isBuffer(response)) {
      res.set('Content-Type', fileType(response).mime).send(response)
    } else {
      res.status(400).json(response)
    }
  })

  app.post('/api', async function (req, res) {
    let action
    try {
      action = await parseRequestBody(req)
    } catch (e) {
      res.status(400).json({ error: e.stack.toString() })
      return
    }

    const response = await processor.processAction(action)

    res.json(response)
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

  const compiler = webpack(webpackConfig)

  app.use(webpackDevMiddleware(compiler, {
    noInfo: false,
    stats: {
      colors: true,
    },
  }))
  app.use(webpackHotMiddleware(compiler))

  app.listen(port, function () {
    console.log('Server listening on: http://localhost:%s', port)
  })
}

startServer()
