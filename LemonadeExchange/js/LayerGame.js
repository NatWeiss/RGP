
//
// The layer which runs the game mechanics. Displays player details, current exchange rate and options to drink, give, buy, sell, earn or purchase lemonades and/or bux. Communicates with the server using the server's [API](Server.html).
//

//
// ###  LayerGame
//
// Uses the module pattern to define some private variables. Returns a constructor.
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

//
// ###  Public
//
// Here begins the public `LayerGame` class.
//
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

//
// ###  LayerGame.init
//
// Setup the labels, sprites, etc. Start animations. Register for events.
//
		init: function() {
			var self = this,
				winSize = App.getWinSize();
			this._super();
			
			/* Test publish actions. */
			/*App.getSocialPlugin().requestPublishPermissions("publish_actions");*/

			/* Create the menu. */
			this.menu = cc.Menu.create();
			this.menu.setPosition(cc.p());
			this.addChild(this.menu, 1);

			/* Create everything else. */
			this.playerImageWidth = App.scale(110);
			this.createBg();
			this.createExchangeRate();
			this.createPlayerDetails();
			this.createActionButtons();

			/* Create the back button. */
			App.createButton(this, "ButtonBack.png", TAG_PAUSE,
				App.centralize(-390, -250), cc.p(.5, .5),
				cc.p(winSize.width * .5, winSize.height), 0.5, 0.25, 1.5);

			/* Handle touch events. */
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
		
//
// ###  LayerGame.createBg
//
// Create the background layer.
//
		createBg: function() {
			var sprite,
				layer,
				winSize = App.getWinSize();
			
			layer = cc.LayerColor.create(
				cc.color(0,0,0,202),
				App.scale(590),
				winSize.height * 1.2
			);
			layer.x = winSize.width * .5 + App.scale(-144);
			layer.y = winSize.height * -.1;
			layer.setRotation(-2);
			this.addChild(layer);
			layer.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.EaseOut.create(cc.RotateBy.create(1.5, 1), 1.2),
				cc.EaseOut.create(cc.RotateBy.create(1.7, -1), 1.2)
			)));
			layer.x = layer.x + winSize.width;
			layer.runAction(cc.EaseOut.create(
				cc.MoveBy.create(0.5, cc.p(-winSize.width, 0)),
				1.5
			));
			
			if (App.isHtml5()) {
				sprite = cc.Sprite.create("#LogoMini.png");
				sprite.setPosition(App.centralize(-650, 360));
				this.addChild(sprite, 1);
			}
		},
		
//
// ###  LayerGame.createExchangeRate
//
// Create the exchange rate labels and sprites.
//
		createExchangeRate: function() {
			var pos = App.centralize(-70, 220),
				font = App.config["font"],
				label,
				sprite,
				winSize = App.getWinSize();
			
			label = cc.LabelTTF.create("1", font, App.scale(60));
			label.setAnchorPoint(0, .5);
			label.setPosition(pos);
			this.addChild(label, 1);

			pos.x += App.scale(50);
			sprite = cc.Sprite.create("#Lemonade.png");
			sprite.setAnchorPoint(0, .5);
			sprite.setPosition(pos);
			sprite.setScale(0.5);
			this.addChild(sprite, 1);

			pos.x += App.scale(30);
			this.rateLabel = cc.LabelTTF.create(" = 10", font, App.scale(60));
			this.rateLabel.setAnchorPoint(0, .5);
			this.rateLabel.setPosition(pos);
			this.addChild(this.rateLabel, 1);

			this.rateIcon = cc.Sprite.create("#Bux.png");
			this.rateIcon.setAnchorPoint(0, .5);
			this.rateIcon.setPosition(pos);
			this.setRateIconPos();
			this.rateIcon.setScale(0.55);
			this.addChild(this.rateIcon, 1);
		},

