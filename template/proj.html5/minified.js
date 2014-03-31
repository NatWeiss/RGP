//
// Make `cc.loader` think that these files have already been loaded.
//
// Used when minified.
//
(function(){
	if (cc && cc.loader) {
		var files = [
			"js/lib/aes.js",
			"js/lib/underscore.js",
			"js/lib/soomla.js",
			"js/lib/SoomlaNdk.js",
			"js/lib/AdsMobFox.js",
			"js/lib/Facebook.js",
			"js/Config.js",
			"js/HelloJavascript.js",
			"js/SceneHello.js",
			"js/Loader.js"
		];
		var cache = cc.loader._jsCache;
		for (var i = 0; i < files.length; i += 1) {
			cc.loader._jsCache[files[i]] = true;
		}
	}
}());
