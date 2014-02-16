
var i,
	express = require('express'),
	server = express(),
	app = server.listen(8000),
	io = require('socket.io'),
	sockets = io.listen(app),
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

// serve static files
server.use('/', express.static(__dirname + '/../'));
server.get('/', function(req,res){
	res.sendfile('index.html');
});

// public api: get exchange rate
server.get("/api/exchange-rate", function(req,res){
	res.send(exchangeRate + "");
});

// public api: modify exchange rate
for (i in multipliers) {
	server.get("/api/" + i, modifyExchangeRateRequest);
}
