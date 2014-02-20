
var App = App || {};

App.showFPS = false;

App.getFrameRate = function() {
	return (this.isHtml5() ? 30 : 60);
};

App.getInitialScene = function() {
	return SceneMain;
};

App.getInitialLayer = function() {
	return (this.isHtml5() ? LayerMenu : LayerMenu);
};

App.getJSFiles = function() {
	var files = [
		"js/underscore.js",
		"js/soomla.js",
		"js/SoomlaNdk.js",
		//"js/MuffinRushAssets.js",
		//"js/SoomlaTest.js",
		"js/Config.js",
		"js/Facebook.js",
		"js/LemonadeExchange.js",
		//"js/ActionDrink.js",
		"js/AdsMobFox.js",
		"js/SceneMain.js",
		"js/LayerMenu.js",
		"js/LayerGame.js"
		];
	return files;
};

App.getResourcesToPreload = function() {
	var dir = this.getResourceDir(),
		files = [
			{src:dir + "/spritesheet.plist"},
			{src:dir + "/spritesheet.png"},
		];
	return files;
};

App.getResourceDir = function() {
	var winSize,
		maxDimension,
		minDimension;

	if (typeof this._resourceDir === 'undefined') {
		winSize = this.getWinSize();
		maxDimension = Math.max(winSize.width, winSize.height);
		minDimension = Math.min(winSize.width, winSize.height);
		cc.log(maxDimension + " x " + minDimension);
		
		// set resource directories
		if (this.isHtml5()) {
			if (minDimension >= 600) { // 640 would be more accurate, 600 is a litte more lenient
				this._resourceDir = "res/hd";
				this._contentScaleFactor = 1;
				this._scaleFactor = 1;
			} else {
				this._resourceDir = "res/sd";
				this._contentScaleFactor = 1;
				this._scaleFactor = .5;
			}
		} else {
			if (maxDimension > 1600) {
				this._resourceDir = "res/hdr";
				this._contentScaleFactor = 1;
				this._scaleFactor = 2;
			} else if (maxDimension >= 960) {
				this._resourceDir = "res/hd";
				this._contentScaleFactor = 1;
				this._scaleFactor = 1;
			} else {
				this._resourceDir = "res/sd";
				this._contentScaleFactor = 1;
				this._scaleFactor = .5;
			}
		}
	}

	return this._resourceDir;
};

App.setupResources = function() {
	var cacher,
		sheets,
		i,
		dirs = [];

	dirs.push(this.getResourceDir());
	cc.Director.getInstance().setContentScaleFactor(this._contentScaleFactor);

	// set resource directories
	dirs.push("jsb");
	//cc.log("Setting resource directories: " + JSON.stringify(dirs));
	cc.FileUtils.getInstance().setSearchPaths(dirs);

	// load spritesheets
	cacher = cc.SpriteFrameCache.getInstance();
	sheets = App.getConfig("spritesheets");
	for (i = 0; i < sheets.length; i += 1) {
		cc.log("Loading spritesheet: " + sheets[i]);
		cacher.addSpriteFrames(sheets[i]);
	}
	
};

App.isHtml5 = function() {
	if (typeof this._isHtml5 === 'undefined') {
		this._isHtml5 = (typeof window !== 'undefined');
	}
	return this._isHtml5;
};

// scale a number by a factor based on the screen size
App.scale = function(floatValue) {
	return floatValue * this._scaleFactor;
};

// make a point relative to the center of the screen and scaled
App.centralize = function(x, y) {
	var winSize = this.getWinSize();
	return cc.p(this.scale(x) + winSize.width * .5, this.scale(y) + winSize.height * .5);
}

App.getConfig = function(key) {
	return this.config[key];
}

App.getString = function(key) {
	return this.config[key];
}

App.getInt = function(key) {
	return parseInt(this.config[key]);
}

App.rand = function(mod) {
	var r = Math.random();
	if (typeof mod !== 'undefined') {
		r *= 0xffffff;
		r = parseInt(r);
		r %= mod;
	}
	return r;
}

