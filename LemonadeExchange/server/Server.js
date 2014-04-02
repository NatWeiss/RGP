
//
// A simple Node.js game server that:
// 1. Sends static files as requested.
// 2. Provides a basic API to game clients.
//
// Keep it running on your own host using [forever](http://blog.nodejitsu.com/keep-a-nodejs-server-up-with-forever/). Remember the -g option on install.
//
// Here's a [post](http://stackoverflow.com/a/14272874) about using SSL and some example code:
//
/*
var https = require("https");
var fs = require("fs");
var protocolHttps = https.createServer({
	key: fs.readFileSync("key.pem"),
	cert: fs.readFileSync("cert.pem")
}, server).listen(443);
*/

//
// ### Setup
//
var config = require("../js/ConfigServer"),
	express = require("express"),
	server = express(),
	protocolHttp = server.listen(config.serverPort || 8000),
	io = require("socket.io"),
	sockets = io.listen(protocolHttp),
	self = {};

console.log("Started server on port: " + config.serverPort);

//
// ###  Static Files
//
// Serve static files as requested.
//
server.use("/", express.static(__dirname + "/../proj.html5/"));
server.use("/lib/", express.static(__dirname + "/../lib/"));
server.use("/res/", express.static(__dirname + "/../res/"));
server.use("/js/", express.static(__dirname + "/../js/"));
server.get("/", function(req,res){res.sendfile("index.html");});

//
// ###  Public API
//
(function(){
	var i,
		exchangeRate = 10.0,
		minRate = 0.01,
		maxRate = 9999.99,
		multipliers = {
			drink: 1.5,
			give: 0.75,
			buy: 1.1,
			sell: 0.909
		},
		modifyExchangeRateRequest = function(req, res) {
			var components = req.url.split("/"),
				method = components.pop();
			exchangeRate *= multipliers[method];
			exchangeRate = Math.min(exchangeRate, maxRate);
			exchangeRate = Math.max(exchangeRate, minRate);
			console.log("[" + method + "] Exchange rate is now " + exchangeRate);
			res.send(exchangeRate + "");
		};

//
// ###  `api/exchange-rate`
//
// Returns the current exchange rate.
//
	server.get("/api/exchange-rate", function(req,res){
		res.send(exchangeRate + "");
	});
	
//
// ###  `api/...`
//
// Provide `api/drink`, `api/give`, `api/buy` and `api/sell`, all of which modify the current exchange rate.
//
	for (i in multipliers) {
		server.get("/api/" + i, modifyExchangeRateRequest);
	}
}());
