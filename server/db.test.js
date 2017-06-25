/* eslint-disable camelcase */

const getDB = require('./db')
const fs = require('fs')

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
      expect(await db.updateRecord(id, type, newName, newData)).toBeUndefined()

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

    let record_id

    beforeAll(async () => {
      record_id = await db.createRecord('type', '', '')
    })

    test('create file', async () => {
      await db.createFile(record_id, name, data)
      const files = await db.listFiles()
      expect(files[record_id]).toEqual([{ record_id, name, size: data.length }])
    })

    test('read file', async () => {
      const file = await db.readFile(record_id, name)
      expect(file.equals(data)).toBeTruthy()
    })

    test('delete file', async () => {
      expect(await db.deleteFile(record_id, name)).toBeUndefined()
      expect(await db.readFile(record_id, name)).toBeUndefined()
    })

    test('auto cleanup after removing record', async () => {
      await db.createFile(record_id, name, data)
      expect(await db.readFile(record_id, name)).toBeTruthy()

      await db.deleteRecord(record_id)
      expect(await db.readFile(record_id, name)).toBeUndefined()
    })
  })
})
