import { expect } from 'chai'
import startServer from 'server'
import { createFileLink } from 'shared/parser'
import { sha256 } from 'server/utils'
import createApiClient from './api'

describe('API client', () => {
  let server
  let api

  before(async () => {
    const port = 8079
    server = await startServer(port)
    api = createApiClient(`http://localhost:${port}`)
  })

  after((done) => {
    server.close(done)
  })

  it('should manage files', async () => {
    const buffer = Buffer.from('test file content')
    const name = 'super text.json'
    const fileId = sha256(buffer)
    const link = createFileLink(name, fileId)

    const recordId = await api.createRecord('note', 'name', `data ${link}`, [ { name, data: buffer } ])
    expect(buffer.equals(await api.readFile(fileId))).to.be.true

    await api.updateRecord(recordId, 'name', 'data')
    expect(await api.readFile(fileId)).to.be.null
  })

  it('should manage records', async () => {
    // create record
    const id = await api.createRecord('note', 'name', 'some data')
    expect(id).to.be.ok

    // list records
    const records = await api.listRecords('note')
    await api.createRecord('note', 'name', 'some data')
    const newRecords = await api.listRecords('note')
    expect(newRecords).to.have.lengthOf(records.length + 1)

    // update record
    await api.updateRecord(id, 'new name', 'new data')
    const record = (await api.listRecords('note')).find(rec => rec.id === id)
    expect(record.name).to.equal('new name')
    expect(record.data).to.equal('new data')

    // delete record
    await api.deleteRecord(id)
    expect((await api.listRecords('note')).filter(rec => rec.id === id)).to.be.empty
  })

  it('should return an error', async () => {
    try {
      await api.updateRecord(99999999, 'new name', 'new data')
    } catch (e) {
      expect(e).to.be.ok
      return
    }
    throw new Error('must be unreachable')
  })
})
