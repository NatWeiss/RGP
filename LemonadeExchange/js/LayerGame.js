
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
		lemonadesIcon: null,
		buxIcon: null,
		rateLabel: null,
		rateIcon: null,
		glass: null,
		lemonade: null,
		exchangeRate: 10,
		drinkCount: 0,
		breakCount: 0,
		newLemonadesAmount: 0,
		newBuxAmount: 0,
		animateLemonadesIncrement: 1,
		animateBuxIncrement: 5,
		animateCurrencyAmountRate: 400,

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
			App.createButton(this, "ButtonBack.png", TAG_PAUSE, App.centralize(-430, -290),
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
			layer = cc.LayerColor.create(cc.c4b(0,0,0,202), App.scale(590), winSize.height * 1.2);
			layer.setPosition(winSize.width * .5 + App.scale(-144), winSize.height * -.1);
			layer.setRotation(-2);
			this.addChild(layer);
			layer.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.EaseOut.create(cc.RotateBy.create(1.5, 1), 1.2),
				cc.EaseOut.create(cc.RotateBy.create(1.7, -1), 1.2)
			)));
			layer.setPositionX(layer.getPositionX() + winSize.width);
			layer.runAction(cc.EaseOut.create(cc.MoveBy.create(0.5, cc.p(-winSize.width, 0)), 1.5));
		},
		
		createExchangeRate: function() {
			var pos = App.centralize(-120, 220),
				font = App.getString("font"),
				label,
				sprite,
				winSize = App.getWinSize();
			
			// exchange rate
			label = cc.LabelTTF.create("1", font, App.scale(80));
			label.setAnchorPoint(0, .5);
			label.setPosition(pos);
			this.addChild(label, 1);

			pos.x += App.scale(50);
			sprite = cc.Sprite.createWithSpriteFrameName("Lemonade.png");
			sprite.setAnchorPoint(0, .5);
			sprite.setPosition(pos);
			sprite.setScale(0.5);
			this.addChild(sprite, 1);

			pos.x += App.scale(80);
			this.rateLabel = cc.LabelTTF.create(" = ", font, App.scale(80));
			this.rateLabel.setAnchorPoint(0, .5);
			this.rateLabel.setPosition(pos);
			this.addChild(this.rateLabel, 1);

			this.rateIcon = cc.Sprite.createWithSpriteFrameName("Bux.png");
			this.rateIcon.setAnchorPoint(0, .5);
			this.rateIcon.setPosition(pos);
			this.setRateIconPos();
			this.rateIcon.setScale(0.55	);
			this.addChild(this.rateIcon, 1);
		},
		
		createPlayerDetails: function() {
			var sprite,
				playerImageUrl = App.getSocialPlugin().getPlayerImageUrl(),
				font = App.getString("font"),
				winSize = App.getWinSize(),
				numBux = Soomla.storeInventory.getItemBalance("currency_bux"),
				numLemonades = Soomla.storeInventory.getItemBalance("currency_lemonades");
			
			this.newLemonadesAmount = numLemonades;
			this.newBuxAmount = numBux;
			
			// player image
			if (playerImageUrl) {
				sprite = cc.Sprite.create(playerImageUrl);
			} else {
				sprite = cc.Sprite.createWithSpriteFrameName("BlankAvatar.png");
			}
			sprite.setAnchorPoint(0, .5);
			sprite.setPosition(App.centralize(-420, 260));
			sprite.setScale(App.scale(60) / sprite.getContentSize().width);
			this.addChild(sprite, 1);
			
			// player name
			this.playerNameLabel = cc.LabelTTF.create(App.getSocialPlugin().getPlayerFirstName(), font, App.scale(48));
			this.playerNameLabel.setAnchorPoint(0, .5);
			this.playerNameLabel.setPosition(App.centralize(-330, 260));
			this.addChild(this.playerNameLabel, 1);
			
			// lemonades
			this.lemonadesIcon = cc.Sprite.createWithSpriteFrameName("Lemonade.png");
			this.lemonadesIcon.setPosition(App.centralize(-395, 130));
			this.addChild(this.lemonadesIcon, 1);
			this.lemonadesIcon.setRotation(-2);
			this.lemonadesIcon.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.EaseInOut.create(cc.RotateBy.create(2.2, 4), 3.0),
				cc.EaseInOut.create(cc.RotateBy.create(2.5, -4), 3.0)
			)));
			this.lemonadesLabel = cc.LabelTTF.create("" + numLemonades, font, App.scale(80));
			this.lemonadesLabel.setAnchorPoint(0, .5);
			this.lemonadesLabel.setPosition(App.centralize(-330, 130));
			this.addChild(this.lemonadesLabel, 1);

			// bux
			this.buxIcon = cc.Sprite.createWithSpriteFrameName("Bux.png");
			this.buxIcon.setPosition(App.centralize(-395, -20));
			this.buxIcon.setScale(0.65);
			this.addChild(this.buxIcon, 1);
			this.buxIcon.setRotation(-4);
			this.buxIcon.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.EaseInOut.create(cc.RotateBy.create(2.2, 8), 3.0),
				cc.EaseInOut.create(cc.RotateBy.create(2.5, -8), 3.0)
			)));
			this.buxLabel = cc.LabelTTF.create("" + numBux, font, App.scale(60));
			this.buxLabel.setAnchorPoint(0, .5);
			this.buxLabel.setPosition(App.centralize(-310, -20));
			this.addChild(this.buxLabel, 1);
		},
		
		createGameMenu: function() {
			var pos = App.centralize(-120, 70),
				ySpacing,
				delayPer,
				winSize = App.getWinSize(),
				numBux = Soomla.storeInventory.getItemBalance("currency_bux"),
				numLemonades = Soomla.storeInventory.getItemBalance("currency_lemonades");
			
			// buttons
			delayPer = 0.25;
			ySpacing = App.scale(115);
			App.createButton(this, "ButtonDrink.png", TAG_DRINK_LEMONADE, pos,
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 1, 1.5);
			pos.y -= ySpacing;
			App.createButton(this, "ButtonGive.png", TAG_GIVE_LEMONADE, pos,
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 2, 1.5);
			pos.y -= ySpacing;
			App.createButton(this, "ButtonEarn.png", TAG_EARN_BUX, pos,
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 3, 1.5);

			pos = App.centralize(154, 70);
			App.createButton(this, "ButtonBuy.png", TAG_BUY_LEMONADE, pos,
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 4, 1.5);
			pos.y -= ySpacing;
			App.createButton(this, "ButtonSell.png", TAG_SELL_LEMONADE, pos,
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 5, 1.5);
			pos.y -= ySpacing;
			App.createButton(this, "ButtonPurchase.png", TAG_PURCHASE_BUX, pos,
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
			var pos = App.centralize(-130, -30),
				item,
				delayPer,
				button,
				winSize = App.getWinSize();

			// buttons
			delayPer = 0.25;
			item = Soomla.storeInfo.getItemByItemId("small_bux_pack");
			button = App.createButton(this, "ButtonProduct.png", TAG_SMALL_BUX_PACK, pos,
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 1, 1.5);
			App.addCurrencyToButton(button,
				item.currency_amount,
				App.localizeCurrency(item.purchasableItem.marketItem.price),
				"small_bux_pack.png");

			pos = App.centralize(154, -30);
			item = Soomla.storeInfo.getItemByItemId("medium_bux_pack");
			button = App.createButton(this, "ButtonProduct.png", TAG_MEDIUM_BUX_PACK, pos,
				cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 2, 1.5);
			App.addCurrencyToButton(button,
				item.currency_amount,
				App.localizeCurrency(item.purchasableItem.marketItem.price),
				"medium_bux_pack.png");
		},
		
		removePurchaseMenu: function() {
			this.removeMenuItems([
				TAG_SMALL_BUX_PACK,
				TAG_MEDIUM_BUX_PACK
			]);
		},
		
		createExchangeItems: function(verb) {
			var self = this,
				label,
				sprite,
				font = App.getConfig("font"),
				winSize = App.getWinSize(),
				fontSize = App.scale(50),
				ySpacing = App.scale(70),
				pos = App.centralize(120, 120);
			
			this.exchangeVerb = verb;
			this.exchangeLayer = cc.Layer.create();
			this.addChild(this.exchangeLayer, 1);
			
			label = cc.LabelTTF.create(App.getSocialPlugin().getPlayerName(), font, fontSize);
			label.setAnchorPoint(.5, .5);
			label.setPosition(pos);
			this.exchangeLayer.addChild(label, 1);

			pos.y -= ySpacing;
			label = cc.LabelTTF.create("wants to " + this.exchangeVerb + " 1 ", font, fontSize);
			label.setAnchorPoint(.5, .5);
			label.setPosition(pos);
			this.exchangeLayer.addChild(label, 1);

			sprite = cc.Sprite.createWithSpriteFrameName("Lemonade.png");
			sprite.setAnchorPoint(0, .5);
			sprite.setPosition(label.getPositionX() + label.getContentSize().width * .5, label.getPositionY());
			sprite.setScale(0.55);
			this.exchangeLayer.addChild(sprite, 1);

			pos.y -= ySpacing;
			this.finishExchangeSprite1 = cc.Sprite.createWithSpriteFrameName("Bux.png");
			this.finishExchangeSprite1.setAnchorPoint(.5, .5);
			this.finishExchangeSprite1.setPosition(pos);
			this.finishExchangeSprite1.setScale(0.25);
			this.finishExchangeSprite1.runAction(cc.RepeatForever.create(
				cc.RotateBy.create(1.0, 360)
			));
			this.exchangeLayer.addChild(this.finishExchangeSprite1, 1);
			
			pos.y -= ySpacing;
			this.finishExchangeLabel1 = cc.LabelTTF.create(this.exchangeVerb === "buy" ? "Bought by" : "Sold to", font, fontSize);
			this.finishExchangeLabel1.setPosition(pos);
			this.exchangeLayer.addChild(this.finishExchangeLabel1, 1);

			pos.y -= ySpacing;
			this.finishExchangeLabel2 = cc.LabelTTF.create("Bruce Lee", font, fontSize);
			this.finishExchangeLabel2.setPosition(pos);
			this.exchangeLayer.addChild(this.finishExchangeLabel2, 1);

			pos.y -= ySpacing;
			this.finishExchangeLabel3 = cc.LabelTTF.create("for " + this.exchangeRate + " ", font, fontSize);
			this.finishExchangeLabel3.setPosition(pos);
			this.exchangeLayer.addChild(this.finishExchangeLabel3, 1);
			
			this.finishExchangeSprite2 = cc.Sprite.createWithSpriteFrameName("Bux.png");
			this.finishExchangeSprite2.setAnchorPoint(0, .5);
			this.finishExchangeSprite2.setPosition(this.finishExchangeLabel3.getPositionX() + this.finishExchangeLabel3.getContentSize().width * .5, this.finishExchangeLabel3.getPositionY());
			this.finishExchangeSprite2.setScale(0.55);
			this.exchangeLayer.addChild(this.finishExchangeSprite2, 1);
			
			this.finishExchangeLabel1.setVisible(false);
			this.finishExchangeLabel2.setVisible(false);
			this.finishExchangeLabel3.setVisible(false);
			this.finishExchangeSprite2.setVisible(false);
			
			this.schedule(function(){self.finishExchange();}, 5.0, 0);
		},
		
		finishExchange: function() {
			var self = this;
			
			this.finishExchangeLabel1.setVisible(true);
			this.finishExchangeLabel2.setVisible(true);
			this.finishExchangeLabel3.setVisible(true);
			this.finishExchangeSprite2.setVisible(true);
			this.finishExchangeSprite1.setVisible(false);
			
			if (this.exchangeVerb === "buy") {
				this.addCurrencies(1, -this.exchangeRate);
				App.requestUrl("api/buy", this.onGetExchangeRate);
			} else {
				this.addCurrencies(-1, this.exchangeRate);
				App.requestUrl("api/sell", this.onGetExchangeRate);
			}

			this.schedule(function(){
				self.exchangeLayer.removeFromParent();
				self.createGameMenu();
			}, 4.0, 0);
		},
		
		createLemonadeGiver: function() {
			//
			// https://developers.facebook.com/docs/reference/dialogs/requests/
			// https://developers.facebook.com/docs/games/requests
			//
			var self = this;
			
			FB.ui({
				method: "apprequests",
				message: "You've been gifted some lemonade!",
				max_recipients: 1,
				title: "Give Some Lemonade"
			}, function(response){
				var i,
					len;
				cc.log("Friend picker response: " + JSON.stringify(response));

				if (response && response.request && response.to.length) {
					len = response.to.length;
					for (i = 0; i < len; i += 1) {
						cc.log(response.request + "_" + response.to[i]);
					}
					
					self.addCurrencies(-1, 0);
					App.requestUrl("api/give", self.onGetExchangeRate);
				}
				
				self.enableButtons();
			});
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
			this.glass.setPosition(App.centralize(100, 0));
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
			App.showTouchCircle(this, null, sender);
			this.enableButton(tag, false);
			
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
					this.createLemonadeGiver();
				}
			}
			else if (tag == TAG_BUY_LEMONADE) {
				if (numBux > this.exchangeRate) {
					this.removeGameMenu();
					this.createExchangeItems("buy");
				}
			}
			else if (tag == TAG_SELL_LEMONADE) {
				if (numLemonades > 0) {
					this.removeGameMenu();
					this.createExchangeItems("sell");
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
			var self = this,
				numAnimations,
				numBux = parseInt(this.buxLabel.getString()),
				numLemonades = parseInt(this.lemonadesLabel.getString());
			
			if (this.newBuxAmount || this.newLemonadesAmount) {
				this.unscheduleAllCallbacks();
				this.buxLabel.setString(this.newBuxAmount);
				this.lemonadesLabel.setString(this.newLemonadesAmount);
			}
			
			this.newBuxAmount = Soomla.storeInventory.getItemBalance("currency_bux"),
			this.newLemonadesAmount = Soomla.storeInventory.getItemBalance("currency_lemonades");
			
			this.animateBuxIncrement = Math.max(parseInt(Math.abs(this.newBuxAmount - numBux) / 10), 1);
			if (this.newBuxAmount < numBux) {
				this.animateBuxIncrement = -this.animateBuxIncrement;
			}
			this.animateLemonadesIncrement = 1;
			if (this.newLemonadesAmount < numLemonades) {
				this.animateLemonadesIncrement = -this.animateLemonadesIncrement;
			}

			numAnimations = parseInt(Math.max(
				Math.abs((this.newBuxAmount - numBux) / this.animateBuxIncrement),
				Math.abs((this.newLemonadesAmount - numLemonades) / this.animateLemonadesIncrement)
			)) - 1;

			this.enableButtons();
			
			self.animateCurrencyAmounts();
			if (numAnimations > 0) {
				this.schedule(function(){
					self.animateCurrencyAmounts();
				}, self.animateCurrencyAmountRate / 1000, numAnimations);
			}
		},
		
		animateCurrencyAmounts: function() {
			var sprite,
				currentBux = parseInt(this.buxLabel.getString()),
				currentLemonades = parseInt(this.lemonadesLabel.getString()),
				sounds;
			
			if (currentBux !== this.newBuxAmount) {
				if (currentBux < this.newBuxAmount) {
					this.animateCurrencyAdd(this.buxIcon, "Bux.png");

					sounds = App.getConfig("bux-sounds");
					App.playEffect(sounds[App.rand(sounds.length)]);
				}
				currentBux += this.animateBuxIncrement;
				currentBux = Math[this.animateBuxIncrement > 0 ? "min" : "max"](currentBux, this.newBuxAmount);
				this.buxLabel.setString(currentBux);
			}
			if (currentLemonades !== this.newLemonadesAmount) {
				if (currentLemonades < this.newLemonadesAmount) {
					this.animateCurrencyAdd(this.lemonadesIcon, "Lemonade.png");

					sounds = App.getConfig("glass-sounds");
					App.playEffect(sounds[App.rand(sounds.length)]);
				}
				currentLemonades += this.animateLemonadesIncrement;
				currentLemonades = Math[this.animateLemonadesIncrement > 0 ? "min" : "max"](currentLemonades, this.newLemonadesAmount);
				this.lemonadesLabel.setString(currentLemonades);
			}
		},
		
		animateCurrencyAdd: function(destNode, filename) {
			var angle = cc.DEGREES_TO_RADIANS(App.rand(180)),
				radius = App.scale(300),
				sprite = cc.Sprite.createWithSpriteFrameName(filename),
				rotation = App.rand(360 * 2);
			sprite.setPosition(cc.pAdd(
				destNode.getPosition(),
				cc.p(Math.sin(angle) * radius, Math.cos(angle) * radius)
			));
			sprite.setRotation(rotation);
			sprite.setScale(destNode.getScale());
			sprite.setOpacity(0);
			sprite.runAction(cc.Sequence.create(
				cc.FadeIn.create(1.0),
				cc.FadeOut.create(0.2)
			));
			sprite.runAction(cc.EaseOut.create(cc.RotateBy.create(1.0, -rotation), 1.5));
			sprite.runAction(cc.MoveTo.create(1.0, destNode.getPosition()));
			sprite.runAction(cc.Sequence.create(
				cc.DelayTime.create(1.2),
				cc.RemoveSelf.create()
			));
			this.addChild(sprite, 10);
		},
		
		enableButtons: function() {
			var numBux = Soomla.storeInventory.getItemBalance("currency_bux"),
				numLemonades = Soomla.storeInventory.getItemBalance("currency_lemonades");

			this.enableButton(TAG_DRINK_LEMONADE, numLemonades > 0);
			this.enableButton(TAG_GIVE_LEMONADE, numLemonades > 0);
			this.enableButton(TAG_BUY_LEMONADE, numBux > this.exchangeRate);
			this.enableButton(TAG_SELL_LEMONADE, numLemonades > 0);
			this.enableButton(TAG_EARN_BUX, true);
			this.enableButton(TAG_PURCHASE_BUX, true);
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
