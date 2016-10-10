import { expect } from 'chai'
import * as api from 'api-client'

describe('GET /api/records/notes', () => {
  it('should return an array', () => {
    return api.listNotes().then(
      (list) => {
        expect(list).to.be.an('array')
      }
    )
  })
})
