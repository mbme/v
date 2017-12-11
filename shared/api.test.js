import { test, before, after } from 'tools/test'
import startServer from 'server'
import createNetwork from 'server/network'
import { createLink } from 'shared/parser'
import { sha256 } from 'server/utils'
import createApiClient from './api'

let server
let api
const password = 'test'

before(async () => {
  const port = 8079
  server = await startServer(port, { html5historyFallback: false, requestLogger: false, dbFile: '/tmp/db', inMemDb: true, password })
  api = createApiClient(`http://localhost:${port}`, createNetwork())
  await api.setPassword(password)
})

after(() => server.close())

test('should handle auth', async (assert) => {
  await api.setPassword('wrong password')

  let failed = false
  try {
    await api.listRecords('note')
  } catch (e) {
    failed = true
  }

  // restore proper password
  await api.setPassword(password)

  assert.equal(failed, true)
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
