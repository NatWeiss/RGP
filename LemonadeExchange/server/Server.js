///
/// > See the `LICENSE` file for the license governing this code.
///

///
/// A simple Node.js game server that:
/// 1. Sends static files as requested.
/// 2. Provides a basic API to game clients.
///
/// Keep it running on your own host using [forever](http://blog.nodejitsu.com/keep-a-nodejs-server-up-with-forever/). Remember the -g option on install.
///
/// Here's a [post](http://stackoverflow.com/a/14272874) about using SSL and some example code:
///
/*
var https = require("https");
var fs = require("fs");
var protocolHttps = https.createServer({
	key: fs.readFileSync("key.pem"),
	cert: fs.readFileSync("cert.pem")
}, server).listen(443);
*/

///
/// ### Setup
///
var config = require("../Assets/ConfigServer"),
	express = require("express"),
	fs = require("fs"),
	path = require("path"),
	server = express(),
	port = config.serverPort || 8000,
	protocolHttp = server.listen(port),
	//io = require("socket.io"),
	//sockets = io.listen(protocolHttp),
	self = {};

console.log("Started server on port: " + config.serverPort);

///
/// ###  Static Files
///
/// Serve static files as requested.
///
server.use("/", express.static(__dirname + "/../Projects/html/"));
server.use("/project.json", express.static(__dirname + "/../project.json"));
server.use("/lib/", express.static(__dirname + "/../lib/"));
server.use("/Assets/", express.static(__dirname + "/../Assets/"));
server.get("/", function(req,res){
	res.sendfile("index.html");
});
server.get("/project.json", function(req,res){
	try {
		res.send(JSON.parse(fs.readFileSync(path.join(__dirname, "..", "project.json"))));
	} catch(e) {
		console.log("Error reading project.json");
	}
});

///
/// ###  Public API
///
(function(){
	var i,
		exchangeRate = 10.0,
		minRate = 0.01,
		maxRate = 999.99,
		multipliers = {
			drink: 1.15,
			give: .89,
			buy: 1.02,
			sell: .985
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

///
/// ###  api/exchange-rate
///
/// Returns the current exchange rate.
///
	server.get("/api/exchange-rate", function(req,res){
		res.send(exchangeRate + "");
	});
	
///
/// ###  api/...
///
/// Provide `api/drink`, `api/give`, `api/buy` and `api/sell`, all of which modify the current exchange rate.
///
	for (i in multipliers) {
		server.get("/api/" + i, modifyExchangeRateRequest);
	}
}());
