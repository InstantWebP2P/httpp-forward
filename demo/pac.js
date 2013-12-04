// Simple http server to serve PAC file
//
// Copyright (c) 2013 Tom Zhou<iwebpp@gmail.com>
//
var http = require('http');
var fs = require('fs');

var srv = http.createServer(function(req, res){
    res.writeHead(200, {'Content-Type': 'application/x-ns-proxy-autoconfig'});
    res.write(fs.readFileSync(__dirname+'/../pac/httpp.pac'));
    res.end();
});

srv.listen(8888);
console.log('PAC http server listen on 127.0.0.1:8888');
