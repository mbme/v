import { expect } from 'chai'
import { serialize, parse, ENCODING } from './serializer'

describe('Serializer', () => {
  const buffer = Buffer.from('test file')
  const name = 'super text.json'
  const getFile = () => ({ name, data: buffer })

  it('should serialize', () => {
    const action = { name: 'TEST' }
    const files = [ getFile(), getFile() ]
    const expectedResult = '15 {"name":"TEST"}15 super text.json9 test file15 super text.json9 test file'
    expect(serialize(action, files).toString(ENCODING)).to.equal(expectedResult)
  })

  it('should parse action', () => {
    const action = {
      name: 'TEST',
      data: { x: 1 },
    }

    const result = parse(serialize(action, []))
    expect(result.files).to.be.empty
    expect(result.action).to.deep.equal(action)
  })

  it('should parse action with files', () => {
    const action = { name: 'TEST' }
    const files = [ getFile(), getFile() ]

    const result = parse(serialize(action, files))
    expect(result.action).to.deep.equal(action)
    expect(result.files).to.have.lengthOf(files.length)

    for (const file of result.files) {
      expect(file.name).to.equal(name)
      expect(file.data.equals(buffer)).to.be.true
    }
  })
})
