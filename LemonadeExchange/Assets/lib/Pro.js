///
/// > See the `LICENSE` file for the license governing this code.
///

///
/// Extend the Game object with Pro features.
///
var Game = Game || {};

///
/// ###  Game.initPro
///
/// Initialize the Pro features.
///
Game.initPro = function() {
	var onFinished = function() {
		var initialLaunch = Game.isInitialLaunch();
		Game.getUUID();
		
		/* Show resource dir. */
		cc.log("Resource dir: " + Game._resourceDir + ", scale: " + Game._scaleFactor + ", content scale: " + Game._contentScaleFactor);

		/* Ensure plugin is defined. */
		window.plugin = window.plugin || {};
		if (!window.plugin.PluginManager) {
			window.plugin.PluginManager = {
				getInstance:function(){return {loadPlugin:function(){}}}
			};
		}

		/* Load plugins. */
		if (typeof plugin !== "undefined") {
			Game.getAnalyticsPlugin();
			Game.getAdsPlugin();
			Game.getSocialPlugin();
			Game.getEconomyPlugin();
		}

		/* Handle initial launch. */
		/* Call after loading plugins so initial currency balances can be set. */
		/*cc.log("Initial launch: " + initialLaunch);*/
		if (initialLaunch && typeof Game.onInitialLaunch === "function") {
			Game.onInitialLaunch();
		}

		/* Show currency balances. */
		Game.logCurrencyBalances();
	};

	if (Game.isHtml5()) {
		cc.loader.loadJs(cc.loader.resPath + "/lib", [
			"aes.js",
			"underscore.js",
			"AdsMobFox.js",
			"Facebook.js",
			"soomla.js",
			"SoomlaNdk.js",
			"screenfull.js"
		], function(){
			document.addEventListener(screenfull.raw.fullscreenchange, Game.onWindowSizeChanged);
			/*window.addEventListener("resize", Game.onWindowSizeChanged, false);*/
			onFinished();
		});
	} else {
		require(cc.loader.resPath + "/ConfigServer.js");
		if (!window.location) {
			window.location = "http://" + Game.serverAddress +
				(Game.serverPort ? ":" + Game.serverPort : "") + "/";
			/*cc.log("Got location: " + window.location);*/
		}
		if (!window.navigator) {
			/*http://stackoverflow.com/questions/8579019/how-to-get-the-user-agent-on-ios */
			window.navigator = {
				userAgent: "Apple-iPhone5C1/1001.525"
			};
		}

		onFinished();
	}
};

///
/// ###  Game.getResourceDir
///
/// Return the resource directory (SD, HD or HDR) for this device's resolution.
///
Game.getResourceDir = function() {
	if (typeof this._resourceDir === "undefined") {
		var self = this,
			winSize = this.getWinSize(),
			tiers = Game.config["resourceTiers"],
			maxDimension = parseInt(Math.max(winSize.width, winSize.height)),
			minDimension = parseInt(Math.min(winSize.width, winSize.height)),
			setResourceDir = function(dir, contentScaleFactor, scaleFactor){
				self._resourceDir = dir;
				self._contentScaleFactor = contentScaleFactor;
				self._scaleFactor = scaleFactor;
			};
		
		if (typeof tiers === "undefined") {
			setResourceDir("", 1, 1);
		} else if (this.isHtml5()) {
			/*if (minDimension > 1500) {
				setResourceDir("hdr/", 1, 2);
			} else*/ if (minDimension >= 600) {
				setResourceDir(tiers[1] + "/", 1, 1);
			} else {
				setResourceDir(tiers[0] + "/", 1, .5);
			}
		} else {
			if (maxDimension > 1600) {
				setResourceDir(tiers[2] + "/", 1, 2);
			} else if (maxDimension >= 960) {
				setResourceDir(tiers[1] + "/", 1, 1);
			} else {
				setResourceDir(tiers[0] + "/", 1, .5);
			}
		}
	}

	return this._resourceDir;
};

///
/// ###  Game.loadResources
///
/// Setup and load resources.
///
Game.loadResources = function() {
	var sheets = Game.config["spritesheets"],
		sheet,
		i;

	cc.director.setContentScaleFactor(this._contentScaleFactor);

	/* Load spritesheets. */
	var dir = Game.getResourceDir(),
		files = Game.config["spritesheets"],
		i;
	if (files) {
		for (i = 0; i < files.length; i += 1) {
			if (files[i] && files[i].length) {
				cc.log("Loading spritesheet: " + dir + files[i]);
				cc.spriteFrameCache.addSpriteFrames(dir + files[i]);
			}
		}
	}

	/* Show cached textures. */
	if (false) {
		if (cc.textureCache.dumpCachedTextureInfo)
			cc.textureCache.dumpCachedTextureInfo();
		if (cc.textureCache.getCachedTextureInfo)
			cc.log(cc.textureCache.getCachedTextureInfo());
	}
};

