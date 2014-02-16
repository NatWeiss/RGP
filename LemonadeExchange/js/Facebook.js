
//
// begin module
//
plugin.Facebook = (function(){
	var TAG = "Facebook:",
		private = {
			devInfo: {},
			debug: false,
			loggedIn: false,
			isCanvas: false,
			playerName: "Anonymous"
		};
	
	private.log = function() {
		if (private.debug) {
			[].unshift.call(arguments, TAG);
			cc.log.apply(self, arguments);
		}
	};
	
	private.callRunningLayer = function(method, param1, param2, param3) {
		scene = cc.Director.getInstance().getRunningScene();
		if (scene && scene.layer && scene.layer[method]) {
			scene.layer[method](param1, param2, param3);
		}
	};

	private.onCheckLoginStatus = function(response) {
		if (!response) {
			return;
		}
		
		if (response.status === "connected") {
			private.log("User is authorized, token: " + response.authResponse.accessToken.substring(0,4) + "...");

			FB.api("/me", function(response) {
				private.playerName = response.name;
				private.callRunningLayer("onGetPlayerName", private.playerName);
			});
			private.loggedIn = true;
		}
		else if (response.status === "not_authorized") {
			cc.log("FB user is not authorized yet");
			private.loggedIn = false;
		}
		else {
			cc.log("FB user is not logged in to Facebook");
			private.loggedIn = false;
		}
		private.log("Logged in? " + private.loggedIn);
		
		private.callRunningLayer("onGetLoginStatus", private.loggedIn);
	};
	
	private.checkForFB = function() {
		if (typeof FB === "undefined") {
			private.log("JS unavailable. Please ensure that all.js is loaded from HTML.");
			return false;
		}
		return true;
	};

	private.init = function() {
		if (typeof FB !== "undefined" && !private.initialized) {
			// init
			FB.init(private.devInfo);
			private.log("Initialized app ID: " + private.devInfo.appId);

			// subscribe to authorization changes
			FB.Event.subscribe("auth.authResponseChange", private.onCheckLoginStatus);
			
			// detect if running as a facebook canvas
			if (window.name && window.name.length > 0) {
				FB.Canvas.getPageInfo(function(info){
					if (info && info.clientWidth) {
						private.isCanvas = true;
						private.canvasInfo = info;
						private.log("Canvas mode");
					}
				});
			}
			
			private.initialized = true;
		}
	};
	
	window.fbAsyncInit = function() {
		private.log("fbAsyncInit");
		private.init();
	};
	
	return cc.Class.extend({
		init: function() {
		},
		
		configDeveloperInfo: function(devInfo) {
			private.devInfo = devInfo;
			private.init();
		},
		
		login: function(loginInfo) {
			if (private.checkForFB()) {
				FB.login(null, loginInfo);
			}
		},
		
		logout: function() {
			if (private.checkForFB()) {
				FB.logout(null);
			}
		},
		
		isLoggedIn: function() {
			return private.loggedIn;
		},
		
		isCanvasMode: function() {
			return private.isCanvas;
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
				product: productUrl,
				//test_currency: "GBP",
				//quantity: 1, // optional, defaults to 1
				//request_id: 'YOUR_REQUEST_ID' // optional, must be unique for each payment
			}, function(response){
				if (!response) {
					return;
				}
				private.log("Payment response: " + JSON.stringify(response).substring(0,64) + "...");

				if (response.status === "completed") {
					private.log("Payment success");
					successCallback();
					responseReceived = true;
				} else if(response.status === "initiated") {
					// TBD: check payments graph api if this truly succeeded
					private.log("Payment initiated, granting success");
					successCallback();
					// note: responseReceived = false;
				} else if(response.error_code) {
					private.log("Payment failure: " + response.error_message);
					failureCallback();
					responseReceived = true;
				} else {
					private.log("Not handling payment response status: " + response.status);
					failureCallback();
					responseReceived = true;
				}
			});

			setTimeout(function(){
				if (!responseReceived){
					private.log("Did not receive a payment response after " + responseTimeout + "s");
				}
			}, responseTimeout * 1000);
		},
		
		resetProductCache: function() {
			// to reset FB's product cache, request a URL like this:
			// https://graph.facebook.com/?id=http%3A%2F%2Fnatweiss.com%2Flemonadex%2Ftipjar.html&scrape=true&method=post
		},
		
		getPlayerName: function() {
			return private.playerName;
		},

		setDebugMode: function (debug) {
			private.debug = (debug ? true : false);
		},
		
		getSDKVersion: function () {
			return 0;
		}
	}); // end class extend

}()); // end module

