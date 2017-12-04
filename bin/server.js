import createServer from 'server'

async function run() {
  if (process.env.NODE_ENV !== 'production') console.warn('WARN: server should run in production mode')

  const dbFile = process.env.QV_DB
  if (!dbFile) throw new Error('QV_DB must contain db file path')

  const port = 8080
  const server = await createServer(port, { dbFile })
  console.log(`Server listening on http://localhost:${port}`)

  process.on('SIGINT', async () => {
    console.log('Stopping...')
    await server.close()
    process.exit(1)
  })
}

run()