///
/// ###  Game.isFullscreenAvailable
///
/// Return true if fullscreen mode is available on this platform.
///
Game.isFullscreenAvailable = function() {
	return (this.isHtml5() ?
		typeof screenfull !== "undefined" && screenfull.enabled :
		this.isDesktop()
	);
};

///
/// ###  Game.isFullscreenEnabled
///
/// Return true if fullscreen mode is enabled.
///
Game.isFullscreenEnabled = function() {
	return (this.isHtml5() ?
		typeof screenfull !== "undefined" && screenfull.isFullscreen :
		this._fullscreenEnabled ? true : false
	);
};

///
/// ###  Game.enableFullscreen
///
/// Enable or disable fullscreen mode.
///
/// See http://www.sitepoint.com/use-html5-full-screen-api/.
///
Game.enableFullscreen = function(enabled) {
	if (this.isFullscreenAvailable()) {
		if (this.isHtml5()) {
			if (enabled) {
				Game.setCanvasSize(document.getElementById("gameDiv"),
					screen.width, screen.height);
				screenfull.request();
			}
			else {
				Game.setCanvasSize(document.getElementById("gameDiv"),
					this._origCanvasSize.width, this._origCanvasSize.height);
				screenfull.exit();
			}
		}
	}
};

///
/// ###  Game.onWindowSizeChanged
///
/// Called when the window size has changed.
///
Game.onWindowSizeChanged = function() {
	/*var size = (Game.isFullscreenEnabled() ?
		cc.size(screen.width, screen.height) :
		cc.size(this._origCanvasSize));
	Game.setCanvasSize(document.getElementById("gameDiv"), size.width, size.height);*/

	/*Game.setCanvasSize(document.getElementById("Cocos2dGameContainer"));
	Game.setCanvasSize(document.getElementById("gameDiv"));*/

	Game.callRunningLayer("onWindowSizeChanged");
};

///
/// ###  Game.toggleFullscreenEnabled
///
/// Toggle whether fullscreen is enabled.
///
Game.toggleFullscreenEnabled = function() {
	this.enableFullscreen(!this.isFullscreenEnabled());
};

///
/// ###  Game.getAnalyticsPlugin
///
/// Get the analytics plugin. The first time this is called, the plugin is loaded and configured.
///
Game.getAnalyticsPlugin = function() {
	var config, name;
	if (typeof this.analyticsPlugin === "undefined" && typeof plugin !== "undefined") {

		if (this.isHtml5() && !this._initializedAnalytics) {
			this._loadAnalyticsTries = (this._loadAnalyticsTries || 0);
			
			if (typeof FlurryAgent !== "undefined" &&
				typeof Game.config !== "undefined"
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
						Game.getAnalyticsPlugin();
					}, 250);
				}
				return;
			}

			this._loadAnalyticsTries = this._loadAnalyticsTries + 1;
		}

		config = Game.config["analytics-plugin"];
		name = config["name"];
		this.analyticsPlugin = plugin.PluginManager.getInstance().loadPlugin(name);

		if (typeof this.analyticsPlugin === "undefined" || this.analyticsPlugin === null) {
			if (typeof plugin[name] !== "undefined") {
				this.analyticsPlugin = new plugin[name]();
				this.analyticsPlugin.init();
			}
		}

		if (this.analyticsPlugin) {
			this.analyticsPlugin.setDebugMode(config["debug"]);
			if (config["api-key"] && config["api-key"].length) {
				this.analyticsPlugin.startSession(config["api-key"]);
				if (config["debug"]) {
					cc.log("Analytics plugin session started with API key: " +
						config["api-key"].substr(0,4) + "...");
				}
			} else {
				cc.log("Analytics plugin missing API key");
			}
		}
	}

	return this.analyticsPlugin;
};

///
/// ###  Game.getAdsPlugin
///
/// Get the advertisements plugin. The first time this is called, the plugin is loaded and configured.
///
Game.getAdsPlugin = function() {
	if (typeof this.adsPlugin === "undefined" && typeof plugin !== "undefined") {
		var name = Game.config["ads-plugin"]["name"];

		this.adsPlugin = plugin.PluginManager.getInstance().loadPlugin(name);
		if (typeof this.adsPlugin === "undefined" || this.adsPlugin === null) {
			if (typeof plugin[name] !== "undefined") {
				this.adsPlugin = new plugin[name]();
				this.adsPlugin.init();
			}
		}
		
		if (this.adsPlugin) {
			this.adsPlugin.setDebugMode(Game.config["ads-plugin"]["debug"]);
			this.adsPlugin.configDeveloperInfo({
				apiKey: Game.config["ads-plugin"]["api-key"],
				mode: Game.config["ads-plugin"]["mode"]
			});
		}
	}

	return this.adsPlugin;
};

