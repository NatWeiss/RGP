///
/// > See the `LICENSE` file for the license governing this code.
///

///
/// Implements the MobFox advertisements plugin for HTML5 clients. Native clients will supercede this by having already defined `plugin.AdsMobFox` (see `src/mobfox`).
///
/// Conforms to the `InterfaceAds` protocol. Loaded by `pluginx`.
///
/// Uses the module pattern. The object `module` will contain all private variables used by the plugin. Public methods will be returned by the module and accessible via the `plugin.AdsMobFox` constructor.
///
var plugin = plugin || {};

///
/// ###  AdsType
///
/// Types of advertisements to be dislayed.
///
plugin.AdsType = {
	BannerAd: 0,
	FullScreenAd: 1
};

///
/// ###  AdsPos
///
/// Positions for advertisements to be dislayed.
///
plugin.AdsPos = {
	Center: 0,
	Top: 1,
	TopLeft: 2,
	TopRight: 3,
	Bottom: 4,
	BottomLeft: 5,
	BottomRight: 6
};

///
/// ###  module
///
/// Begin the module pattern.
///
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

///
/// ###  module.log
///
/// Logs the given message to the console if the module has debug mode enabled. Log messages are prefixed with the module's `logPrefix`.
///
		module.log = function(msg) {
			if (module.debug) {
				cc.log(logPrefix + msg);
			}
		};
		
