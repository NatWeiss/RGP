
//
// The main App object is a singleton providing boot code, main functions, and other commonly-used, globally-accessible functionality.

// 1. All code in this file is applicable to any game project in general.
// 2. If you need to extend the App object with project-specific code, use [HelloJavascript.js](HelloJavascript.html).
//

//
// ###  App
//
// Get or create the App object.
//

var App = App || {};

//
// ###  App.getInitialScene
//
// Return the initial Scene class.
//
App.getInitialScene = function() {
	return SceneHello;
};

//
// ###  App.isHtml5
//
// Return true if the app is running in HTML5 mode.
//
App.isHtml5 = function() {
	if (typeof this._isHtml5 === "undefined") {
		this._isHtml5 = cc.sys.isNative ? false : true;
	}
	return this._isHtml5;
};

//
// ###  App.getTargetFrameRate
//
// Return the target frame rate to use. Scale back in HTML5 mode to save a CPU fan somewhere.
//
App.getTargetFrameRate = function() {
	return this.isHtml5() ? 30 : 60;
};

//
// ###  App.rand
//
// Return a random integer between 0 and the given value.
//
App.rand = function(mod) {
	var r = Math.random();
	if (typeof mod !== 'undefined') {
		r *= 0xffffff;
		r = parseInt(r);
		r %= mod;
	}
	return r;
};

//
// ###  App.getWinSize
//
// Return the current size of the window or screen.
//
App.getWinSize = function() {
	var size = cc.director.getWinSizeInPixels();
	if (typeof this._winSize === 'undefined' || (size.width && size.height)) {
		this._winSize = size;
	}
	return this._winSize;
};

//
// ###  App.getResourceDir
//
// Return the resource directory (SD, HD or HDR) for this device's resolution.
//
App.getResourceDir = function() {
	if (typeof this._resourceDir === "undefined") {
		var self = this,
			winSize = this.getWinSize(),
			maxDimension = Math.max(winSize.width, winSize.height),
			minDimension = Math.min(winSize.width, winSize.height),
			setResourceDir = function(dir, contentScaleFactor, scaleFactor){
				self._resourceDir = dir;
				self._contentScaleFactor = contentScaleFactor;
				self._scaleFactor = scaleFactor;
			};
		
		if (this.isHtml5()) {
			if (minDimension >= 600) {
				setResourceDir("res/hd", 1, 1);
			} else {
				setResourceDir("res/sd", 1, .5);
			}
		} else {
			if (maxDimension > 1600) {
				setResourceDir("res/hdr", 1, 2);
			} else if (maxDimension >= 960) {
				setResourceDir("res/hd", 1, 1);
			} else {
				setResourceDir("res/sd", 1, .5);
			}
		}
	}

	return this._resourceDir;
};

//
// ###  App.scale
//
// Scale a number by a factor based on the screen size.
//
App.scale = function(floatValue) {
	return floatValue * this._scaleFactor;
};

//
// ###  App.centralize
//
// Return a point relative to the center of the screen and scaled.
//
App.centralize = function(x, y) {
	var winSize = this.getWinSize();
	return cc.p(this.scale(x) + winSize.width * .5,
		this.scale(y) + winSize.height * .5);
};

//
// ###  App.getResourcesToPreload
//
// Return an array of files to preload.
//
App.getResourcesToPreload = function() {
	var dir = this.getResourceDir(),
		files = this.getConfig("preload"),
		ret = [],
		i;

	if (files) {
		for (i = 0; i < files.length; i += 1) {
			if (files[i] && files[i].length) {
				ret[i] = dir + "/" + files[i];
			}
		}
	} else {
		cc.log("Missing App.config.preload array");
	}
	
	return ret;
};

//
// ###  App.loadResources
//
// Setup and load resources.
//
App.loadResources = function() {
	var sheets = App.getConfig("spritesheets"),
		sheet,
		i;

	cc.loader.resPath = this.getResourceDir();
	cc.director.setContentScaleFactor(this._contentScaleFactor);

	for (i = 0; i < sheets.length; i += 1) {
		sheet = cc.loader.getUrl(sheets[i]);
		cc.log("Loading spritesheet: " + sheet);
		cc.spriteFrameCache.addSpriteFrames(sheet);
	}
};

App.getConfig = function(key) {
	return this.config[key];
};

App.localizeCurrency = function(amount) {
	return "$" + parseFloat(amount).toFixed(2);
};

App.getLanguageCode = function() {
	var strings;
	
	if (typeof this._language === "undefined") {
		this._language = cc.sys.language;

		strings = this.getConfig("strings");
		if (strings && typeof strings[this._language] === "undefined") {
			cc.log("Don't have strings for language: " + this._language);
			this._language = "en";
		}
	}
	
	return this._language;
};

