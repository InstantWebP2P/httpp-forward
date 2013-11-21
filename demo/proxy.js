var Proxy = require('../proxy');

var srv = new Proxy(function(err, proxy){
    if (err || !proxy) {
        console.log(err+',create proxy failed');
        return 
    }
    
    // start http forward proxy service
    var http = require('http');
    var pxySrv = http.createServer();
    
    pxySrv.on('request', proxy.httpProxy);
    pxySrv.on('connect', proxy.httpTunnel);
    
    pxySrv.listen(51868);
    console.log('Httpp forwar proxy server listen on port 51868');
});
