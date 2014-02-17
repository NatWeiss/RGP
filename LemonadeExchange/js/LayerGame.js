
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
		TAG_PURCHASE_BUX = 6,
		TAG_SMALL_BUX_PACK = 7,
		TAG_MEDIUM_BUX_PACK = 8,
		TAG_LEMONADE = 9;

	return cc.Layer.extend( {
		menu: null,
		playerNameLabel: null,
		lemonadesLabel: null,
		buxLabel: null,
		rateLabel: null,
		rateIcon: null,
		glass: null,
		lemonade: null,
		exchangeRate: 10,
		drinkCount: 0,
		breakCount: 0,

		init: function() {
			var winSize = App.getWinSize();
			this._super();

			// menu
			this.menu = cc.Menu.create();
			this.menu.setPosition(cc.PointZero());
			this.addChild(this.menu, 1);

			// everything else
			this.createBg();
			this.createExchangeRate();
			this.createPlayerDetails();
			this.createGameMenu();

			// back
			App.createButton(this, "ButtonBack.png", TAG_PAUSE,
				cc.p(App.scale(50), App.scale(30)),
				cc.p(0, 0), cc.p(winSize.width * .5, winSize.height), 0.5, 0.25, 1.5);

			// listen for when ads are finished
			App.getAdsPlugin().setAdsListener(this);

			this.setTouchEnabled(true);

			return true;
		},
		
		createBg: function() {
			var layer,
				winSize = App.getWinSize();
			
			// color stripe
			layer = cc.LayerColor.create(cc.c4b(0,0,0,202), winSize.width * 0.6, winSize.height * 1.2);
			layer.setPosition(winSize.width * 1.35, winSize.height * -.1);
			layer.setRotation(-2);
			this.addChild(layer);
			layer.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.EaseOut.create(cc.RotateBy.create(1.5, 1), 1.2),
				cc.EaseOut.create(cc.RotateBy.create(1.7, -1), 1.2)
			)));
			layer.runAction(cc.EaseOut.create(cc.MoveBy.create(0.5, cc.p(-winSize.width, 0)), 1.5));
		},
		
		createExchangeRate: function() {
			var x,
				y,
				font = App.getString("font"),
				label,
				sprite,
				winSize = App.getWinSize();
			
			// exchange rate
			x = winSize.width * .425;
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
		},
		
		createPlayerDetails: function() {
			var sprite,
				font = App.getString("font"),
				winSize = App.getWinSize(),
				numBux = Soomla.storeInventory.getItemBalance("currency_bux"),
				numLemonades = Soomla.storeInventory.getItemBalance("currency_lemonades");
			
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
			this.lemonadesLabel = cc.LabelTTF.create("" + numLemonades, font, 80);
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
			this.buxLabel = cc.LabelTTF.create("" + numBux, font, 60);
			this.buxLabel.setAnchorPoint(0, .5);
			this.buxLabel.setPosition(App.scale(170), winSize.height - App.scale(340));
			this.addChild(this.buxLabel, 1);
		},
		
		createGameMenu: function() {
			var x,
				y,
				ySpacing,
				delayPer,
				winSize = App.getWinSize(),
				numBux = Soomla.storeInventory.getItemBalance("currency_bux"),
				numLemonades = Soomla.storeInventory.getItemBalance("currency_lemonades");

			// buttons
			delayPer = 0.25;
			ySpacing = App.scale(115);
			x = winSize.width * .4;
			y = winSize.height - App.scale(250);
			App.createButton(this, "ButtonDrink.png", TAG_DRINK_LEMONADE, cc.p(x, y),
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 1, 1.5);
			y -= ySpacing;
			App.createButton(this, "ButtonGive.png", TAG_GIVE_LEMONADE, cc.p(x, y),
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 2, 1.5);
			y -= ySpacing;
			App.createButton(this, "ButtonEarn.png", TAG_EARN_BUX, cc.p(x, y),
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 3, 1.5);

			x = winSize.width * .66;
			y = winSize.height - App.scale(250);
			App.createButton(this, "ButtonBuy.png", TAG_BUY_LEMONADE, cc.p(x, y),
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 4, 1.5);
			y -= ySpacing;
			App.createButton(this, "ButtonSell.png", TAG_SELL_LEMONADE, cc.p(x, y),
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 5, 1.5);
			y -= ySpacing;
			App.createButton(this, "ButtonPurchase.png", TAG_PURCHASE_BUX, cc.p(x, y),
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 6, 1.5);
			
			this.enableButtons();
		},
		
		removeMenuItems: function(tags) {
			var i,
				button;
			for (i = 0; i < tags.length; i += 1) {
				button = this.menu.getChildByTag(tags[i]);
				if (button) {
					button.removeFromParent();
				}
			}
		},
		
		removeGameMenu: function() {
			this.removeMenuItems([
				TAG_DRINK_LEMONADE,
				TAG_GIVE_LEMONADE,
				TAG_EARN_BUX,
				TAG_BUY_LEMONADE,
				TAG_SELL_LEMONADE,
				TAG_PURCHASE_BUX
			]);
		},
		
		createPurchaseMenu: function() {
			var x,
				y,
				delayPer,
				winSize = App.getWinSize();

			// buttons
			delayPer = 0.25;
			x = winSize.width * .4;
			y = winSize.height - App.scale(250);
			App.createButton(this, "ButtonBuy.png", TAG_SMALL_BUX_PACK, cc.p(x, y),
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 1, 1.5);

			x = winSize.width * .66;
			y = winSize.height - App.scale(250);
			App.createButton(this, "ButtonBuy.png", TAG_MEDIUM_BUX_PACK, cc.p(x, y),
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 2, 1.5);
		},
		
		removePurchaseMenu: function() {
			this.removeMenuItems([
				TAG_SMALL_BUX_PACK,
				TAG_MEDIUM_BUX_PACK
			]);
		},
		
		onEnter: function() {
			this._super();
			App.requestUrl("api/exchange-rate", this.onGetExchangeRate);
		},
		
		setRateIconPos: function() {
			var x = this.rateLabel.getPositionX();
			x += this.rateLabel.getContentSize().width;
			this.rateIcon.setPositionX(x);
		},
		
		giveLemonade: function() {
			var numLemonades = Soomla.storeInventory.getItemBalance("currency_lemonades");
			if (numLemonades <= 0) {
				App.playEffect("res/music-stop.wav");
				return;
			}

			this.slideGlass();
		},
		
		slideGlass: function() {
			var self = this,
				glassSize,
				winSize = App.getWinSize();

			App.playEffect("res/glass-sliding.wav");

			this.addCurrencies(-1, 0);

			if (this.glass !== null) {
				this.glass.removeFromParent();
				this.glass = null;
			}

			// glass
			this.glass = cc.Sprite.createWithSpriteFrameName("GlassEmpty.png");
			glassSize = this.glass.getContentSize()
			this.glass.setTag(TAG_LEMONADE);
			this.glass.setPosition(winSize.width * .5, winSize.height * .5);
			this.glass.setScale(0.35);
			this.addChild(this.glass, 2);

			this.slideIn(this.glass);
			this.schedule(function(){
				self.showTouchArea(self.glass.getPosition());
			}, 1.0, 0);
			
			// lemonade
			this.lemonade = cc.Sprite.createWithSpriteFrameName("GlassFull.png");
			this.lemonade.setAnchorPoint(.5, .5);
			this.lemonade.setPosition(glassSize.width * .5, glassSize.height * .5);
			this.glass.addChild(this.lemonade, 1);
			
			this.schedule(function(){self.drinkLemonade();}, 1.0, 0);
		},
		
		slideIn: function(node) {
			var winSize = App.getWinSize(),
				movement = cc.p(-winSize.width, 0);
			
			node.setPosition(cc.pSub(node.getPosition(), movement));
			node.runAction(cc.Sequence.create(
				cc.EaseOut.create(cc.MoveBy.create(0.7, movement), 1.5),
				cc.RotateBy.create(0.08, -5, 0),
				cc.RotateBy.create(0.08, 5, 0)
			));
		},
		
		drinkLemonade: function() {
			var self = this,
				winSize = App.getWinSize(),
				audio = cc.AudioEngine.getInstance();

			audio.setMusicVolume(0.75);

			this.glass.runAction(cc.Spawn.create(
				cc.ScaleTo.create(1.0, 1, 1),
				cc.MoveTo.create(1.0, cc.p(winSize.width * .5, winSize.height * .5))
			));

			this.schedule(function(){self.drinkingLemonade();}, 1.0, 0);
		},
		
		drinkingLemonade: function() {
			var self = this,
				winSize = App.getWinSize(),
				streak,
				i,
				len = App.getInt("total-drinking-streaks");

			App.playEffect("res/drink.wav");

			this.glass.runAction(cc.Sequence.create(
				cc.DelayTime.create(3.2),
				cc.MoveBy.create(0.2, cc.p(0, -winSize.height * 2)),
				cc.RemoveSelf.create()
			));
			
			if (typeof cc.ActionDrink !== 'undefined') {
				this.lemonade.runAction(cc.ActionDrink.create(2.0));
			}
			
			// streaks
			for (i = 0; i < len; i += 1) {
				streak = cc.Sprite.createWithSpriteFrameName("Streak.png");
				streak.setAnchorPoint(.5, -.5);
				streak.setPosition(winSize.width * .5, winSize.height * .5);
				streak.setRotation((i / len) * 360);
				streak.setOpacity(0);
				streak.runAction(cc.RotateBy.create(3, 360, 360));
				streak.runAction(cc.Sequence.create(
					cc.EaseIn.create(cc.FadeTo.create(0.5, i % 2 === 0 ? 255 : 196), 1.5),
					cc.DelayTime.create(1.5),
					cc.EaseOut.create(cc.FadeOut.create(1), 3.0),
					cc.RemoveSelf.create()
				));
				this.addChild(streak, 25);
			}

			this.schedule(function(){self.smashGlass()}, 3.5, 0);
			
			this.drinkCount += 1;
		},
		
		smashGlass: function() {
			var self = this,
				audio = cc.AudioEngine.getInstance();

			this.lemonade = null;
			this.glass = null;
			
			App.playEffect("res/glass-breaking" + (1 + this.breakCount) + ".wav");
			audio.setMusicVolume(1);

			App.requestUrl("api/drink", this.onGetExchangeRate);
			this.createGameMenu();
		
			this.breakCount = (this.breakCount + 1) % App.getInt("total-glass-breaking-sounds");
		},
		
		watchVideo: function() {
			App.getAdsPlugin().showAds(plugin.AdsType.FullScreenAd, 0, plugin.AdsPos.Center);
		},
		
		showTouchArea: function(pos) {
			var circle;
			
			if (typeof pos === "undefined") {
				if (this.menu && this.menu._selectedItem) {
					pos = this.menu._selectedItem.getPosition();
				} else {
					return;
				}
			}
			
			circle = cc.Sprite.createWithSpriteFrameName("TouchCircle.png");
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
			this.addChild(circle, 10);
		},
		
		onTouchesBegan: function(touches, event) {
			if (touches) {
				App.showTouchCircle(this, touches[0].getLocation());
			}
		},
		
		addCurrencies: function(lemonades, bux) {
			lemonades = parseInt(lemonades);
			bux = parseInt(bux);

			if (lemonades) {
				App.giveItem("currency_lemonades", lemonades);
			}
			if (bux) {
				App.giveItem("currency_bux", bux);
			}
			if (lemonades || bux) {
				this.onCurrencyUpdate();
			}
		},
		
		menuButtonCallback: function(sender) {
			var self = this,
				tag = sender.getTag(),
				numBux = Soomla.storeInventory.getItemBalance("currency_bux"),
				numLemonades = Soomla.storeInventory.getItemBalance("currency_lemonades"),
				director = cc.Director.getInstance();
			
			App.playClickSound();
			App.showTouchCircle(this);
			
			if (tag == TAG_PAUSE) {
				this.getParent().createLayer(LayerMenu, true);
			}
			else if (tag == TAG_DRINK_LEMONADE) {
				if (numLemonades > 0) {
					this.removeGameMenu();
					this.giveLemonade();
				}
			}
			else if (tag == TAG_GIVE_LEMONADE) {
				if (numLemonades > 0) {
					this.addCurrencies(-1, 0);
					App.requestUrl("api/give", this.onGetExchangeRate);
				}
			}
			else if (tag == TAG_BUY_LEMONADE) {
				if (numBux > this.exchangeRate) {
					this.addCurrencies(1, -this.exchangeRate);
					App.requestUrl("api/buy", this.onGetExchangeRate);
				}
			}
			else if (tag == TAG_SELL_LEMONADE) {
				if (numLemonades > 0) {
					this.addCurrencies(-1, this.exchangeRate);
					App.requestUrl("api/sell", this.onGetExchangeRate);
				}
			}
			else if (tag == TAG_PURCHASE_BUX) {
				this.removeGameMenu();
				this.createPurchaseMenu();
			}
			else if (tag == TAG_EARN_BUX) {
				this.watchVideo();
			}
			else if (tag == TAG_SMALL_BUX_PACK) {
				Soomla.storeController.buyMarketItem("small_bux_pack");
			}
			else if (tag == TAG_MEDIUM_BUX_PACK) {
				Soomla.storeController.buyMarketItem("medium_bux_pack");
			}
		},
		
		onGetPlayerName: function(name) {
			this.playerNameLabel.setString(name);
		},
		
		enableButton: function(tag, enabled) {
			var button = this.menu.getChildByTag(tag);
			if (button) {
				button.getNormalImage().setColor(enabled ? cc.c3b(255,255,255) : cc.c3b(128,128,128));
				button.setEnabled(enabled);
			}
		},
		
		onCurrencyUpdate: function() {
			var numBux = Soomla.storeInventory.getItemBalance("currency_bux"),
				numLemonades = Soomla.storeInventory.getItemBalance("currency_lemonades");

			this.lemonadesLabel.setString(numLemonades);
			this.buxLabel.setString(numBux);
			
			this.enableButtons();
		},
		
		enableButtons: function() {
			var numBux = Soomla.storeInventory.getItemBalance("currency_bux"),
				numLemonades = Soomla.storeInventory.getItemBalance("currency_lemonades");

			this.enableButton(TAG_DRINK_LEMONADE, numLemonades > 0);
			this.enableButton(TAG_GIVE_LEMONADE, numLemonades > 0);
			this.enableButton(TAG_BUY_LEMONADE, numBux > this.exchangeRate);
			this.enableButton(TAG_SELL_LEMONADE, numLemonades > 0);
		},
		
		onPaymentComplete: function() {
			this.removePurchaseMenu();
			this.createGameMenu();
		},

		onAdsResult: function(code, msg) {
			var scene;
			
			cc.log("Got ads result code: " + code + ", message: " + msg);
			if (code == plugin.AdsResultCode.FullScreenViewDismissed) {
				scene = cc.Director.getInstance().getRunningScene();
				if (scene && scene.layer) {
					scene.layer.addCurrencies(0, parseInt(scene.layer.exchangeRate * .5));
				}
			}
		},

		onGetExchangeRate: function(response) {
			var scene = cc.Director.getInstance().getRunningScene(),
				multiplier = 100,
				value;
			
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
				scene.layer.exchangeRate = parseInt(value);
				scene.layer.rateLabel.setString(" = " + value);
				scene.layer.setRateIconPos();
				scene.layer.enableButtons();
			}
		}

	}); // end layer extend

}()); // end module pattern
