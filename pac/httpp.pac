// Fill httpp enabled website in white list
var whitelist = {
    // like below
    // 'host': 'web site descriptions'
};

function FindProxyForURL(url, host) {
    var autoproxy = 'PROXY 127.0.0.1:51868'; // change to your local proxy server port
    
    console.log('proxy for %s, %s', url, host);
    if (host && (host in whitelist)) {
        return autoproxy;
    } else {
        return "DIRECT";
    }
}
