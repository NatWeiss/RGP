

//
// begin module pattern
//
var LayerMenu = (function(){

	var TAG_PLAY_RESUME = 0,
		TAG_LOGIN_LOGOUT = 1,
		TAG_TOGGLE_SOUND = 2,
		TAG_TOGGLE_FULLSCREEN = 3,
		TAG_INFO = 4;

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

		init: function(canResume) {
			var winSize = App.getWinSize(),
				layer,
				sprite,
				label,
				button,
				loggedIn;
			this._super();

			this.playMusic();

			// menu
			this.menu = cc.Menu.create();
			this.menu.setPosition(0,0);
			this.addChild(this.menu, 2);

			// logo
			this.logo = cc.Sprite.createWithSpriteFrameName("Logo.png");
			this.logo.setPosition(winSize.width * .5, winSize.height * .7);
			this.addChild(this.logo, 1);
			//if (!canResume) {
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
			//}
			
			// button layer
			layer = cc.LayerColor.create(cc.c4b(0,0,0,202), winSize.width * 1.2, App.scale(215));
			layer.setPosition(App.scale(-20), App.scale(50) - winSize.height);
			layer.setRotation(-2);
			this.addChild(layer, 1);
			layer.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.EaseOut.create(cc.RotateBy.create(1.5, 1), 1.2),
				cc.EaseOut.create(cc.RotateBy.create(1.7, -1), 1.2)
			)));
			layer.runAction(cc.EaseOut.create(cc.MoveBy.create(0.5, cc.p(0, winSize.height)), 1.5));
			
			// buttons
			button = App.createButton(this, "ButtonPlay.png", TAG_PLAY_RESUME, cc.p(winSize.width * .2, App.scale(157)),
				cc.p(.5, .5), cc.p(winSize.width, 0), 0.5, 1.0, 1.5);
			button.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.DelayTime.create(1.5),
				cc.ScaleBy.create(0.2, 1.02),
				cc.ScaleBy.create(0.1, 1 / 1.02)
			)));

			this.buttonLogin = App.createButton(this, "ButtonLogin.png", TAG_LOGIN_LOGOUT, cc.p(winSize.width * .5, App.scale(157)),
				cc.p(.5, .5), cc.p(winSize.width, 0), 0.5, 0.7, 1.5);
			this.buttonLogout = App.createButton(this, "ButtonLogout.png", TAG_LOGIN_LOGOUT, cc.p(winSize.width * .5, App.scale(157)),
				cc.p(.5, .5), cc.p(winSize.width, 0), 0.5, 0.7, 1.5);
			loggedIn = App.getSocialPlugin().isLoggedIn();
			this.buttonLogin.setVisible(!loggedIn);
			this.buttonLogout.setVisible(loggedIn);

			button = App.createButton(this, "ButtonAbout.png", TAG_INFO, cc.p(winSize.width * .8, App.scale(157)),
				cc.p(.5, .5), cc.p(winSize.width, 0), 0.5, 0.4, 1.5);

			this.buttonSound = App.createButton(this, "ButtonSound.png", TAG_TOGGLE_SOUND,
				cc.p(App.scale(75), winSize.height - App.scale(90)),
				cc.p(.5, .5), cc.p(winSize.width * .5, -winSize.height), 0.5, 0.25, 1.5);
			this.buttonNoSound = App.createButton(this, "ButtonNoSound.png", TAG_TOGGLE_SOUND,
				cc.p(App.scale(75), winSize.height - App.scale(90)),
				cc.p(.5, .5), cc.p(winSize.width * .5, -winSize.height), 0.5, 0.25, 1.5);
			this.buttonSound.setVisible(App.isSoundEnabled());
			this.buttonNoSound.setVisible(!App.isSoundEnabled());

			this.buttonFullscreen = App.createButton(this, "ButtonFullscreen.png", TAG_TOGGLE_FULLSCREEN,
				cc.p(winSize.width - App.scale(75), winSize.height - App.scale(90)),
				cc.p(.5, .5), cc.p(-winSize.width * .5, -winSize.height), 0.5, 0.25, 1.5);
			this.buttonMinimize = App.createButton(this, "ButtonMinimize.png", TAG_TOGGLE_FULLSCREEN,
				cc.p(winSize.width - App.scale(75), winSize.height - App.scale(90)),
				cc.p(.5, .5), cc.p(-winSize.width * .5, -winSize.height), 0.5, 0.25, 1.5);
			this.buttonMinimize.setVisible(false);
			
			this.scheduleUpdate();

			this.setTouchEnabled(true);

			return true;
		},
		
		onGetLoginStatus: function(loggedIn) {
			this.buttonLogin.setVisible(!loggedIn);
			this.buttonLogout.setVisible(loggedIn);
			this.buttonLogin.setEnabled(true);
			this.buttonLogout.setEnabled(true);
		},
		
		playMusic: function() {
			var song = App.getConfig("songs")[this.songNumber]
			
			if (!cc.AudioEngine.getInstance().isMusicPlaying()) {
				App.playEffect("res/music-start.wav");
				App.playMusic(song.file);
				this.songNumber = (this.songNumber + 1) % App.getConfig("songs").length;
			}
		},
		
		onTouchesBegan: function(touches, event) {
			if (touches) {
				App.showTouchCircle(this, touches[0].getLocation());
			}
		},
		
		menuButtonCallback: function(sender) {
			var self = this,
				tag = sender.getTag(),
				director = cc.Director.getInstance(),
				audio = cc.AudioEngine.getInstance(),
				socialPlugin;
			
			App.playClickSound();
			App.showTouchCircle(this);
			
			// play
			if (tag == TAG_PLAY_RESUME) {
				this.getParent().createLayer(LayerGame, true);
			}
			
			// login to facebook
			else if (tag == TAG_LOGIN_LOGOUT) {
				socialPlugin = App.getSocialPlugin();
				if (socialPlugin.isLoggedIn()) {
					socialPlugin.logout();
				} else {
					socialPlugin.login(App.getConfig("social-plugin-login"));
				}

				this.buttonLogin.setEnabled(false);
				this.buttonLogout.setEnabled(false);
			}
			
			// show info scene
			else if (tag == TAG_INFO) {
			}
			
			// toggle sound
			else if (tag == TAG_TOGGLE_SOUND) {
				if (App.isSoundEnabled()) {
					App.playEffect("res/music-stop.wav");
				}
				App.toggleSoundEnabled();
				if (App.isSoundEnabled()) {
					this.playMusic();
				}
				this.buttonSound.setVisible(App.isSoundEnabled());
				this.buttonNoSound.setVisible(!App.isSoundEnabled());
			}
			
			// toggle fullscreen
			else if (tag == TAG_TOGGLE_FULLSCREEN) {
				App.toggleFullscreenEnabled();
				this.buttonFullscreen.setVisible(!App.isFullscreenEnabled());
				this.buttonMinimize.setVisible(App.isFullscreenEnabled());
			}
		}
	}); // end of layer extend
}()); // end of module
