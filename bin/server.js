import server from 'server'

const port = 8080
server(port).then(() => console.log(`Server listening on http://localhost:${port}`))
