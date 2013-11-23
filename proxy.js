// Copyright (c) 2013 Tom Zhou<iwebpp@gmail.com>

var URL = require('url'),
    NET = require('net'),
    UDT = require('udt'),
    HTTP = require('http'),
    HTTPS = require('https'),
    HTTPP = require('httpp');

// Debug level
var Debug = 0;

// Proxy class
// - fn: callback to pass proxy informations
var Proxy = module.exports = function(fn){ 
    var self = this;
       
    if (!(this instanceof Proxy)) return new Proxy(fn);
    		    
    // 1.
    // http tunnel for CONNECT method
    var httpTunnel = function(req, socket, head){
        var urls    = URL.parse('https://'+req.url, true, true);
        var srvip   = urls.hostname;
        var srvport = urls.port || 443;
        
        // probe httpp capacity
        self.probeHttpp('https://'+req.url, function(err, cap){
            if (err) {
                console.log(err + ",https tunnel proxy to " + req.url + " failed");
                socket.end();
                return;
            } else if (cap && (cap.proto === 'httpp')) {
                if (Debug) console.log('Detected httpp, '+JSON.stringify(cap)+' for http://'+req.url);
                var altport = cap.port;
                
                if (Debug) console.log('https tunnel proxy, UDT connect to %s:%d', srvip, altport);
                var srvSocket = UDT.connect(altport, srvip, function() {
                    if (Debug) console.log('httpp tunnel proxy, UDT got connected!');   
                    
                    ///srvSocket.write(head); 
				    socket.pipe(srvSocket);
				        
				    socket.write('HTTP/1.1 200 Connection Established\r\n' +
				                 'Proxy-agent: Node-Proxy\r\n' +
				                 '\r\n');
				    srvSocket.pipe(socket);
                });
  
				srvSocket.setNoDelay(true);
				    
				srvSocket.on('error', function(e) {
				    console.log("httpp tunnel proxy to UDT " + req.url + ", socket error: " + e);
				    socket.end();
				});
            } 
            ///else if (proto === 'quic') {
                // TBD...
            ///} 
            else {
            	if (Debug) console.log('https tunnel proxy, NET connect to %s:%d', srvip, srvport);
                var srvSocket = NET.connect(srvport, srvip, function() {
                    if (Debug) console.log('https tunnel proxy, NET got connected!');   
                    
                    ///srvSocket.write(head); 
				    socket.pipe(srvSocket);
				        
				    socket.write('HTTP/1.1 200 Connection Established\r\n' +
				                 'Proxy-agent: Node-Proxy\r\n' +
				                 '\r\n');
				    srvSocket.pipe(socket);
                });
  
				srvSocket.setNoDelay(true);
				    
				srvSocket.on('error', function(e) {
				    console.log("http tunnel proxy to NET " + req.url + ", socket error: " + e);
				    socket.end();
				});
            }
        });
    }
    	    
    // 2.
    // http proxy
    function httpProxy(req, res){
	    function resErr(err){
	        try {
		        res.writeHead(500);
				res.end(err);
			} catch (e) {
			    console.log('res.end exception '+e);
			}
	    }
	    
	    var hosts   = req.headers.host.split(':');
        var srvip   = hosts[0];
        var srvport = hosts[1] || 80;
        var path    = req.url.match(/^(http:)/gi)? URL.parse(req.url).path : req.url;
        
        if (Debug) console.log('proxy to '+'http://'+srvip+':'+srvport+path+', headers:'+JSON.stringify(req.headers));
        
        // probe httpp capacity
        self.probeHttpp('http://'+srvip+':'+srvport+path, function(err, cap){
            if (err) {
                console.log(err + ",http tunnel proxy to " + req.url + " failed");
                resErr(err + ",http tunnel proxy to " + req.url + " failed");
                return;
            } else if (cap && (cap.proto === 'httpp')) {
                if (Debug) console.log('Detected httpp, '+JSON.stringify(cap)+' for '+'http://'+srvip+':'+srvport+path);
                var altport = cap.port;
                
                if (Debug) console.log('httpp tunnel proxy, connect to %s:%d', srvip, altport);
                var srvSocket = UDT.connect(altport, srvip, function() {
                    if (Debug) console.log('httpp tunnel proxy, UDT got connected!');   
                    
				    // request on tunnel connection
				    var toptions = {
					              method: req.method,
					                path: path,
					               agent: false,
					               
					             // set headers
					             headers: req.headers,
					             
					    // pass rsocket which's request on           
					    createConnection: function(port, host, options){
					        return srvSocket
					    } 
			        };
					
					var treq = HTTPP.request(toptions, function(tres){
					    if (Debug) console.log('tunnel proxy, UDT got response, headers:'+JSON.stringify(tres.headers));
					    
					    try {
						    // set headers
						    Object.keys(tres.headers).forEach(function (key) {
						      res.setHeader(key, tres.headers[key]);
						    });
						    res.writeHead(tres.statusCode);
						    
						    tres.pipe(res);
						    
						    tres.on('error', function(e) {
					            console.log("tunnel proxy, UDT tunnel response error: " + e);					        
					            resErr("tunnel proxy, UDT tunnel response error: " + e);
				            });
			            } catch (e) {
			                console.log('Ignore HTTPP.request '+e);
			            }
					});
					treq.on('error', function(e) {
				        console.log("tunnel proxy, UDT tunnel request error: " + e);					        
				        resErr("tunnel proxy, UDT tunnel request error: " + e);
			        });
					req.pipe(treq);
					req.on('error', resErr);
					req.on('aborted', function () {
					    treq.abort();
					});
					if (req.trailers) {
					    treq.end();
					}
                });
  					    
				srvSocket.on('error', function(e) {
				    console.log("http tunnel proxy to UDT " + req.url + ", socket error: " + e);
				    socket.end();
				});
            } 
            ///else if (proto === 'quic') {
                // TBD...
            ///} 
            else {
            	if (Debug) console.log('http tunnel proxy, connect to %s:%d', srvip, srvport);
            	
                var srvSocket = NET.connect(srvport, srvip, function() {
                    if (Debug) console.log('http tunnel proxy, NET got connected!');   
                    
				    // request on tunnel connection
				    var toptions = {
					              method: req.method,
					                path: path,
					               agent: false,
					               
					             // set headers
					             headers: req.headers,
					             
					    // pass rsocket which's request on           
					    createConnection: function(port, host, options){
					        return srvSocket
					    } 
			        };
					
					var treq = HTTP.request(toptions, function(tres){
					    if (Debug) console.log('tunnel proxy, NET got response, headers:'+JSON.stringify(tres.headers));
					    
					    try {
						    // set headers
						    Object.keys(tres.headers).forEach(function (key) {
						      res.setHeader(key, tres.headers[key]);
						    });
						    res.writeHead(tres.statusCode);
						    
						    tres.pipe(res);
						    
						    tres.on('error', function(e) {
					            console.log("tunnel proxy, NET tunnel response error: " + e);					        
					            resErr("tunnel proxy, NET tunnel response error: " + e);
				            });
			            } catch (e) {
			                console.log('Ignore HTTP.request '+e);
			            }
					});
					treq.on('error', function(e) {
				        console.log("tunnel proxy, NET tunnel request error: " + e);					        
				        resErr("tunnel proxy, NET tunnel request error: " + e);
			        });
					req.pipe(treq);
					req.on('error', resErr);
					req.on('aborted', function () {
					    treq.abort();
					});
					if (req.trailers) {
					    treq.end();
					}
                });
  
				srvSocket.setNoDelay(true);
				    
				srvSocket.on('error', function(e) {
				    console.log("http tunnel proxy to NET " + req.url + ", socket error: " + e);
				    resErr("http tunnel proxy to NET " + req.url + ", socket error: " + e);
				});
            }
        });	    
    }
    
    // 3.
    // pass forwarder App
    fn(null, {httpTunnel: httpTunnel, httpProxy: httpProxy});
};