//
// ###  LayerGame.createPlayerImage
//
// Create the player image.
//
		createPlayerImage: function(url) {
			var image = null,
				stencil = cc.Sprite.create("#MaskCircle.png");

			if (this.playerImage) {
				this.playerImage.removeFromParent(true);
			}
			this.playerImage = null;

			if (url) {
				image = cc.Sprite.create(url);
				if (image !== null) {
					cc.log("Player image: " + image.width +
						"x" + image.height);
				}
			}
			if (image === null) {
				image = cc.Sprite.create("#BlankAvatar.png");
			}
			
			stencil.setScale(this.playerImageWidth / stencil.width);
			this.playerImage = cc.ClippingNode.create(stencil);
			this.playerImage.setAlphaThreshold(0.05);
			image.setPosition(this.playerImage.width * .5, this.playerImage.height * .5);
			image.setScale(this.playerImageWidth / image.width);
			this.playerImage.addChild(image, 1);
			this.playerImage.setPosition(App.centralize(-390, 240));
			this.addChild(this.playerImage, 2);
		},
		
//
// ###  LayerGame.createFriendImage
//
// Create a friend image.
//
		createFriendImage: function(url) {
			if (!url || !this.exchangeLayer) {
				return;
			}
			sprite = cc.Sprite.create(url);
			if (sprite) {
				sprite.setPosition(this.finishExchangeSprite1.getPosition());
				sprite.setScale(App.scale(60) / sprite.width);
				sprite.setVisible(false);
				this.exchangeLayer.addChild(sprite, 1);
				this.finishExchangeSprite3 = sprite;
			}
		},

//
// ###  LayerGame.createPlayerDetails
//
// Create the player detail labels and sprites.
//
		createPlayerDetails: function() {
			var name = App.getSocialPlugin().getPlayerFirstName(),
				playerImageUrl = App.getSocialPlugin().getPlayerImageUrl(),
				font = App.config["font"],
				winSize = App.getWinSize(),
				numBux = Soomla.storeInventory.getItemBalance("currency_bux"),
				numLemonades = Soomla.storeInventory.getItemBalance("currency_lemonades"),
				sprite;
			
			this.newLemonadesAmount = numLemonades;
			this.newBuxAmount = numBux;
			numLemonades = "" + numLemonades;
			
			/* Create the player's profile image. */
			this.createPlayerImage(playerImageUrl);
			sprite = cc.Sprite.create("#ShadowOval.png");
			sprite.x = this.playerImage.x;
			sprite.y = this.playerImage.y - (this.playerImageWidth * .5);
			this.addChild(sprite, 1);
			
			/* Create the player's name label. */
			this.playerNameLabel = cc.LabelTTF.create(name, font, App.scale(48));
			this.playerNameLabel.setAnchorPoint(0, .5);
			this.playerNameLabel.x = this.playerImage.x + (this.playerImageWidth * 0.7);
			this.playerNameLabel.y = this.playerImage.y;
			this.addChild(this.playerNameLabel, 1);
			
			/* Currencies frame. */
			sprite = cc.Sprite.create("#Frame.png");
			sprite.setPosition(App.centralize(-325, 0));
			this.addChild(sprite, 1);
			
			/* Create the lemonades currency label. */
			this.lemonadesIcon = cc.Sprite.create("#LemonadeDark.png");
			this.lemonadesIcon.setPosition(App.centralize(-395, 60));
			this.addChild(this.lemonadesIcon, 2);
			this.lemonadesIcon.setRotation(-2);
			this.lemonadesIcon.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.EaseInOut.create(cc.RotateBy.create(2.2, 4), 3.0),
				cc.EaseInOut.create(cc.RotateBy.create(2.5, -4), 3.0)
			)));
			this.lemonadesLabel = cc.LabelTTF.create(numLemonades, font, App.scale(60));
			this.lemonadesLabel.setAnchorPoint(0, .5);
			this.lemonadesLabel.setPosition(App.centralize(-330, 60));
			this.addChild(this.lemonadesLabel, 2);

			/* Create the bux currency label. */
			this.buxIcon = cc.Sprite.create("#Bux.png");
			this.buxIcon.setPosition(App.centralize(-395, -70));
			this.buxIcon.setScale(0.65);
			this.addChild(this.buxIcon, 2);
			this.buxIcon.setRotation(-4);
			this.buxIcon.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.EaseInOut.create(cc.RotateBy.create(2.2, 8), 3.0),
				cc.EaseInOut.create(cc.RotateBy.create(2.5, -8), 3.0)
			)));
			this.buxLabel = cc.LabelTTF.create("" + numBux, font, App.scale(60));
			this.buxLabel.setAnchorPoint(0, .5);
			this.buxLabel.setPosition(App.centralize(-330, -70));
			this.addChild(this.buxLabel, 2);
		},
		
