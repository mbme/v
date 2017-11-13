import { test } from 'tools/test'
import { serialize, parse, ENCODING } from './protocol'

const buffer = Buffer.from('test file')
const name = 'super text.json'
const getFile = () => ({ name, data: buffer })

test('serialization', (assert) => {
  const action = { name: 'TEST' }
  const files = [ getFile(), getFile() ]
  assert.matchSnapshot(serialize(action, files).toString(ENCODING))
})

test('deserialization', (assert) => {
  { // parse action
    const action = {
      name: 'TEST',
      data: { x: 1 },
    }

    const result = parse(serialize(action, []))
    assert.equal(result.files.length, 0)
    assert.deepEqual(result.action, action)
  }

  { // parse action with files
    const action = { name: 'TEST' }
    const files = [ getFile(), getFile() ]

    const result = parse(serialize(action, files))
    assert.deepEqual(result.action, action)
    assert.equal(result.files.length, files.length)

    for (const file of result.files) {
      assert.equal(file.name, name)
      assert.equal(file.data.equals(buffer), true)
    }
  }
})