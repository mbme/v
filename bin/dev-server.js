import createServer from 'server'
import webpack from 'webpack' // eslint-disable-line import/no-extraneous-dependencies
import webpackConfig from '../webpack.config.babel'
import genData from './gen-data'

const port = 8080

const compiler = webpack(webpackConfig)
const compilationPromise = new Promise((resolve, reject) => {
  compiler.watch({ ignored: /(node_modules|dist)/ }, (err, stats) => {
    err ? reject(err) : resolve()
    console.log(stats.toString({ colors: true }))
  })
})

Promise.all([
  compilationPromise,
  createServer(port, { dbFile: '/tmp/db', inMemDb: true }).then(() => genData(port, 30)),
]).then(() => console.log(`server http://localhost:${port}`))
