
//
// The game client's config file. Used to localize the game, configure plugins and provide other settings and preferences.
//
var Game = Game || {};

Game.config = {
//
// ###  strings
//
// Localize your app by providing strings grouped by language code. If a string is not found for the current language code, the default `en` will be used.
//
	"strings": {
		"en": {
			"hello-world": "Hello World!",
			"you-are-player-number": "Your magic number is %d."
		}
	},
	
//
// ###  font
//
// The font to be used.
//
	"font": "Molle",
	"font-shadow-color": cc.color(35, 168, 20),

//
// ###  click-sounds
//
// An array of click sounds to be used when tapping the Hello World layer.
//
	"click-sounds": [
		"Assets/Drop1.wav",
		"Assets/Drop2.wav",
		"Assets/Drop3.wav"
	],

	"songs": [
		{file: "Assets/3 Ragga C Jump Beat.mp3", bpm: 113, intro: 4.437},
		{file: "Assets/2 Beat One.mp3", bpm: 120},
		{file: "Assets/1 Island Mystery.mp3", bpm: 120, intro: 12.0}
	],
	
	"bux-sounds": [
		"Assets/Bux1.wav",
		"Assets/Bux2.wav",
		"Assets/Bux3.wav"
	],

	"glass-sounds": [
		"Assets/Glass1.wav"
	],

	"anonymous-friends": [
		"Bruce Lee",
		"Samwise Gamgee",
		"Peter Parker",
		"Lex Luthor",
		"David Banner",
		"Clark Kent",
		"Austin Powers",
		"James Bond",
		"Ricky Ricardo",
		"Johnny Knoxville",
		"G.R.R. Martin",
		"Mr. T",
		"Robin Hood",
		"Barbara Streisand",
		"Coffee Brown",
		"Janis Joplin",
		"Michelle Obama",
		"Grandma Moses",
		"Harriet Tubman",
		"Joan of Arc"
	],
	
	"total-drinking-streaks": 25,
	"total-glass-breaking-sounds": 3,
	
//
// ###  loader
//
// Settings for the loading scene.
//
	"loader": {
		"bg-color": cc.color(253, 252, 255, 255),
		"text": "L o a d i n g . . .",
		"text-font": "Arial",
		"text-color": cc.color(180, 180, 180, 255),
		"text-size": 20,
		"bar-color": cc.color(9, 9, 10, 255),
		"image-win-size-percent": 0.5
	},

//
// ###  analytics-plugin
//
// Settings for the analytics plugin. Insert your API key.
//
	"analytics-plugin": {
		"name": "AnalyticsFlurry",
		"debug": false,
		"api-key": "PBSGR7SV59JZN2RQQW96"
	},
	
//
// ###  social-plugin
//
// Settings for the social plugin. Insert your app ID. Add [login permissions](https://developers.facebook.com/docs/facebook-login/permissions) as needed or leave empty to use only `basic_info`.
//
// iOS apps require the app ID to be in the `Info.plist` under the `FacebookAppID` key and a part of the URL scheme. See LemonadeExchange's `Info.plist` for an example. Reference Facebook's [iOS Documentation](https://developers.facebook.com/docs/ios/getting-started/#configure).
//
// Android apps require the app ID to be a string in `strings.xml` and referenced from `AndroidManifest.xml` as metadata. See LemonadeExchange's Android project for an example. Reference Facebook's [Android Documentation](https://developers.facebook.com/docs/android/getting-started/#login).
//
	"social-plugin": {
		"name": "Facebook",
		"debug": false,
		"app-id": "641151319281152",
		"login-permissions": "",
		"profile-image-width": 150
	},

//
// ###  ads-plugin
//
// Settings for the advertisements plugin. Insert your API key. Mode can be `test` or `live`.
//
	"ads-plugin": {
		"name": "AdsMobFox",
		"debug": false,
		"api-key": "928212dab22e3c4cc7774cc26532100c",
		"mode": "live"
	},

//
// ###  economy-plugin
//
// Settings for the virtual economy plugin. Generate random 32-character strings for `secret1` and `secret2`. Insert your Android public key obtained from your Google Play Developer Console (optional).
//
	"economy-plugin": {
		"name": "Soomla",
		"debug": false,
		"secret1": "77yMfv8l1yyYq4WoKJ0cVTEa3FU2zuSp",
		"secret2": "0irOF7InTS2OzA3hc7Ejj8Mhm3l3dI9s",
		"android-public-key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlYZHeBm9l52JwNB9s6j9z3lbZN6O4ydWctIin1gJFUrEILtJpIGb5z6ER+F9DsOYphmin0QXu1TF1S78BfAKUNzJbJzcKIi85B/IQPgRpSIKx+Y2k5m9dECXwbSVcJgwndUQnBGbxz7EJIJtrY+hPVhN5DCRM4FZSE0rRLA6niWzKwbZOlGrHYr9q/H/a6zKho9/JJtimVTtE8KhoVIjKBhFBUQYhCIkkKRZfzUc4pXgmtv+7G9o77XhE5sPvcZZfZN2EFPjXXl4BdeRtpytZ6b72OhRpzlkciNb8e8cnobe2zviPggM8HzNv3YwTEPbyS9Vez4UcslW/wmrekuQuwIDAQAB",
		"currencies": [
			{
				"name": "Lemonades",
				"description": "",
				"itemId": "currency_lemonades"
			},
			{
				"name": "Bux",
				"description": "",
				"itemId": "currency_bux"
			}
		],
		"initial-balances": {
			"currency_lemonades": 10,
			"currency_bux": 100
		},
		"currency-packs": [
			{
				"name": "Small Bux Pack",
				"description": "50 bux!",
				"itemId": "small_bux_pack",
				"currency_amount": 50,
				"currency_itemId": "currency_bux",
				"create_market_item": [
					"com.wizardfu.lemonadex.small_bux_pack",
					0.99
				],
				"facebook_product_url": "http://wizardfu.com/lemonadex/Assets/small_bux_pack.html"
			},
			{
				"name": "Medium Bux Pack",
				"description": "300 bux!",
				"itemId": "medium_bux_pack",
				"currency_amount": 300,
				"currency_itemId": "currency_bux",
				"create_market_item": [
					"com.wizardfu.lemonadex.medium_bux_pack",
					4.99
				],
				"facebook_product_url": "http://wizardfu.com/lemonadex/Assets/medium_bux_pack.html"
			}
		],
		"single-use-goods": [],
		"lifetime-goods": [],
		"equippable-goods": [],
		"good-upgrades": [],
		"good-packs": [],
		"non-consumables": [],
		"categories": []
	}
};
