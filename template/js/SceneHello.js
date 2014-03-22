
var SceneHello,
	LayerHello;

var SceneHello = cc.Scene.extend({
	layer: null,
	
	init: function() {
		this._super();
		
		this.layer = new LayerHello();
		this.layer.init();
		this.addChild(this.layer);
	}
});

//
// begin module pattern
//
var LayerHello = (function(){

	return cc.Layer.extend({
		bg: null,
		labelHello: null,
		labelCounter: null,

		init: function() {
			var self = this,
				winSize = App.getWinSize(),
				font = App.getConfig("font");
			this._super();

			// background
			this.bg = cc.LayerGradient.create(cc.color(127,190,255,255), cc.color(102,153,204,255), cc.p(0.25,-1));
			this.bg.setAnchorPoint(0, 0);
			this.addChild(this.bg, 0);

			// hello world
			labelHello = cc.LabelTTF.create(App.getLocalizedString("hello-world"), font, App.scale(120));
			labelHello.setAnchorPoint(.5, .5);
			labelHello.setPosition(App.centralize(0, 114));
			this.addChild(labelHello, 1);
			labelHello.setPositionY(labelHello.getPositionY() + winSize.height);
			labelHello.runAction(
				cc.EaseOut.create(cc.MoveBy.create(0.333, cc.p(0, -winSize.height)), 1.1)
			);
			labelHello.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.EaseOut.create(cc.ScaleBy.create(1.0, 0.95), 1.5),
				cc.EaseOut.create(cc.ScaleBy.create(3.0, 1.0 / 0.95), 1.5)
			)));

			// player number
			this.labelCounter = cc.LabelTTF.create("", font, App.scale(75));
			this.labelCounter.setAnchorPoint(.5, .5);
			this.labelCounter.setPosition(App.centralize(0, -50));
			this.addChild(this.labelCounter, 1);
			this.labelCounter.setPositionX(this.labelCounter.getPositionX() + winSize.width);
			this.labelCounter.runAction(cc.Sequence.create(
				cc.DelayTime.create(0.25),
				cc.EaseOut.create(cc.MoveBy.create(0.333, cc.p(-winSize.width, 0)), 1.1),
				cc.EaseOut.create(cc.ScaleBy.create(0.1, 1.1), 2.0),
				cc.EaseOut.create(cc.ScaleBy.create(0.2, 1 / 1.1), 1.5)
			));

			// handle touch events
			cc.eventManager.addListener({
				event: cc.EventListener.TOUCH_ALL_AT_ONCE,
				onTouchesBegan: function(touches, event) {
					if (touches) {
						App.showTouchCircle(self, touches[0].getLocation());
						App.playClickSound();
					}
				}
			}, this);

			return true;
		},
		
		onEnter: function() {
			this._super();

			this.setCounterLabel("1");
			App.requestUrl("api/counter", this.onGetCounter);
		},
		
		setCounterLabel: function(number) {
			var string = App.getLocalizedString("you-are-player-number");
			string = string.replace("%d", number);
			this.labelCounter.setString(string);
		},

		//
		// onGetCounter is a callback method without "this" context, like a static method
		//
		onGetCounter: function(response) {
			var scene = cc.director.getRunningScene();
			if (scene && scene.layer) {
				scene.layer.setCounterLabel(parseInt(response));
			}
		}
	}); // end of layer extend

}()); // end of module