App.getLocalizedString = function(key) {
	var strings,
		code = this.getLanguageCode();
	
	strings = this.getConfig("strings")[code];
	if (typeof strings[key] !== "undefined") {
		return strings[key];
	}
	if (key && key.length) {
		cc.log("Couldn't find string[" + code + "][" + key + "]");
	}
	return "";
};

App.getRunningLayer = function() {
	var node = cc.director.getRunningScene();
	if (node) {
		if (node.layer) {
			node = node.layer;
		}
	}
	return node;
};

App.isFullscreenAvailable = function() {
	return this.isHtml5(); // or desktop...
};

App.isFullscreenEnabled = function() {
	return this._fullscreenEnabled ? true : false;
};

App.setFullscreenEnabled = function(enabled) {
	if (this.isHtml5()) {
		if (this.isFullscreenEnabled()) {
			this.runPrefixMethod(document, "CancelFullScreen");
			//cc.log("Cancelling fullscreen");
		}
		else {
			this.runPrefixMethod(document.getElementById("gameBody"), "RequestFullScreen");
			//cc.log("Requesting fullscreen");
		}
	}

	this._fullscreenEnabled = enabled ? true : false;
	//cc.log("Is fullscreen? " + this.isFullscreenEnabled());
};

App.toggleFullscreenEnabled = function() {
	this.setFullscreenEnabled(!this.isFullscreenEnabled());
};

App.runPrefixMethod = function(obj, method) {
	// from: http://www.sitepoint.com/html5-full-screen-api/
	var pfx = ["webkit", "moz", "ms", "o", ""];
	var p = 0, m, t;
	while (p < pfx.length && !obj[m]) {
		m = method;
		if (pfx[p] == "") {
			m = m.substr(0,1).toLowerCase() + m.substr(1);
		}
		m = pfx[p] + m;
		t = typeof obj[m];
		if (t != "undefined") {
			pfx = [pfx[p]];
			return (t == "function" ? obj[m]() : obj[m]);
		}
		p++;
	}
};

App.isInitialLaunch = function() {
	// use soundEnabled as an indicator of if we have previously launched the app
	var v = cc.sys.localStorage.getItem("soundEnabled");
	return (typeof v === "undefined" || v === null || v === "");
};

App.loadSoundEnabled = function() {
	this._soundEnabled = cc.sys.localStorage.getItem("soundEnabled");
	//cc.log("Loaded sound enabled: " + this._soundEnabled);
	if (this._soundEnabled === null || this._soundEnabled === "") {
		this.enableSound(true);
	}
	this._soundEnabled = (this._soundEnabled === "true" || this._soundEnabled === true) ? true : false;
	//cc.log("Loaded sound enabled: " + this._soundEnabled);
};

App.enableSound = function(enabled) {
	this._soundEnabled = enabled ? true : false;
	cc.sys.localStorage.setItem("soundEnabled", this._soundEnabled);
	if (!this.isSoundEnabled()) {
		cc.audioEngine.stopMusic();
	}
};

App.toggleSoundEnabled = function() {
	this.enableSound(!this.isSoundEnabled());
};

App.isSoundEnabled = function() {
	return this._soundEnabled ? true : false;
};

App.playEffect = function(filename) {
	if (this.isSoundEnabled()) {
		cc.audioEngine.playEffect(filename);
	}
};

App.playMusic = function(filename) {
	if (this.isSoundEnabled()) {
		cc.audioEngine.playMusic(filename);
	}
};

App.getHttpQueryParams = function() {
	var loc,
		i,
		len,
		query,
		aux;
	
	if (typeof this._GET === "undefined") {
		this._GET = {};
		loc = window.location.toString() || "";
		
		if (loc.indexOf("?") !== -1) {
			query = loc.replace(/^.*?\?/, "").split("&");
			len = query.length;

			for (i = 0; i < len; i += 1) {
				aux = decodeURIComponent(query[i]).split("=");
				this._GET[aux[0]] = aux[1];
			}
		}
	}
	
	return this._GET;
};

App.alert = function(msg) {
	if(typeof alert === "function") {
		alert(msg);
	} else {
		cc.log(msg);
	}
};

App.callRunningLayer = function(method, param1, param2, param3) {
	scene = cc.director.getRunningScene();
	if (scene && scene.layer && scene.layer[method]) {
		scene.layer[method](param1, param2, param3);
	}
};

