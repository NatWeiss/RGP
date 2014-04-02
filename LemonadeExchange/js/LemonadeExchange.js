
var App = App || {};

App.getInitialLayer = function() {
	return LayerMenu;
};

App.playClickSound = function() {
	var sounds = App.config["click-sounds"];
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
	
	circle = cc.Sprite.create("#TouchCircle.png");
	circle.setPosition(pos);
	circle.setScale(0.5);
	circle.runAction(cc.Sequence.create(
		cc.DelayTime.create(0.5),
		cc.FadeOut.create(1),
		cc.RemoveSelf.create()
	));
	self.addChild(circle, 10);

	circle = cc.Sprite.create("#TouchCircle.png");
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

App.createButton = function(obj, spriteFilename, tag, position, anchorPoint, movement, duration, delay, easeRate) {
	var winSize = App.getWinSize(),
		normalSprite = cc.Sprite.create("#" + spriteFilename),
		selectedSprite = cc.Sprite.create("#" + spriteFilename),
		disabledSprite = cc.Sprite.create("#" + spriteFilename),
		button;
	selectedSprite.setColor(cc.color(128,128,128));

	button = cc.MenuItemSprite.create(normalSprite, selectedSprite, disabledSprite, obj.menuButtonCallback, obj);
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

App.addCurrencyToButton = function(button, amount, currencyAmount, spriteFrameName) {
	var label,
		sprite,
		margin = App.scale(12),
		shadowDistance = App.scale(4),
		buttonSize = button.getContentSize(),
		font = App.getString("font");

	sprite = cc.Sprite.create("#" + spriteFrameName);
	sprite.setPosition(buttonSize.width * .5, buttonSize.height * .5);
	sprite.setScale(0.9);
	button.addChild(sprite);

	label = cc.LabelTTF.create(amount, font, App.scale(50));
	label.setAnchorPoint(0, 1);
	label.setPosition(margin * 1.5, buttonSize.height - margin);
	button.addChild(label, 1);

	label = cc.LabelTTF.create(amount, font, App.scale(50));
	label.setAnchorPoint(0, 1);
	label.setColor(App.config["font-shadow-color"]);
	label.setPosition(margin * 1.5, buttonSize.height - margin - shadowDistance);
	button.addChild(label);

	label = cc.LabelTTF.create(currencyAmount, font, App.scale(50));
	label.setAnchorPoint(1, 0);
	label.setPosition(buttonSize.width - margin * 1.5, margin);
	button.addChild(label, 1);

	label = cc.LabelTTF.create(currencyAmount, font, App.scale(50));
	label.setAnchorPoint(1, 0);
	label.setColor(App.config["font-shadow-color"]);
	label.setPosition(buttonSize.width - margin * 1.5, margin - shadowDistance);
	button.addChild(label);
};
