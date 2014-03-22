
var App = App || {};

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
	
//	var frame = cc.spriteFrameCache.getSpriteFrame("TouchCircle.png");
//	cc.log("TouchCircle.png spriteframe: " + frame);
	
	
	circle = cc.Sprite.create("#TouchCircle.png");
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

