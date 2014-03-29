
//
// Create a unique loading screen by customizing `cc.LoaderScene`.
//
// See `lib/cocos2d-html5/cocos2d/core/scenes/CCLoaderScene.js`.
//

//
// ###  cc.LoaderScene.init
//
// Setup the loader scene.
//
cc.LoaderScene.prototype.init = function(){
	var self = this;
	this._winSize = cc.director.getWinSize();
	
	/* Call super's init. */
	cc.Scene.prototype.init.call(this);

	/* Start loading the logo texture. */
	cc.loader.loadImg(App.getConfig("loading-image"),
		{isCrossOrigin : false},
		function(err, img){
			var sizePercent = App.getConfig("loading-image-win-size-percent");

			self._initStage(img, cc.p(self._winSize.width * .5,
				self._winSize.height * .6));

			if (sizePercent) {
				self._logo.setScale((self._winSize.height * sizePercent)
					/ self._logo.getContentSize().height);
			}
		}
	);

	/* Create background color. */
	this._bgLayer = cc.LayerColor.create(App.getConfig("loader-bg-color"));
	this._bgLayer.setPosition(0, 0);
	this.addChild(this._bgLayer, 0);

	/* Create label. */
	this._label = cc.LabelTTF.create(
		App.getConfig("loader-text") || "Loading...",
		App.getConfig("loader-text-font") || "Arial",
		App.getConfig("loader-text-size") || 20
	);
	this._label.setColor(
		App.getConfig("loader-text-color") || cc.color(180,180,180,255)
	);
	this._label.setPosition(this._winSize.width * .5, this._winSize.height * .265);
	this._bgLayer.addChild(this._label, 10);

	/* Create loading bar. */
	this._loadingBarSize = cc.size(
		this._winSize.width * .2,
		this._winSize.height * .025
	);
	this._loadingBar = cc.LayerColor.create(
		App.getConfig("loader-bar-color") || cc.color(9,9,10,255),
		this._loadingBarSize.width,
		this._loadingBarSize.height
	);
	this._loadingBar.setPosition(this._winSize.width * .4, this._winSize.height * .2);
	this._loadingBar.setContentSize(2, this._loadingBarSize.height);
	this.addChild(this._loadingBar, 10);
};

//
// ###  cc.LoaderScene._updatePercent
//
// Update the percent loaded animation.
//
cc.LoaderScene.prototype._updatePercent = function (){
	var percent = Math.min(100, Math.max(0, (this._count / this._length) * 100)),
		width = Math.max(2, this._loadingBarSize.width * (percent / 100));

	/* Set width of loading bar. */
	this._loadingBar.setContentSize(width, this._loadingBarSize.height);

	/* Unschedule update. */
	if (percent >= 100) {
		this.unschedule(this._updatePercent);
	}
};
