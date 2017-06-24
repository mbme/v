import startServer from '../server'
import createApiClient from './api'

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

  describe('api', () => {
    it('should create record', async () => {
      const id = await api.createRecord('note', 'name', 'some data')
      expect(id).toBeDefined()
    })

    it('should list records', async () => {
      const records = await api.listRecords('note')
      await api.createRecord('note', 'name', 'some data')
      const newRecords = await api.listRecords('note')

      expect(newRecords.length).toBe(records.length + 1)
    })

    it('should update record', async () => {
      const id = await api.createRecord('note', 'name', 'some data')
      await api.updateRecord(id, 'note', 'new name', 'new data')
      const record = (await api.listRecords('note')).find(record => record.id === id)

      expect(record.name).toBe('new name')
      expect(record.data).toBe('new data')
    })

    it('should delete record', async () => {
      const id = await api.createRecord('note', 'name', 'some data')
      await api.deleteRecord(id)
      const record = (await api.listRecords('note')).find(record => record.id === id)

      expect(record).toBeUndefined()
    })
  })
})