//
// ###  LayerGame.createActionButtons
//
// Create the buttons for drink, give, buy, sell, etc.
//
		createActionButtons: function() {
			var pos = App.centralize(-120, 70),
				ySpacing = App.scale(115),
				delayPer = 0.25,
				winSize = App.getWinSize(),
				numBux = Soomla.storeInventory.getItemBalance("currency_bux"),
				numLemonades = Soomla.storeInventory.getItemBalance("currency_lemonades");
			
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
			
			this.enableActionButtons();
		},

//
// ###  LayerGame.createPurchaseButtons
//
// Create the buttons for purchasing more bux.
//
		createPurchaseButtons: function() {
			var pos = App.centralize(-130, -30),
				item,
				delayPer = 0.25,
				button,
				winSize = App.getWinSize();

			item = Soomla.storeInfo.getItemByItemId("small_bux_pack");
			button = App.createButton(this, "ButtonProduct.png", TAG_SMALL_BUX_PACK,
				pos, cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 1, 1.5);
			App.addCurrencyToButton(button,
				item.currency_amount,
				App.localizeCurrency(item.purchasableItem.marketItem.price),
				"small_bux_pack.png");

			pos = App.centralize(154, -30);
			item = Soomla.storeInfo.getItemByItemId("medium_bux_pack");
			button = App.createButton(this, "ButtonProduct.png", TAG_MEDIUM_BUX_PACK,
				pos, cc.p(0, .5), cc.p(-winSize.width, 0), 0.5, delayPer * 2, 1.5);
			App.addCurrencyToButton(button,
				item.currency_amount,
				App.localizeCurrency(item.purchasableItem.marketItem.price),
				"medium_bux_pack.png");
		},
		
