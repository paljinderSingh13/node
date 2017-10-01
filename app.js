var http = require('http');


var server = http.createServer(function(req, res) {
  res.writeHead(200);
  console.log('waheguru');

  res.end('Hello Http');
});
server.listen(8080);

