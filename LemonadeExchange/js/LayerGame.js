
//
//
//
var LayerGame = (function(){
	var TAG_PAUSE = 0,
		TAG_DRINK_LEMONADE = 1,
		TAG_GIVE_LEMONADE = 2,
		TAG_BUY_LEMONADE = 3,
		TAG_SELL_LEMONADE = 4,
		TAG_EARN_BUX = 5,
		TAG_PURCHASE_BUX = 6;

	return cc.Layer.extend( {
		menu: null,
		playerNameLabel: null,
		lemonadesLabel: null,
		buxLabel: null,
		rateLabel: null,
		rateIcon: null,

		init: function() {
			this._super();
			this.showOptions();
			return true;
		},
		
		addButton: function(text, tag, pos) {
			var font = App.getString("font"),
				label = cc.LabelTTF.create(text, font, 60),
				button = cc.MenuItemLabel.create(label, this.menuButtonCallback, this);

			button.setTag(tag);
			button.setAnchorPoint(cc.p(0.0, 0.5));
			button.setPosition(pos);
			this.menu.addChild(button);
		},
		
		setRateIconPos: function() {
			var x = this.rateLabel.getPositionX();
			x += this.rateLabel.getContentSize().width;
			this.rateIcon.setPositionX(x);
		},
		
		showOptions: function() {
			var self = this,
				winSize = App.getWinSize(),
				audio = cc.AudioEngine.getInstance(),
				i,
				label,
				font = App.getString("font"),
				sprite,
				layer,
				x,
				y,
				ySpacing,
				delayPer;

			// color stripe
			layer = cc.LayerColor.create(cc.c4b(0,0,0,202), winSize.width * 0.6, winSize.height * 1.2);
			layer.setPosition(winSize.width * 1.35, winSize.height * -.1);
			layer.setRotation(-2);
			this.addChild(layer, 1);
			layer.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.EaseOut.create(cc.RotateBy.create(1.5, 1), 1.2),
				cc.EaseOut.create(cc.RotateBy.create(1.7, -1), 1.2)
			)));
			layer.runAction(cc.EaseOut.create(cc.MoveBy.create(0.5, cc.p(-winSize.width, 0)), 1.5));

			// player name
			this.playerNameLabel = cc.LabelTTF.create(App.getSocialPlugin().getPlayerName(), font, 48);
			this.playerNameLabel.setAnchorPoint(0, .5);
			this.playerNameLabel.setPosition(App.scale(60), winSize.height - App.scale(60));
			this.addChild(this.playerNameLabel, 1);
			
			// lemonades
			sprite = cc.Sprite.createWithSpriteFrameName("Lemonade.png");
			sprite.setPosition(App.scale(85), winSize.height - App.scale(190));
			this.addChild(sprite, 1);
			sprite.setRotation(-2);
			sprite.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.EaseInOut.create(cc.RotateBy.create(2.2, 4), 3.0),
				cc.EaseInOut.create(cc.RotateBy.create(2.5, -4), 3.0)
			)));
			this.lemonadesLabel = cc.LabelTTF.create("" + Soomla.storeInventory.getItemBalance("currency_lemonades"), font, 80);
			this.lemonadesLabel.setAnchorPoint(0, .5);
			this.lemonadesLabel.setPosition(App.scale(150), winSize.height - App.scale(190));
			this.addChild(this.lemonadesLabel, 1);

			// bux
			sprite = cc.Sprite.createWithSpriteFrameName("Bux.png");
			sprite.setPosition(App.scale(85), winSize.height - App.scale(340));
			sprite.setScale(0.65);
			this.addChild(sprite, 1);
			sprite.setRotation(-4);
			sprite.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.EaseInOut.create(cc.RotateBy.create(2.2, 8), 3.0),
				cc.EaseInOut.create(cc.RotateBy.create(2.5, -8), 3.0)
			)));
			this.buxLabel = cc.LabelTTF.create("" + Soomla.storeInventory.getItemBalance("currency_bux"), font, 60);
			this.buxLabel.setAnchorPoint(0, .5);
			this.buxLabel.setPosition(App.scale(170), winSize.height - App.scale(340));
			this.addChild(this.buxLabel, 1);

			// exchange rate
			x = winSize.width * .45;
			y = winSize.height - App.scale(100);
			label = cc.LabelTTF.create("1", font, 80);
			label.setAnchorPoint(0, .5);
			label.setPosition(x, y);
			this.addChild(label, 1);

			x += App.scale(50);
			sprite = cc.Sprite.createWithSpriteFrameName("Lemonade.png");
			sprite.setAnchorPoint(0, .5);
			sprite.setPosition(x, y);
			sprite.setScale(0.5);
			this.addChild(sprite, 1);

			x += App.scale(80);
			this.rateLabel = cc.LabelTTF.create(" = ", font, 80);
			this.rateLabel.setAnchorPoint(0, .5);
			this.rateLabel.setPosition(x, y);
			this.addChild(this.rateLabel, 1);

			this.rateIcon = cc.Sprite.createWithSpriteFrameName("Bux.png");
			this.rateIcon.setAnchorPoint(0, .5);
			this.rateIcon.setPosition(x, y);
			this.setRateIconPos();
			this.rateIcon.setScale(0.55	);
			this.addChild(this.rateIcon, 1);

			// menu
			if (this.menu === null) {
				this.menu = cc.Menu.create();
				this.menu.setPosition(cc.PointZero());
				this.addChild(this.menu, 1);
			}

			// buttons
			delayPer = 0.25;
			ySpacing = App.scale(115);
			x = winSize.width * .425;
			y = winSize.height - App.scale(250);
			App.createButton(this, "ButtonDrink.png", TAG_DRINK_LEMONADE, cc.p(x, y),
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 1, 1.5);
			y -= ySpacing;
			App.createButton(this, "ButtonGive.png", TAG_GIVE_LEMONADE, cc.p(x, y),
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 2, 1.5);
			y -= ySpacing;
			App.createButton(this, "ButtonEarn.png", TAG_EARN_BUX, cc.p(x, y),
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 3, 1.5);

			x = winSize.width * .65;
			y = winSize.height - App.scale(250);
			App.createButton(this, "ButtonBuy.png", TAG_BUY_LEMONADE, cc.p(x, y),
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 4, 1.5);
			y -= ySpacing;
			App.createButton(this, "ButtonSell.png", TAG_SELL_LEMONADE, cc.p(x, y),
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 5, 1.5);
			y -= ySpacing;
			App.createButton(this, "ButtonPurchase.png", TAG_PURCHASE_BUX, cc.p(x, y),
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 6, 1.5);

			// back
			this.buttonSound = App.createButton(this, "ButtonBack.png", TAG_PAUSE,
				cc.p(App.scale(50), App.scale(30)),
				cc.p(0, 0), cc.p(winSize.width * .5, winSize.height), 0.5, 0.25, 1.5);

			// set ads listener for finished watching video

	// need to re-implement this in the protocol...

			App.getAdsPlugin().setAdsListener(this);

			this.setTouchEnabled(true);

			return true;
		},
		
		onEnter: function() {
			this._super();
			App.requestUrl("api/exchange-rate", this.onGetExchangeRate);
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
	return;
			if (typeof pos === 'undefined') {
				if (this.menu && this.menu._selectedItem) {
					pos = this.menu._selectedItem.getPosition();
				} else {
					return;
				}
			}
			
			var circle = cc.Sprite.createWithSpriteFrameName("touch-circle.png");
			if (!circle) {
				return;
			}
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
		
		onGetExchangeRate: function(response) {
			var scene = cc.Director.getInstance().getRunningScene(),
				multiplier = 100,
				value;
			//cc.log("Got exchange rate " + response + ", scene " + scene + ", layer " + scene.layer);
			
			if (scene && scene.layer) {
				if ((parseInt(response) + "").length >= 3) {
					multiplier = 1;
				} else if (parseFloat(response) > 50) {
					multiplier = 10;
				}

				value = parseInt(parseFloat(response) * multiplier) / multiplier;
				if (multiplier == 100) {
					value = value.toFixed(2);
				}
				if (value < 0.01) {
					value = 0.01;
				}
				scene.layer.rateLabel.setString(" = " + value);
				scene.layer.setRateIconPos();
			}
		},
		
		onDrinkLemonade: function(response) {
			cc.Director.getInstance().getRunningScene().layer.onGetExchangeRate(response);
		},
		
		onGiveLemonade: function(response) {
			cc.Director.getInstance().getRunningScene().layer.onGetExchangeRate(response);
		},

		onBuyLemonade: function(response) {
			cc.Director.getInstance().getRunningScene().layer.onGetExchangeRate(response);
		},

		onSellLemonade: function(response) {
			cc.Director.getInstance().getRunningScene().layer.onGetExchangeRate(response);
		},
		
		menuButtonCallback: function(sender) {
			var self = this,
				tag = sender.getTag(),
				director = cc.Director.getInstance(),
				audio = cc.AudioEngine.getInstance();
			
			this.showTouchCircle();
			
			if (tag == TAG_PAUSE) {
				this.getParent().createLayer(LayerMenu, true);
			}
			else if (tag == TAG_DRINK_LEMONADE) {
				//self.drinkLemonade();
				App.requestUrl("api/drink", this.onDrinkLemonade);
			}
			else if (tag == TAG_GIVE_LEMONADE) {
				App.requestUrl("api/give", this.onGiveLemonade);
			}
			else if (tag == TAG_BUY_LEMONADE) {
				App.requestUrl("api/buy", this.onBuyLemonade);
			}
			else if (tag == TAG_SELL_LEMONADE) {
				App.requestUrl("api/sell", this.onSellLemonade);
			}
			else if (tag == TAG_PURCHASE_BUX) {
				Soomla.storeController.buyMarketItem("small_bux_pack");
			}
			else if (tag == TAG_EARN_BUX) {
				this.watchVideo();
			}
		},
		
		onGetPlayerName: function(name) {
			this.playerNameLabel.setString(name);
		},
		
		onCurrencyUpdate: function() {
			this.lemonadesLabel.setString(Soomla.storeInventory.getItemBalance("currency_lemonades"));
			this.buxLabel.setString(Soomla.storeInventory.getItemBalance("currency_bux"));
		},

		onAdsResult: function(code, msg) {
			var scene;
			
			cc.log("Got ads result code: " + code + ", message: " + msg);
			if (code == plugin.AdsResultCode.FullScreenViewDismissed) {
				Soomla.storeInventory.giveItem("currency_bux", 5);
				scene = cc.Director.getInstance().getRunningScene();
				if (scene && scene.layer) {
					scene.layer.onCurrencyUpdate();
				}
			}
		}

	}); // end layer extend

}()); // end module pattern
