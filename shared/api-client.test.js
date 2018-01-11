import { test, before, after } from 'tools/test'
import startServer from 'server'
import createNetwork from 'server/platform'
import { createLink } from 'shared/parser'
import { sha256 } from 'server/utils'
import createApiClient from './api-client'

let server
let api
const port = 8079

before(async () => {
  const password = 'test'

  server = await startServer(port, { html5historyFallback: false, requestLogger: false, dbFile: '/tmp/db', inMemDb: true, password })
  api = createApiClient(`http://localhost:${port}`, createNetwork(password))
})

after(() => server.close())

test('should handle auth', async (assert) => {
  const badApi = createApiClient(`http://localhost:${port}`, createNetwork('wrong password'))

  const failed = await badApi.listRecords('note').then(() => false, () => true)
  assert.equal(failed, true)
})

test('should ping', async (assert) => {
  const response = await api.ping()
  assert.equal(response, 'PONG')
})

test('should manage files', async (assert) => {
  const buffer = Buffer.from('test file content')
  const name = 'super text.json'
  const fileId = sha256(buffer)
  const link = createLink(name, fileId)

  const recordId = await api.createRecord('note', 'name', `data ${link}`, [ { name, data: buffer } ])
  assert.equal(buffer.equals(await api.readFile(fileId)), true)

  await api.updateRecord(recordId, 'name', 'data')
  assert.equal(await api.readFile(fileId), null)
})

test('should manage records', async (assert) => {
  // create record
  const id = await api.createRecord('note', 'name', 'some data')
  assert.equal(!!id, true)

  // list records
  const records = await api.listRecords('note')
  await api.createRecord('note', 'name', 'some data')
  const newRecords = await api.listRecords('note')
  assert.equal(newRecords.length, records.length + 1)

  // update record
  await api.updateRecord(id, 'new name', 'new data')
  const record = (await api.listRecords('note')).find(rec => rec.id === id)
  assert.equal(record.name, 'new name')
  assert.equal(record.data, 'new data')

  // delete record
  await api.deleteRecord(id)
  assert.equal((await api.listRecords('note')).filter(rec => rec.id === id).length, 0)
})

test('should return an error', async (assert) => {
  try {
    await api.updateRecord(99999999, 'new name', 'new data')
  } catch (e) {
    assert.equal(!!e, true)
    return
  }
  throw new Error('must be unreachable')
})