App.loadAnalyticsPlugin = function() {
	var self = this,
		flurryApiKey,
		flurry;

	this._loadAnalyticsTries = (this._loadAnalyticsTries || 0);
	
	if (typeof FlurryAgent !== "undefined" && typeof App.config !== "undefined" && !this._initializedFlurry) {
		this._initializedFlurry = true;
		//cc.log("Loaded flurry after " + this._loadAnalyticsTries + " tries");
		flurryApiKey = App.getConfig("flurry-api-key");
		if (flurryApiKey) {
			flurry = plugin.PluginManager.getInstance().loadPlugin("AnalyticsFlurry");
			if (flurry) {
				flurry.startSession(flurryApiKey);
			}
		} else {
			cc.log("Flurry: API key has not been set");
		}
	} else {
		if (this._loadAnalyticsTries < 10) {
			setTimeout(function(){
				self.loadAnalyticsPlugin();
			}, 250);
		}
	}

	this._loadAnalyticsTries = this._loadAnalyticsTries + 1;
};

App.getAdsPlugin = function() {
	var name;
	
	if (typeof this._adsPlugin === "undefined" && typeof plugin !== "undefined") {
		name = this.getConfig("ads-plugin-name");

		// try to load plugin
		this._adsPlugin = plugin.PluginManager.getInstance().loadPlugin(name);
		
		// fallback trying for manual js load
		// this happens for any platform that doesn't have a c++ plugin with js bindings
		if (this._adsPlugin === null) {
			this._adsPlugin = new plugin[name]();
			this._adsPlugin.init();
		}
	}

	return this._adsPlugin;
};

App.loadAdsPlugin = function() {
	var plugin = this.getAdsPlugin(),
		debug = this.getConfig("ads-plugin-debug");

	if (typeof plugin !== 'undefined') {
		if (debug) {
			plugin.setDebugMode(debug);
			cc.log("Ads plugin: " + plugin);
		}

		plugin.configDeveloperInfo({
			apiKey: this.getConfig("ads-plugin-api-key"),
			mode: this.getConfig("ads-plugin-mode")
		});
	}
};

App.getSocialPlugin = function() {
	var name;
	
	if (typeof this._socialPlugin === "undefined") {
		name = this.getConfig("social-plugin-name");
		if (plugin[name]) {
			this._socialPlugin = new plugin[name]();
			this._socialPlugin.setDebugMode(this.getConfig("social-plugin-debug"));
			this._socialPlugin.init();
		} /*else {
			this._socialPlugin = {
				isLoggedIn: function() {return true;},
				isCanvasMode: function() {return false;},
				getPlayerName: function() {return "Anonymous";},
				setDebugMode: function() {},
				configDeveloperInfo: function() {},
				buy: function() {},
				login: function() {},
				logout: function() {},
				getPlayerImageUrl: function() {},
				getPlayerFirstName: function() {},
				getRandomFriendId: function() {}
			};
		}*/
	}

	return this._socialPlugin;
};

App.loadSocialPlugin = function() {
	var plugin = this.getSocialPlugin();

	if (typeof plugin !== "undefined") {
		plugin.configDeveloperInfo(App.getConfig("social-plugin-init"));
	}
};

App.loadEconomyPlugin = function() {
	var config = App.getConfig("economy-plugin-init");
	
	if (Soomla.CCSoomlaNdkBridge.setDebug) {
		Soomla.CCSoomlaNdkBridge.setDebug(App.getConfig("economy-plugin-debug"));
	}

	if (config && config.soomSec && config.customSecret) {
		Soomla.StoreController.createShared(App.getStoreAssets(), config);

		Soomla.CCSoomlaNdkBridge.buy = function(productId, successCallback, failureCallback) {
			var social = App.getSocialPlugin();
			if (social && social.isCanvasMode()) {
				social.buy(productId, successCallback, failureCallback);
			}
			else {
				App.alert("Please play within Facebook to enable purchasing.");
				Soomla.CCSoomlaNdkBridge.onPaymentComplete();
			}
		};

		Soomla.CCSoomlaNdkBridge.onCurrencyUpdate = function() {
			App.getRunningLayer().onCurrencyUpdate();
		};

		Soomla.CCSoomlaNdkBridge.onPaymentComplete = function() {
			App.getRunningLayer().onPaymentComplete();
		};
	} else {
		cc.log("Soomla: Secret keys have not been set");
	}
};

App.giveItem = function(itemId, amount) {
	if (amount < 0) {
		Soomla.storeInventory.takeItem(itemId, Math.abs(amount));
	} else {
		Soomla.storeInventory.giveItem(itemId, amount);
	}
};

