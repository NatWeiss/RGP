
// why do we get these warnings when loading minified?
// [Warning] Invalid App Id: Must be a number or numeric string representing the application id. (all.js, line 56)
// [Warning] FB.getLoginStatus() called before calling FB.init(). (all.js, line 56)

// scores:
// https://developers.facebook.com/docs/games/scores/


//
// begin module
//
if (typeof window !== "undefined") {
	var plugin = plugin || {};

	plugin.Facebook = (function(){
		var TAG = "Facebook:",
			module = {
				devInfo: {},
				debug: false,
				loggedIn: false,
				isCanvas: false
			};

		module.reset = function() {
			module.playerNames = {"me": "Me"};
			module.playerFirstNames = {"me": "Me"};
			module.playerImageUrls = {"me": ""};
			module.friendIds = [];
		};
		
		module.reset();
		
		module.log = function() {
			if (module.debug) {
				[].unshift.call(arguments, TAG);
				cc.log.apply(self, arguments);
			}
		};
		
		module.callRunningLayer = function(method, param1, param2, param3) {
			scene = cc.director.getRunningScene();
			if (scene && scene.layer && scene.layer[method]) {
				scene.layer[method](param1, param2, param3);
			}
		};

		module.onCheckLoginStatus = function(response) {
			if (!response) {
				return;
			}
			
			if (response.status === "connected") {
				module.log("User is authorized, token: " + response.authResponse.accessToken.substring(0,4) + "...");

				// get my info
				FB.api("/me", function(response) {
					//module.log("Got /me response: " + JSON.stringify(response));
					module.playerNames["me"] = response.name;
					module.playerFirstNames["me"] = response.first_name;
					module.userId = response.id;
					module.deleteRequests();
					module.callRunningLayer("onGetPlayerName", module.playerNames["me"]);
				});
				
				// get my profile image
				module.loadPlayerImage("me");
				
				// get my friends
				FB.api("/me/friends?fields=id,name,first_name", function(response) {
					if (response.data && response.data.length) {
						module.onGetFriends(response.data);
					}
				});
				module.loggedIn = true;
			}
			else if (response.status === "not_authorized") {
				cc.log("FB user is not authorized yet");
				module.loggedIn = false;
				module.reset();
			}
			else {
				cc.log("FB user is not logged in to Facebook");
				module.loggedIn = false;
				module.reset();
			}
			module.log("Logged in? " + module.loggedIn);
			
			module.callRunningLayer("onGetLoginStatus", module.loggedIn);
		};
		
		module.loadPlayerImage = function(id, callback) {
			var dim = App.scale(App.getConfig("social-plugin-profile-image-width") || 100);
			FB.api("/" + id + "/picture?width=" + dim + "&height=" + dim, function(response) {
				if (response.data.url) {
					module.log("Got image url " + response.data.url + " for " + id);
					App.loadImage(response.data.url, function(){
						module.playerImageUrls[id] = response.data.url;
						if (typeof callback === "function"){
							callback(response.data.url);
						}
					});
				}
			});
		};
		
		module.onGetFriends = function(friends) {
			var i,
				len = friends.length,
				friend;
			
			for (i = 0; i < len; i += 1){
				friend = friends[i];
				if (friend.id) {
					module.friendIds.push(friend.id);
					if (friend.name) {
						module.playerNames[friend.id] = friend.name;
					}
					if (friend.first_name) {
						module.playerFirstNames[friend.id] = friend.first_name;
					}
				}
			}
			module.log("Parsed " + module.friendIds.length + " friends");
		};
		
		module.checkForFB = function() {
			if (typeof FB === "undefined") {
				module.log("JS unavailable. Please ensure that all.js is loaded from HTML.");
				return false;
			}
			return true;
		};

		module.init = function() {
			if (typeof FB !== "undefined" && !module.initialized) {
				module.initialized = true;

				if (module.devInfo.appId && module.devInfo.appId.length) {
					// init
					FB.init(module.devInfo);
					module.log("Initialized app ID: " + module.devInfo.appId);

					// subscribe to authorization changes
					FB.Event.subscribe("auth.authResponseChange", module.onCheckLoginStatus);
					
					// detect if running as a facebook canvas
					if (window.name && window.name.length > 0) {
						FB.Canvas.getPageInfo(function(info){
							if (info && info.clientWidth) {
								module.isCanvas = true;
								module.canvasInfo = info;
								module.log("Canvas mode");
							}
						});
					}
				} else {
					module.log("App ID has not been set");
				}
			}
		};
		
		module.deleteRequests = function() {
			var i,
				len,
				gets,
				requestIds;

			// delete request id
			// https://apps.facebook.com/lemonadex/?fb_source=notification&request_ids=221921991333209&ref=notif&app_request_type=user_to_user&notif_t=app_invite
			// https://apps.facebook.com/lemonadex/?fb_source=notification&request_ids=221921991333209%2C1426088330967926&ref=notif&app_request_type=user_to_user&notif_t=app_invite
			gets = App.getHttpQueryParams();
			if (gets.request_ids) {
				cc.log("GET: " + JSON.stringify(gets));
				requestIds = gets.request_ids.split(",");
				if (requestIds) {
					len = requestIds.length;
					for (i = 0; i < len; i += 1) {
						module.log("Deleting request ID: " + requestIds[i]);
						FB.api(requestIds[i] + "_" + module.userId, "delete", function(response) {
							module.log("Delete request response " + JSON.stringify(response));
						});
					}
				}
			}
		};
		
		window.fbAsyncInit = function() {
			//module.log("fbAsyncInit");
			module.init();
		};
		
		return cc.Class.extend({
			init: function() {
			},
			
			configDeveloperInfo: function(devInfo) {
				module.devInfo = devInfo;
				module.init();
			},
			
			login: function(loginInfo) {
				if (module.checkForFB()) {
					FB.login(null, loginInfo);
				}
			},
			
			logout: function() {
				if (module.checkForFB()) {
					FB.logout(null);
				}
			},
			
			isLoggedIn: function() {
				return module.loggedIn;
			},
			
			isCanvasMode: function() {
				return module.isCanvas;
			},
			
			getPlayerName: function(id) {
				if (!id) {
					id = "me";
				}
				return module.playerNames[id];
			},

			getPlayerFirstName: function(id) {
				if (!id) {
					id = "me";
				}
				return module.playerFirstNames[id];
			},

			getPlayerImageUrl: function(id, callback) {
				if (!id) {
					id = "me";
				}
				if (!module.playerImageUrls[id]) {
					module.loadPlayerImage(id, callback);
				}
				return module.playerImageUrls[id];
			},
			
			getRandomFriendId: function() {
				var index = App.rand(module.friendIds.length);
				return module.friendIds[index];
			},
			
			buy: function(productUrl, successCallback, failureCallback) {
				var responseReceived = false,
					responseTimeout = 35;
				
				//
				// https://developers.facebook.com/docs/concepts/payments/dialog/
				//
				FB.ui({
					method: "pay",
					action: "purchaseitem",
					product: productUrl
					//test_currency: "GBP",
					//quantity: 1, // optional, defaults to 1
					//request_id: 'YOUR_REQUEST_ID' // optional, must be unique for each payment
				}, function(response){
					if (!response) {
						return;
					}
					module.log("Payment response: " + JSON.stringify(response).substring(0,64) + "...");

					if (response.status === "completed") {
						module.log("Payment success");
						successCallback();
						responseReceived = true;
					} else if(response.status === "initiated") {
						// TBD: check payments graph api if this truly succeeded
						module.log("Payment initiated, granting success");
						successCallback();
						// note: responseReceived = false;
					} else if(response.error_code) {
						module.log("Payment failure: " + response.error_message);
						failureCallback();
						responseReceived = true;
					} else {
						module.log("Not handling payment response status: " + response.status);
						failureCallback();
						responseReceived = true;
					}
				});

				setTimeout(function(){
					if (!responseReceived){
						module.log("Did not receive a payment response after " + responseTimeout + "s");
					}
				}, responseTimeout * 1000);
			},
			
			resetProductCache: function() {
				// to reset FB's product cache, request a URL like this:
				// https://graph.facebook.com/?id=http%3A%2F%2Fnatweiss.com%2Flemonadex%2Ftipjar.html&scrape=true&method=post
			},
			
			setDebugMode: function (debug) {
				module.debug = (debug ? true : false);
			},
			
			getSDKVersion: function () {
				return 0;
			}
		}); // end class extend

	}()); // end module

} // end if html5