//
// ###  LayerGame.createExchangeItems
//
// Create the labels and sprites for an exchange.
//
		createExchangeItems: function(verb) {
			var self = this,
				label,
				sprite,
				str,
				friendId = App.getSocialPlugin().getRandomFriendId(),
				friendName = this.getFriendName(friendId),
				friendUrl = App.getSocialPlugin().getPlayerImageUrl(friendId),
				font = App.config["font"],
				winSize = App.getWinSize(),
				fontSize = App.scale(50),
				ySpacing = App.scale(70),
				pos = App.centralize(120, 120);

			this.exchangeVerb = verb;
			this.exchangeLayer = cc.Layer.create();
			this.addChild(this.exchangeLayer, 1);
			
			str = App.getSocialPlugin().getPlayerName();
			label = cc.LabelTTF.create(str, font, fontSize);
			label.setAnchorPoint(.5, .5);
			label.setPosition(pos);
			this.exchangeLayer.addChild(label, 1);

			pos.y -= ySpacing;
			str = "wants to " + this.exchangeVerb + " 1 ";
			label = cc.LabelTTF.create(str, font, fontSize);
			label.setAnchorPoint(.5, .5);
			label.setPosition(pos);
			this.exchangeLayer.addChild(label, 1);

			sprite = cc.Sprite.create("#Lemonade.png");
			sprite.setAnchorPoint(0, .5);
			sprite.setPosition(label.x + label.width * .5, label.y);
			sprite.setScale(0.75);
			this.exchangeLayer.addChild(sprite, 1);

			pos.y -= ySpacing;
			this.finishExchangeSprite1 = cc.Sprite.create("#Bux.png");
			this.finishExchangeSprite1.setAnchorPoint(.5, .5);
			this.finishExchangeSprite1.setPosition(pos);
			this.finishExchangeSprite1.setScale(0.75);
			this.finishExchangeSprite1.runAction(cc.RepeatForever.create(
				cc.RotateBy.create(1.0, 360)
			));
			this.exchangeLayer.addChild(this.finishExchangeSprite1, 1);
			
			this.createFriendImage(friendUrl);
			
			pos.y -= ySpacing;
			str = (this.exchangeVerb === "buy" ? "Bought by" : "Sold to");
			this.finishExchangeLabel1 = cc.LabelTTF.create(str, font, fontSize);
			this.finishExchangeLabel1.setPosition(pos);
			this.exchangeLayer.addChild(this.finishExchangeLabel1, 1);

			pos.y -= ySpacing;
			this.finishExchangeLabel2 = cc.LabelTTF.create(friendName, font, fontSize);
			this.finishExchangeLabel2.setPosition(pos);
			this.exchangeLayer.addChild(this.finishExchangeLabel2, 1);

			pos.y -= ySpacing;
			str = "for " + this.exchangeRate + " ";
			this.finishExchangeLabel3 = cc.LabelTTF.create(str, font, fontSize);
			this.finishExchangeLabel3.setPosition(pos);
			this.exchangeLayer.addChild(this.finishExchangeLabel3, 1);
			
			this.finishExchangeSprite2 = cc.Sprite.create("#Bux.png");
			this.finishExchangeSprite2.setAnchorPoint(0, .5);
			this.finishExchangeSprite2.x = this.finishExchangeLabel3.x +
				this.finishExchangeLabel3.width * .5;
			this.finishExchangeSprite2.y = this.finishExchangeLabel3.y;
			this.finishExchangeSprite2.setScale(0.75);
			this.exchangeLayer.addChild(this.finishExchangeSprite2, 1);
			
			this.finishExchangeLabel1.setVisible(false);
			this.finishExchangeLabel2.setVisible(false);
			this.finishExchangeLabel3.setVisible(false);
			this.finishExchangeSprite2.setVisible(false);
			
			this.finishExchangeSprite3 = null;
			
			this.schedule(function(){self.finishExchange();}, 5.0, 0);
		},
		
//
// ###  LayerGame.createLemonadeGiver
//
// Create the UI for giving lemonade to a friend.
//
		createLemonadeGiver: function() {
			App.getSocialPlugin().showUI({
				method: "apprequests",
				message: "You've been gifted some lemonade!",
				max_recipients: 1,
				title: "Give Some Lemonade"
			});
		},
		
//
// ###  LayerGame.finishExchange
//
// Finish the exchange.
//
		finishExchange: function() {
			var self = this;
			
			this.finishExchangeLabel1.setVisible(true);
			this.finishExchangeLabel2.setVisible(true);
			this.finishExchangeLabel3.setVisible(true);
			this.finishExchangeSprite2.setVisible(true);
			this.finishExchangeSprite1.setVisible(false);
			if (this.finishExchangeSprite3) {
				this.finishExchangeSprite3.setVisible(true);
			}
			
			if (this.exchangeVerb === "buy") {
				this.addCurrencies(1, -this.exchangeRate);
				App.requestUrl("api/buy", this.onGetExchangeRate);
			} else {
				this.addCurrencies(-1, this.exchangeRate);
				App.requestUrl("api/sell", this.onGetExchangeRate);
			}

			this.schedule(function(){
				self.exchangeLayer.removeFromParent();
				self.exchangeLayer = null;
				self.createActionButtons();
			}, 4.0, 0);
		},
		
