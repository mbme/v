import { test, before, after } from 'tools/test'
import getDB from './db'

let db
before(() => { db = getDB() })
after(() => db.close())

test('records', (assert) => {
  const type = 'type'
  const name = 'name'
  const data = 'data'

  const id = db.createRecord(type, name, data)

  // list records
  assert.equal(db.listRecords('12312313131').length, 0)
  assert.equal(db.listRecords(type).length, 1)

  // read record
  {
    const record = db.readRecord(id)
    assert.deepEqual(record, { id, type, name, data, updatedTs: record.updatedTs })
  }

  // update record
  {
    const newName = 'newName'
    const newData = 'newData'
    assert.equal(db.updateRecord(id, newName, newData), true)

    const record = db.readRecord(id)
    assert.deepEqual(record, { id, type, name: newName, data: newData, updatedTs: record.updatedTs })
  }

  // delete record
  assert.equal(db.deleteRecord(id), true)
  assert.equal(db.readRecord(id), undefined)
  assert.equal(db.listRecords(type).length, 0)
})

test('files', (assert) => {
  const name = 'some file.json'
  const data = Buffer.from('test file content')

  let counter = 0
  const nextId = () => { counter += 1; return `${counter}` }

  { // add files
    const id = nextId()
    assert.equal(db.isKnownFile(id), false)

    db.addFiles([ { id, name, data } ])
    const file = db.readFile(id)
    assert.equal(file.name, name)
    assert.equal(data.equals(file.data), true)
    assert.equal(db.isKnownFile(id), true)
  }

  { // read file
    const id = nextId()
    db.addFiles([ { id, name, data } ])

    const file = db.readFile(id)
    assert.equal(file.name, name)
    assert.equal(file.data.equals(data), true)
  }

  // remove unused files
  assert.equal(db.removeUnusedFiles(), 2)

  { // connections
    const recordId = db.createRecord('type', '', '')

    const fileId = nextId()
    db.addFiles([ { id: fileId, name, data } ])
    db.addConnections(recordId, [ fileId ])

    assert.equal(db.removeUnusedFiles(), 0)
    assert.equal(db.isKnownFile(fileId), true)

    assert.equal(db.removeConnections(recordId), 1)
    assert.equal(db.removeUnusedFiles(), 1)
    assert.equal(db.isKnownFile(fileId), false)
  }
})

test('Transaction', (assert) => {
  { // commit
    const id = db.createRecord('type', '', '')

    assert.equal(db.inTransaction(() => {
      db.deleteRecord(id)
      return id
    }), id)

    assert.equal(db.readRecord(id), undefined)
  }

  { // rollback
    const id = db.createRecord('type', '', '')
    const error = new Error('test')

    assert.throws(() => {
      db.inTransaction(() => {
        db.deleteRecord(id)
        throw error
      })
    }, error)
    assert.equal(!!db.readRecord(id), true)
  }
})
