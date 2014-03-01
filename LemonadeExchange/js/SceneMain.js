

var SceneMain = (function() {
	var EFFECT_ORBIT_RADIUS = 8.0;

	return cc.Scene.extend({
		layer: null,
		bg: null,
		runTime: 0,
		
		init: function() {
			var winSize = App.getWinSize();
			this._super();
			
			EFFECT_ORBIT_RADIUS = App.scale(EFFECT_ORBIT_RADIUS);
			
			// background
			this.bg = cc.Sprite.createWithSpriteFrameName("Bg.png");
			this.bg.setAnchorPoint(0, 0);
			this.bg.setScale(Math.max(
				winSize.width / (this.bg.getContentSize().width - EFFECT_ORBIT_RADIUS * 2),
				winSize.height / (this.bg.getContentSize().height - EFFECT_ORBIT_RADIUS * 2)
				));
			this.addChild(this.bg, 0);
			
			// create first layer
			// it will be swapped out for other layers
			this.createLayer(App.getInitialLayer(), false);
			
			// schedule an update to run an effect on the background
			this.scheduleUpdate();
		},

		update: function(dt) {
			var percent,
				yScale = 0.5;
			
			this.runTime += dt;
			percent = (this.runTime % 2.0) * .5;
			
			this.bg.setPosition(EFFECT_ORBIT_RADIUS * -1 + Math.sin(percent * Math.PI * 2) * EFFECT_ORBIT_RADIUS,
				(EFFECT_ORBIT_RADIUS * -1 + Math.cos(percent * Math.PI * 2) * EFFECT_ORBIT_RADIUS) * yScale);
		},

		createLayer: function(LayerClass, canResume) {
			if (this.layer) {
				this.layer.removeFromParent();
				this.layer = null;
			}

			this.layer = new LayerClass();
			this.layer.init(canResume);
			this.addChild(this.layer);
		}
		
	}); // end or scene extend

}()); // end of module closure
