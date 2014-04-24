
//
// Implements the MobFox advertisements plugin for HTML5 clients. Native clients will supercede this by having already defined `plugin.AdsMobFox` (see `src/mobfox`).
//
// Conforms to the `InterfaceAds` protocol. Loaded by `pluginx`.
//
// Uses the module pattern. The object `module` will contain all private variables used by the plugin. Public methods will be returned by the module and accessible via the `plugin.AdsMobFox` constructor.
//
var plugin = plugin || {};

//
// ###  AdsType
//
// Types of advertisements to be dislayed.
//
plugin.AdsType = {
	BannerAd: 0,
	FullScreenAd: 1
};

//
// ###  AdsPos
//
// Positions for advertisements to be dislayed.
//
plugin.AdsPos = {
	Center: 0,
	Top: 1,
	TopLeft: 2,
	TopRight: 3,
	Bottom: 4,
	BottomLeft: 5,
	BottomRight: 6
};

//
// ###  module
//
// Begin the module pattern.
//
if (typeof plugin.AdsMobFox === "undefined") {

	plugin.AdsMobFox = (function(){
		var logPrefix = "MobFox: ",
			module = {
				devInfo: {},
				debug: false,
				layer: null,
				adUrl: "",
				geoData: null,
				doShowAds: null
			};

//
// ###  module.log
//
// Logs the given message to the console if the module has debug mode enabled. Log messages are prefixed with the module's `logPrefix`.
//
		module.log = function(msg) {
			if (module.debug) {
				cc.log(logPrefix + msg);
			}
		};
		
//
// ###  module.getIPAddress
//
// Requests and stores the client's IP address and geo data.
//
		module.getIPAddress = function() {
			App.requestUrl("http://api.hostip.info/get_json.php?position=true",
				function(response, status){
					if (!response || !response.length) {
						module.log("Couldn't get client's IP address, status: "	+ status);
						return;
					}
					try {
						module.geoData = JSON.parse(response);
						module.log("Client's IP address: " + module.geoData.ip);
						if (module.doShowAds) {
							module.showAds(module.doShowAds);
						}
					} catch(e) {
						module.log("" + e);
					}
				}
			);
		};

//
// ###  module.showAds
//
// Shows an advertisement given the info object. Uses [corsproxy.com](http://www.cocos2d-x.org/forums/19/topics/38739) to prevent browser warnings.
//
		module.showAds = function(infoObj) {
			var typeEnum = infoObj["type"] || 0,
				sizeEnum = infoObj["size"] || 0,
				posEnum = infoObj["position"] || 0,
				uuid = App.getUUID();
		
			/* Wait until client geo data is full. */
			if (module.geoData === null) {
				module.log("Client IP data not full, waiting...");
				module.doShowAds = App.clone(infoObj);
				return;
			}
			module.doShowAds = null;

			/* Remove any existing ad. */
			module.hideAds();
			
			/* Proceed with showing ad. */
			var doVideo = false,
				isFullscreen = (typeEnum === plugin.AdsType.FullScreenAd),
				url = "http://my.mobfox.com/" + (doVideo ? "v" :"") + "request.php",
				params = {
					rt: "api",
					s: module.devInfo.apiKey,
					i: module.geoData.ip,
					p: window.location,
					m: module.devInfo.mode,
					c_mraid: 1,
					o: uuid,
					v: "2.0",
					u: navigator.userAgent,
					no_markup: 1,
					allow_mr: 1,
					longitude: module.geoData.lng,
					latitude: module.geoData.lat
				};
			if (isFullscreen) {
				params["adspace.width"] = parseInt(App.winSize.width);
				params["adspace.height"] = parseInt(App.winSize.height);
				posEnum = plugin.AdsPos.Center;
			} else if (typeEnum === plugin.AdsType.BannerAd) {
				if (sizeEnum > 0) {
					params["adspace.width"] = parseInt(App.winSize.width);
					params["adspace.height"] = (App.winSize.width >= 1024 ? 90 : 50);
				}
			}

			/* Encode url. */
			url = App.insert(url, "://", "www.corsproxy.com/"),
			url += App.encodeURIComponents(params);
			module.log("Requesting: " + url);
			
			/* Get the ad data. */
			App.requestUrl(url, function(adResponse, adStatus) {
				if (typeof adResponse !== "undefined") {
					var html = adResponse,
						imageUrl = App.between(html, "src=\"", "\"");

					module.log("Ad response: " + html);
					if (!imageUrl.length) {
						module.log("No ad url found");
						App.callRunningLayer("onAdDismissed", false);
						return;
					}
					/*imageUrl = App.insert(imageUrl, "://", "www.corsproxy.com/");*/
					module.adUrl = App.between(html, "href=\"", "\"");
					
					module.log("Image: " + imageUrl + ", click URL:" + module.adUrl);
					
					App.loadImage(imageUrl, function() {
						module.showImage(imageUrl, typeEnum, sizeEnum, posEnum);
					});
				} else {
					module.log("Error retrieving ad data, status: " + adStatus);
				}
			});
		};

//
// ###  module.showImage
//
// Displays the given advertisement image URL with given parameters.
//
		module.showImage = function(imageUrl, typeEnum, sizeEnum, posEnum) {
			var sprite,
				scene,
				menu,
				closeButton = null,
				normalSprite,
				selectedSprite,
				disabledSprite;
			
			/* Create layer and sprite. */
			module.layer = cc.Layer.create();
			sprite = cc.MenuItemImage.create(
				imageUrl,
				imageUrl,
				null,
				module.clickAdCallback,
				module
			);
			
			/* Set sprite position. */
			if (posEnum === plugin.AdsPos.Center) {
				sprite.setPosition(App.winSize.width * .5, App.winSize.height * .5);
			} else if (posEnum === plugin.AdsPos.Top) {
				sprite.setAnchorPoint(cc.p(.5, 1));
				sprite.setPosition(App.winSize.width * .5, App.winSize.height);
			} else if (posEnum === plugin.AdsPos.TopLeft) {
				sprite.setAnchorPoint(cc.p(0, 1));
				sprite.setPosition(0, App.winSize.height);
			} else if (posEnum === plugin.AdsPos.TopRight) {
				sprite.setAnchorPoint(cc.p(1, 1));
				sprite.setPosition(App.winSize.width, App.winSize.height);
			} else if (posEnum === plugin.AdsPos.Bottom) {
				sprite.setAnchorPoint(cc.p(.5, 0));
				sprite.setPosition(App.winSize.width * .5, 0);
			} else if (posEnum === plugin.AdsPos.BottomLeft) {
				sprite.setAnchorPoint(cc.p(0, 0));
				sprite.setPosition(0, 0);
			} else if (posEnum === plugin.AdsPos.BottomRight) {
				sprite.setAnchorPoint(cc.p(1, 0));
				sprite.setPosition(App.winSize.width, 0);
			}
			
			/* Close button for fullscreen ad. */
			if (typeEnum == plugin.AdsType.FullScreenAd) {
				normalSprite = cc.Sprite.create("#close-button.png");
				selectedSprite = cc.Sprite.create("#close-button.png");
				disabledSprite = cc.Sprite.create("#close-button.png");
				if (normalSprite && selectedSprite) {
					selectedSprite.setColor(cc.color(128,128,128));
					closeButton = cc.MenuItemSprite.create(
						normalSprite,
						selectedSprite,
						disabledSprite,
						module.closeAdCallback,
						module
					);
					closeButton.setAnchorPoint(cc.p(1,1));
					closeButton.x = sprite.x + sprite.width * .5;
					closeButton.y = sprite.y + sprite.height * .5;
					closeButton.y -= App.winSize.height;
					closeButton.runAction(cc.EaseOut.create(
						cc.MoveBy.create(0.5, cc.p(0, App.winSize.height)),
						3.0)
					);
					if (App.winSize.width < 1024) {
						closeButton.setScale(.5);
					}

					/* Make the content size of the clickable image smaller than
					the close button so they don't conflict. (Because of a bug in
					cocos2d-html5 2.2.2 that prevents the top-most menu item from
					being clicked.) */
					var w = closeButton.width;
					var size = sprite.getContentSize();
					sprite.setContentSize(size.width - w, size.height);
					sprite.setPositionX(sprite.x - w * .5);
				}
			}

			/* Run an action. */
			sprite.y -= App.winSize.height;
			sprite.runAction(cc.EaseOut.create(
				cc.MoveBy.create(0.5, cc.p(0, App.winSize.height)),
				3.0)
			);

			/* Create the menu. */
			menu = cc.Menu.create();
			menu.addChild(sprite);
			if (closeButton) {
				menu.addChild(closeButton, 1);
			}
			menu.setPosition(cc.p());

			/* Add children. */
			module.layer.addChild(menu);
			scene = cc.director.getRunningScene()
			if (scene) {
				scene.addChild(module.layer, 1000);
			}
		};

//
// ###  module.hideAds
//
// Hides the current advertisement. Safe to be called if there is no advertisement.
//
		module.hideAds = function() {
			if (module.layer) {
				module.log("Hiding ads, layer: " + module.layer);
				
				module.layer.stopAllActions();
				module.layer.runAction(cc.Sequence.create(
					cc.EaseIn.create(
						cc.MoveBy.create(0.5, cc.p(0, -App.winSize.height)),
						3.0),
					cc.RemoveSelf(true)
				));
				module.layer = null;
			}
		};

//
// ###  module.clickAdCallback
//
// Callback used when the advertisement is clicked.
//
		module.clickAdCallback = function(menuItem) {
			module.log("Clicked ad, visiting: " + module.adUrl);
			if (module.adUrl.length) {
				cc.openURL(module.adUrl);
			}
		};
		
//
// ###  module.closeAdCallback
//
// Callback used when the advertisement is closed.
//
		module.closeAdCallback = function(menuItem) {
			module.hideAds();
			App.callRunningLayer("onAdDismissed");
		};
		
//
// ###  Public Methods
//
// Here begins the public methods accessible via creating a new `plugin.AdsMobFox`.
//
		return cc.Class.extend({
		
			init: function(){
			},

//
// ###  AdsMobFox.configDeveloperInfo
//
// Configures the plugin with the given developer info object.
//
			configDeveloperInfo: function(devInfo) {
				module.devInfo = devInfo;
				module.getIPAddress();
				module.log("Set API key to: " + module.devInfo.apiKey);
			},
			
//
// ###  AdsMobFox.showAds
//
// Shows an advertisement given the info object. Properties of the info object are `type`, `size` and `position` which are all enums. See `plugin.AdsType` and `plugin.AdsPos`.
//
			showAds: function(infoObj) {
				module.showAds(infoObj);
			},

//
// ###  AdsMobFox.hideAds
//
// Hides the current advertisement. Safe to be called even if there is no advertisement.
//
			hideAds: function(infoObj) {
				module.hideAds();
			},

//
// ###  AdsMobFox.queryPoints
//
// Unused.
//
			queryPoints: function() {
				module.log("Has no points API");
			},

//
// ###  AdsMobFox.spendPoints
//
// Unused.
//
			spendPoints: function(points) {
				module.log("Has no points API");
			},

//
// ###  AdsMobFox.setDebugMode
//
// Enables or disables debug mode. In debug mode, messages are logged to the console.
//
			setDebugMode: function(debug) {
				module.debug = (debug ? true : false);
			},
			
//
// ###  AdsMobFox.getSDKVersion
//
// Returns the SDK version.
//
			getSDKVersion: function() {
				return "unknown";
			},

//
// ###  AdsMobFox.getPluginVersion
//
// Returns the plugin version.
//
			getPluginVersion: function() {
				return plugin.Version;
			}

		}); // end cc.Class extend
	
	}()); // end module pattern

} // end if undefined
