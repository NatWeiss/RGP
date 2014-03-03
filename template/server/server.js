/*

Using forever:

http://blog.nodejitsu.com/keep-a-nodejs-server-up-with-forever/

(Remember the -g option on install)


SSL:

http://stackoverflow.com/a/14272874

var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');

// This line is from the Node.js HTTPS documentation.
var options = {
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
};

// Create a service (the app object is just a callback).
var app = express();

// Create an HTTP service.
http.createServer(app).listen(80);
// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(443);


*/


var config = require('../js/ConfigServer'),
	express = require('express'),
	server = express(),
	app = server.listen(config.serverPort || 8000),
	io = require('socket.io'),
	sockets = io.listen(app),
	module = {};

console.log("Started server on port: " + config.serverPort);

// serve static files
server.use('/', express.static(__dirname + '/../proj.html5/'));
server.use('/lib/', express.static(__dirname + '/../lib/'));
server.use('/res/', express.static(__dirname + '/../res/'));
server.use('/js/', express.static(__dirname + '/../js/'));
server.get('/', function(req,res){
	res.sendfile('index.html');
});

// public api: get counter
module.counter = 0;
server.get("/api/counter", function(req,res){
	module.counter = module.counter + 1;
	res.send(module.counter + "");
});