App.onInitialLaunch = function() {
	// set initial balances
	var i,
		itemId,
		balance,
		initialBalances = App.getConfig("economy-plugin-initial-balances"),
		currencies,
		len = 0,
		allZero = true;
	
	if (Soomla && Soomla.storeInfo) {
		currencies = Soomla.storeInfo.getVirtualCurrencies();
		len = currencies.length || 0;
	}

	// determine if inventory is all at zero
	for (i = 0; i < len; i += 1) {
		itemId = currencies[i].itemId;
		balance = Soomla.storeInventory.getItemBalance(itemId);
		if (balance > 0) {
			cc.log("User has " + balance + " of " + itemId);
			allZero = false;
			break;
		}
	}
	
	// set initial balances
	if (allZero) {
		for (i = 0; i < len; i += 1) {
			itemId = currencies[i].itemId;
			balance = (initialBalances ? initialBalances[itemId] : 0);
			cc.log("Setting initial balance " + balance + " for " + itemId);
			Soomla.storeInventory.giveItem(itemId, balance);
		}
	}
};

App.requestUrl = function(url, callback, binary) {
	var x,
		loc,
		pos;
	if (XMLHttpRequest) {
		x = new XMLHttpRequest();
	} else {
		x = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	if (url.indexOf("://") <= 0) {
		cc.log("window.location = " + window.location);
		loc = window.location.toString() || "";
		pos = loc.indexOf("?");
		if (pos > 0) {
			loc = loc.substring(0, pos);
		}
		url = loc + url;
	}
	cc.log("Requesting URL: " + url);

	if (x != null) {
		if (!binary && x.overrideMimeType) {
			x.overrideMimeType("text/xml");
		}

		// callback
		x.onreadystatechange = function () {
			if (x.readyState == 4) { // 4 == done
				var res = (binary ? x.response : x.responseText);
				callback(res || "", x.statusText);
				if (res) {
					x = null;
				}
			}
		};

		// request
		x.open("GET", url, true);
		if (binary) {
			x.responseType = "arraybuffer";
		}
		x.send(null);
	} else {
		throw "Your browser does not support XMLHTTPRequest.";
	}
};

App.loadImage = function(url, callback) {
	if (url.indexOf("://") == 0) {
		return;
	}
	
	// load image the cocos2d-html5 way
	if (typeof Image !== "undefined") {
		var image = new Image();
		//image.crossOrigin = "Anonymous";
		image.src = url;
		//cc.log("Loading image: " + url);
		image.addEventListener("load", function(){
			cc.textureCache.cacheImage(url, image);
			this.removeEventListener("load", arguments.callee, false);
			if (typeof callback === "function") {
				callback();
			}
		}, false);
	// load image from raw file data the cocos2d-x way
	} else {
		//cc.log("Loading image from raw data: " + url);
		this.requestUrl(url, function(response, status) {
			var bytes = new Uint8Array(response);
			App.addImageData(url, bytes);
			if (typeof callback === "function") {
				callback();
			}
		}, true);
	}
};

App.bootHtml5 = function() {
	var d = document;
/*	var c = {
		COCOS2D_DEBUG: 2, // 0 to turn debug off, 1 for basic debug, and 2 for full debug
		box2d: false,
		chipmunk: false,
		showFPS: this.showFPS,
		frameRate: this.getTargetFrameRate(),
		loadExtension: true,
		loadPluginx: true,
		renderMode: 0, // 0 (default), 1 (Canvas only), 2 (WebGL only)
		tag: "gameCanvas" // the dom element to run cocos2d on
	};
	
	if (typeof this.singleEngineFile !== "undefined" && this.singleEngineFile.length) {
		c.SingleEngineFile = this.singleEngineFile;
		c.appFiles = [];
	} else {
		c.engineDir = "lib/cocos2d-html5/cocos2d/";
		c.appFiles = this.getJSFiles();
	}

	// require canvas element
	if (!d.createElement('canvas').getContext) {
		var s = d.createElement('div');
		s.innerHTML = '<h2>Your browser does not support HTML5 canvas!</h2>' +
			'<p>Google Chrome is a browser that combines a minimal design with sophisticated technology to make the web faster, safer, and easier.Click the logo to download.</p>' +
			'<a href="http://www.google.com/chrome" target="_blank"><img src="http://www.google.com/intl/zh-CN/chrome/assets/common/images/chrome_logo_2x.png" border="0"/></a>';
		var p = d.getElementById(c.tag).parentNode;
		p.style.background = 'none';
		p.style.border = 'none';
		p.insertBefore(s, d.getElementById(c.tag));
		d.body.style.background = '#ffffff';
		return;
	}

	// load cocos2d
	window.addEventListener('DOMContentLoaded', function() {
		this.removeEventListener('DOMContentLoaded', arguments.callee, false);
		var s = d.createElement('script');
		if (c.SingleEngineFile && !c.engineDir) {
			s.src = c.SingleEngineFile;
		}
		else if (c.engineDir && !c.SingleEngineFile) {
			s.src = c.engineDir + 'jsloader.js';
		}
		else {
			alert('You must specify either the single engine file OR the engine directory in "cocos2d.js"');
		}

		document.ccConfig = c;
		s.id = 'cocos2d-html5';
		d.body.appendChild(s);
	});
*/
};

App.bootX = function(global) {
	//require("jsb.js");
	//require("jsb_pluginx.js");
	//require("jsb_pluginx_protocols_auto_api.js");
	//require("jsb_cocos2dx_auto_api.js");

	global.plugin = global.plugin || {};
	if (!global.plugin.PluginManager) {
		global.plugin.PluginManager = {getInstance:function(){return {loadPlugin:function(){}}}};
	}

	// implement timers
	require("js/lib/timers.js");
	this.timerLoop = makeWindowTimer(global, function(ms){});
	cc.director.getScheduler().scheduleCallbackForTarget(this, this.timerLoop);
	//setTimeout(function(){cc.log("Confirmed setTimeout() works");}, 3333);

	// after everything is done loading, create the main window variable
	require("js/ConfigServer.js");
	global.location = "http://" + App.serverAddress + (App.serverPort ? ":" + App.serverPort : "") + "/";
	global.navigator = {
		// http://stackoverflow.com/questions/8579019/how-to-get-the-user-agent-on-ios
		userAgent: "Apple-iPhone5C1/1001.525" // how to apply this from C++??
	};
	//cc.log("Got location: " + window.location);
	
	// add some functionality to cc
	if (typeof cc.DEGREES_TO_RADIANS === "undefined") {
		cc.PI = Math.PI;
		cc.RAD = cc.PI / 180;
		cc.DEG = 180 / cc.PI;
		cc.DEGREES_TO_RADIANS = function(angle) {return angle * cc.RAD;};
		cc.RADIANS_TO_DEGREES = function(angle) {return angle * cc.DEG;};
	}
	
	// test addImageData
	//var array = new Uint8Array;
	//App.addImageData("http://somewhere.com/something.png", array);
};

App.mainHtml5 = function() {
	var winSize = this.getWinSize();
	
	cc.view.setDesignResolutionSize(winSize.width, winSize.height, cc.ResolutionPolicy.SHOW_ALL);
	cc.view.resizeWithBrowserSize(true);

	cc.LoaderScene.preload(App.getResourcesToPreload(), App.mainCallback, this);

	App.addImageData = function() {};
};

App.mainX = function() {
	App.mainCallback();
};

App.mainCallback = function() {
	var Scene = App.getInitialScene(),
		scene;
	
	App.loadResources();
	scene = new Scene;
	scene.init();
	cc.director.runScene(scene);
};

App.main = function() {
	var i,
		sheets,
		cacher,
		dirs = [],
		winSize,
		initialLaunch = this.isInitialLaunch();

	this.loadSoundEnabled();

	if (this.isHtml5())
		this.mainHtml5();
	else
		this.mainX();
	
	winSize = this.getWinSize();
	
	if (this.isHtml5()) {
		this._fullscreenEnabled = (this.runPrefixMethod(document, "FullScreen")
			|| this.runPrefixMethod(document, "IsFullScreen"));
		if (this._fullscreenEnabled) {
			cc.log("Initially fullscreen? " + this.isFullscreenEnabled());
		}
	}

	//cc.director.setDisplayStats(this.showFPS);
	cc.director.setAnimationInterval(1.0 / this.getTargetFrameRate());
	cc.log(winSize.width + " x " + winSize.height
		+ ", resource dir: " + App.getResourceDir()
		+ ", language: " + App.getLanguageCode()
		+ ", " + parseInt(1.0 / cc.director.getAnimationInterval()) + " fps");

	// load
	this.loadAnalyticsPlugin();
	this.loadAdsPlugin();
	this.loadSocialPlugin();
	this.loadEconomyPlugin();
	
	// handle initial launch
	//cc.log("Initial launch: " + initialLaunch);
	if (initialLaunch) {
		this.onInitialLaunch();
	}
};

App.boot = function(global) {
	if (this.isHtml5())
		this.bootHtml5(global);
	else
		this.bootX(global);

	// window is not guaranteed until now
	window.flurryAsyncInit = function() {
		App.loadAnalyticsPlugin();
	};

	// embed main.js
	cc.game.onStart = function(){
		App.main();
	};
	cc.game.run();
};

App.boot(this);
