import startServer from '../server'
import createApiClient from './api'
import fs from 'fs'
import path from 'path'

global.fetch = require('node-fetch')

const port = 8079

describe('API client', () => {
  let server
  let api

  beforeAll(async () => {
    server = await startServer(port)
    api = createApiClient(`http://localhost:${port}`)
  })

  afterAll((done) => {
    server.close(done)
  })

  const newRecord = () => api.createRecord('note', 'name', 'some data')

  it('should manage files', async () => {
    const buffer = fs.readFileSync(path.join(__dirname, '../package.json'))
    const recordId = await newRecord()

    // create file
    await api.createFile(recordId, 'name', buffer)

    // read file
    const file = await api.readFile(recordId, 'name')
    expect(buffer.equals(file)).toBeTruthy()

    // delete file
    await api.deleteFile(recordId, 'name')
    await expect(api.readFile(recordId, 'name')).resolves.toBeNull()
  })

  it('should manage records', async () => {
    // create record
    const id = await newRecord()
    expect(id).toBeDefined()

    // list records
    const records = await api.listRecords('note')
    await newRecord()
    const newRecords = await api.listRecords('note')
    expect(newRecords.length).toBe(records.length + 1)

    // update record
    await api.updateRecord(id, 'note', 'new name', 'new data')
    const record = (await api.listRecords('note')).find(record => record.id === id)
    expect(record.name).toBe('new name')
    expect(record.data).toBe('new data')

    // delete record
    await api.deleteRecord(id)
    expect((await api.listRecords('note')).filter(rec => rec.id === id)).toHaveLength(0)
  })

  it('should return an error', async () => {
    await expect(api.updateRecord(99999999, 'note', 'new name', 'new data')).rejects.toBeDefined()
  })
})