//
// ###  LayerGame.startDrinkingLemonade
//
// Start drinking a lemonade.
//
		startDrinkingLemonade: function() {
			var lemonades = Soomla.storeInventory.getItemBalance("currency_lemonades");
			if (lemonades <= 0) {
				App.playEffect("res/music-stop.wav");
				return;
			}

			this.slideGlass();
		},
		
//
// ###  LayerGame.slideGlass
//
// Slide the lemonade glass into the scene.
//
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

			/* Create the glass sprite. */
			this.glass = cc.Sprite.create("#GlassEmpty.png");
			glassSize = this.glass.getContentSize()
			this.glass.setTag(TAG_LEMONADE);
			this.glass.setPosition(App.centralize(100, 0));
			this.glass.setScale(0.35);
			this.addChild(this.glass, 2);

			this.slideIn(this.glass);
			this.schedule(function(){
				self.showTouchArea(self.glass.getPosition());
			}, 1.0, 0);
			
			/* Create the lemonade sprite. */
			this.lemonade = cc.Sprite.create("#GlassFull.png");
			this.lemonade.setAnchorPoint(.5, .5);
			this.lemonade.setPosition(glassSize.width * .5, glassSize.height * .5);
			this.glass.addChild(this.lemonade, 1);
			
			this.schedule(function(){self.drinkLemonade();}, 1.0, 0);
		},
		
//
// ###  LayerGame.slideIn
//
// Run the actions to make a node look like it is sliding into the scene.
//
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
		
//
// ###  LayerGame.drinkLemonade
//
// Drink the lemonade.
//
		drinkLemonade: function() {
			var self = this,
				winSize = App.getWinSize();

			cc.audioEngine.setMusicVolume(0.75);

			this.glass.runAction(cc.Spawn.create(
				cc.ScaleTo.create(1.0, 1, 1),
				cc.MoveTo.create(1.0, cc.p(winSize.width * .5, winSize.height * .5))
			));

			this.schedule(function(){self.drinkingLemonade();}, 1.0, 0);
		},
		
//
// ###  LayerGame.drinkingLemonade
//
// Continue drinking the lemonade.
//
		drinkingLemonade: function() {
			var self = this,
				winSize = App.getWinSize(),
				streak,
				i,
				len = App.config["total-drinking-streaks"];

			App.playEffect("res/drink.wav");

			this.glass.runAction(cc.Sequence.create(
				cc.DelayTime.create(3.2),
				cc.MoveBy.create(0.2, cc.p(0, -winSize.height * 2)),
				cc.RemoveSelf.create()
			));
			
			/* Create the streaks. */
			for (i = 0; i < len; i += 1) {
				streak = cc.Sprite.create("#Streak.png");
				streak.setAnchorPoint(.5, 0);
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
				this.addChild(streak, 1);
			}
			
			/* Start the drinking animation. */
			this._originalLemonadePos = cc.p(this.lemonade.getPosition());
			this._originalLemonadeRect = cc.rect(this.lemonade.getTextureRect());
			this.schedule(this.animateDrink, 0, cc.REPEAT_FOREVER);

			/* Schedule the glass smashing. */
			this.schedule(function(){self.smashGlass()}, 3.5, 0);
			
			this.drinkCount += 1;
		},
		
//
// ###  LayerGame.smashGlass
//
// Smash the empty lemonade glass.
//
		smashGlass: function() {
			var self = this,
				total = App.config["total-glass-breaking-sounds"];

			this.lemonade = null;
			this.glass = null;
			
			App.playEffect("res/glass-breaking" + (1 + this.breakCount) + ".wav");
			cc.audioEngine.setMusicVolume(1);

			App.requestUrl("api/drink", this.onGetExchangeRate);
			this.createActionButtons();
		
			this.breakCount = (this.breakCount + 1) % total;
		},
		
