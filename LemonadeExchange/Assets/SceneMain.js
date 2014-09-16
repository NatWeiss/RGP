///
/// > See the `LICENSE` file for the license governing this code.
///

///
/// The main scene for LemonadeExchange. Provides a consistent background layer for the foreground layers [LayerMenu](LayerMenu.html) and [LayerGame](LayerGame.html).
///

///
/// ###  SceneMain
///
/// Uses the module pattern to define some private variables. Returns a constructor.
///
var SceneMain = (function() {
	var EFFECT_ORBIT_RADIUS = 8.0;

///
/// ###  Public
///
/// Here begins the public `SceneMain` class.
///
	return cc.Scene.extend({
		layer: null,
		bg: null,
		runTime: 0,
		
///
/// ###  SceneMain.init
///
/// Setup the background layer and start the animation. Create the initial foreground layer.
///
		init: function() {
			var winSize = Game.getWinSize();
			this._super();
			
			EFFECT_ORBIT_RADIUS = Game.scale(EFFECT_ORBIT_RADIUS);
			
			/* Create the background layer. */
			this.bg = cc.Sprite.create("#Bg.png");
			this.bg.setAnchorPoint(0, 0);
			this.bg.setScale(1.05 * Math.max(
				winSize.width / (this.bg.width - EFFECT_ORBIT_RADIUS * 2),
				winSize.height / (this.bg.height - EFFECT_ORBIT_RADIUS * 2)
				));
			this.addChild(this.bg, 0);
			
			/* Create the first foreground layer. */
			this.createLayer(Game.getInitialLayer(), false);
			
			/* Schedule an update to run a custom effect on the background. */
			this.scheduleUpdate();
		},

///
/// ###  SceneMain.createLayer
///
/// Creates a new foreground layer. Destroys any existing foreground layer.
///
		createLayer: function(LayerClass, canResume) {
			if (this.layer) {
				this.layer.removeFromParent();
				this.layer = null;
			}

			this.layer = new LayerClass();
			this.layer.init(canResume);
			this.addChild(this.layer);
		},
		
///
/// ###  SceneMain.update
///
/// Makes the background look sort of like it is swirling by updating it's position. Called continously.
///
		update: function(dt) {
			var percent,
				yScale = 0.5;
			
			this.runTime += dt;
			percent = (this.runTime % 2.0) * .5;
			
			this.bg.x = EFFECT_ORBIT_RADIUS * -1 +
				Math.sin(percent * Math.PI * 2) * EFFECT_ORBIT_RADIUS;
			this.bg.y = (EFFECT_ORBIT_RADIUS * -1 +
				Math.cos(percent * Math.PI * 2) * EFFECT_ORBIT_RADIUS) * yScale;
			
			Game.startMusic();
		}

	}); // end or scene extend

}()); // end of module closure