///
/// ###  Game.getSocialPlugin
///
/// Get the social networking plugin. The first time this is called, the plugin is loaded and configured.
///
Game.getSocialPlugin = function() {
	var name;
	
	if (typeof this.socialPlugin === "undefined") {
		name = Game.config["social-plugin"]["name"];
		if (plugin[name]) {
			this.socialPlugin = new plugin[name]();
			this.socialPlugin.setDebugMode(Game.config["social-plugin"]["debug"]);
			this.socialPlugin.init({
				appId: Game.config["social-plugin"]["app-id"],
				xfbml: false,
				status: true,
				cookie: true
			});
		}
	}

	return this.socialPlugin;
};

///
/// ###  Game.getEconomyPlugin
///
/// Get the virtual economy plugin. The first time this is called, the plugin is loaded and configured.
///
Game.getEconomyPlugin = function() {
	if (typeof this.economyPlugin === "undefined" && typeof Soomla !== "undefined") {
		var storeConfig = {
				soomSec: Game.config["economy-plugin"]["secret1"],
				customSecret: Game.config["economy-plugin"]["secret2"],
				androidPublicKey: Game.config["economy-plugin"]["android-public-key"]
			};
		
		this.economyPlugin = Soomla;
		
		if (Soomla.CCSoomlaNdkBridge.setDebug) {
			Soomla.CCSoomlaNdkBridge.setDebug(Game.config["economy-plugin"]["debug"]);
		}

		if (storeConfig && storeConfig.soomSec && storeConfig.customSecret) {
			try{
				Soomla.StoreController.createShared(Game.getStoreAssets(), storeConfig);
			} catch(e) {
				cc.log("Error creating store or getting store assets: " + e);
			}

			Soomla.CCSoomlaNdkBridge.buy = function(
				productId,
				successCallback,
				failureCallback
			) {
				var social = Game.getSocialPlugin();
				if (social && social.isCanvasMode()) {
					social.buy(productId, successCallback, failureCallback);
				}
				else {
					Game.alert("Please play within Facebook to enable purchasing.");
					Soomla.CCSoomlaNdkBridge.onPaymentComplete();
				}
			};

			Soomla.CCSoomlaNdkBridge.onCurrencyUpdate = function() {
				Game.getRunningLayer().onCurrencyUpdate();
			};

			Soomla.CCSoomlaNdkBridge.onPaymentComplete = function() {
				Game.getRunningLayer().onPaymentComplete();
			};
		} else {
			cc.log("Soomla: Secret keys have not been set");
		}
	}
	
	return this.economyPlugin;
};

///
/// ###  Game.getStoreAssets
///
/// Returns the store assets object. Configured in `Game.config["economy-plugin"]`.
///
Game.getStoreAssets = function() {
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
	a = Game.clone(Game.config["economy-plugin"]["currencies"]);
	for (i = 0; i < a.length; i += 1) {
		assets.currencies.push(
			Soomla.Models.VirtualCurrency.create(a[i])
		);
	}
	
	/* Currency packs. */
	a = Game.clone(Game.config["economy-plugin"]["currency-packs"]);
	for (i = 0; i < a.length; i += 1) {
		assets.currencyPacks.push(
			Soomla.Models.VirtualCurrencyPack.create(processItems(a[i]))
		);
	}

	/* Single-use goods. */
	a = Game.clone(Game.config["economy-plugin"]["single-use-goods"]);
	for (i = 0; i < a.length; i += 1) {
		assets.goods.singleUse.push(
			Soomla.Models.SingleUseVG.create(processItems(a[i]))
		);
	}
	
	/* Lifetime goods. */
	a = Game.clone(Game.config["economy-plugin"]["lifetime-goods"]);
	for (i = 0; i < a.length; i += 1) {
		assets.goods.lifetime.push(
			Soomla.Models.LifetimeVG.create(processItems(a[i]))
		);
	}

	/* Equippable goods. */
	a = Game.clone(Game.config["economy-plugin"]["equippable-goods"]);
	for (i = 0; i < a.length; i += 1) {
		assets.goods.equippable.push(
			Soomla.Models.EquippableVG.create(processItems(a[i]))
		);
	}

	/* Good upgrades. */
	a = Game.clone(Game.config["economy-plugin"]["good-upgrades"]);
	for (i = 0; i < a.length; i += 1) {
		assets.goods.goodUpgrades.push(
			Soomla.Models.UpgradeVG.create(processItems(a[i]))
		);
	}

	/* Good packs. */
	a = Game.clone(Game.config["economy-plugin"]["good-packs"]);
	for (i = 0; i < a.length; i += 1) {
		assets.goods.goodPacks.push(
			Soomla.Models.SingleUsePackVG.create(processItems(a[i]))
		);
	}

	/* Non-consumables. */
	a = Game.clone(Game.config["economy-plugin"]["non-consumables"]);
	for (i = 0; i < a.length; i += 1) {
		assets.nonConsumables.push(
			Soomla.Models.NonConsumableItem.create(processItems(a[i]))
		);
	}
	
	/* Categories. */
	a = Game.clone(Game.config["economy-plugin"]["categories"]);
	for (i = 0; i < a.length; i += 1) {
		assets.categories.push(
			Soomla.Models.VirtualCategory.create(a[i])
		);
	}

	/*cc.log(JSON.stringify(assets));*/
	return Soomla.IStoreAssets.create(assets);
};