//
// ###  LayerGame.viewAdvertisement
//
// View an advertisement.
//
		viewAdvertisement: function() {
			App.getAdsPlugin().showAds({
				type: plugin.AdsType.FullScreenAd,
				size: 0,
				position: plugin.AdsPos.Center
			});
		},
		
//
// ###  LayerGame.animateDrink
//
// Animate drinking the lemonade. The glass will go from full to empty.
//
		animateDrink: function(delta) {
			var originalRect = this._originalLemonadeRect,
				originalPos = this._originalLemonadePos,
				rect = cc.rect(originalRect),
				target = this.lemonade,
				offset = cc.p(),
				duration = 2,
				percent,
				y;

			this.drinkElapsed = this.drinkElapsed || 0;
			this.drinkElapsed += delta;
			percent = Math.min(this.drinkElapsed / duration, 1);

			rect.height *= (1.0 - percent);
			y = originalRect.height - rect.height;
			rect.y += y;
			offset.y = -y * .5;
			
			if (rect.height == 0) {
				target.setVisible(false);
			} else if (!cc.rectEqualToRect(rect, target.getTextureRect())) {
				target.setTextureRect(rect);
				target.x = offset.x + originalPos.x;
				target.y = offset.y + originalPos.y;
			}
			
			if (this.drinkElapsed > duration) {
				this.drinkElapsed = 0;
				this.unschedule(this.animateDrink);
			}
		},
		
//
// ###  LayerGame.animateCurrencies
//
// Animate adding or subtracting currencies.
//
		animateCurrencies: function() {
			var sprite,
				bux = parseInt(this.buxLabel.getString()),
				lemonades = parseInt(this.lemonadesLabel.getString()),
				sounds,
				funcName;
			
			if (bux !== this.newBuxAmount) {
				if (bux < this.newBuxAmount) {
					this.animateCurrencyAdd(this.buxIcon, "Bux.png");

					sounds = App.config["bux-sounds"];
					App.playEffect(sounds[App.rand(sounds.length)]);
				}
				bux += this.animateBuxIncrement;
				funcName = this.animateBuxIncrement > 0 ? "min" : "max";
				bux = Math[funcName](bux, this.newBuxAmount);
				this.buxLabel.setString(bux);
			}
			if (lemonades !== this.newLemonadesAmount) {
				if (lemonades < this.newLemonadesAmount) {
					this.animateCurrencyAdd(this.lemonadesIcon, "Lemonade.png");

					sounds = App.config["glass-sounds"];
					App.playEffect(sounds[App.rand(sounds.length)]);
				}
				lemonades += this.animateLemonadesIncrement;
				funcName = this.animateLemonadesIncrement > 0 ? "min" : "max";
				lemonades = Math[funcName](lemonades, this.newLemonadesAmount);
				this.lemonadesLabel.setString(lemonades);
			}
		},
		
