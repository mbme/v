import fs from 'fs'
import getDB from './db'

describe('DB', () => {
  let db

  beforeAll(async () => {
    db = await getDB()
  })
  afterAll(() => db.close())

  describe('records', () => {
    const type = 'type'
    const name = 'name'
    const data = 'data'

    let id
    test('create record', async () => {
      id = await db.createRecord(type, name, data)
    })

    test('list records', async () => {
      expect(await db.listRecords('12312313131')).toHaveLength(0)
      expect(await db.listRecords(type)).toHaveLength(1)
    })

    test('read record', async () => {
      const record = await db.readRecord(id)
      expect(record).toEqual({ id, type, name, data })
    })

    test('update record', async () => {
      const newName = 'newName'
      const newData = 'newData'
      expect(await db.updateRecord(id, newName, newData)).toBeUndefined()

      const record = await db.readRecord(id)
      expect(record).toEqual({ id, type, name: newName, data: newData })
    })

    test('delete record', async () => {
      expect(await db.deleteRecord(id)).toBeUndefined()
      expect(await db.readRecord(id)).toBeUndefined()
      expect(await db.listRecords(type)).toHaveLength(0)
    })
  })

  describe('files', () => {
    const name = 'package.json'
    const data = fs.readFileSync(name)

    let counter = 0
    const nextId = () => { counter += 1; return `${counter}` }

    test('add files', async () => {
      const id = nextId()
      expect(await db.isKnownFile(id)).toBe(false)
      await db.addFiles([ { id, name, data } ])
      const files = await db.listFiles()
      expect(files.filter(file => file.id === id)).toEqual([ { id, name, size: data.length } ])
      expect(await db.isKnownFile(id)).toBe(true)
    })

    test('read file', async () => {
      const id = nextId()
      await db.addFiles([ { id, name, data } ])

      const file = await db.readFile(id)
      expect(file.name).toBe(name)
      expect(file.data.equals(data)).toBeTruthy()
    })

    test('remove unused files', async () => {
      expect(await db.removeUnusedFiles()).toBe(2)
      expect(await db.listFiles()).toHaveLength(0)
    })

    test('connections', async () => {
      const recordId = await db.createRecord('type', '', '')

      const fileId = nextId()
      await db.addFiles([ { id: fileId, name, data } ])
      await db.addConnections(recordId, [ fileId ])

      expect(await db.removeUnusedFiles()).toBe(0)
      expect(await db.listFiles()).toHaveLength(1)

      expect(await db.removeConnections(recordId)).toBe(1)
      expect(await db.removeUnusedFiles()).toBe(1)
      expect(await db.listFiles()).toHaveLength(0)
    })
  })

  describe('Transaction', () => {
    test('commit', async () => {
      const id = await db.createRecord('type', '', '')

      await expect(db.inTransaction(async () => {
        await db.deleteRecord(id)
        return id
      })).resolves.toBe(id)

      expect(await db.readRecord(id)).toBeUndefined()
    })

    test('rollback', async () => {
      const id = await db.createRecord('type', '', '')
      const error = new Error('test')

      await expect(db.inTransaction(async () => {
        await db.deleteRecord(id)
        throw error
      })).rejects.toBe(error)
      expect(await db.readRecord(id)).not.toBeUndefined()
    })
  })
})
