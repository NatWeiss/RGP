///
/// > See the `LICENSE` file for the license governing this code.
///

///
/// Extend the [Game](Game.html) object with project-specific functions.
///

///
/// ###  Game
///
/// Get or create the Game object.
///
var Game = Game || {};

///
/// ###  Game.playClickSound
///
/// Play one of the click sounds in sequential order.
///
Game.playClickSound = function() {
	var sounds = Game.config["click-sounds"];
	this.clickSound = this.clickSound || 0;
	
	Game.playEffect(sounds[this.clickSound]);
	
	this.clickSound = (this.clickSound + 1) % sounds.length;
};

///
/// ###  Game.showTouchCircle
///
/// Show an expanding, fading circle at the given position or the given item's position.
///
Game.showTouchCircle = function(parentNode, pos, item) {
	var circle;
	
	if (typeof pos === "undefined" || pos === null) {
		if (item) {
			pos = cc.p(
				item.getPositionX() + (item.getAnchorPoint().x ?
					0 : item.getContentSize().width * .5),
				item.getPositionY() + (item.getAnchorPoint().y ?
					0 : item.getContentSize().height * .5)
			);
		} else {
			return;
		}
	}
	
	circle = cc.Sprite.create("#TouchCircle.png");
	if (circle === null) {
		return;
	}
	circle.setPosition(pos);
	circle.setScale(0.5);
	circle.runAction(cc.Sequence.create(
		cc.DelayTime.create(0.5),
		cc.FadeOut.create(1),
		cc.RemoveSelf.create()
	));
	parentNode.addChild(circle, 10);

	circle = cc.Sprite.create("#TouchCircle.png");
	circle.setPosition(pos);
	circle.setScale(0.5);
	circle.runAction(cc.Spawn.create(
		cc.FadeOut.create(1.5),
		cc.Sequence.create(
			cc.ScaleBy.create(1.5, 2.5, 2.5),
			cc.RemoveSelf.create()
		)
	));
	parentNode.addChild(circle, 11);
};

///
/// ###  Game.getInitialLayer
///
/// Get the initial layer to run.
///
Game.getInitialLayer = function() {
	return LayerMenu;
};

///
/// ###  Game.createButton
///
/// Creates a button.
///
Game.createButton = function(obj, spriteFilename, tag, position, anchorPoint, movement, duration, delay, easeRate) {
	var winSize = Game.getWinSize(),
		normalSprite = cc.Sprite.create("#" + spriteFilename),
		selectedSprite = cc.Sprite.create("#" + spriteFilename),
		disabledSprite = cc.Sprite.create("#" + spriteFilename),
		button;
	selectedSprite.setColor(cc.color(128,128,128));
	disabledSprite.setColor(cc.color(128,128,128));

	button = cc.MenuItemSprite.create(normalSprite, selectedSprite, disabledSprite, obj.menuButtonCallback, obj);
	button.setTag(tag);
	if (typeof movement !== "undefined") {
		button.setPosition(cc.pSub(position, movement));
		button.runAction(cc.Sequence.create(
			cc.DelayTime.create(delay),
			cc.EaseOut.create(cc.MoveBy.create(duration, movement), easeRate ? easeRate : 1.5)
		));
	} else {
		button.setPosition(position);
	}
	button.setAnchorPoint(anchorPoint);
	obj.menu.addChild(button);

	return button;
};

///
/// ###  Game.addCurrencyToButton
///
/// Adds a currency amount to the given button.
///
Game.addCurrencyToButton = function(button, amount, currencyAmount, spriteFrameName) {
	var label,
		sprite,
		margin = Game.scale(12),
		shadowDistance = Game.scale(4),
		buttonSize = button.getContentSize(),
		font = Game.config["font"];

	sprite = cc.Sprite.create("#" + spriteFrameName);
	sprite.setPosition(buttonSize.width * .5, buttonSize.height * .5);
	sprite.setScale(0.9);
	button.addChild(sprite);

	label = cc.LabelTTF.create(amount, font, Game.scale(50));
	label.setAnchorPoint(0, 1);
	label.setPosition(margin * 1.5, buttonSize.height - margin);
	button.addChild(label, 1);

	label = cc.LabelTTF.create(amount, font, Game.scale(50));
	label.setAnchorPoint(0, 1);
	label.setColor(Game.config["font-shadow-color"]);
	label.setPosition(margin * 1.5, buttonSize.height - margin - shadowDistance);
	button.addChild(label);

	label = cc.LabelTTF.create(currencyAmount, font, Game.scale(50));
	label.setAnchorPoint(1, 0);
	label.setPosition(buttonSize.width - margin * 1.5, margin);
	button.addChild(label, 1);

	label = cc.LabelTTF.create(currencyAmount, font, Game.scale(50));
	label.setAnchorPoint(1, 0);
	label.setColor(Game.config["font-shadow-color"]);
	label.setPosition(buttonSize.width - margin * 1.5, margin - shadowDistance);
	button.addChild(label);
};

///
/// ###  Game.startMusic
///
/// Starts music playing, cycling through the available songs. Safe to be called even if music is already playing.
///
Game.startMusic = function() {
	var self = this,
		song;
	
	if (!this._didPlaySong
	&& Game.isSoundEnabled()
	&& !cc.audioEngine.isMusicPlaying()) {
		this._songNumber = this._songNumber || 0;
		song = Game.config["songs"][this._songNumber]
		
		Game.playEffect("music-start.wav");
		Game.playMusic(song.file);
		
		this._songNumber = (this._songNumber + 1) % Game.config["songs"].length;
		this._didPlaySong = true;
		cc.director.getRunningScene().schedule(Game.checkMusic, 1, 30);
	}
};

///
/// ###  Game.checkMusic
///
/// Checks that music started playing. Workaround for an issue where Chrome takes a few seconds to play music.
///
Game.checkMusic = function() {
	var enabled = Game.isSoundEnabled(),
		playing = cc.audioEngine.isMusicPlaying();
	if (enabled && playing) {
		Game._didPlaySong = false;
		/*cc.log("Started song");*/
		cc.director.getRunningScene().unschedule(Game.checkMusic);
	} else if (!enabled) {
		Game._didPlaySong = false;
		/*cc.log("checkMusic stopping");*/
		cc.director.getRunningScene().unschedule(Game.checkMusic);
	}
};


