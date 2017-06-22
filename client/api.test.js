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
    console.error('STOPPING');
    server.close(function () {
      console.error('STOPPED');
      done()
    })
  })

  describe('api', () => {
    it('should create record', async () => {
      try {
        const response = await api.createRecord('note', 'name', 'some data')
        console.error(response.toString())
      } catch(e) {
        console.error(e.toString())
      }
    })
  })
})
