var http = require('http')
var formidable = require('formidable')

var { handleAction } = require('./server')

const PORT = 8080

function handleRequest(req, res){
  handleAction('some action')

  if (req.url == '/api/files' && req.method.toLowerCase() == 'post') {
    // parse a file upload
    var form = new formidable.IncomingForm()

    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'})
      res.write('received upload:\n\n', files)
      // res.end(util.inspect({fields: fields, files: files}))
    })

    return
  }

  if (req.url == '/api/files/123' && req.method.toLowerCase() == 'get') {
    // serve file

    return
  }

  if (req.url == '/api' && req.method.toLowerCase() == 'post') {
    // handle api request

    return
  }

  // write static files
}

var server = http.createServer(handleRequest)

server.listen(PORT, function(){
  console.log('Server listening on: http://localhost:%s', PORT)
})

server.on('error', (error) => {
  console.error(error)
})
