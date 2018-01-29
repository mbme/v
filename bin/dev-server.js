import startServer from 'server'
import webpack from 'webpack' // eslint-disable-line import/no-extraneous-dependencies
import webpackConfig from '../webpack.config.babel'
import genData from './gen-data'

const port = 8080
const password = ''

const compiler = webpack(webpackConfig)
const compilationPromise = new Promise((resolve, reject) => {
  compiler.watch({ ignored: /(node_modules|dist)/ }, (err, stats) => {
    err ? reject(err) : resolve()
    console.log(stats.toString({ colors: true }))
  })
})

async function run() {
  const [ server ] = await Promise.all([
    startServer(port, { rootDir: '/tmp/db', password }),
    compilationPromise,
  ])

  await genData(port, password, 30)

  console.log(`server http://localhost:${port}`)

  async function close() {
    try {
      await server.close()
      process.exit(0)
    } catch (e) {
      console.error('Failed to stop server:', e)
      process.exit(1)
    }
  }

  process.on('SIGINT', close)
  process.on('SIGTERM', close)
}

run().catch((e) => {
  console.error('Failed to start server:', e)
  process.exit(2)
})
