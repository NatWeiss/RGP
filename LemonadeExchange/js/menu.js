
var Menu,
	TAG_PAUSE = 0,
	TAG_RADIO = 1,
	TAG_TIPJAR = 2,
	TAG_LEMONADE = 3,
	TAG_HULA = 4,
	TAG_LOGIN = 5;

var Menu = cc.Layer.extend( {
	winSize: null,
	bg: null,
	fg: null,
	banner: null,
	logo: null,
	menu: null,
	lemonadeCount: 0,
	drinkCount: 0,
	breakCount: 0,
	breakCommentCount: 0,
	videoCount: 0,
	giveCount: 0,
	musicCount: 0,
	complaintCount: 0,
	saidSmooth: true,
	hula: null,
	glass: null,
	lemonade: null,
	radioItem: null,
	tipjarItem: null,
	radioKnob: null,
	finger: null,
	adShown: false,
	pauseLayer: null,

	init: function() {
		var self = this,
			menu,
			moveAction,
			pause,
			closeItem,
			radio,
			radioItem,
			lemonadeItem,
			loginSprite,
			loginItem,
			tipjar,
			sheets,
			audio = cc.AudioEngine.getInstance(),
			cacher = cc.SpriteFrameCache.getInstance(),
			i;

		this._super();
		this.winSize = cc.Director.getInstance().getWinSize();
		cc.log("Window size " + this.winSize.width + "x" + this.winSize.height);

		// load spritesheets
		sheets = App.getConfig("spritesheets");
		for (i = 0; i < sheets.length; i += 1) {
			cc.log("Adding " + sheets[i]);
			cacher.addSpriteFrames(sheets[i]);
		}

		// layer holding fg items
		this.fg = cc.LayerColor.create(cc.c4b(255, 255, 255, 0));
		this.addChild(this.fg, 1);

		// bg
		this.bg = cc.Sprite.createWithSpriteFrameName("bg.png");
		this.bg.setPosition(cc.p(this.winSize.width * .5, this.winSize.height * .5));
		this.addChild(this.bg);
//		this.bg.setPositionX(this.bg.getPositionX() - 25);
//		this.bg.runAction(cc.EaseOut.create(
//			cc.MoveBy.create(120.0, cc.p(50,0)),
//			3.0));

		// banner
		this.banner = cc.Sprite.createWithSpriteFrameName("banner.png");
		this.banner.setAnchorPoint(.5, 10);
		this.banner.setPosition(this.winSize.width * .5,
			this.winSize.height + (this.banner.getContentSize().height * 9) + 10);
		this.fg.addChild(this.banner, 1);

		// logo
		this.logo = cc.Sprite.createWithSpriteFrameName("logo.png");
		this.logo.setPosition(cc.p(this.banner.getContentSize().width * .5, this.banner.getContentSize().height * .5 + 10));
		this.banner.addChild(this.logo);

		// create menu
		this.menu = cc.Menu.create();
		this.menu.setPosition(cc.PointZero());
		this.fg.addChild(this.menu, 1);

		// close button
		pause = cc.Sprite.createWithSpriteFrameName("pause.png");
		pause.setAnchorPoint(0,0);
		closeItem = cc.MenuItem.create(this.menuButtonCallback, this);
		closeItem.setTag(TAG_PAUSE);
		closeItem.setContentSize(pause.getContentSize());
		closeItem.setAnchorPoint(cc.p(0.5, 0.5));
		closeItem.setPosition(cc.p(this.winSize.width - 30, 30));
		this.menu.addChild(closeItem);
		closeItem.addChild(pause);
		
		// radio button
		radio = cc.Sprite.createWithSpriteFrameName("radio.png");
		radio.setAnchorPoint(0,0);
		this.radioKnob = cc.Sprite.createWithSpriteFrameName("radio-button.png");
		this.radioKnob.setPosition(262, 117);
		this.radioItem = cc.MenuItem.create(this.menuButtonCallback, this);
		this.radioItem.setTag(TAG_RADIO);
		this.radioItem.setContentSize(radio.getContentSize());
		this.radioItem.setAnchorPoint(cc.p(0.5, 0.5));
		this.radioItem.setPosition(cc.p(this.winSize.width * .5 - 315, this.winSize.height * .5 - 188));
		this.menu.addChild(this.radioItem);
		this.radioItem.addChild(radio);
		radio.addChild(this.radioKnob);

		// login
		loginSprite = cc.Sprite.createWithSpriteFrameName("pause.png");
		loginSprite.setAnchorPoint(0,0);
		loginItem = cc.MenuItem.create(this.menuButtonCallback, this);
		loginItem.setTag(TAG_LOGIN);
		loginItem.setContentSize(loginSprite.getContentSize());
		loginItem.setAnchorPoint(1, 1);
		loginItem.setPosition(this.winSize.width - 30, this.winSize.height - 30);
		this.menu.addChild(loginItem);
		loginItem.addChild(loginSprite);
		
		// hula
		this.hula = cc.Sprite.createWithSpriteFrameName("hula.png");
		this.hula.setTag(TAG_HULA);
		this.hula.setAnchorPoint(cc.p(0.5, 0.5));
		this.hula.setPosition(cc.p(this.winSize.width * .5 - 62, this.winSize.height * .5 - 195));
		this.fg.addChild(this.hula);

		// tipjar
		tipjar = cc.Sprite.createWithSpriteFrameName("tipjar.png");
		tipjar.setAnchorPoint(0,0);
		this.tipjarItem = cc.MenuItem.create(this.menuButtonCallback, this);
		this.tipjarItem.setTag(TAG_TIPJAR);
		this.tipjarItem.setContentSize(tipjar.getContentSize());
		this.tipjarItem.setAnchorPoint(cc.p(0.5, 0.5));
		this.tipjarItem.setPosition(cc.p(this.winSize.width * .5 + 352, this.winSize.height * .5 + 30));
		this.menu.addChild(this.tipjarItem);
		this.tipjarItem.addChild(tipjar);
		this.slideIn(this.tipjarItem);
		audio.playEffect("res/glass-sliding-slow.wav");
	
		// play music
		this.toggleMusic();
		
		// give lemonade
		this.schedule(function(){self.giveLemonade()}, 4, 0);

		// show touchable areas
		this.showTouchArea(this.radioItem.getPosition());
		//this.schedule(function(){self.showTouchArea(this.tipjarItem.getPosition())}, 2, 0);

/*
var n = cc.Node.create();
n.init();
this.tipjarItem.runAction(n);
*/
		// set ads listener for finished watching video

// need to re-implement this in the protocol...

//		App.getAdsPlugin().setAdsListener(this);

		// initialize facebook
		/*if (typeof FB !== "undefined") {
			FB.init(App.getConfig("facebook-init"));
			FB.Event.subscribe("auth.authResponseChange", this.onCheckLoginStatus);
			FB.getLoginStatus(this.onCheckLoginStatus);
		}*/

		this.setTouchEnabled(true);

		//this.adjustSizeForWindow();
		//lazyLayer.adjustSizeForCanvas();
		//if( typeof window !== 'undefined' ) {
		//	window.addEventListener( "resize", function( event ) {
		//		self.adjustSizeForWindow();
		//	});
		//}

		return true;
	},
	
	getSong: function() {
		return App.getConfig("songs")[this.musicCount];
	},
	
	toggleMusic: function() {
		var self = this,
			cache = cc.SpriteFrameCache.getInstance(),
			audio = cc.AudioEngine.getInstance(),
			song,
			duration;

		this.showTouchCircle();
		audio.setMusicVolume(1);
		
		// stop
		if (audio.isMusicPlaying()) {
			audio.stopAllEffects();
			audio.stopMusic();
			audio.playEffect("res/music-stop.wav");
			
			this.hula.stopAllActions();
			this.banner.stopAllActions();
			
			this.musicCount = (this.musicCount + 1) % App.getConfig("songs").length;

			this.unscheduleAllCallbacks();
			this.schedule(function(){self.complainAboutNoMusic()}, 2.5, 0);
		}
		
		// play
		else {
			song = this.getSong();
			duration = song.bpm ? 180 / song.bpm : 1.5;
			
			audio.playEffect("res/music-start.wav");
			audio.playMusic(song.file);
			
			this.radioKnob.runAction(
				cc.EaseOut.create(cc.RotateBy.create(0.5, App.rand(900) - 450), 1.5)
			);
			this.banner.stopAllActions();
			this.banner.setRotation(0);
			this.banner.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.EaseInOut.create(cc.RotateBy.create(duration, -0.5, 0), 1.5),
				cc.EaseInOut.create(cc.RotateBy.create(duration, 0.5, 0), 1.5)
			)));
			
			this.unscheduleAllCallbacks();
			this.schedule(function(){self.hulaDance()}, parseInt(song.intro), 0);
			this.scheduleRadioSignal();
		}
	},
	
	hulaDance: function() {
		var cache = cc.SpriteFrameCache.getInstance(),
			song,
			anim;

		song = App.getConfig("songs")[this.musicCount];
		
		anim = cc.Animation.create();
		anim.addSpriteFrame(cache.getSpriteFrame("hula-left.png"));
		anim.addSpriteFrame(cache.getSpriteFrame("hula-right.png"));
		anim.setDelayPerUnit(song.bpm ? 60 / song.bpm : .5);
		this.hula.runAction(cc.RepeatForever.create(cc.Animate.create(anim)));
	},

	scheduleRadioSignal: function() {
		var self = this,
			song = this.getSong();

		this.schedule(function(){self.radioSignal()}, (song.bpm ? 120 / song.bpm : 1), 0);
	},

	radioSignal: function() {
		var self = this,
			sprite,
			angle,
			angleDegrees,
			audio = cc.AudioEngine.getInstance();

		angleDegrees = 45 + App.rand(135);
		angle = cc.DEGREES_TO_RADIANS(angleDegrees);
		//cc.log("Angle " + angle + " sin " + Math.sin(angle) + " cos " + Math.cos(angle));

		sprite = cc.Sprite.createWithSpriteFrameName("signal.png");
		sprite.setRotation(90 - angleDegrees);
		sprite.setPosition(this.radioItem.getPositionX() - 5 + Math.cos(angle) * 200,
			this.radioItem.getPositionY() + Math.sin(angle) * 200);
		sprite.runAction(cc.FadeOut.create(1.0));
		sprite.runAction(cc.Sequence.create(
			cc.MoveBy.create(1.0, cc.p(Math.cos(angle) * 50, Math.sin(angle) * 50)),
			cc.RemoveSelf.create()
		));
		this.fg.addChild(sprite, 100);
		
		// continue
		if (audio.isMusicPlaying()) {
			this.scheduleRadioSignal();
		}
	},
	
	complainAboutNoMusic: function() {
		var self = this,
			audio = cc.AudioEngine.getInstance();

		audio.stopAllEffects();
		audio.playEffect("res/complain-about-no-music" + (this.complaintCount + 1) + ".wav");
		
		this.complaintCount = (this.complaintCount + 1) % App.getInt("total-complain-about-no-music-sounds");
		
		this.schedule(function(){self.toggleMusic()}, 2, 0);
	},
	
	giveLemonade: function() {
//
// how to prevent rapid clicking?
//
		var self = this,
			sprite,
			audio = cc.AudioEngine.getInstance();
		
		if (!audio.isMusicPlaying()) {
			cc.log("Would give lemonade but music isn't playing");
			return;
		}
		if (this.glass !== null) {
			if (this.glass.isVisible()) {
				cc.log("Would give lemonade but glass is visible");
				return;
			} else {
				this.glass.removeFromParent();
				this.glass = null;
			}
		}
		this.glass = cc.MenuItem.create(this.menuButtonCallback, this);
		this.glass.setVisible(false);
		sprite = cc.Sprite.createWithSpriteFrameName("glass.png");
		sprite.setAnchorPoint(0,0);
		this.glass.setContentSize(sprite.getContentSize());
		this.glass.addChild(sprite);
		this.menu.addChild(this.glass, 1);
		
		// play lemonade sound
		audio.stopAllEffects();
		audio.playEffect("res/lemonade" + (1 + this.lemonadeCount) + ".wav");
		
		//this.unscheduleAllCallbacks();
		this.schedule(function(){self.slideGlass()}, this.lemonadeCount == 0 ? 4 : 2.5, 0);

		this.lemonadeCount = (this.lemonadeCount + 1) % App.getInt("total-lemonade-sounds");
	},
	
	slideGlass: function() {
		var self = this,
			glassSize = this.glass.getContentSize(),
			audio = cc.AudioEngine.getInstance(),
			func;

		audio.playEffect("res/glass-sliding.wav");

		// glass
		this.glass.setVisible(true);
		this.glass.setAnchorPoint(.5, .5);
		this.glass.setTag(TAG_LEMONADE);
		this.glass.setPosition(this.winSize.width * .5 + glassSize.width * .5, this.winSize.height * .5 - 210);
		this.glass.setScale(0.35);
		this.slideIn(this.glass);
		func = function(){
			self.showTouchArea(self.glass.getPosition());
		};
		this.schedule(func, 1.0, 0);
		
		// lemonade
		this.lemonade = cc.Sprite.createWithSpriteFrameName("lemonade.png");
		this.lemonade.setAnchorPoint(.5, .5);
		this.lemonade.setPosition(glassSize.width * .5, glassSize.height * .5);
		this.glass.addChild(this.lemonade, 1);
	},
	
	slideIn: function(node) {
		var movement = cc.p(-this.winSize.width * .5, 0),
			audio = cc.AudioEngine.getInstance();
		
		node.setPosition(cc.pSub(node.getPosition(), movement));
		node.runAction(cc.Sequence.create(
			cc.EaseOut.create(cc.MoveBy.create(0.7, movement), 1.5),
			cc.RotateBy.create(0.08, -5, 0),
			cc.RotateBy.create(0.08, 5, 0)
		));

	},
	
	drinkLemonade: function() {
		var self = this,
			audio = cc.AudioEngine.getInstance();

		if (this.glass === null) {
			return;
		}
		
		audio.setMusicVolume(0.75);

		this.glass.runAction(cc.Spawn.create(
			cc.ScaleTo.create(1.0, 1, 1),
			cc.MoveTo.create(1.0, cc.p(self.winSize.width * .5, self.winSize.height * .5))
		));

		this.schedule(function(){self.drinkingLemonade()}, 1.0, 0);
	},
	
	drinkingLemonade: function() {
		var self = this,
			streak,
			i,
			len = App.getInt("total-drinking-streaks"),
			audio = cc.AudioEngine.getInstance();

		audio.playEffect("res/drink.wav");
		this.schedule(function(){self.saySmooth()}, 4.0, 0);

		this.glass.runAction(cc.Sequence.create(
			cc.DelayTime.create(3.2),
			cc.MoveBy.create(0.2, cc.p(0, -this.winSize.height * 2)),
			cc.RemoveSelf.create()
		));
		
		if (typeof cc.ActionDrink !== 'undefined') {
			this.lemonade.runAction(cc.ActionDrink.create(2.0));
		}
		
		// streaks
		for (i = 0; i < len; i += 1) {
			streak = cc.Sprite.createWithSpriteFrameName("streak.png");
			streak.setAnchorPoint(.5, -1);
			streak.setPosition(this.winSize.width * .5, this.winSize.height * .5);
			streak.setRotation((i / len) * 360);
			streak.setOpacity(0);
			streak.runAction(cc.RotateBy.create(3, 360, 360));
			streak.runAction(cc.Sequence.create(
				cc.EaseIn.create(cc.FadeTo.create(0.5, i % 2 === 0 ? 255 : 196), 1.5),
				cc.DelayTime.create(1.5),
				cc.EaseOut.create(cc.FadeOut.create(1), 3.0),
				cc.RemoveSelf.create()
			));
			this.fg.addChild(streak, 25);
		}

		this.schedule(function(){self.smashGlass()}, 3.5, 0);
		
		this.drinkCount += 1;
	},
	
	smashGlass: function() {
		var self = this,
			audio = cc.AudioEngine.getInstance();

		this.lemonade = null;
		this.glass = null;
		
		audio.playEffect("res/glass-breaking" + (1 + this.breakCount) + ".wav");
	
		this.schedule(function(){self.commentOnBrokenGlass()}, this.saidSmooth ? 1 : 3, 0);

		this.breakCount = (this.breakCount + 1) % App.getInt("total-glass-breaking-sounds");
	},
	
	saySmooth: function() {
		var audio = cc.AudioEngine.getInstance();
		
		if (!this.saidSmooth) {
			audio.playEffect("res/smooth.wav");
			
			this.saidSmooth = true;
		}
	},
	
	commentOnBrokenGlass: function() {
		var self = this,
			audio = cc.AudioEngine.getInstance();

		audio.setMusicVolume(1);
		audio.playEffect("res/comment-on-broken-glass" + (1 + this.breakCommentCount) + ".wav");

		this.breakCommentCount = (this.breakCommentCount + 1) % App.getInt("total-comment-on-broken-glass-sounds");

		//this.schedule(function(){self.watchVideoComment()}, 3, 0);
		this.schedule(function(){self.watchVideo()}, 0, 0);
	},
	
	watchVideoComment: function() {
		var self = this,
			audio = cc.AudioEngine.getInstance();

		audio.playEffect("res/watch-a-video" + (1 + this.videoCount) + ".wav");

		this.videoCount = (this.videoCount + 1) % App.getInt("total-watch-a-video-sounds");

		this.schedule(function(){self.watchVideo()}, 2, 0);
	},
	
	watchVideo: function() {
		App.getAdsPlugin().showAds(plugin.AdsType.FullScreenAd, 0, plugin.AdsPos.Center);
	},
	
	showTouchCircle: function(pos) {
		if (typeof pos === 'undefined') {
			if (this.menu && this.menu._selectedItem) {
				pos = this.menu._selectedItem.getPosition();
			} else {
				return;
			}
		}
		
		var circle = cc.Sprite.createWithSpriteFrameName("touch-circle.png");
		circle.setPosition(pos);
		circle.setScale(0.5);
		circle.runAction(cc.Sequence.create(
			cc.DelayTime.create(0.5),
			cc.FadeOut.create(1),
			cc.RemoveSelf.create()
		));
		this.fg.addChild(circle, 10);
	},

	showTouchArea: function(pos) {
		var circle;
		
		if (typeof pos === 'undefined') {
			if (this.menu && this.menu._selectedItem) {
				pos = this.menu._selectedItem.getPosition();
			} else {
				return;
			}
		}
		
		circle = cc.Sprite.createWithSpriteFrameName("touch-circle.png");
		circle.setPosition(pos);
		circle.setScale(2);
		circle.setOpacity(96);
		circle.runAction(cc.Sequence.create(
			cc.Spawn.create(
				cc.FadeOut.create(1),
				cc.ScaleBy.create(1, 1.5, 1.5)
			),
			cc.RemoveSelf.create()
		));
		this.fg.addChild(circle, 10);
	},
	
	onTouchesBegan: function(touches, event) {
		var self = this;
		
		if (touches) {
			this.showTouchCircle(touches[0].getLocation());
			
			this.schedule(function(){self.giveLemonade()}, 1, 0);
		}
	},
	
	onTouchesMoved: function(touches, event) {
	},

	onTouchesEnded: function(touches, event) {
	},

	onTouchesCancelled: function(touches, event) {
	},

	menuButtonCallback: function(sender) {
		var self = this,
			tag = sender.getTag(),
			director = cc.Director.getInstance(),
			audio = cc.AudioEngine.getInstance();
		cc.log("Pressed button: " + tag);
		
		this.showTouchCircle();
		
		// pause
		if (tag == TAG_PAUSE) {
			if (!director.isPaused()) {
				this.pauseLayer = cc.LayerColor.create(cc.c4b(0, 0, 0, 128));
				this.addChild(this.pauseLayer, 9999);

				//director.pause();
				director.end();
				audio.stopMusic();
				audio.stopAllEffects();
				//plugin.PluginManager.getInstance().loadPlugin("AnalyticsFlurry").stopSession();
			} else {
				this.pauseLayer.removeFromParent();
				this.pauseLayer = null;
				
				director.resume();
			}
		}
			
		// lemonade
		else if (tag == TAG_LEMONADE) {
			self.drinkLemonade();
		}
			
		// radio
		else if (tag == TAG_RADIO) {
			self.toggleMusic();
		}
		
		// tipjar
		else if (tag == TAG_TIPJAR) {
			audio.playEffect("res/money.wav");
			
			self.tipjarItem.runAction(cc.Sequence.create(
				cc.RotateBy.create(0.08, -5, 0),
				cc.RotateBy.create(0.08, 5, 0)
			));

			try {
				Soomla.storeInventory.buyItem("small_lemonade_order");
				var id = "currency_lemonades";
				var balance = Soomla.storeInventory.getItemBalance(id);
				cc.log("User now has " + balance + " of " + id);

			} catch (e) {
				cc.log("Buy from tipjar: " + Soomla.dumpError(e));
			}
			
/*			FB.ui({
				method: "pay",
				action: "purchaseitem",
				product: "http://wizardfu.com/lemonadex/tipjar.html",
				//quantity: 1,                 // optional, defaults to 1
				//request_id: 'YOUR_REQUEST_ID' // optional, must be unique for each payment
			}, this.onPayment);
*/
		}
		
		// login to facebook
		else if (tag == TAG_LOGIN) {
			FB.login(null, App.getConfig("facebook-login"));
			//FB.logout(function(response) {});
			//FB.login(function(){FB.api('/me/feed', 'post', {message: 'Hello, world!'});}, {scope: 'publish_actions'});
			
			// to reset FB's product cache:
			// https://graph.facebook.com/?id=http%3A%2F%2Fnatweiss.com%2Flemonadex%2Ftipjar.html&scrape=true&method=post
		}
	},

	onAdsResult: function(code, msg) {
		var scene;
		
		cc.log("Got ads result code: " + code + ", message: " + msg);
		if (code == plugin.AdsResultCode.FullScreenViewDismissed) {
			//scene = cc.Director.getInstance().getRunningScene();
			//if (scene && scene.layer) {
			//	scene.layer.schedule(function(){scene.layer.giveLemonade();}, 2, 0, 0);
			//}
		}
	},
	
	onCheckLoginStatus: function(response) {
		if (!response) {
			return;
		}
		if(response.status === 'connected') {
			// Hide the login button
			//document.getElementById('loginButton').style.display = 'none';

			// Now Personalize the User Experience
			cc.log('FB user is authorized, access Token: ' + response.authResponse.accessToken);

			FB.api('/me', function(response) {
				cc.log('Good to see you, ' + response.name + '.');
			});
		} else if (response.status === 'not_authorized') {
			cc.log('FB user is not authorized yet');
		} else {
			cc.log('FB user is not logged in to Facebook');
			
			// Display the login button
			//document.getElementById('loginButton').style.display = 'block';
		}
	},
	
	onPayment: function(response) {
		cc.log("Payment: " + response);
		cc.log("Payment: " + App.logify(response));
	}

});

var MenuScene = cc.Scene.extend({
	layer: null,
	onEnter: function() {
		this._super();
		this.layer = new Menu();
		this.layer.init();
		this.addChild(this.layer);
	}
});