///
/// ###  module.getIPAddress
///
/// Requests and stores the client's IP address and geo data.
///
		module.getIPAddress = function() {
			Game.requestUrl("//api.hostip.info/get_json.php?position=true",
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

///
/// ###  module.showAds
///
/// Shows an advertisement given the info object. Uses [corsproxy.com](http://www.cocos2d-x.org/forums/19/topics/38739) to prevent browser warnings.
///
		module.showAds = function(infoObj) {
			var i,
				tries = 0,
				typeEnum = infoObj["type"] || 0,
				sizeEnum = infoObj["size"] || 0,
				posEnum = infoObj["position"] || 0,
				uuid = Game.getUUID(),
				requestUrl,
				responseHandler;
		
			/* Wait until client geo data is full. */
			if (module.geoData === null) {
				module.log("Client IP data not full, waiting...");
				module.doShowAds = Game.clone(infoObj);
				return;
			}
			module.doShowAds = null;

			/* Remove any existing ad. */
			module.hideAds();
			
			/* Proceed with showing ad. */
			var params,
				url,
				isFullscreen = (typeEnum === plugin.AdsType.FullScreenAd),
				urlBase = "//my.mobfox.com/" + (isFullscreen ? "v" : "") +
					"request.php";
			
			if (isFullscreen) {
				params = {
					"sdk": "vad",
					"c.mraid": 0,
					"o_iosadvidlimit": 0,
					"u": "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_3 like Mac OS X) " +
						"AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/11B508",
					"u_wv": "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_3 like Mac OS X) " +
						"AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/11B508",
					"u_br": "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_3 like Mac OS X) " +
						"AppleWebKit/537.51.1 (KHTML, like Gecko) Version/unknown " +
						"Mobile/11B508 Safari/unknown",
					"v": "5.0.0",
					"s": module.devInfo.apiKey,
					"iphone_osversion": "7.0.3",
					"o_iosadvid": "ABCDEF01-2345-6789-ABCD-EF0123456789",
					"rt": "iphone_app",
					"i": module.geoData.ip
				};
			} else {
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
					latitude: module.geoData.lat,
					"adspace.width": parseInt(Game.winSize.width),
					"adspace.height": (Game.winSize.width >= 1024 ? 90 : 50)
				};
			}
			
			/* Ad requester. */
			requestUrl = function() {
				url = Game.insert(urlBase, "://", "www.corsproxy.com/");
				if (isFullscreen) {
					params["t"] = parseFloat(Date.now() / 1000).toFixed(6);
				}
				url += Game.encodeURIComponents(params);
				Game.requestUrl(url, responseHandler);
			};

			/* Ad response handler. */
			responseHandler = function(adResponse, adStatus) {
				var html = adResponse,
					start = 0,
					newStart,
					imageHtml,
					imageCount = 0,
					imageUrl;

				if (typeof adResponse === "undefined") {
					module.log("Error retrieving ad data, status: " + adStatus);
					return;
				}
				module.adUrl = Game.between(html, "href=\"", "\"");
				if (!module.adUrl.length) {
					module.adUrl = Game.between(html, "href='", "'");
				}
				start = module.adUrl.indexOf("http");
				if (start > 0) {
					module.adUrl = module.adUrl.substr(start);
				}
				start = 0;
				module.log("Ad response: " + html);
				if (!module.adUrl.length) {
					tries += 1;
					if (tries < 3) {
						i = Game.rand(150) + 150;
						cc.log("No response " + tries +
							", waiting " + i + " and trying again");
						setTimeout(requestUrl, i);
						return;
					}
				}
				module.log("Ad URL:" + module.adUrl);

				do {
					newStart = html.indexOf("<img ", start);
					/*module.log("Start " + start + " new start " + newStart);*/
					if (newStart <= start) {
						break;
					}
					start = newStart;

					imageHtml = Game.between(html, "<img", ">", start);
					/*module.log("Image html " + imageHtml);*/
					start += 1;
					
					imageUrl = Game.between(imageHtml, "src=\"", "\"");
					if (!imageUrl.length) {
						imageUrl = Game.between(imageHtml, "src='", "'");
						if (!imageUrl.length) {
							break;
						}
					}
					imageCount++;
					imageUrl = Game.insert(imageUrl, "://", "www.corsproxy.com/");
					module.log("Image " + imageCount + ": " +
						(imageUrl.length > 128 ?
							imageUrl.substr(0,128) + "..." :
							imageUrl
						)
					);
					if (imageCount > 10) {
						break;
					}
					
					Game.loadImage(imageUrl, function(url) {
						module.showImage(url, typeEnum, sizeEnum, posEnum);
					});
				} while(imageUrl.length);
				
				if (imageCount == 0) {
					module.log("No images found");
					Game.callRunningLayer("onAdDismissed", false);
				}
			};
			requestUrl();
		};

///
/// ###  module.showImage
///
/// Displays the given advertisement image URL with given parameters.
///
		module.showImage = function(imageUrl, typeEnum, sizeEnum, posEnum) {
			var texture,
				sprite,
				scene,
				menu,
				closeButton = null,
				normalSprite,
				selectedSprite,
				disabledSprite,
				lower = imageUrl.toLowerCase(),
				isImage = (lower.indexOf(".gif") > 0
					|| lower.indexOf(".jpg") > 0
					|| lower.indexOf(".png") > 0);
			
			/* Check the texture. */
			texture = cc.textureCache.textureForKey(imageUrl);
			if (!isImage || !texture || texture.getContentSize().width < 10) {
				/*module.log("Not showing image: " + imageUrl.substr(0,128));*/
				return;
			}
			
			/* Create layer and sprite. */
			module.layer = cc.Layer.create();
			sprite = cc.MenuItemImage.create(
				imageUrl,
				imageUrl,
				null,
				module.clickAdCallback,
				module
			);
			if (texture.getContentSize().height > 0) {
				sprite.scale = Game.winSize.height / texture.getContentSize().height;
			}
			
			/* Set sprite position. */
			if (posEnum === plugin.AdsPos.Center) {
				sprite.setPosition(Game.winSize.width * .5, Game.winSize.height * .5);
			} else if (posEnum === plugin.AdsPos.Top) {
				sprite.setAnchorPoint(cc.p(.5, 1));
				sprite.setPosition(Game.winSize.width * .5, Game.winSize.height);
			} else if (posEnum === plugin.AdsPos.TopLeft) {
				sprite.setAnchorPoint(cc.p(0, 1));
				sprite.setPosition(0, Game.winSize.height);
			} else if (posEnum === plugin.AdsPos.TopRight) {
				sprite.setAnchorPoint(cc.p(1, 1));
				sprite.setPosition(Game.winSize.width, Game.winSize.height);
			} else if (posEnum === plugin.AdsPos.Bottom) {
				sprite.setAnchorPoint(cc.p(.5, 0));
				sprite.setPosition(Game.winSize.width * .5, 0);
			} else if (posEnum === plugin.AdsPos.BottomLeft) {
				sprite.setAnchorPoint(cc.p(0, 0));
				sprite.setPosition(0, 0);
			} else if (posEnum === plugin.AdsPos.BottomRight) {
				sprite.setAnchorPoint(cc.p(1, 0));
				sprite.setPosition(Game.winSize.width, 0);
			}
			
			/* Close button for fullscreen ad. */
			if (typeEnum == plugin.AdsType.FullScreenAd) {
				normalSprite = cc.Sprite.create("#CloseButton.png");
				selectedSprite = cc.Sprite.create("#CloseButton.png");
				disabledSprite = cc.Sprite.create("#CloseButton.png");
				if (normalSprite && selectedSprite) {
					selectedSprite.setColor(cc.color(128,128,128));
					closeButton = cc.MenuItemSprite.create(
						normalSprite,
						selectedSprite,
						disabledSprite,
						module.closeAdCallback,
						module
					);
				} else {
					/*var label = ...;
					closeButton = cc.MenuItemLabel.create(
						label,
						module.closeAdCallback,
						module
					);*/
				}
				if (closeButton) {
					closeButton.setAnchorPoint(cc.p(1,1));
					closeButton.x = sprite.x + (sprite.width * .5 * sprite.scale);
					closeButton.y = sprite.y + (sprite.height * .5 * sprite.scale);
					closeButton.y -= Game.winSize.height;
					closeButton.runAction(cc.EaseOut.create(
						cc.MoveBy.create(0.5, cc.p(0, Game.winSize.height)),
						3.0)
					);

					/* Make the content size of the clickable image smaller than
					the close button so they don't conflict. (Because of a bug in
					cocos2d-html5 that prevents the top-most menu item from
					being clicked.) */
					var w = closeButton.width / sprite.scale;
					var size = sprite.getContentSize();
					sprite.setContentSize(size.width - w, size.height);
					sprite.x -= w * .5;
				}
			}

			/* Run an action. */
			sprite.y -= Game.winSize.height;
			sprite.runAction(cc.EaseOut.create(
				cc.MoveBy.create(0.5, cc.p(0, Game.winSize.height)),
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

///
/// ###  module.hideAds
///
/// Hides the current advertisement. Safe to be called if there is no advertisement.
///
		module.hideAds = function() {
			if (module.layer) {
				module.log("Hiding ads, layer: " + module.layer);
				
				module.layer.stopAllActions();
				module.layer.runAction(cc.Sequence.create(
					cc.EaseIn.create(
						cc.MoveBy.create(0.5, cc.p(0, -Game.winSize.height)),
						3.0),
					cc.RemoveSelf(true)
				));
				module.layer = null;
			}
		};

///
/// ###  module.clickAdCallback
///
/// Callback used when the advertisement is clicked.
///
		module.clickAdCallback = function(menuItem) {
			module.log("Clicked ad, visiting: " + module.adUrl);
			if (Game.isFullscreenEnabled()) {
				Game.enableFullscreen(false);
			}
			if (module.adUrl.length) {
				cc.openURL(module.adUrl);
			}
			module.closeAdCallback();
		};
		
///
/// ###  module.closeAdCallback
///
/// Callback used when the advertisement is closed.
///
		module.closeAdCallback = function(menuItem) {
			module.hideAds();
			Game.callRunningLayer("onAdDismissed");
		};
		
///
/// ###  Public Methods
///
/// Here begins the public methods accessible via creating a new `plugin.AdsMobFox`.
///
		return cc.Class.extend({
		
			init: function(){
			},

///
/// ###  AdsMobFox.configDeveloperInfo
///
/// Configures the plugin with the given developer info object.
///
			configDeveloperInfo: function(devInfo) {
				module.devInfo = devInfo;
				module.getIPAddress();
				module.log("Set API key to: " + module.devInfo.apiKey);
			},
			
///
/// ###  AdsMobFox.showAds
///
/// Shows an advertisement given the info object. Properties of the info object are `type`, `size` and `position` which are all enums. See `plugin.AdsType` and `plugin.AdsPos`.
///
			showAds: function(infoObj) {
				module.showAds(infoObj);
			},

///
/// ###  AdsMobFox.hideAds
///
/// Hides the current advertisement. Safe to be called even if there is no advertisement.
///
			hideAds: function(infoObj) {
				module.hideAds();
			},

///
/// ###  AdsMobFox.queryPoints
///
/// Unused.
///
			queryPoints: function() {
				module.log("Has no points API");
			},

///
/// ###  AdsMobFox.spendPoints
///
/// Unused.
///
			spendPoints: function(points) {
				module.log("Has no points API");
			},

///
/// ###  AdsMobFox.setDebugMode
///
/// Enables or disables debug mode. In debug mode, messages are logged to the console.
///
			setDebugMode: function(debug) {
				module.debug = (debug ? true : false);
			},
			
///
/// ###  AdsMobFox.getSDKVersion
///
/// Returns the SDK version.
///
			getSDKVersion: function() {
				return "unknown";
			},

///
/// ###  AdsMobFox.getPluginVersion
///
/// Returns the plugin version.
///
			getPluginVersion: function() {
				return plugin.Version;
			}

		}); // end cc.Class extend
	
	}()); // end module pattern

} // end if undefined
