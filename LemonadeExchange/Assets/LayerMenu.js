
//
// The layer which runs the main menu. Provides buttons to play, login or logout, enable or disable sound and enable or disable fullscreen.
//

//
// ###  LayerMenu
//
// Uses the module pattern to define some private variables. Returns a constructor.
//
var LayerMenu = (function(){

	var TAG_PLAY_RESUME = 0,
		TAG_LOGIN_LOGOUT = 1,
		TAG_TOGGLE_SOUND = 2,
		TAG_TOGGLE_FULLSCREEN = 3,
		TAG_INFO = 4;

//
// ###  Public
//
// Here begins the public `LayerMenu` class.
//
	return cc.Layer.extend({
		songNumber: 0,
		logo: null,
		menu: null,
		buttonLogin: null,
		buttonLogout: null,
		buttonSound: null,
		buttonNoSound: null,
		buttonFullscreen: null,
		buttonMinimize: null,

//
// ###  LayerMenu.init
//
// Setup the sprites, buttons, etc. Start animations. Register for events.
//
		init: function(canResume) {
			var self = this,
				winSize = Game.getWinSize(),
				layer,
				sprite,
				label,
				button,
				loggedIn,
				pos = cc.p(0,0),
				xSpacing = Game.scale(300),
				numButtons = 2;
			this._super();

			/* Create the menu. */
			this.menu = cc.Menu.create();
			this.menu.setPosition(0,0);
			this.addChild(this.menu, 2);
			
			/* Preload font. */
			label = cc.LabelTTF.create(" ", Game.config["font"], 1);
			label.x = -4000;
			this.addChild(label, -1);

			/* Create the logo. */
			this.logo = cc.Sprite.create("#Logo.png");
			this.logo.setPosition(Game.centralize(20, 114));
			this.addChild(this.logo, 1);
			this.logo.setPositionY(this.logo.getPositionY() + winSize.height);
			this.logo.runAction(cc.Sequence.create(
				cc.EaseOut.create(cc.MoveBy.create(0.333, cc.p(0, -winSize.height)), 1.1),
				cc.EaseOut.create(cc.ScaleBy.create(0.1, 1.1), 2.0),
				cc.EaseOut.create(cc.ScaleBy.create(0.2, 1 / 1.1), 1.5)
			));
			this.logo.setRotation(-2);
			this.logo.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.EaseInOut.create(cc.RotateBy.create(2.2, 4), 3.0),
				cc.EaseInOut.create(cc.RotateBy.create(2.5, -4), 3.0)
			)));
			
			/* Create the button layer. */
			layer = cc.LayerColor.create(
				cc.color(0,0,0,202),
				winSize.width * 1.2,
				Game.scale(185)
			);
			layer.x = Game.scale(-20);
			layer.y = winSize.height * .5 - Game.scale(275) - winSize.height;
			layer.setRotation(-2);
			this.addChild(layer, 1);
			layer.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.EaseOut.create(cc.RotateBy.create(1.5, 1), 1.2),
				cc.EaseOut.create(cc.RotateBy.create(1.7, -1), 1.2)
			)));
			layer.runAction(cc.EaseOut.create(
				cc.MoveBy.create(0.5, cc.p(0, winSize.height)), 1.5
			));
			
			/* Create the buttons. */
			pos = Game.centralize(0,-183);
			pos.x -= ((numButtons - 1) * .5) * xSpacing;
			button = Game.createButton(this, "ButtonPlay.png", TAG_PLAY_RESUME, pos,
				cc.p(.5, .5), cc.p(winSize.width, 0), 0.5, 1.0, 1.5);
			button.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.DelayTime.create(1.5),
				cc.ScaleBy.create(0.2, 1.02),
				cc.ScaleBy.create(0.1, 1 / 1.02)
			)));

			pos.x += xSpacing;
			this.buttonLogin = Game.createButton(this, "ButtonLogin.png",
				TAG_LOGIN_LOGOUT, pos, cc.p(.5, .5),
				cc.p(winSize.width, 0), 0.5, 0.7, 1.5);
			this.buttonLogout = Game.createButton(this, "ButtonLogout.png",
				TAG_LOGIN_LOGOUT, pos, cc.p(.5, .5),
				cc.p(winSize.width, 0), 0.5, 0.7, 1.5);
			loggedIn = Game.getSocialPlugin().isLoggedIn();
			this.buttonLogin.setVisible(!loggedIn);
			this.buttonLogout.setVisible(loggedIn);

			/*pos.x += xSpacing;
			button = Game.createButton(this, "ButtonAbout.png", TAG_INFO, pos,
				cc.p(.5, .5), cc.p(winSize.width, 0), 0.5, 0.4, 1.5);*/

			this.buttonSound = Game.createButton(this, "ButtonSound.png",
				TAG_TOGGLE_SOUND, Game.centralize(-420, 260), cc.p(.5, .5),
				cc.p(winSize.width * .5, -winSize.height), 0.5, 0.25, 1.5);
			this.buttonNoSound = Game.createButton(this, "ButtonNoSound.png",
				TAG_TOGGLE_SOUND, Game.centralize(-420, 260), cc.p(.5, .5),
				cc.p(winSize.width * .5, -winSize.height), 0.5, 0.25, 1.5);
			this.buttonSound.setScale(0.8);
			this.buttonNoSound.setScale(0.8);
			this.buttonSound.setVisible(Game.isSoundEnabled());
			this.buttonNoSound.setVisible(!Game.isSoundEnabled());

			this.buttonFullscreen = Game.createButton(this, "ButtonFullscreen.png",
				TAG_TOGGLE_FULLSCREEN, Game.centralize(420, 260), cc.p(.5, .5),
				cc.p(-winSize.width * .5, -winSize.height), 0.5, 0.25, 1.5);
			this.buttonMinimize = Game.createButton(this, "ButtonMinimize.png",
				TAG_TOGGLE_FULLSCREEN, Game.centralize(420, 260), cc.p(.5, .5),
				cc.p(-winSize.width * .5, -winSize.height), 0.5, 0.25, 1.5);
			this.buttonFullscreen.setScale(0.8);
			this.buttonMinimize.setScale(0.8);
			this.buttonMinimize.setVisible(false);
			if (!Game.isHtml5()) {
				this.buttonFullscreen.setVisible(false);
			}
			
			/* Handle touch events. */
			cc.eventManager.addListener({
				event: cc.EventListener.TOUCH_ALL_AT_ONCE,
				onTouchesBegan: function(touches, event) {
					if (touches) {
						Game.showTouchCircle(self, touches[0].getLocation());
						Game.playClickSound();
					}
				}
			}, this);

			return true;
		},
		
