App.config = {
	"flurry-api-key": "PBSGR7SV59JZN2RQQW96",
	
	"social-plugin-name": "Facebook",
	"social-plugin-debug": true,
	"social-plugin-init": {
		appId: "641151319281152",
		xfbml: false,
		status: true,
		cookie: true,
	},
	"social-plugin-login": {
		//scope:'email'
	},

	"economy-plugin-name": "Soomla",
	"economy-plugin-debug": true,
	"economy-plugin-init": {
		// only use soomla highway and your don't need these...
		soomSec: "77yMfv8l1yyYq4WoKJ0cVTEa3FU2zuSp",
		customSecret: "0irOF7InTS2OzA3hc7Ejj8Mhm3l3dI9s",

		// put this only in the android build...
		androidPublicKey: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlYZHeBm9l52JwNB9s6j9z3lbZN6O4ydWctIin1gJFUrEILtJpIGb5z6ER+F9DsOYphmin0QXu1TF1S78BfAKUNzJbJzcKIi85B/IQPgRpSIKx+Y2k5m9dECXwbSVcJgwndUQnBGbxz7EJIJtrY+hPVhN5DCRM4FZSE0rRLA6niWzKwbZOlGrHYr9q/H/a6zKho9/JJtimVTtE8KhoVIjKBhFBUQYhCIkkKRZfzUc4pXgmtv+7G9o77XhE5sPvcZZfZN2EFPjXXl4BdeRtpytZ6b72OhRpzlkciNb8e8cnobe2zviPggM8HzNv3YwTEPbyS9Vez4UcslW/wmrekuQuwIDAQAB"
	},

	"ads-plugin-name": "AdsMobFox",
	"ads-plugin-debug": false,
	"ads-plugin-api-key": "7e9fe879ef86ffa86071cddbd7ec6203", // "928212dab22e3c4cc7774cc26532100c"
	"ads-plugin-mode": "test", // "test" or "live"
	
	"initial-balances": {
		"currency_lemonades": 10,
		"currency_bux": 100
	},

	"spritesheets": [
		"spritesheet.plist"
	],
	
	"font": "Arial",
	
	"songs": [
		{file: "res/1 Island Mystery.mp3", bpm: 120, intro: 12.0},
		{file: "res/2 Beat One.mp3", bpm: 120},
		{file: "res/3 Ragga C Jump Beat.mp3", bpm: 113, intro: 4.437}
	],

	"total-drinking-streaks": 25,

	"total-lemonade-sounds": 3,
	"total-complain-about-no-music-sounds": 2,
	"total-glass-breaking-sounds": 3,
	"total-comment-on-broken-glass-sounds": 3,
	"total-tell-your-friends-sounds": 1,
	"total-tipjar-philosophy-sounds": 1,
	"total-watch-a-video-sounds": 3
};

App.getStoreAssets = function() {
	var LEMONADE_CURRENCY_ITEM_ID = "currency_lemonades";
	var BUX_CURRENCY_ITEM_ID = "currency_bux";

	// currencies
	var lemonadeCurrency = Soomla.Models.VirtualCurrency.create({
		name: "Lemonades",
		description: "",
		itemId: LEMONADE_CURRENCY_ITEM_ID
	});
	var buxCurrency = Soomla.Models.VirtualCurrency.create({
		name: "Bux",
		description: "",
		itemId: BUX_CURRENCY_ITEM_ID
	});

	// currency packs
	var smallBuxPack = Soomla.Models.VirtualCurrencyPack.create({
		name: "50 bux",
		description: "Money!",
		itemId: "small_bux_pack",
		currency_amount: 50,
		currency_itemId: BUX_CURRENCY_ITEM_ID,
		purchasableItem: Soomla.Models.PurchaseWithMarket.createWithMarketItem(
			"com.wizardfu.lemonadex.small_lemonades_pack",
			0.99
		),
		facebookProductUrl: "http://wizardfu.com/lemonadex/tipjar.html"
	});

	// assets
	var assets = {
		categories: [],
		currencies: [lemonadeCurrency, buxCurrency],
		currencyPacks: [smallBuxPack],
		goods: {
			singleUse: [],
			lifetime: [],
			equippable: [],
			goodUpgrades: [],
			goodPacks: []
		},
		nonConsumables: [],
		version: 1
	};
	
	return Soomla.IStoreAssets.create(assets);
}
