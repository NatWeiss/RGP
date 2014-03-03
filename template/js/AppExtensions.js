
var App = App || {};

App.localizeCurrency = function(amount) {
	return "$" + parseFloat(amount).toFixed(2);
};

App.giveItem = function(itemId, amount) {
	if (amount < 0) {
		Soomla.storeInventory.takeItem(itemId, Math.abs(amount));
	} else {
		Soomla.storeInventory.giveItem(itemId, amount);
	}
};

Soomla.CCSoomlaNdkBridge.buy = function(productId, successCallback, failureCallback) {
	var social = App.getSocialPlugin();
	if (social.isCanvasMode()) {
		social.buy(productId, successCallback, failureCallback);
	}
	else {
		alert("Please play within Facebook to enable purchasing.");
		Soomla.CCSoomlaNdkBridge.onPaymentComplete();
	}
};

Soomla.CCSoomlaNdkBridge.onCurrencyUpdate = function() {
	scene = cc.Director.getInstance().getRunningScene();
	if (scene && scene.layer && scene.layer.onCurrencyUpdate()) {
		scene.layer.onCurrencyUpdate();
	}
};

Soomla.CCSoomlaNdkBridge.onPaymentComplete = function() {
	scene = cc.Director.getInstance().getRunningScene();
	if (scene && scene.layer && scene.layer.onPaymentComplete()) {
		scene.layer.onPaymentComplete();
	}
};

App.playClickSound = function() {
	var sounds = App.getConfig("click-sounds");
	this.clickSound = this.clickSound || 0;
	
	App.playEffect(sounds[this.clickSound]);
	
	this.clickSound = (this.clickSound + 1) % sounds.length;
};

App.showTouchCircle = function(self, pos, item) {
	var circle;
	
	if (typeof pos === "undefined" || pos === null) {
		if (item) {
			pos = cc.p(
				item.getPositionX() + (item.getAnchorPoint().x ? 0 : item.getContentSize().width * .5),
				item.getPositionY() + (item.getAnchorPoint().y ? 0 : item.getContentSize().height * .5)
			);
		} else {
			return;
		}
	}
	
	circle = cc.Sprite.createWithSpriteFrameName("TouchCircle.png");
	if (circle === null) {
		return;
	}
	circle.setPosition(pos);
	circle.setScale(0.5);
	circle.runAction(cc.Sequence.create(
		cc.DelayTime.create(0.5),
		cc.FadeOut.create(1),
		cc.RemoveSelf.create()
	));
	self.addChild(circle, 10);

	circle = cc.Sprite.createWithSpriteFrameName("TouchCircle.png");
	circle.setPosition(pos);
	circle.setScale(0.5);
	circle.runAction(cc.Spawn.create(
		cc.FadeOut.create(1.5),
		cc.Sequence.create(
			cc.ScaleBy.create(1.5, 2.5, 2.5),
			cc.RemoveSelf.create()
		)
	));
	self.addChild(circle, 11);
};