//
// ###  LayerMenu.menuButtonCallback
//
// Callback for when a button is clicked. Determines which button was clicked by tag.
//
		menuButtonCallback: function(sender) {
			var self = this,
				tag = sender.getTag(),
				socialPlugin;
			
			Game.playClickSound();
			Game.showTouchCircle(this, null, sender);
			
			if (tag == TAG_PLAY_RESUME) {
				this.getParent().createLayer(LayerGame, true);
			}
			else if (tag == TAG_LOGIN_LOGOUT) {
				this.buttonLogin.setEnabled(false);
				this.buttonLogout.setEnabled(false);

				socialPlugin = Game.getSocialPlugin();
				if (socialPlugin.isLoggedIn()) {
					socialPlugin.logout();
				} else {
					socialPlugin.login(Game.config["social-plugin-login-permissions"]);
				}
			}
			else if (tag == TAG_TOGGLE_SOUND) {
				if (Game.isSoundEnabled()) {
					Game.playEffect("Assets/music-stop.wav");
				}
				Game.toggleSoundEnabled();
				this.buttonSound.setVisible(Game.isSoundEnabled());
				this.buttonNoSound.setVisible(!Game.isSoundEnabled());
			}
			else if (tag == TAG_TOGGLE_FULLSCREEN) {
				Game.toggleFullscreenEnabled();
				this.buttonFullscreen.setVisible(!Game.isFullscreenEnabled());
				this.buttonMinimize.setVisible(Game.isFullscreenEnabled());
			}
			else if (tag == TAG_INFO) {
			}
		},

//
// ###  LayerMenu.onGetLoginStatus
//
// Called when the login status is obtained. Sets the visibility of login and logout buttons.
//
		onGetLoginStatus: function(loggedIn) {
			this.buttonLogin.setVisible(!loggedIn);
			this.buttonLogout.setVisible(loggedIn);
			this.buttonLogin.setEnabled(true);
			this.buttonLogout.setEnabled(true);
		},

//
// ###  LayerMenu.onWindowSizeChanged
//
// Called when the window size changes or fullscreen mode is enabled / disabled.
//
		onWindowSizeChanged: function() {
			this.buttonFullscreen.setVisible(!Game.isFullscreenEnabled());
			this.buttonMinimize.setVisible(Game.isFullscreenEnabled());
		}
		
	}); // end of layer extend

}()); // end of module
