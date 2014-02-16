
var App = App || {};

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

Soomla.CCSoomlaNdkBridge.buy = function(productId, callback) {
	if (App.getSocialPlugin().isCanvasMode()) {
		//
		// https://developers.facebook.com/docs/concepts/payments/dialog/
		//
		FB.ui({
			method: "pay",
			action: "purchaseitem",
			product: productId,
			//test_currency: "GBP",
			//quantity: 1, // optional, defaults to 1
			//request_id: 'YOUR_REQUEST_ID' // optional, must be unique for each payment
		}, callback);
	}
	else {
		alert("Haven't implemented non-Facebook web purchasing yet...");
	}
};


