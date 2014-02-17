
var App = App || {};

App.giveItem = function(itemId, amount) {
	if (amount < 0) {
		Soomla.storeInventory.takeItem(itemId, Math.abs(amount));
	} else {
		Soomla.storeInventory.giveItem(itemId, amount);
	}
};

App.playClickSound = function() {
	var sounds = App.getConfig("click-sounds");
	this.clickSound = this.clickSound || 0;
	
	App.playEffect(sounds[this.clickSound]);
	
	this.clickSound = (this.clickSound + 1) % sounds.length;
};

App.createButton = function(obj, spriteFilename, tag, position, anchorPoint, movement, duration, delay, easeRate) {
	var winSize = App.getWinSize(),
		normalSprite = cc.Sprite.createWithSpriteFrameName(spriteFilename),
		selectedSprite = cc.Sprite.createWithSpriteFrameName(spriteFilename),
		button;
	selectedSprite.setColor(cc.c3b(128,128,128));

	button = cc.MenuItemSprite.create(normalSprite, selectedSprite, obj.menuButtonCallback, obj);
	button.setTag(tag);
	if (typeof movement !== "undefined") {
		button.setPosition(cc.pSub(position, movement));
		button.runAction(cc.Sequence.create(
			cc.DelayTime.create(delay),
			cc.EaseOut.create(cc.MoveBy.create(duration, movement), easeRate ? easeRate : 1.5)
		));
	} else {
		button.setPosition(position);
	}
	button.setAnchorPoint(anchorPoint);
	obj.menu.addChild(button);

	return button;
};

App.showTouchCircle = function(self, pos) {
	var item,
		circle;
	
	if (typeof pos === "undefined") {
		if (self.menu) {
			item = self.menu._selectedItem;
			if (item) {
				pos = cc.p(
					item.getPositionX() + (item.getAnchorPoint().x ? 0 : item.getContentSize().width * .5),
					item.getPositionY() + (item.getAnchorPoint().y ? 0 : item.getContentSize().height * .5)
				);
			}
		} else {
			return;
		}
	}
	
	circle = cc.Sprite.createWithSpriteFrameName("TouchCircle.png");
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


Soomla.CCSoomlaNdkBridge.buy = function(productId, successCallback, failureCallback) {
	var social = App.getSocialPlugin();
	if (social.isCanvasMode()) {
		social.buy(productId, successCallback, failureCallback);
	}
	else {
		alert("Haven't implemented non-Facebook web purchasing yet...");
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