
cc.LoaderScene.prototype.init = function(){
	var self = this;
	cc.Scene.prototype.init.call(this);

	this._currentColor = 0;
	this._colors = App.getConfig("loading-image-colors") || [];

	//
	// convert your image to base64:
	// http://webcodertools.com/imagetobase64converter
	//
	this._logoTexture = new Image();
	this._logoTexture.addEventListener("load", function () {
		var sizePercent = App.getConfig("loading-image-win-size-percent");
		self._initStage(cc.p(self._winSize.width * .5, self._winSize.height * .6));
		
		// adjust size of image
		if (sizePercent) {
			self._logo.setScale((self._winSize.height * sizePercent) / self._logo.getContentSize().height);
		}
		
		this.removeEventListener("load", arguments.callee, false);
	}, false);
	this._logoTexture.src = App.getConfig("loading-image");
	if (App.getConfig("loading-image-width")) {
		this._logoTexture.width = App.getConfig("loading-image-width");
	}
	if (App.getConfig("loading-image-height")) {
		this._logoTexture.height = App.getConfig("loading-image-height");
	}

	// background
	this._bgLayer = cc.LayerColor.create(App.getConfig("loader-bg-color") || cc.c4b(0,0,0,0));
	this._bgLayer.setPosition(0, 0);
	this.addChild(this._bgLayer, 0);

	// label
	this._label = cc.LabelTTF.create(
		App.getConfig("loader-text") || "Loading...",
		App.getConfig("loader-text-font") || "Arial",
		App.getConfig("loader-text-size") || 20
	);
	this._label.setColor(App.getConfig("loader-text-color") || cc.c3(180, 180, 180));
	this._label.setPosition(this._winSize.width * .5, this._winSize.height * .265);
	this._bgLayer.addChild(this._label, 10);

	// loading bar
	this._loadingBarSize = cc.size(this._winSize.width * .2, this._winSize.height * .025);
	this._loadingBar = cc.LayerColor.create(
		App.getConfig("loader-bar-color") || cc.c4b(9,9,10,255),
		this._loadingBarSize.width,
		this._loadingBarSize.height
	);
	this._loadingBar.setPosition(this._winSize.width * .4, this._winSize.height * .2);
	this._loadingBar.setContentSize(2, this._loadingBarSize.height);
	this.addChild(this._loadingBar, 10);
};

cc.LoaderScene.prototype._updatePercent = function (){
	var percent = cc.Loader.getInstance().getPercentage(),
		xSpacing;

	if (percent >= 100) {
		this._currentColor = this._colors.length - 1;
	}
	
	if (this._logo) {
		if (this._colors.length) {
			xSpacing = this._logo.getContentSize().width * .5;
			this._logo.setColor(this._colors[this._currentColor]);
			this._logo.setPositionX(this._winSize.width * .5 + ((this._currentColor - (this._colors.length * .5)) * xSpacing));
		}
	}

	this._loadingBar.setContentSize(this._loadingBarSize.width * (percent / 100), this._loadingBarSize.height);

	this._currentColor = Math.min(this._currentColor + 1, this._colors.length - 1);

	if (percent >= 100) {
		this.unschedule(this._updatePercent);
	}
};