App.getWinSize = function() {
	var size = cc.Director.getInstance().getWinSizeInPixels();
	if (typeof this._winSize === 'undefined' || (size.width && size.height)) {
		this._winSize = size;
	}
	return this._winSize;
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

App.loadSoundEnabled = function() {
	this._soundEnabled = sys.localStorage.getItem("soundEnabled");
	//cc.log("Loaded sound enabled: " + this._soundEnabled);
	if (this._soundEnabled === null || this._soundEnabled === "") {
		this._soundEnabled = true;
	}
	this._soundEnabled = (this._soundEnabled === "true" || this._soundEnabled === true) ? true : false;
	//cc.log("Loaded sound enabled: " + this._soundEnabled);
};

App.enableSound = function(enabled) {
	var audio;
	this._soundEnabled = enabled ? true : false;
	sys.localStorage.setItem("soundEnabled", this._soundEnabled);
	if (!this.isSoundEnabled()) {
		audio = cc.AudioEngine.getInstance();
		audio.stopMusic();
	}
};

App.toggleSoundEnabled = function() {
	this.enableSound(!this.isSoundEnabled());
};

App.isSoundEnabled = function() {
	return this._soundEnabled ? true : false;
};

App.playEffect = function(filename) {
	var audio;
	if (this.isSoundEnabled()) {
		audio = cc.AudioEngine.getInstance();
		audio.playEffect(filename);
	}
};

App.playMusic = function(filename) {
	var audio;
	if (this.isSoundEnabled()) {
		audio = cc.AudioEngine.getInstance();
		audio.playMusic(filename);
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

App.loadAnalyticsPlugin = function(key) {
	var flurryApiKey = this.getString("flurry-api-key");
	if (flurryApiKey) {
		var flurry = plugin.PluginManager.getInstance().loadPlugin("AnalyticsFlurry");
		if (flurry) {
			flurry.startSession(flurryApiKey);
		}
	}


//        var flurry = plugin.PluginManager.getInstance().loadPlugin("AnalyticsFlurry");
		//flurry.setDebugMode(true);
		//cc.log("Flurry SDK version: " + flurry.getSDKVersion());
		//flurry.setSessionContinueMillis(5 * 60 * 1000);
//		flurry.startSession("PBSGR7SV59JZN2RQQW96");
		//flurry.logError("someErrorId", "Error in js: foo foo!");
		//flurry.setCaptureUncaughtException(false);
		//flurry.logEvent("myevent1");
		//flurry.logEvent("myevent2", {"some-parameter": true});
		//flurry.logTimedEventBegin("mytimedevent");
		//flurry.logTimedEventEnd("mytimedevent");

}

App.getAdsPlugin = function() {
	var name;
	
	if (typeof this._adsPlugin === 'undefined' && typeof plugin !== 'undefined') {
		name = this.getString("ads-plugin-name");

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
}

App.loadAdsPlugin = function() {
	var plugin = this.getAdsPlugin(),
		debug = this.getConfig("ads-plugin-debug");

	if (typeof plugin !== 'undefined') {
		if (debug) {
			plugin.setDebugMode(debug);
			cc.log("Ads plugin: " + plugin);
		}

		plugin.configDeveloperInfo({
			apiKey: this.getString("ads-plugin-api-key"),
			mode: this.getString("ads-plugin-mode")
		});
	}
}

App.getSocialPlugin = function() {
	var name = this.getString("social-plugin-name");
	
	if (typeof this._socialPlugin === "undefined") {
		if (plugin[name]) {
			this._socialPlugin = new plugin[name]();
			this._socialPlugin.init();
		} else {
			this._socialPlugin = {
				isLoggedIn: function() {return true;},
				isCanvasMode: function() {return false;},
				getPlayerName: function() {return "Anonymous";},
				setDebugMode: function() {},
				configDeveloperInfo: function() {},
				buy: function() {},
				login: function() {},
				logout: function() {}
			};
		}
	}

	return this._socialPlugin;
}

App.loadSocialPlugin = function() {
	var plugin = this.getSocialPlugin(),
		debug = this.getConfig("social-plugin-debug");

	if (typeof plugin !== "undefined") {
		if (debug) {
			plugin.setDebugMode(debug);
			cc.log("Social plugin: " + plugin);
		}

		plugin.configDeveloperInfo(App.getConfig("social-plugin-init"));
	}
}

App.loadEconomyPlugin = function() {
	if (Soomla.CCSoomlaNdkBridge.setDebug) {
		Soomla.CCSoomlaNdkBridge.setDebug(App.getConfig("economy-plugin-debug"));
	}
	Soomla.StoreController.createShared(App.getStoreAssets(), App.getConfig("economy-plugin-init"));

	// set initial balances
	// todo: make sure this only happens on first run...
	var currencies = Soomla.storeInfo.getVirtualCurrencies();
	//cc.log("Currencies: " + JSON.stringify(currencies));
	_.forEach(currencies, function(vc) {
		var balance = Soomla.storeInventory.getItemBalance(vc.itemId);
		//cc.log("User has " + balance + " of " + vc.itemId);
		if (balance == 0) {
			Soomla.storeInventory.giveItem(vc.itemId, App.getConfig("initial-balances")[vc.itemId]);
		}
	});
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

App.bootHtml5 = function() {
	var d = document;
	var c = {
		COCOS2D_DEBUG: 2, //0 to turn debug off, 1 for basic debug, and 2 for full debug
		box2d: false,
		chipmunk: false,
		showFPS: this.showFPS,
		frameRate: this.getFrameRate(),
		loadExtension: true,
		loadPluginx: true,
		renderMode: 0,       //Choose of RenderMode: 0(default), 1(Canvas only), 2(WebGL only)
		tag: 'gameCanvas', //the dom element to run cocos2d on
		engineDir: 'lib/cocos2d-html5/cocos2d/',
		//SingleEngineFile:'',
		appFiles: this.getJSFiles()
	};

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
		/*********Delete this section if you have packed all files into one*******/
		if (c.SingleEngineFile && !c.engineDir) {
			s.src = c.SingleEngineFile;
		}
		else if (c.engineDir && !c.SingleEngineFile) {
			s.src = c.engineDir + 'jsloader.js';
		}
		else {
			alert('You must specify either the single engine file OR the engine directory in "cocos2d.js"');
		}
		/*********Delete this section if you have packed all files into one*******/

		//s.src = 'Packed_Release_File.js'; //IMPORTANT: Un-comment this line if you have packed all files into one

		document.ccConfig = c;
		s.id = 'cocos2d-html5';
		d.body.appendChild(s);
	});
};

App.bootX = function(global) {
	require("jsb.js");
	//require("jsb_pluginx.js");
	//require("jsb_pluginx_protocols_auto_api.js");
	require("jsb_cocos2dx_auto_api.js");

	// implement timers
	require("js/timers.js");
	this.timerLoop = makeWindowTimer(global, function(ms){});
	cc.Director.getInstance().getScheduler().scheduleCallbackForTarget(this, this.timerLoop);
	//setTimeout(function(){cc.log("Confirmed setTimeout() works");}, 3333);

	// load js files
	var files = this.getJSFiles();
	for (var i = 0; i < files.length; i += 1) {
		cc.log("Including: " + files[i]);
		require(files[i]);
	}

	// main
	require("main.js");
	
	// after everything is done loading, create the main window variable
	global.window = {
		location: "http://localhost:8000/"
	};
	global.navigator = {
		// http://stackoverflow.com/questions/8579019/how-to-get-the-user-agent-on-ios
		userAgent: "Apple-iPhone5C1/1001.525", // how to apply this from C++??
	};
	
	// add some functionality to cc
	if (typeof cc.DEGREES_TO_RADIANS === 'undefined') {
		cc.PI = Math.PI;
		cc.RAD = cc.PI / 180;
		cc.DEG = 180 / cc.PI;
		cc.DEGREES_TO_RADIANS = function(angle) {return angle * cc.RAD;};
		cc.RADIANS_TO_DEGREES = function(angle) {return angle * cc.DEG;};
	}
}

App.mainHtml5 = function() {
	var Application = cc.Application.extend({
		config: document['ccConfig'],

		ctor: function() {
			this._super();
			cc.COCOS2D_DEBUG = this.config['COCOS2D_DEBUG'];
			cc.initDebugSetting();
			cc.setup(this.config['tag']);
			cc.AppController.shareAppController().didFinishLaunchingWithOptions();
		},

		applicationDidFinishLaunching: function() {
			if (cc.RenderDoesnotSupport()) {
				alert("Browser doesn't support WebGL");
				return false;
			}

			var director = cc.Director.getInstance(),
				screenSize = cc.EGLView.getInstance().getFrameSize(),
				Scene = App.getInitialScene();

			cc.EGLView.getInstance().resizeWithBrowserSize( true );
			//cc.EGLView.getInstance().setDesignResolutionSize(screenSize.width, screenSize.height, cc.RESOLUTION_POLICY.SHOW_ALL);
			cc.EGLView.getInstance().setResolutionPolicy(cc.RESOLUTION_POLICY.SHOW_ALL);

			cc.LoaderScene.preload(App.getResourcesToPreload(), function() {
				var scene;
				App.setupResources();
				scene = new Scene();
				scene.init();
				director.replaceScene(scene);
			}, this );

			return true;
		},
		
		getCurrentLanguage: function() {
			// navigator.systemLanguage... / navigator.language... / navigator.platform...
			return cc.LANGUAGE_ENGLISH;
		}
	});
	var myApp = new Application();
	
	App.addImageRaw = function() {
	};
}

App.mainX = function() {
	var director = cc.Director.getInstance(),
		Scene = this.getInitialScene(),
		scene;
	
	this.setupResources();
	scene = new Scene;
	scene.init();
	director.runWithScene(scene);
}

App.main = function() {
	var i,
		director,
		sheets,
		cacher,
		dirs = [];

	this.loadSoundEnabled();

	if (this.isHtml5())
		this.mainHtml5();
	else
		this.mainX();
	
	cc.log("Resource directory: " + App.getResourceDir());
	
	if (this.isHtml5()) {
		this._fullscreenEnabled = (this.runPrefixMethod(document, "FullScreen")
			|| this.runPrefixMethod(document, "IsFullScreen"));
		if (this._fullscreenEnabled) {
			cc.log("Initially fullscreen? " + this.isFullscreenEnabled());
		}
	}

	director = cc.Director.getInstance();
	director.setDisplayStats(this.showFPS);
	director.setAnimationInterval(1.0 / this.getFrameRate());

	// load
	this.loadAnalyticsPlugin();
	this.loadAdsPlugin();
	this.loadSocialPlugin();
	this.loadEconomyPlugin();
}

App.boot = function(global) {
	if (this.isHtml5())
		this.bootHtml5(global);
	else
		this.bootX(global);
}

App.boot(this);
