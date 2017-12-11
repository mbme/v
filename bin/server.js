import startServer from 'server'
import { existsFile, ask } from 'server/utils'

async function run() {
  if (process.env.NODE_ENV !== 'production') console.warn('WARN: server should run in production mode')

  const dbFile = process.env.QV_DB
  if (!dbFile) throw new Error('QV_DB must contain db file path')

  let password = ''
  if (!await existsFile(dbFile)) {
    console.log("DB file doesn't exist, going to create a new one")

    password = await ask('Input password: ')
    const p2 = await ask('Retype password: ')

    if (password !== p2) throw new Error('Passwords must be equal')

    if (!password) console.warn('WARN: password is empty')
  }

  const port = 8080
  const server = await startServer(port, { dbFile, password })
  console.log(`Server listening on http://localhost:${port}`)

  process.on('SIGINT', async () => {
    console.log('Stopping...')
    await server.close()
    process.exit(1)
  })
}

run()
