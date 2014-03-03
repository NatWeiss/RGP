
var module = (module ? module.exports : (App ? App : {}));
/*if (typeof module !== "undefined") {
	module = module.exports;
} else if (typeof App !== "undefined") {
	module = App;
} else {
	module = {};
}*/

if (typeof cc !== "undefined") cc.log("WHEEEE");

module.serverPort = 8000;
