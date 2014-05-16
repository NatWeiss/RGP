
//
// The main App object is a singleton providing boot code, main functions, and other commonly-used, globally-accessible methods.
//
// 1. All code in this file is applicable to any game project in general.
// 2. If you need to extend the App object with project-specific code, use [HelloWorld.js](HelloWorld.html).
//

//
// ###  App
//
// Get or create the App object.
//
var App = App || {};

//
// ###  App.getTargetFrameRate
//
// Return the target frame rate to use. Scale back in HTML5 mode to save a CPU fan somewhere.
//
App.getTargetFrameRate = function() {
	return this.isHtml5() ? 30 : 60;
};

//
// ###  App.isHtml5
//
// Return true if the app is running in HTML5 mode.
//
App.isHtml5 = function() {
	if (typeof this._isHtml5 === "undefined") {
		App.assert(cc.sys);
		this._isHtml5 = cc.sys.isNative ? false : true;
	}
	return this._isHtml5;
};

//
// ###  App.isDesktop
//
// Return true if the app is running on a native desktop OS.
//
App.isDesktop = function() {
	if (typeof this._isDesktop === "undefined") {
		if (this.isHtml5()) {
			this._isDesktop = false;
		} else {
			this._isDesktop = (cc.sys.os === cc.sys.OS_OSX
				|| cc.sys.os === cc.sys.OS_WINDOWS
				|| cc.sys.os === cc.sys.OS_LINUX);
		}
	}
	return this._isDesktop;
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
			if (minDimension >= 1200 && this._pixelRatio > 1) {
				setResourceDir("res/hdr", 1, 2);
			} else if (minDimension >= 600) {
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
// ###  App.alert
//
// Safely call `alert`.
//
App.alert = function(msg) {
	if(typeof alert === "function") {
		alert(msg);
	} else {
		cc.log(msg);
	}
};

//
// ###  App.assert
//
// Throw an error if the given object is undefined or boolean is false.
//
App.assert = function(objOrBool, errMsg) {
	if (typeof objOrBool === "undefined"
	|| (typeof objOrBool === "boolean" && !objOrBool)
	) {
		errMsg = errMsg || "Couldn't load the game. Please try a newer browser.";
		alert(errMsg);
		debugger;
		throw errMsg;
	}
};

//
// ###  App.clone
//
// Clone an object or array so the original can remained unchanged. If passed an undefined value, an empty array is returned.
//
App.clone = function(obj) {
	if(typeof obj !== "undefined") {
		return JSON.parse(JSON.stringify(obj));
	}
	return [];
};

//
// ###  App.localizeCurrency
//
// Return the currency amount localized. Currently the method only localizes to the United States currency format.
//
App.localizeCurrency = function(amount) {
	return "$" + parseFloat(amount).toFixed(2);
};

//
// ###  App.getLanguageCode
//
// Return the current language code. Example: `en`.
//
App.getLanguageCode = function() {
	var strings;
	
	if (typeof this._language === "undefined") {
		this._language = cc.sys.language;

		strings = App.config["strings"];
		if (strings && typeof strings[this._language] === "undefined") {
			cc.log("Don't have strings for language: " + this._language);
			this._language = "en";
		}
	}
	
	return this._language;
};

//
// ###  App.getLocalizedString
//
// Lookup and return a localized string. Configure localized strings in `App.config["strings"][languageCode]`.
//
App.getLocalizedString = function(key) {
	var strings,
		code = this.getLanguageCode();
	
	strings = App.config["strings"][code];
	if (typeof strings[key] !== "undefined") {
		return strings[key];
	}
	if (key && key.length) {
		cc.log("Couldn't find string[" + code + "][" + key + "]");
	}
	return "";
};

//
// ###  App.getRunningLayer
//
// Returns the running scene's child layer.
//
// Scenes can create a member variable named `layer` which will be used by this method.
//
App.getRunningLayer = function() {
	var node = cc.director.getRunningScene();
	if (node) {
		if (node.layer) {
			node = node.layer;
		}
	}
	return node;
};

//
// ###  App.callRunningLayer
//
// Call the running scene's layer's method.
//
App.callRunningLayer = function(methodName, param1, param2, param3) {
	var layer = this.getRunningLayer();
	if (layer && layer[methodName]) {
		layer[methodName](param1, param2, param3);
	} else {
		/*cc.log("Couldn't find method '" + methodName + "' in running scene or layer.");*/
	}
};

//
// ###  App.getResourcesToPreload
//
// Return an array of files to preload.
//
App.getResourcesToPreload = function() {
	var dir = this.getResourceDir(),
		files = App.config["preload"],
		ret = [],
		i;

	if (files) {
		for (i = 0; i < files.length; i += 1) {
			if (files[i] && files[i].length) {
				if (files[i].indexOf("/") < 0) {
					ret[i] = dir + "/" + files[i];
				} else {
					ret[i] = files[i];
				}
			}
		}
	}
	
	return ret;
};

//
// ###  App.loadResources
//
// Setup and load resources.
//
App.loadResources = function() {
	var sheets = App.config["spritesheets"],
		sheet,
		i;

	cc.director.setContentScaleFactor(this._contentScaleFactor);

	for (i = 0; i < sheets.length; i += 1) {
		sheet = cc.loader.getUrl(this.getResourceDir(), sheets[i]);
		cc.log("Loading spritesheet: " + sheet);
		cc.spriteFrameCache.addSpriteFrames(sheet);
	}
};

//
// ###  App.runInitialScene
//
// Loads resources and calls the initial scene. Called by `App.main`.
//
App.runInitialScene = function() {
	var Scene = window[cc.game.config.initialScene],
		scene;
	
	App.loadResources();
	scene = new Scene;
	scene.init();
	cc.director.runScene(scene);
};

//
// ###  App.setCanvasSize
//
// Sets the size of the game canvas.
//
App.setCanvasSize = function(e, w, h) {
	var allowHtmlRetina = false;
	this._pixelRatio = (allowHtmlRetina ? window.devicePixelRatio || 1 : 1);
	e = e || document.getElementById(cc.game.config[cc.game.CONFIG_KEY.id]);
	w = w || document.body.clientWidth; // or scrollWidth
	h = h || document.body.clientHeight;

	e.width = w * this._pixelRatio;
	e.height = h * this._pixelRatio;
	e.style.width = w + "px";
	e.style.height = h + "px";
	e.style.backgroundColor = document.body.style.backgroundColor;

	cc.log("Set #" + e.getAttribute("id") + " pixel ratio " + this._pixelRatio +
		", size " + e.width + "x" + e.height +
		", style " + e.style.width + " x " + e.style.height +
// begin pro
		", fullscreen " + App.isFullscreenEnabled() +
// end pro
		", parent " + e.parentNode.getAttribute("id"));
	
	if (typeof this._origCanvasSize === "undefined") {
		this._origCanvasSize = {width: w, height: h};
	}
};

// begin pro
//
// ###  App.isFullscreenAvailable
//
// Return true if fullscreen mode is available on this platform.
//
App.isFullscreenAvailable = function() {
	return (this.isHtml5() ?
		typeof screenfull !== "undefined" && screenfull.enabled :
		this.isDesktop()
	);
};

//
// ###  App.isFullscreenEnabled
//
// Return true if fullscreen mode is enabled.
//
App.isFullscreenEnabled = function() {
	return (this.isHtml5() ?
		typeof screenfull !== "undefined" && screenfull.isFullscreen :
		this._fullscreenEnabled ? true : false
	);
};

//
// ###  App.enableFullscreen
//
// Enable or disable fullscreen mode.
//
// See http://www.sitepoint.com/use-html5-full-screen-api/.
//
App.enableFullscreen = function(enabled) {
	if (this.isFullscreenAvailable()) {
		if (this.isHtml5()) {
			if (enabled) {
				App.setCanvasSize(document.getElementById("gameDiv"),
					screen.width, screen.height);
				screenfull.request();
			}
			else {
				App.setCanvasSize(document.getElementById("gameDiv"),
					this._origCanvasSize.width, this._origCanvasSize.height);
				screenfull.exit();
			}
		}
	}
};

//
// ###  App.onWindowSizeChanged
//
// Called when the window size has changed.
//
App.onWindowSizeChanged = function() {
	/*var size = (App.isFullscreenEnabled() ?
		cc.size(screen.width, screen.height) :
		cc.size(this._origCanvasSize));
	App.setCanvasSize(document.getElementById("gameDiv"), size.width, size.height);*/

	/*App.setCanvasSize(document.getElementById("Cocos2dGameContainer"));
	App.setCanvasSize(document.getElementById("gameDiv"));*/

	App.callRunningLayer("onWindowSizeChanged");
};

//
// ###  App.toggleFullscreenEnabled
//
// Toggle whether fullscreen is enabled.
//
App.toggleFullscreenEnabled = function() {
	this.enableFullscreen(!this.isFullscreenEnabled());
};
// end pro

//
// ###  App.loadSoundEnabled
//
// Load the `soundEnabled` preference from local storage.
//
App.loadSoundEnabled = function() {
	var enabled = cc.sys.localStorage.getItem("soundEnabled");
	/*cc.log("Loaded sound enabled: " + enabled);*/
	
	if (enabled === null || enabled === "") {
		this.enableSound(true);
	} else {
		this._soundEnabled = (enabled === "true" || enabled === true);
	}
	/*cc.log("Sound enabled is now: " + this._soundEnabled);*/
};

//
// ###  App.enableSound
//
// Enable or disable sound.
//
App.enableSound = function(enabled) {
	this._soundEnabled = enabled ? true : false;
	cc.sys.localStorage.setItem("soundEnabled", this._soundEnabled);

	if (!this.isSoundEnabled()) {
		cc.audioEngine.stopMusic();

		/* Check that the music stopped (Chrome bug). */
		cc.director.getRunningScene().schedule(function(){
			if (!App.isSoundEnabled()) {
				cc.audioEngine.stopMusic();
			}
		}, 1, 15);
	}
};

//
// ###  App.toggleSoundEnabled
//
// Toggle whether sound is enabled.
//
App.toggleSoundEnabled = function() {
	this.enableSound(!this.isSoundEnabled());
};

//
// ###  App.isSoundEnabled
//
// Return true if sound is enabled.
//
App.isSoundEnabled = function() {
	return this._soundEnabled ? true : false;
};

//
// ###  App.playEffect
//
// Plays the sound effect with the given filename if sound is enabled.
//
App.playEffect = function(filename) {
	if (this.isSoundEnabled()) {
		/* Automatically prefix with resource path. */
		if (cc.loader.resPath && filename.indexOf("/") < 0) {
			filename = cc.loader.resPath + "/" + filename;
		}
		return cc.audioEngine.playEffect(filename);
	}
	return -1;
};

//
// ###  App.stopEffect
//
// Stops the sound effect with the given id.
//
App.stopEffect = function(audioId) {
	cc.audioEngine.stopEffect(audioId);
};

//
// ###  App.playMusic
//
// Plays the music file with the given filename if sound is enabled.
//
App.playMusic = function(filename) {
	if (this.isSoundEnabled()) {
		cc.audioEngine.stopMusic();
		cc.audioEngine.playMusic(filename);
	}
};

// begin pro
//
// ###  App.getAnalyticsPlugin
//
// Get the analytics plugin. The first time this is called, the plugin is loaded and configured.
//
App.getAnalyticsPlugin = function() {
	var config, name;
	if (typeof this._analyticsPlugin === "undefined" && typeof plugin !== "undefined") {

		if (this.isHtml5() && !this._initializedAnalytics) {
			this._loadAnalyticsTries = (this._loadAnalyticsTries || 0);
			
			if (typeof FlurryAgent !== "undefined" &&
				typeof App.config !== "undefined"
			) {
				if (this._loadAnalyticsTries > 0) {
					cc.log("Loaded analytics after " +
						this._loadAnalyticsTries + " tries");
				}
				this._initializedAnalytics = true;
			} else {
				/* Try to load plugin up to 10 times with a 250ms delay between tries. */
				if (this._loadAnalyticsTries < 10) {
					setTimeout(function(){
						App.getAnalyticsPlugin();
					}, 250);
				}
				return;
			}

			this._loadAnalyticsTries = this._loadAnalyticsTries + 1;
		}

		config = App.config["analytics-plugin"];
		name = config["name"];
		this._analyticsPlugin = plugin.PluginManager.getInstance().loadPlugin(name);

		if (this._analyticsPlugin === null) {
			this._analyticsPlugin = new plugin[name]();
			this._analyticsPlugin.init();
		}

		if (this._analyticsPlugin) {
			this._analyticsPlugin.setDebugMode(config["debug"]);
			if (config["api-key"] && config["api-key"].length) {
				this._analyticsPlugin.startSession(config["api-key"]);
				if (config["debug"]) {
					cc.log("Analytics plugin session started with API key: " +
						config["api-key"].substr(0,4) + "...");
				}
			} else {
				cc.log("Analytics plugin missing API key");
			}
		}
	}

	return this._analyticsPlugin;
};

//
// ###  App.getAdsPlugin
//
// Get the advertisements plugin. The first time this is called, the plugin is loaded and configured.
//
App.getAdsPlugin = function() {
	if (typeof this._adsPlugin === "undefined" && typeof plugin !== "undefined") {
		var name = App.config["ads-plugin"]["name"];

		this._adsPlugin = plugin.PluginManager.getInstance().loadPlugin(name);
		
		if (this._adsPlugin === null) {
			this._adsPlugin = new plugin[name]();
			this._adsPlugin.init();
		}
		
		if (this._adsPlugin) {
			this._adsPlugin.setDebugMode(App.config["ads-plugin"]["debug"]);
			this._adsPlugin.configDeveloperInfo({
				apiKey: App.config["ads-plugin"]["api-key"],
				mode: App.config["ads-plugin"]["mode"]
			});
		}
	}

	return this._adsPlugin;
};

//
// ###  App.getSocialPlugin
//
// Get the social networking plugin. The first time this is called, the plugin is loaded and configured.
//
App.getSocialPlugin = function() {
	var name;
	
	if (typeof this._socialPlugin === "undefined") {
		name = App.config["social-plugin"]["name"];
		if (plugin[name]) {
			this._socialPlugin = new plugin[name]();
			this._socialPlugin.setDebugMode(App.config["social-plugin"]["debug"]);
			this._socialPlugin.init({
				appId: App.config["social-plugin"]["app-id"],
				xfbml: false,
				status: true,
				cookie: true
			});
		}
	}

	return this._socialPlugin;
};

//
// ###  App.getEconomyPlugin
//
// Get the virtual economy plugin. The first time this is called, the plugin is loaded and configured.
//
App.getEconomyPlugin = function() {
	if (typeof this._economyPlugin === "undefined") {
		var storeConfig = {
				soomSec: App.config["economy-plugin"]["secret1"],
				customSecret: App.config["economy-plugin"]["secret2"],
				androidPublicKey: App.config["economy-plugin"]["android-public-key"]
			};
		
		this._economyPlugin = Soomla;
		
		if (Soomla.CCSoomlaNdkBridge.setDebug) {
			Soomla.CCSoomlaNdkBridge.setDebug(App.config["economy-plugin"]["debug"]);
		}

		if (storeConfig && storeConfig.soomSec && storeConfig.customSecret) {
			try{
				Soomla.StoreController.createShared(App.getStoreAssets(), storeConfig);
			} catch(e) {
				cc.log("Error creating store or getting store assets: " + e);
			}

			Soomla.CCSoomlaNdkBridge.buy = function(
				productId,
				successCallback,
				failureCallback
			) {
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
	}
	
	return this._economyPlugin;
};

//
// ###  App.getStoreAssets
//
// Returns the store assets object. Configured in `App.config["economy-plugin"]`.
//
App.getStoreAssets = function() {
	var i,
		a,
		assets = {
			categories: [],
			currencies: [],
			currencyPacks: [],
			goods: {
				singleUse: [],
				lifetime: [],
				equippable: [],
				goodUpgrades: [],
				goodPacks: []
			},
			nonConsumables: [],
			version: 1
		},
		processItems = function(obj) {
			var key,
				func;
			
			key = "create_market_item";
			if (obj[key]) {
				func = Soomla.Models.PurchaseWithMarket.createWithMarketItem;
				obj.purchasableItem = func(obj[key][0], obj[key][1]);
				delete obj[key];
			}

			key = "create_virtual_item";
			if (obj[key]) {
				func = Soomla.Models.PurchaseWithVirtualItem.create;
				obj.purchasableItem = func({
					pvi_itemId: obj[key][0],
					pvi_amount: obj[key][1]
				});
				delete obj[key];
			}

			key = "create_nonconsumable_item";
			if (obj[key]) {
				func = Soomla.Models.PurchaseWithMarket.create;
				obj.purchasableItem = func({
					marketItem: Soomla.Models.MarketItem.create({
						productId: obj[key][0],
						consumable: 0,
						price: obj[key][1]
					})
				});
				delete obj[key];
			}
			
			return obj;
		};
	
	/* Currencies. */
	a = App.clone(App.config["economy-plugin"]["currencies"]);
	for (i = 0; i < a.length; i += 1) {
		assets.currencies.push(
			Soomla.Models.VirtualCurrency.create(a[i])
		);
	}
	
	/* Currency packs. */
	a = App.clone(App.config["economy-plugin"]["currency-packs"]);
	for (i = 0; i < a.length; i += 1) {
		assets.currencyPacks.push(
			Soomla.Models.VirtualCurrencyPack.create(processItems(a[i]))
		);
	}

	/* Single-use goods. */
	a = App.clone(App.config["economy-plugin"]["single-use-goods"]);
	for (i = 0; i < a.length; i += 1) {
		assets.goods.singleUse.push(
			Soomla.Models.SingleUseVG.create(processItems(a[i]))
		);
	}
	
	/* Lifetime goods. */
	a = App.clone(App.config["economy-plugin"]["lifetime-goods"]);
	for (i = 0; i < a.length; i += 1) {
		assets.goods.lifetime.push(
			Soomla.Models.LifetimeVG.create(processItems(a[i]))
		);
	}

	/* Equippable goods. */
	a = App.clone(App.config["economy-plugin"]["equippable-goods"]);
	for (i = 0; i < a.length; i += 1) {
		assets.goods.equippable.push(
			Soomla.Models.EquippableVG.create(processItems(a[i]))
		);
	}

	/* Good upgrades. */
	a = App.clone(App.config["economy-plugin"]["good-upgrades"]);
	for (i = 0; i < a.length; i += 1) {
		assets.goods.goodUpgrades.push(
			Soomla.Models.UpgradeVG.create(processItems(a[i]))
		);
	}

	/* Good packs. */
	a = App.clone(App.config["economy-plugin"]["good-packs"]);
	for (i = 0; i < a.length; i += 1) {
		assets.goods.goodPacks.push(
			Soomla.Models.SingleUsePackVG.create(processItems(a[i]))
		);
	}

	/* Non-consumables. */
	a = App.clone(App.config["economy-plugin"]["non-consumables"]);
	for (i = 0; i < a.length; i += 1) {
		assets.nonConsumables.push(
			Soomla.Models.NonConsumableItem.create(processItems(a[i]))
		);
	}
	
	/* Categories. */
	a = App.clone(App.config["economy-plugin"]["categories"]);
	for (i = 0; i < a.length; i += 1) {
		assets.categories.push(
			Soomla.Models.VirtualCategory.create(a[i])
		);
	}

	/*cc.log(JSON.stringify(assets));*/
	return Soomla.IStoreAssets.create(assets);
};

//
// ###  App.giveItem
//
// Give the player a certain amount of an item ID. Use a negative amount to take away.
//
App.giveItem = function(itemId, amount) {
	if (amount < 0) {
		Soomla.storeInventory.takeItem(itemId, Math.abs(amount));
	} else {
		Soomla.storeInventory.giveItem(itemId, amount);
	}
};

//
// ###  App.logCurrencyBalances
//
// Logs the balances of all currencies.
//
App.logCurrencyBalances = function() {
	var currencies, len, i, itemId, balance;

	if (Soomla && Soomla.storeInfo) {
		currencies = Soomla.storeInfo.getVirtualCurrencies();
		len = currencies.length || 0;
		cc.log("Checking " + len + " currency balances");

		for (i = 0; i < len; i += 1) {
			itemId = currencies[i].itemId;
			balance = Soomla.storeInventory.getItemBalance(itemId);
			cc.log("User has " + balance + " of " + itemId);
		}
	}
};

//
// ###   App.isInitialLaunch
//
// Returns true if this is the first time the app is being launched. It determines this based on whether the `uuid` key exists within local storage. Deleting this key will essentially reset the app into thinking it's the first run.
//
// Must be called before `App.getUUID()`, which creates the `uuid` key.
//
App.isInitialLaunch = function() {
	var v, key;
	
	/* Test local storage. */
	key = "testItem";
	v = "xyz";
	cc.sys.localStorage.setItem(key, v);
	if (cc.sys.localStorage.getItem(key) !== v) {
		cc.log("ERROR: Local storage test failed");
		this._localStorage = false;
		return true;
	} else {
		cc.log("Local storage test succeeded");
		cc.sys.localStorage.removeItem(key);
		this._localStorage = true;
	}
	
	/* Determine if initial launch. */
	v = cc.sys.localStorage.getItem("uuid");
	return (typeof v === "undefined" || v === null || v === "");
};

//
// ###  App.onInitialLaunch
//
// Called on the App's first launch. Used to set initial balances of virtual economy currencies.
//
App.onInitialLaunch = function() {
	var i,
		itemId,
		balance,
		initialBalances = App.config["economy-plugin"]["initial-balances"],
		currencies,
		len = 0,
		allZero = true;
	
	/* Get the currencies. */
	if (Soomla && Soomla.storeInfo) {
		currencies = Soomla.storeInfo.getVirtualCurrencies();
		len = currencies.length || 0;
	}

	/* Determine if inventory is all at zero. */
	for (i = 0; i < len; i += 1) {
		itemId = currencies[i].itemId;
		balance = Soomla.storeInventory.getItemBalance(itemId);
		if (balance > 0) {
			cc.log("User has " + balance + " of " + itemId);
			allZero = false;
			break;
		}
	}
	
	/* Set initial balances. */
	if (allZero) {
		for (i = 0; i < len; i += 1) {
			itemId = currencies[i].itemId;
			balance = (initialBalances ? initialBalances[itemId] : 0);
			cc.log("Setting initial balance " + balance + " for " + itemId);
			Soomla.storeInventory.giveItem(itemId, balance);
		}
	}
};

//
// ###  App.getUUID
//
// Gets or creates a unique identifier for the current device.
//
App.getUUID = function(length) {
	if (typeof this._uuid === "undefined") {
		this._uuid = cc.sys.localStorage.getItem("uuid") || "";
		
		if (this._uuid.length === 0) {
			length = length || 32;
			for (var i = 0; i < length; i += 1) {
				this._uuid += Math.floor(Math.random() * 16).toString(16);
			}
			cc.sys.localStorage.setItem("uuid", this._uuid);
			/*cc.log("Generated UUID for the first time: " + this._uuid);*/
		} else {
			/*cc.log("Already had UUID: " + this._uuid);*/
		}
	}
	return this._uuid;
};

//
// ###  App.getHttpQueryParams
//
// Return the HTTP query's GET parameters.
//
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

//
// ###  App.requestUrl
//
// Load the given URL and call the callback when finished. If the third parameter `binary` is truthy, then use binary transfer mode.
//
// Uses `XMLHttpRequest` (implemented natively on native platforms).
//
App.requestUrl = function(url, callback, binary) {
	var x,
		loc,
		pos;
	if (XMLHttpRequest) {
		x = new XMLHttpRequest();
	} else {
		x = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	if (url.indexOf("//") < 0) {
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

		/* Call the callback when done. */
		x.onreadystatechange = function () {
			if (x.readyState == 4) { /* 4 == done. */
				var res = (binary ? x.response : x.responseText);
				callback(res || "", x.statusText);
				if (res) {
					x = null;
				}
			}
		};

		/* Make the request. */
		x.open("GET", url, true);
		if (binary) {
			x.responseType = "arraybuffer";
		}
		x.send(null);
	} else {
		throw "Your browser does not support XMLHTTPRequest.";
	}
};

//
// ###  App.between
//
// Return the substring of `string` between `prefix` and `suffix`.
//
App.between = function(string, prefix, suffix, start) {
	var startPos = string.indexOf(prefix, start || 0),
		endPos = string.indexOf(suffix, startPos + prefix.length);
	if (startPos > 0 && endPos > 0) {
		startPos += prefix.length;
		return string.substring(startPos, endPos);
	}
	return "";
};

//
// ###  App.insert
//
// Return the given `string` with `insert` inserted after `after`.
//
App.insert = function(string, after, insert) {
	var pos = string.indexOf(after) + after.length;
	if (pos > 0) {
		return string.substr(0, pos) + insert + string.substr(pos);
	}
	return string;
};

//
// ###  App.encodeURIComponents
//
// Return a URI string with components encoded given an object of associated key value pairs to encode.
//
App.encodeURIComponents = function(o) {
	var ret = "",
		count = 0;
	for (var key in o) {
		if (typeof o[key] !== "undefined") {
			ret += (count === 0 ? "?" : "&") +
				key + "=" + encodeURIComponent(o[key]);
			count += 1;
		}
	}
	return ret;
};

//
// ###  App.loadImage
//
// Loads an image asynchronously from the given URL, calling the callback when finished. Different for HTML5 versus native.
//
App.loadImage = function(url, callback) {
	if (url.indexOf("://") == 0) {
		cc.log("Not a URL: " + url);
		return;
	}
	
	/* Load image HTML5. */
	if (typeof Image !== "undefined") {
		var image = new Image();
		/* If anonymous doesn't work, try: */
		/* url = App.insert(url, "://", "www.corsproxy.com/"); */
		image.crossOrigin = "Anonymous";
		image.src = url;

		/*cc.log("Loading image: " + url);*/
		image.addEventListener("load", function(){
			this.removeEventListener("load", arguments.callee, false);
			if (image.width && image.height) {
				cc.textureCache.cacheImage(url, image);
				if (typeof callback === "function") {
					callback(url);
				}
			}
		}, false);

	/* Load image native. */
	} else {
		/*cc.log("Loading image from raw data: " + url);*/
		this.requestUrl(url, function(response, status) {
			var bytes = new Uint8Array(response);
			App.addImageData(url, bytes);
			if (typeof callback === "function") {
				callback(url);
			}
		}, true);
	}
};
// end pro

//
// ###  App.boot
//
// Boot method. Different for HTML5 versus native. Called at the end of this file.
//
App.boot = function(global) {
	if (this.isHtml5()) {
		App.setCanvasSize();
		App.setCanvasSize(document.getElementById("gameDiv"),
			this._origCanvasSize.width, this._origCanvasSize.height);
	} else {
		/* Implement timers. */
		require("js/lib/timers.js");
		this.timerLoop = makeWindowTimer(global, function(ms){});
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.timerLoop);

// begin pro
		/* Ensure plugin is defined. */
		global.plugin = global.plugin || {};
		if (!global.plugin.PluginManager) {
			global.plugin.PluginManager = {
				getInstance:function(){return {loadPlugin:function(){}}}
			};
		}

		/* Location. */
		require("js/ConfigServer.js");
		if (!global.location) {
			global.location = "http://" + App.serverAddress +
				(App.serverPort ? ":" + App.serverPort : "") + "/";
			/*cc.log("Got location: " + window.location);*/
		}
		if (!global.navigator) {
			/*http://stackoverflow.com/questions/8579019/how-to-get-the-user-agent-on-ios */
			global.navigator = {
				userAgent: "Apple-iPhone5C1/1001.525"
			};
		}
// end pro
	}

	/*setTimeout(function(){cc.log("Confirmed setTimeout() works");}, 3333);*/

	/* Embed the equivalent of main.js for faster loading. */
	cc.game.onStart = function(){
		App.main();
	};

	/*
	Native client boot happens like this:
		1. cc.game.run() ->
		2. cc.game.prepare() ->
		3. jsb.js ->
		4. jsb_cocos2d.js, etc...
	*/
	cc.game.run();
};

//
// ###  App.main
//
// The main method. Called by `cc.game.onStart`.
//
App.main = function() {
	var i,
		size = {},
		sheets,
		cacher,
		dirs = [];

	/* Get config */
	App.config = App.config || {};
	for (i in cc.game.config) {
		if (cc.game.config.hasOwnProperty(i)) {
			App.config[i] = App.clone(cc.game.config[i]);
		}
	}

// begin pro
	var initialLaunch = this.isInitialLaunch();
	this.getUUID();
// end pro
	this.loadSoundEnabled();

	cc.defineGetterSetter(App, "winSize", App.getWinSize);
	size.width = cc.game.config.designWidth || App.winSize.width;
	size.height = cc.game.config.designHeight || App.winSize.height;
	cc.director.setDisplayStats(cc.game.config[cc.game.CONFIG_KEY.showFPS]);
	cc.view.setDesignResolutionSize(size.width, size.height, cc.ResolutionPolicy.SHOW_ALL);
	cc.view.resizeWithBrowserSize(true);

	App.contentHeight = App.winSize.height;
	App.contentWidth = App.contentHeight * (size.width / size.height);
	App.contentX = (App.winSize.width - App.contentWidth) * .5;
	App.contentY = 0;

	cc.loader.resPath = cc.game.config.resourcePath;
	cc.director.setAnimationInterval(1.0 / this.getTargetFrameRate());
	cc.log(parseInt(App.winSize.width) + " x " + parseInt(App.winSize.height)
		+ ", resource dir: " + App.getResourceDir()
		+ ", language: " + App.getLanguageCode()
		+ ", " + parseInt(1.0 / cc.director.getAnimationInterval()) + " fps");


	if (this.isHtml5()) {
// begin pro
		cc.loader.loadJs("js/lib", ["screenfull.js"], function() {
			document.addEventListener(screenfull.raw.fullscreenchange, App.onWindowSizeChanged);
		});
		
		/*window.addEventListener("resize", App.onWindowSizeChanged, false);*/
// end pro
		App.addImageData = function() {};
	} else {
		App.config["font"] = "res/" + App.config["font"] + ".ttf";
	}

// begin pro
	/* Load plugins. */
	this.getAnalyticsPlugin();
	this.getAdsPlugin();
	this.getSocialPlugin();
	this.getEconomyPlugin();

	/* Handle initial launch. */
	/* Call after loading plugins so initial currency balances can be set. */
	/*cc.log("Initial launch: " + initialLaunch);*/
	if (initialLaunch && typeof this.onInitialLaunch === "function") {
		this.onInitialLaunch();
	}

	/* Show currency balances. */
	this.logCurrencyBalances();
// end pro

	/* Preload. */
	cc.LoaderScene.preload(App.getResourcesToPreload(), App.runInitialScene, this);
};

//
// ###  Boot
//
// Call `App.boot` passing in the global variable.
//
App.boot(this);