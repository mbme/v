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

    let recordId

    beforeAll(async () => {
      recordId = await db.createRecord('type', '', '')
    })

    test('create file', async () => {
      await db.createFile(recordId, name, data)
      const files = await db.listFiles()
      expect(files[recordId]).toEqual([{ recordId, name, size: data.length }])
    })

    test('read file', async () => {
      const file = await db.readFile(recordId, name)
      expect(file.equals(data)).toBeTruthy()
    })

    test('delete file', async () => {
      expect(await db.deleteFile(recordId, name)).toBeUndefined()
      expect(await db.readFile(recordId, name)).toBeUndefined()
    })

    test('auto cleanup after removing record', async () => {
      await db.createFile(recordId, name, data)
      expect(await db.readFile(recordId, name)).toBeTruthy()

      await db.deleteRecord(recordId)
      expect(await db.readFile(recordId, name)).toBeUndefined()
    })
  })
})
