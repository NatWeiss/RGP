
//
// begin module
//
plugin.Facebook = (function(){
	var private = {
		devInfo: {},
		debug: false,
		loggedIn: false,
		playerName: "Anonymous"
	};
	
	private.debugLog = function() {
		if (this.debug) {
			cc.log.apply(this, arguments);
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
			private.debugLog("Facebook user is authorized, access Token: " + response.authResponse.accessToken.substring(0,4) + "...");

			FB.api("/me", function(response) {
				private.playerName = response.name;
				private.callRunningLayer("onGetPlayerName", private.playerName);
			});
			private.loggedIn = true;
		} else if (response.status === "not_authorized") {
			cc.log("FB user is not authorized yet");
			private.loggedIn = false;
		} else {
			cc.log("FB user is not logged in to Facebook");
			private.loggedIn = false;
		}
		private.debugLog("Logged in? " + private.loggedIn);
		
		private.callRunningLayer("onGetLoginStatus", private.loggedIn);
	};
	
	private.checkForFB = function() {
		if (typeof FB === "undefined") {
			private.debugLog("Facebook JS SDK unavailable. Please ensure that all.js is loaded from HTML.");
			return false;
		}
		return true;
	};

	private.init = function() {
		if (typeof FB !== "undefined" && !private.initialized) {
			// init
			FB.init(private.devInfo);
			private.debugLog("Initialized Facebook app ID: " + private.devInfo.appId);

			// subscribe to authorization changes
			FB.Event.subscribe("auth.authResponseChange", private.onCheckLoginStatus);
			
			private.initialized = true;
		}
	};
	
	window.fbAsyncInit = function() {
		private.debugLog("fbAsyncInit");
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

