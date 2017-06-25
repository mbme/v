import startServer from '../server'
import createApiClient from './api'
import fs from 'fs'
import path from 'path'

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

    await api.createFile(recordId, 'name', buffer)

    const file = await api.readFile(recordId, 'name')
    console.error(file);
    expect(buffer.equals(file)).toBeTruthy()
  })

  it('should create record', async () => {
    const id = await newRecord()
    expect(id).toBeDefined()
  })

  it('should list records', async () => {
    const records = await api.listRecords('note')
    await newRecord()
    const newRecords = await api.listRecords('note')

    expect(newRecords.length).toBe(records.length + 1)
  })

  it('should update record', async () => {
    const id = await newRecord()
    await api.updateRecord(id, 'note', 'new name', 'new data')
    const record = (await api.listRecords('note')).find(record => record.id === id)

    expect(record.name).toBe('new name')
    expect(record.data).toBe('new data')
  })

  it('should delete record', async () => {
    const id = await newRecord()
    await api.deleteRecord(id)
    const record = (await api.listRecords('note')).find(record => record.id === id)

    expect(record).toBeUndefined()
  })
})
