/* eslint-disable import/no-extraneous-dependencies */
import express from 'express'
import http from 'http'
import fileType from 'file-type'

import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackConfig from '../webpack.config'

import createProcessor from './processor'

function getRequestBody (req) {
  return new Promise((resolve, reject) => {
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

export default async function startServer (port = 8080, dev = false) {
  const app = express()

  const processor = await createProcessor()

  app.use(function logger (req, res, next) {
    const start = process.hrtime()

    res.on('close', () => log(start, req, res, false))
    res.on('finish', () => log(start, req, res))

    next()
  })

  app.post('/api/files/:record_id/:file_name', async (req, res) => {
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

  app.get('/api/files/:record_id/:file_name', async (req, res) => {
    try {
      const response = await processor.processAction({
        name: 'READ_FILE',
        data: {
          record_id: parseInt(req.params.record_id, 10),
          name: req.params.file_name,
        },
      })

      if (response) {
        const type = fileType(response)
        if (type) {
          res.set('Content-Type', type.mime)
        }

        res.send(response)
      } else {
        res.status(404).send()
      }
    } catch (e) {
      console.error(e)
      res.status(400).json({ error: e.toString() })
    }
  })

  app.delete('/api/files/:record_id/:file_name', async (req, res) => {
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
      res.status(400).json({ error: e.toString() })
    }
  })

  app.post('/api', async (req, res) => {
    try {
      const body = await getRequestBody(req)
      const action = JSON.parse(body.toString())
      const response = await processor.processAction(action)

      res.json({ data: response })
    } catch (e) {
      console.error(e)
      res.status(400).json({ error: e.toString() })
    }
  })

  app.get('/', (req, res) => {
    res.end(`
      <!DOCTYPE html>
      <html lang="en" class="mdc-typography">
        <head>
          <title>QuantumV</title>

          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">

          <script src="bundle.js" defer></script>

          <link rel="stylesheet" href="styles.css" type="text/css">
        </head>
        <body>
          <style id="stylesheet"></style>
          <div id="root" />
        </body>
      </html>
    `)
  })

  app.use(express.static('static'))

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

  return new Promise((resolve, reject) => {
    console.log('Starting server...')
    server.listen(port, () => {
      console.log('Server listening on: http://localhost:%s', port)
      resolve(server)
    })
  })
}