///
/// ###  Game.giveItem
///
/// Give the player a certain amount of an item ID. Use a negative amount to take away.
///
Game.giveItem = function(itemId, amount) {
	if (amount < 0) {
		Soomla.storeInventory.takeItem(itemId, Math.abs(amount));
	} else {
		Soomla.storeInventory.giveItem(itemId, amount);
	}
};

///
/// ###  Game.logCurrencyBalances
///
/// Logs the balances of all currencies.
///
Game.logCurrencyBalances = function() {
	var currencies, len, i, itemId, balance;

	if (typeof Soomla !== "undefined" && Soomla.storeInfo) {
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

///
/// ###   Game.isInitialLaunch
///
/// Returns true if this is the first time the game is being launched. It determines this based on whether the `uuid` key exists within local storage. Deleting this key will essentially reset the game into thinking it's the first run.
///
/// Must be called before `Game.getUUID()`, which creates the `uuid` key.
///
Game.isInitialLaunch = function() {
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

///
/// ###  Game.onInitialLaunch
///
/// Called on the Game's first launch. Used to set initial balances of virtual economy currencies.
///
Game.onInitialLaunch = function() {
	var i,
		itemId,
		balance,
		initialBalances = Game.config["economy-plugin"]["initial-balances"],
		currencies,
		len = 0,
		allZero = true;
	
	/* Get the currencies. */
	if (typeof Soomla !== "undefined" && Soomla && Soomla.storeInfo) {
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
cc.log("all zero ?" + allZero);
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

///
/// ###  Game.getUUID
///
/// Gets or creates a unique identifier for the current device.
///
Game.getUUID = function(length) {
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

///
/// ###  Game.getHttpQueryParams
///
/// Return the HTTP query's GET parameters.
///
Game.getHttpQueryParams = function() {
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

///
/// ###  Game.requestUrl
///
/// Load the given URL and call the callback when finished. If the third parameter `binary` is truthy, then use binary transfer mode.
///
/// Uses `XMLHttpRequest` (implemented natively on native platforms).
///
Game.requestUrl = function(url, callback, binary) {
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

///
/// ###  Game.between
///
/// Return the substring of `string` between `prefix` and `suffix`.
///
Game.between = function(string, prefix, suffix, start) {
	var startPos = string.indexOf(prefix, start || 0),
		endPos = string.indexOf(suffix, startPos + prefix.length);
	if (startPos > 0 && endPos > 0) {
		startPos += prefix.length;
		return string.substring(startPos, endPos);
	}
	return "";
};

///
/// ###  Game.insert
///
/// Return the given `string` with `insert` inserted after `after`.
///
Game.insert = function(string, after, insert) {
	var pos = string.indexOf(after) + after.length;
	if (pos > 0) {
		return string.substr(0, pos) + insert + string.substr(pos);
	}
	return string;
};

///
/// ###  Game.encodeURIComponents
///
/// Return a URI string with components encoded given an object of associated key value pairs to encode.
///
Game.encodeURIComponents = function(o) {
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

///
/// ###  Game.loadImage
///
/// Loads an image asynchronously from the given URL, calling the callback when finished. Different for HTML5 versus native.
///
Game.loadImage = function(url, callback) {
	if (url.indexOf("://") == 0) {
		cc.log("Not a URL: " + url);
		return;
	}
	
	/* Load image HTML5. */
	if (typeof Image !== "undefined") {
		var image = new Image();
		/* If anonymous doesn't work, try: */
		/* url = Game.insert(url, "://", "www.corsproxy.com/"); */
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
			Game.addImageData(url, bytes);
			if (typeof callback === "function") {
				callback(url);
			}
		}, true);
	}
};
