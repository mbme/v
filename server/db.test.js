import { expect } from 'chai'
import getDB from './db'

describe('DB', () => {
  const db = getDB()

  after(() => db.close())

  describe('records', () => {
    const type = 'type'
    const name = 'name'
    const data = 'data'

    let id
    it('create record', () => {
      id = db.createRecord(type, name, data)
    })

    it('list records', () => {
      expect(db.listRecords('12312313131')).to.be.empty
      expect(db.listRecords(type)).to.have.lengthOf(1)
    })

    it('read record', () => {
      const record = db.readRecord(id)
      expect(record).to.deep.equal({ id, type, name, data })
    })

    it('update record', () => {
      const newName = 'newName'
      const newData = 'newData'
      expect(db.updateRecord(id, newName, newData)).to.be.true

      const record = db.readRecord(id)
      expect(record).to.deep.equal({ id, type, name: newName, data: newData })
    })

    it('delete record', () => {
      expect(db.deleteRecord(id)).to.be.true
      expect(db.readRecord(id)).to.be.undefined
      expect(db.listRecords(type)).to.be.empty
    })
  })

  describe('files', () => {
    const name = 'some file.json'
    const data = Buffer.from('test file content')

    let counter = 0
    const nextId = () => { counter += 1; return `${counter}` }

    it('add files', () => {
      const id = nextId()
      expect(db.isKnownFile(id)).to.be.false

      db.addFiles([ { id, name, data } ])
      const file = db.readFile(id)
      expect(file.name).to.be.equal(name)
      expect(data.equals(file.data)).to.be.true
      expect(db.isKnownFile(id)).to.be.true
    })

    it('read file', () => {
      const id = nextId()
      db.addFiles([ { id, name, data } ])

      const file = db.readFile(id)
      expect(file.name).to.equal(name)
      expect(file.data.equals(data)).to.be.true
    })

    it('remove unused files', () => {
      expect(db.removeUnusedFiles()).to.equal(2)
    })

    it('connections', () => {
      const recordId = db.createRecord('type', '', '')

      const fileId = nextId()
      db.addFiles([ { id: fileId, name, data } ])
      db.addConnections(recordId, [ fileId ])

      expect(db.removeUnusedFiles()).to.equal(0)
      expect(db.isKnownFile(fileId)).to.be.true

      expect(db.removeConnections(recordId)).to.equal(1)
      expect(db.removeUnusedFiles()).to.equal(1)
      expect(db.isKnownFile(fileId)).to.be.false
    })
  })

  describe('Transaction', () => {
    it('commit', () => {
      const id = db.createRecord('type', '', '')

      expect(db.inTransaction(() => {
        db.deleteRecord(id)
        return id
      })).to.equal(id)

      expect(db.readRecord(id)).to.be.undefined
    })

    it('rollback', () => {
      const id = db.createRecord('type', '', '')
      const error = new Error('test')

      expect(() => {
        db.inTransaction(() => {
          db.deleteRecord(id)
          throw error
        })
      }).to.throw(error)
      expect(db.readRecord(id)).to.be.ok
    })
  })
})