//
// ###  LayerGame.animateCurrencyAdd
//
// Animate adding an amount to a certain currency.
//
		animateCurrencyAdd: function(destNode, filename) {
			var angle = cc.DEGREES_TO_RADIANS(App.rand(180)),
				radius = App.scale(300),
				sprite = cc.Sprite.create("#" + filename),
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
		
//
// ###  LayerGame.showTouchArea
//
// Animate the given position as if being clicked or tapped.
//
		showTouchArea: function(pos) {
			var circle;
			
			if (typeof pos === "undefined") {
				if (this.menu && this.menu._selectedItem) {
					pos = this.menu._selectedItem.getPosition();
				} else {
					return;
				}
			}
			
			circle = cc.Sprite.create("#TouchCircle.png");
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
		
//
// ###  LayerGame.addCurrencies
//
// Add the given currency amount to the player's inventory.
//
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
		
//
// ###  LayerGame.getFriendName
//
// Return a random friend's name.
//
		getFriendName: function(id) {
			var friends;
			if (id && id > 0) {
				return App.getSocialPlugin().getPlayerName(id);
			}
			friends = App.config["anonymous-friends"];
			if (friends) {
				id = App.rand(friends.length);
				return friends[id];
			}
			return "Bruce Lee";
		},
		
//
// ###  LayerGame.setRateIconPos
//
// Set the position of the exchange rate icon.
//
		setRateIconPos: function() {
			this.rateIcon.x = this.rateLabel.x + this.rateLabel.width +
				App.scale(15);
		},
		
//
// ###  LayerGame.menuButtonCallback
//
// Callback for when a button is clicked. Determines which button was clicked by tag.
//
		menuButtonCallback: function(sender) {
			var button,
				self = this,
				tag = sender.getTag(),
				numBux = Soomla.storeInventory.getItemBalance("currency_bux"),
				numLemonades = Soomla.storeInventory.getItemBalance("currency_lemonades");
			
			App.playClickSound();
			App.showTouchCircle(this, null, sender);
			this.enableButton(tag, false);
			
			if (tag == TAG_PAUSE) {
				button = this.menu.getChildByTag(TAG_SMALL_BUX_PACK);
				if (button) {
					this.removePurchaseButtons();
					this.createActionButtons();
					this.enableButton(tag, true);
				} else {
					this.getParent().createLayer(LayerMenu, true);
				}
			}
			else if (tag == TAG_DRINK_LEMONADE) {
				if (numLemonades > 0) {
					this.removeActionButtons();
					this.startDrinkingLemonade();
				}
			}
			else if (tag == TAG_GIVE_LEMONADE) {
				if (numLemonades > 0) {
					this.createLemonadeGiver();
				}
			}
			else if (tag == TAG_BUY_LEMONADE) {
				if (numBux > this.exchangeRate) {
					this.removeActionButtons();
					this.createExchangeItems("buy");
				}
			}
			else if (tag == TAG_SELL_LEMONADE) {
				if (numLemonades > 0) {
					this.removeActionButtons();
					this.createExchangeItems("sell");
				}
			}
			else if (tag == TAG_PURCHASE_BUX) {
				this.removeActionButtons();
				this.createPurchaseButtons();
			}
			else if (tag == TAG_EARN_BUX) {
				this.viewAdvertisement();
			}
			else if (tag == TAG_SMALL_BUX_PACK) {
				Soomla.storeController.buyMarketItem("com.wizardfu.lemonadex.small_bux_pack");
			}
			else if (tag == TAG_MEDIUM_BUX_PACK) {
				Soomla.storeController.buyMarketItem("com.wizardfu.lemonadex.medium_bux_pack");
			}
		},
		
//
// ###  LayerGame.onEnter
//
// Called when the layer enters the scene. Updates the exchange rate.
//
		onEnter: function() {
			this._super();
			App.requestUrl("api/exchange-rate", this.onGetExchangeRate);
		},
		
//
// ###  LayerGame.onGetExchangeRate
//
// Called when the exchange rate is updated.
//
		onGetExchangeRate: function(response) {
			var scene = cc.director.getRunningScene(),
				multiplier = 100,
				value;
			
			if (scene && scene.layer) {
				if ((parseInt(response) + "").length >= 3) {
					multiplier = 1;
				} else if (parseFloat(response) > 50) {
					multiplier = 10;
				}

				if (typeof response === "undefined" || isNaN(response)) {
					response = 9.5 + (App.rand(100) / 100);
					cc.log("NaN exchange rate, setting to " + response);
				}
				value = parseFloat(response);
				if (multiplier == 100) {
					value = value.toFixed(2);
				}
				if (value < 0.01) {
					value = 0.01;
				}
				scene.layer.exchangeRate = value;
				scene.layer.rateLabel.setString(" = " + value);
				scene.layer.setRateIconPos();
				scene.layer.enableActionButtons();
			}
		},
		
//
// ###  LayerGame.onPaymentComplete
//
// Called when a payment is completed.
//
		onPaymentComplete: function() {
			this.removePurchaseButtons();
			this.createActionButtons();
		},

//
// ###  LayerGame.onAdDismissed
//
// Called when the advertisement is dismissed.
//
		onAdDismissed: function(success){
			if (typeof success === "undefined" || success === true) {
				this.addCurrencies(0, parseInt(this.exchangeRate * .5));
			} else {
				this.enableActionButtons();
			}
		},

//
// ###  LayerGame.onGetMyPlayerName
//
// Called when the player's name is retrieved.
//
		onGetMyPlayerName: function(name) {
			this.playerNameLabel.setString(name);
		},
		
//
// ###  LayerGame.onCurrencyUpdate
//
// Called when a currency amount is updated.
//
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

			this.enableActionButtons();
			
			self.animateCurrencies();
			if (numAnimations > 0) {
				this.schedule(function(){
					self.animateCurrencies();
				}, self.animateCurrencyAmountRate / 1000, numAnimations);
			}
		},
		
//
// ###  LayerGame.onSocialUIResponse
//
// Called when the social UI has completed.
//
		onSocialUIResponse: function(response) {
			var i,
				len;
			cc.log("Friend picker response: " + JSON.stringify(response));

			if (response && response.request && response.to.length) {
				len = response.to.length;
				for (i = 0; i < len; i += 1) {
					cc.log(response.request + "_" + response.to[i]);
				}
				
				this.addCurrencies(-1, 0);
				App.requestUrl("api/give", this.onGetExchangeRate);
			}
			
			this.enableActionButtons();
		},

//
// ###  LayerGame.onPlayerImageLoaded
//
// Called when the player image has finished loading.
//
		onPlayerImageLoaded: function(id, url) {
			var sprite;
			if (id === "me") {
				this.createPlayerImage(url);
			} else if (this.exchangeLayer) {
				this.createFriendImage(url);
			}
		},
		
//
// ###  LayerGame.enableButton
//
// Enables or disables a button by the given tag.
//
		enableButton: function(tag, enabled) {
			var button = this.menu.getChildByTag(tag);
			if (button) {
				button.setEnabled(enabled);
			}
		},
		
//
// ###  LayerGame.enableActionButtons
//
// Automatically enables or disables all action buttons.
//
		enableActionButtons: function() {
			var numBux = Soomla.storeInventory.getItemBalance("currency_bux"),
				numLemonades = Soomla.storeInventory.getItemBalance("currency_lemonades");

			this.enableButton(TAG_DRINK_LEMONADE, numLemonades > 0);
			this.enableButton(TAG_GIVE_LEMONADE, numLemonades > 0);
			this.enableButton(TAG_BUY_LEMONADE, numBux > this.exchangeRate);
			this.enableButton(TAG_SELL_LEMONADE, numLemonades > 0);
			this.enableButton(TAG_EARN_BUX, true);
			this.enableButton(TAG_PURCHASE_BUX, true);
		},
		
//
// ###  LayerGame.removeButtons
//
// Remove buttons with the given tags. `tags` is an array.
//
		removeButtons: function(tags) {
			var i,
				button;
			for (i = 0; i < tags.length; i += 1) {
				button = this.menu.getChildByTag(tags[i]);
				if (button) {
					button.removeFromParent();
				}
			}
		},
		
//
// ###  LayerGame.removeActionButtons
//
// Remove the game menu items.
//
		removeActionButtons: function() {
			this.removeButtons([
				TAG_DRINK_LEMONADE,
				TAG_GIVE_LEMONADE,
				TAG_EARN_BUX,
				TAG_BUY_LEMONADE,
				TAG_SELL_LEMONADE,
				TAG_PURCHASE_BUX
			]);
		},
		
//
// ###  LayerGame.removePurchaseButtons
//
// Remove the purchase menu items.
//
		removePurchaseButtons: function() {
			this.removeButtons([
				TAG_SMALL_BUX_PACK,
				TAG_MEDIUM_BUX_PACK
			]);
		}

	}); // end layer extend

}()); // end module pattern
