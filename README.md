httpp-forward
=============

Forward web browser http traffic over httpp/udp 


### Features

* forward http traffic over httpp/udp
* high udp data transfer performance
* easy setup as local forward proxy

### Install
* npm install httpp-forward, or git clone https://github.com/InstantWebP2P/httpp-forward.git && cd httpp-forward && npm install
* httpp-forward depend on node-httpp, please npm install httpp-binary.if the binary didn't work, just build it from source:
  https://github.com/InstantWebP2P/node-httpp

### Usage/API
* for httpp-forward demo, refer to demo/proxy.js. to start it, just node demo/proxy.js
* for httpp-forward utility, refer to bin/httpp-forward. to start it, just node bin/httpp-forward --port xxx
* httpp-forward is designed to work with connect-httpp enabled server, https://github.com/InstantWebP2P/connect-httpp

<br/>
### License

(The MIT License)

Copyright (c) 2012-2013 Tom Zhou(iwebpp@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
