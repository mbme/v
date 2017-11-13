import server from 'server'
import genData from './gen-data'

const port = 8080

server(port).then(() => {
  console.log(`api server http://localhost:${port}`)
  return genData(port, 30)
})
