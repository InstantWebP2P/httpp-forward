// Simple http server to server PAC file
//
// Copyright (c) 2013 Tom Zhou<iwebpp@gmail.com>
//
var http = require('http');
var fs = require('fs');

var srv = http.createServer(function(req, res){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    fs.createReadStream(__dirname+'../pac/httpp.pac').pipe(res);
});

srv.listen(8888);
console.log('PAC http server listen on 127.0.0.1:8888');
