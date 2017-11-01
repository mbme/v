import fs from 'fs'
import path from 'path'
import startServer from 'server'
import { createFileLink } from 'shared/parser'
import { sha256 } from 'server/utils'
import createApiClient from './api'

global.fetch = require('node-fetch')
global.FormData = require('form-data')

describe('API client', () => {
  let server
  let api

  beforeAll(async () => {
    const port = 8079
    server = await startServer(port)
    api = createApiClient(`http://localhost:${port}`)
  })

  afterAll((done) => {
    server.close(done)
  })

  it('should manage files', async () => {
    const buffer = fs.readFileSync(path.join(__dirname, '../package.json'))
    const name = 'super text.json'
    const fileId = sha256(buffer)
    const link = createFileLink(name, fileId)

    const recordId = await api.createRecord('note', 'name', `data ${link}`, [ { name, data: buffer } ])
    expect(buffer.equals(await api.readFile(fileId))).toBeTruthy()

    await api.updateRecord(recordId, 'name', 'data')
    await expect(api.readFile(fileId)).resolves.toBeNull()
  })

  it('should manage records', async () => {
    // create record
    const id = await api.createRecord('note', 'name', 'some data')
    expect(id).toBeDefined()

    // list records
    const records = await api.listRecords('note')
    await api.createRecord('note', 'name', 'some data')
    const newRecords = await api.listRecords('note')
    expect(newRecords.length).toBe(records.length + 1)

    // update record
    await api.updateRecord(id, 'new name', 'new data')
    const record = (await api.listRecords('note')).find(rec => rec.id === id)
    expect(record.name).toBe('new name')
    expect(record.data).toBe('new data')

    // delete record
    await api.deleteRecord(id)
    expect((await api.listRecords('note')).filter(rec => rec.id === id)).toHaveLength(0)
  })

  it('should return an error', async () => {
    await expect(api.updateRecord(99999999, 'new name', 'new data')).rejects.toBeDefined()
  })
})
