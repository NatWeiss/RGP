
//
// Implements the Facebook plugin for HTML5 clients. Native clients will supercede this by having already defined `plugin.Facebook` (see `src/facebook`).
//
// Uses the module pattern. The object `module` will contain all private variables used by the plugin. Public methods will be returned by the module and accessible via `plugin.Facebook`.
//
var plugin = plugin || {};

if (typeof plugin.Facebook === "undefined") {

	plugin.Facebook = (function(){
		var logPrefix = "Facebook: ",
			module = {
				devInfo: {},
				debug: false,
				loggedIn: false,
				isCanvas: false,
				userId: ""
			};

//
// ###  module.reset
//
// Reset the module's data. Used initially and when the player logs out.
//
		module.reset = function() {
			module.playerNames = {"me": "Me"};
			module.playerFirstNames = {"me": "Me"};
			module.playerImageUrls = {"me": ""};
			module.friendIds = [];
			module.permissions = null;
		};
		
		module.reset();
		
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
// ###  module.checkForFB
//
// Returns true if the Facebook SDK has been loaded.
//
		module.checkForFB = function() {
			if (typeof FB === "undefined") {
				module.log("FB unavailable. Please ensure that all.js is being loaded.");
				return false;
			}
			return true;
		};

//
// ###  window.fbAsyncInit
//
// Called by Facebook JS SDK when loaded asynchronosly.
//
		window.fbAsyncInit = function() {
			/*module.log("fbAsyncInit");*/
			module.init();
		};
		
//
// ###  module.init
//
// Intializes the module. Configures Facebook and subscribes to authorization changes. Detects if running within the Facebook canvas.
//
// This method can be called multiple times. It will initialize only once.
//
		module.init = function() {
			if (typeof FB !== "undefined" && !module.initialized) {
				module.initialized = true;

				if (module.devInfo.appId && module.devInfo.appId.length) {
					/* Init. */
					FB.init(module.devInfo);
					module.log("Initialized app ID: " + module.devInfo.appId);

					/* Subscribe to authorization changes. */
					FB.Event.subscribe(
						"auth.authResponseChange",
						module.onCheckLoginStatus
					);
					
					/* Detect if running as a Facebook canvas. */
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
		
//
// ###  module.onCheckLoginStatus
//
// Callback used by Facebook whenever the player's login status changes. Handles cases where the player is logged in, not authorized or not logged in.
//
// If logged in, asynchronous requests will be made to get the player's info, profile image, friends and current permissions.
//
		module.onCheckLoginStatus = function(response) {
			if (response && response.status === "connected") {
				module.log("User is authorized, token: " +
					response.authResponse.accessToken.substring(0,4) + "...");

				/* Get my info. */
				if (!module.userId) {
					FB.api("/me", function(response) {
						/*module.log("Got /me response: " + JSON.stringify(response));*/
						module.playerNames["me"] = response.name;
						module.playerFirstNames["me"] = response.first_name;
						module.userId = response.id;
						module.deleteRequests();
						App.callRunningLayer(
							"onGetMyPlayerName",
							module.playerFirstNames["me"]
						);
					});
				}
				
				/* Get my profile image. */
				if (!module.playerImageUrls["me"]) {
					module.loadPlayerImage("me");
				}
				
				/* Get my friends. */
				if (!module.friendIds.length) {
					FB.api("/me/friends?fields=id,name,first_name", function(response) {
						if (response.data && response.data.length) {
							module.onGetFriends(response.data);
						}
					});
				}
				
				/* Get current permissions. */
				if (!module.permissions) {
					module.getCurrentPermissions();
				}
				
				module.loggedIn = true;
			}
			else if (response && response.status === "not_authorized") {
				module.log("User is not authorized yet");
				module.loggedIn = false;
				module.reset();
			}
			else {
				module.log("User is not logged in");
				module.loggedIn = false;
				module.reset();
			}
			/*module.log("Logged in? " + module.loggedIn);*/
			
			App.callRunningLayer("onGetLoginStatus", module.loggedIn);
		};
		
//
// ###  module.loadPlayerImage
//
// Loads a player's profile image URL, then loads the image and uses `cc.textureCache` to cache it using the URL as the key.
//
		module.loadPlayerImage = function(id) {
			var request,
				config = App.config["social-plugin"],
				dim = App.scale(config["profile-image-width"] || 100);
			if (this.checkForFB()) {
				request = "/" + id + "/picture?redirect=0" +
					"&width=" + dim + "&height=" + dim;
				FB.api(request, function(response) {
					if (response && response.data && response.data.url) {
						module.log("Got image url " + response.data.url + " for " + id);
						App.loadImage(response.data.url, function(){
							module.playerImageUrls[id] = response.data.url;
							App.callRunningLayer(
								"onPlayerImageLoaded",
								id,
								module.playerImageUrls[id]
							);
						});
					}
				});
			}
		};
		
//
// ###  module.onGetFriends
//
// Callback used when the player's friends list is loaded. Parses the friends list, saving IDs and names.
//
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
		
//
// ###  module.deleteRequests
//
// Deletes any pending invitation requests. The requests are passed from Facebook when a player is responding to an invitation request and look something like [this](https://apps.facebook.com/your-app-name/?fb_source=notification&request_ids=221921991333209%2C1426088330967926&ref=notif&app_request_type=user_to_user&notif_t=app_invite).
//
		module.deleteRequests = function() {
			var i,
				len,
				gets,
				requestIds;

			gets = App.getHttpQueryParams();
			if (gets.request_ids) {
				/*module.log("GET: " + JSON.stringify(gets));*/
				requestIds = gets.request_ids.split(",");
				if (requestIds) {
					len = requestIds.length;
					for (i = 0; i < len; i += 1) {
						module.log("Deleting request ID: " + requestIds[i]);
						FB.api(
							requestIds[i] + "_" + module.userId,
							"delete",
							function(response) {
								module.log("Delete request response " +
									JSON.stringify(response));
							}
						);
					}
				}
			}
		};
		
//
// ###  module.getCurrentPermissions
//
// Requests the player's current permissions and stores the result.
//
		module.getCurrentPermissions = function() {
			if (module.checkForFB()) {
				FB.api("/me/permissions", function(response) {
					if (response.data && response.data.length) {
						module.permissions = JSON.parse(JSON.stringify(response.data[0]));
						module.log("Current permissions: " +
							JSON.stringify(module.permissions));
					}
				});
			}
		};
		
//
// ###  Public Methods
//
// Here begins the public methods accessible via `plugin.Facebook`.
//
		return cc.Class.extend({

//
// ###  Facebook.init
//
// Initializes the plugin and configures it with the given info object.
//
			init: function(devInfo) {
				module.devInfo = devInfo;
				module.init();
			},
			
//
// ###  Facebook.login
//
// Logs the player in with the given [permissions](https://developers.facebook.com/docs/facebook-login/permissions).
//
// Calls the running layer's `onGetLoginStatus` method when finished. Calls the running layer's `onGetMyPlayerName` method when finished retrieving the current player's details.
//
			login: function(permissions) {
				if (module.checkForFB()) {
					module.log("Logging in with permissions: " + permissions);
					FB.login(function(response){
						if (response && !response.authResponse) {
							module.onCheckLoginStatus();
						}
					}, permissions ? {scope: permissions} : null);
				}
			},
			
//
// ###  Facebook.requestPublishPermissions
//
// Requests the given publishing permissions.
//
			requestPublishPermissions: function(permissions) {
				var i,
					requestingPerms,
					hasAllPermissions = true;

				if (!module.checkForFB()) {
					return;
				}
				
				if (!module.permissions) {
					hasAllPermissions = false;
				} else {
					requestingPerms = permissions.split(',');
					for (i = 0; i < requestingPerms.length; i += 1) {
						if (typeof module.permissions[requestingPerms[i]] === "undefined") {
							hasAllPermissions = false;
							break;
						}
					}
				}
				
				if (!hasAllPermissions) {
					module.log("Requesting additional permissions: " + permissions);
					FB.login(function(response){
						module.getCurrentPermissions();
					}, {scope: permissions});
				} else {
					module.log("Already have permissions: " + permissions);
				}
			},
			
//
// ###  Facebook.logout
//
// Logs the player out.
//
			logout: function() {
				if (module.checkForFB()) {
					FB.logout(null);
				}
			},
			
//
// ###  Facebook.isLoggedIn
//
// Returns true if the player is logged in.
//
			isLoggedIn: function() {
				return module.loggedIn;
			},
			
//
// ###  Facebook.isCanvasMode
//
// Returns true if the HTML5 client is running within a Facebook canvas.
//
			isCanvasMode: function() {
				return module.isCanvas;
			},
			
//
// ###  Facebook.getPlayerName
//
// Returns the player name for the given ID.
//
			getPlayerName: function(id) {
				if (!id) {
					id = "me";
				}
				return module.playerNames[id];
			},

//
// ###  Facebook.getPlayerFirstName
//
// Returns the player's first name for the given ID.
//
			getPlayerFirstName: function(id) {
				if (!id) {
					id = "me";
				}
				return module.playerFirstNames[id];
			},

//
// ###  Facebook.getPlayerImageUrl
//
// Returns the player's image URL for the given ID.
//
// Calls the running layer's `onGetPlayerImageUrl` when complete.
//
			getPlayerImageUrl: function(id) {
				if (!id) {
					id = "me";
				}
				if (!module.playerImageUrls[id]) {
					module.loadPlayerImage(id);
					return "";
				}
				return module.playerImageUrls[id];
			},
			
//
// ###  Facebook.getRandomFriendId
//
// Returns a random player ID from the list of friends.
//
			getRandomFriendId: function() {
				var index = App.rand(module.friendIds.length);
				return module.friendIds[index];
			},
			
//
// ###  Facebook.buy
//
// Attempts to purchase the given product with Facebook Payments. Only works for HTML5 clients running within a Facebook canvas.
//
// See the following [reference](https://developers.facebook.com/docs/concepts/payments/dialog/).
//
			buy: function(productUrl, successCallback, failureCallback) {
				var responseReceived = false,
					responseTimeout = 35;
				
				FB.ui({
					method: "pay",
					action: "purchaseitem",
					product: productUrl
					/* Optional variables. */
					/*test_currency: "GBP",*/
					/*quantity: 1,*/
					/*request_id: 'YOUR_UNIQUE_REQUEST_ID'*/
				}, function(response){
					if (!response) {
						return;
					}
					module.log("Payment response: " +
						JSON.stringify(response).substring(0,64) + "...");

					if (response.status === "completed") {
						module.log("Payment success");
						successCallback();
						responseReceived = true;
					} else if(response.status === "initiated") {
						/* TBD: check payments graph api if this truly succeeded. */
						module.log("Payment initiated, granting success");
						successCallback();
						/*responseReceived = false;*/
					} else if(response.error_code) {
						module.log("Payment failure: " + response.error_message);
						failureCallback();
						responseReceived = true;
					} else {
						module.log("Not handling payment response status: " +
							response.status);
						failureCallback();
						responseReceived = true;
					}
				});

				setTimeout(function(){
					if (!responseReceived){
						module.log("Did not receive a payment response after " +
							responseTimeout + "s");
					}
				}, responseTimeout * 1000);
			},
			
//
// ###  Facebook.setDebugMode
//
// Sets debug mode to the given value. In debug mode, messages are logged to the console.
//
			setDebugMode: function (debug) {
				module.debug = (debug ? true : false);
			},
			
//
// ###  Facebook.getSDKVersion
//
// Returns the Facebook SDK version.
//
			getSDKVersion: function () {
				if (module.checkForFB() && FB.getSDKVersion) {
					return FB.getSDKVersion();
				}
				return "unknown";
			}
		}); // end class extend

	}()); // end module

} // end if html5
