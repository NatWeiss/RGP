

var plugin = plugin || {};

plugin.AdsType = {
	BannerAd: 0,
	FullScreenAd: 1
};

plugin.AdsPos = {
	Center: 0,
	Top: 1,
	TopLeft: 2,
	TopRight: 3,
	Bottom: 4,
	BottomLeft: 5,
	BottomRight: 6
};





/*

protocol changed to an object constructor....

cos2d: JS: /Users/nat/Library/Application Support/iPhone Simulator/7.0.3/Applications/F73D6514-E383-4C87-84FA-D6201C922D19/LemonadeExchange.app/js/menu.js:488:Error: js_pluginx_protocols_ProtocolAds_showAds : wrong number of arguments: 3, was expecting 1


*/






plugin.AdsMobFox = cc.Class.extend({
	debug: false,
	config: null,
	uuid: "",
	layer: null,
	listener: null,
	adUrl: "",
	geoData: null,
	doShowAds: null,

    /**
     methods of InterfaceAds protocol
	 */
    init: function() {
		var self = this;
		
		// get client's IP address & geo data
		this.requestURL("http://api.hostip.info/get_json.php?position=true", function(response, status){
			if( response.length ) {
				try {
					self.geoData = JSON.parse(response);
					self.debugLog("MobFox client's IP address: " + self.geoData.ip);
					if (self.doShowAds) {
						self.showAds(self.doShowAds.typeEnum, self.doShowAds.sizeEnum, self.doShowAds.posEnum);
					}
				} catch(e) {
					self.debugLog("" + e);
				}
			} else {
				self.debugLog("MobFox couldn't get client's IP address, status: " + status);
				if( this.listener ) {
					this.listener.onAdsResult(plugin.AdsResultCode.NetworkError, "MobFox error getting client's IP address");
				}
			}
		});
    },
	
    configDeveloperInfo: function (devInfo) {
		this.config = devInfo;
		this.debugLog("Set MobFox API key to: " + this.config.apiKey);
	},
	
    showAds: function (typeEnum, sizeEnum, posEnum) {
		// wait until client geo data is full?
		if (this.geoData === null) {
			this.debugLog("MobFox: client IP data not full, waiting...");
			this.doShowAds = {
				typeEnum: typeEnum,
				sizeEnum: sizeEnum,
				posEnum: posEnum
			};
			return;
		}
		this.doShowAds = null;
		if (this.uuid.length === 0) {
			this.uuid = this.getUUID();
		}

		// remove existing ads
		this.hideAds();
		
		// proceed with showing ads
		// info on inserting corsproxy.com: http://www.cocos2d-x.org/forums/19/topics/38739
		var self = this,
			doVideo = false,
			isFullscreen = (typeEnum === plugin.AdsType.FullScreenAd),
			url = this.insert("http://my.mobfox.com/" + (doVideo ? "v" :"") + "request.php", "://", "www.corsproxy.com/"),

			params = {
				rt: "api",
				s: self.config.apiKey,
				i: self.geoData.ip,
				p: window.location, // blank for mobile apps
				m: self.config.mode, // "test" or "live"
				c_mraid: 1,
				o: this.uuid,
				v: "2.0",
				u: navigator.userAgent,
				no_markup: 1,
				allow_mr: 1,
				longitude: self.geoData.lng,
				latitude: self.geoData.lat
			};
		if (isFullscreen){
			params["adspace.width"] = parseInt(App.winSize.width);
			params["adspace.height"] = parseInt(App.winSize.height);
			posEnum = plugin.AdsPos.Center;
		} else if (typeEnum === plugin.AdsType.BannerAd) {
			if (sizeEnum > 0) {
				params["adspace.width"] = parseInt(App.winSize.width);
				params["adspace.height"] = (App.winSize.width >= 1024 ? 90 : 50);
			}
		}

		// make url
		url += self.encode(params);
		self.debugLog("MobFox requesting: " + url);
		
		// get the ad data
		self.requestURL(url, function(adResponse, adStatus) {
			if (typeof adResponse !== 'undefined') {
				// cocos2d-x jsb lacks xmlhttpresponse.xml, so we parse the raw html string
				var html = adResponse,
					imageUrl = self.between(html, "src=\"", "\"");

				self.debugLog("MobFox ad response: " + html);
				if (!imageUrl.length) {
					self.debugLog("MobFox: no ad url found");
					return;
				}
				imageUrl = self.insert(imageUrl, "://", "www.corsproxy.com/");
				self.adUrl = self.between(html, "href=\"", "\"");
				
				self.debugLog("MobFox image: " + imageUrl + ", click URL:" + self.adUrl);
				if( this.listener ) {
					this.listener.onAdsResult(plugin.AdsResultCode.AdsReceived, "MobFox ad data received");
				}
				
				App.loadImage(imageUrl, function() {
					self.showImage(imageUrl, typeEnum, sizeEnum, posEnum);
				});
			} else {
				self.debugLog("There was a problem retrieving MobFox data, status: " + adStatus);
			}
		});
	},

    hideAds: function (type) {
		if (this.layer) {
			this.debugLog("MobFox hiding ads, layer: " + this.layer);
			
			this.layer.stopAllActions();
			this.layer.runAction(cc.Sequence.create(
				cc.EaseIn.create(cc.MoveBy.create(0.5, cc.p(0, -App.winSize.height)), 3.0),
				cc.RemoveSelf(true)
			));
			this.layer = null;
		}
	},

    spendPoints: function (points) {
		this.debugLog("MobFox has no spendPoints API");
		if (this.listener) {
			this.listener.onPlayerGetPoints(this, 0);
		}
	},

    setAdsListener: function (listener) {
		this.debugLog("Setting MobFox ads listener: " + listener);
		this.listener = listener;
	},
	
    setDebugMode: function (debug) {
		this.debug = (debug ? true : false);
	},
	
	debugLog: function() {
		if (this.debug) {
			cc.log.apply(this, arguments);
		}
	},

    getSDKVersion: function () {
		return 0;
	},

    getPluginVersion: function () {
        return plugin.Version;
    },

	between: function(string, prefix, suffix) {
		var startPos = string.indexOf(prefix),
			endPos = string.indexOf(suffix, startPos + prefix.length);
		if (startPos > 0 && endPos > 0) {
			startPos += prefix.length;
			return string.substring(startPos, endPos);
		}
		return "";
	},
	
	insert: function(string, after, insert) {
		var pos = string.indexOf(after) + after.length;
		if (pos > 0) {
			return string.substr(0, pos) + insert + string.substr(pos);
		}
		return string;
	},

	requestURL: function(url, callback, binary) {
		var x;
		if (XMLHttpRequest) {
			x = new XMLHttpRequest();
		} else {
			x = new ActiveXObject("Microsoft.XMLHTTP");
		}

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
	},
	
	encode: function(o) {
		var ret = "",
			count = 0;
		for (var key in o) {
			if( typeof o[key] !== 'undefined' ) {
				ret += (count === 0 ? "?" : "&") +
					key + "=" + encodeURIComponent(o[key]);
				count += 1;
			}
		}
		return ret;
	},
	
	showImage: function(imageUrl, typeEnum, sizeEnum, posEnum) {
		var sprite,
			scene,
			menu,
			closeButton = null,
			normalSprite,
			selectedSprite,
			disabledSprite;
		
		// create layer + sprite
		this.layer = cc.Layer.create();
		sprite = cc.MenuItemImage.create(imageUrl, imageUrl, null, this.clickAdCallback, this);
		
		// set sprite position
		switch (posEnum) {
			case plugin.AdsPos.Center:
				sprite.setPosition(App.winSize.width * .5, App.winSize.height * .5);
				break;
			case plugin.AdsPos.Top:
				sprite.setAnchorPoint(cc.p(.5, 1));
				sprite.setPosition(App.winSize.width * .5, App.winSize.height);
				break;
			case plugin.AdsPos.TopLeft:
				sprite.setAnchorPoint(cc.p(0, 1));
				sprite.setPosition(0, App.winSize.height);
				break;
			case plugin.AdsPos.TopRight:
				sprite.setAnchorPoint(cc.p(1, 1));
				sprite.setPosition(App.winSize.width, App.winSize.height);
				break;
			case plugin.AdsPos.Bottom:
				sprite.setAnchorPoint(cc.p(.5, 0));
				sprite.setPosition(App.winSize.width * .5, 0);
				break;
			case plugin.AdsPos.BottomLeft:
				sprite.setAnchorPoint(cc.p(0, 0));
				sprite.setPosition(0, 0);
				break;
			case plugin.AdsPos.BottomRight:
				sprite.setAnchorPoint(cc.p(1, 0));
				sprite.setPosition(App.winSize.width, 0);
				break;
		}
		
		// close button for fullscreen ad
		if (typeEnum == plugin.AdsType.FullScreenAd) {
			normalSprite = cc.Sprite.create("#close-button.png");
			selectedSprite = cc.Sprite.create("#close-button.png");
			disabledSprite = cc.Sprite.create("#close-button.png");
			if (normalSprite && selectedSprite) {
				selectedSprite.setColor(cc.color(128,128,128));
				closeButton = cc.MenuItemSprite.create(normalSprite, selectedSprite, disabledSprite, this.closeAdCallback, this);
				closeButton.setAnchorPoint(cc.p(1,1));
				closeButton.setPosition(sprite.getPositionX() + sprite.getContentSize().width * .5,
					sprite.getPositionY() + sprite.getContentSize().height * .5);
				closeButton.setPositionY(closeButton.getPositionY() - App.winSize.height);
				closeButton.runAction(cc.EaseOut.create(cc.MoveBy.create(0.5, cc.p(0, App.winSize.height)), 3.0));
				if (App.winSize.width < 1024) {
					closeButton.setScale(.5);
				}

				// make the content size of the clickable image smaller than the close button so they don't conflict
				// (this is because there's a bug in cocos2d-html5 2.2.2 that prevents the top-most menu item from being clicked)
				var w = closeButton.getContentSize().width;
				var size = sprite.getContentSize();
				sprite.setContentSize(size.width - w, size.height);
				sprite.setPositionX(sprite.getPositionX() - w * .5);
			}
		}

		// action
		sprite.setPositionY(sprite.getPositionY() - App.winSize.height);
		sprite.runAction(cc.EaseOut.create(cc.MoveBy.create(0.5, cc.p(0, App.winSize.height)), 3.0));

		// create menu
		menu = cc.Menu.create();
		menu.addChild(sprite);
		if (closeButton) {
			menu.addChild(closeButton, 1);
		}
		menu.setPosition(cc.p());

		// add children
		this.layer.addChild(menu);
		scene = cc.director.getRunningScene()
		if (scene) {
			scene.addChild(this.layer, 1000);
		}

		if( this.listener ) {
			this.listener.onAdsResult(plugin.AdsResultCode.FullScreenViewShown, "MobFox ad shown");
		}
	},
	
	clickAdCallback: function(menuItem) {
		this.debugLog("MobFox: clicked ad, visiting: " + this.adUrl);
		if (this.adUrl.length) {
			cc.openURL(this.adUrl);
		}
	},
	
	closeAdCallback: function(menuItem) {
		this.hideAds();

		if( this.listener ) {
			this.listener.onAdsResult(plugin.AdsResultCode.FullScreenViewDismissed, "MobFox ad dismissed");
		}
	},
	
	getUUID: function(length) {
		var ret = cc.sys.localStorage.getItem("uuid") || "";
		if (ret.length === 0) {
			length = length || 32;
			for (var i = 0; i < length; i+= 1) {
				ret += Math.floor(Math.random() * 16).toString(16);
			}
			cc.sys.localStorage.setItem("uuid", ret);
			this.debugLog("MobFox generated UUID for the first time: " + ret);
		} else {
			this.debugLog("MobFox already had UUID: " + ret);
		}
		return ret;
	}
});
