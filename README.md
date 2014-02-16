
My Edits to Cocos2d HTML5
=========================

Added plugins loaded via cocos2d-html5/cocos2d/jsloader.js
Added cocos2d-html5/extensions/PluginX/protocols/ProtocolAds.js, ProtocolAnalytics.js, ProtocolIAP.js

My Edits to Cocos2d-X
=====================

Added optional parameters to CCTextureCache::addImage() to cache image from raw file data.
Added jsval_to_binary_data() to scripting/javascript/bindings/ScriptingCore.*.
Fixed XMLHTTPRequest so it can properly copy binary data.
Added a 2nd optional parameter (binary array buffer) to JSB's cc.TextureCache.addImage().
	cocos2d-x/scripting/javascript/bindings/generated/jsb_cocos2dx_auto.cpp
Edited plugin/jsbindings/js/jsb_pluginx.js to include proper constants, such as:
	plugin.PluginParam = plugin.PluginParam || {};
	plugin.ShareResultCode = {...
Added cc.Browser.openURL() to bindings.