// probe httpp capability
// urle like http(s)://host:port/
Proxy.prototype.probeHttpp = function(urle, fn){
    var self     = this;
    var urls     = URL.parse(urle, true, true);
    var pref     = urle.split('://')[0];
    var hostname = urls.hostname;
    var port     = urls.port || ((pref === 'https') ? 443 : 80);
    var path     = urls.path;
    var proto    = (pref === 'https') ? HTTPS : HTTP;
    var host     = hostname + ':' + port;
    
    // probe cache
    self.probeCache = self.probeCache || {};
    
    if (host in self.probeCache) {
        fn(null, self.probeCache[host]);
        return self;
    }
    
    // ask destination site about httpp capacity
    var options = {
	        port: port,
	    hostname: hostname,
	      method: 'GET',
	        path: path,
    };
	
	var req = proto.request(options);
	req.end();
	req.on('error', function(e) {
        console.log(urle + " request error: " + e);					        
        fn(urle + " request error: " + e);
    });		
    req.on('response', function(res){
        // check httpp capacity, like alternate-protocol: httpp:80
        if (Debug) console.log('res.headers: '+JSON.stringify(res.headers));
        
        var capacity = null;
        
        if ('alternate-protocol' in res.headers) {
            // check httpp
            var althttpp = /httpp:[0-9]+/gi;
            var altproto = res.headers['alternate-protocol'].match(althttpp);
            
            if (altproto && altproto[0]){
                var altport = parseInt(altproto[0].split(':')[1]);
                capacity = {proto: 'httpp', port: altport};
                
                console.log('Detected httpp on '+urle);
            }
            
            // check quic, TBD...
        }
        
        // cache it
        self.probeCache[host] = capacity;
        
        fn(null, self.probeCache[host]);
    });	    
    
    return self;
};
