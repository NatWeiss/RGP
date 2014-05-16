
//
// The game client's config file. Used to localize the game, configure plugins and provide other settings and preferences.
//
var App = App || {};

App.config = {
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
// ###  preload
//
// Specify resources to preload.
//
	"preload": [
		"spritesheet.plist",
		"spritesheet.png"
	],

//
// ###  spritesheets
//
// Specify spritesheets to be used.
//
	"spritesheets": [
		"spritesheet.plist"
	],
	
//
// ###  font
//
// The font to be used.
//
	"font": "Arial",
	
//
// ###  click-sounds
//
// An array of click sounds to be used when tapping the Hello World layer.
//
	"click-sounds": [
		"res/Drop1.wav",
		"res/Drop2.wav",
		"res/Drop3.wav"
	],

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

// begin pro
//
// ###  analytics-plugin
//
// Settings for the analytics plugin. Insert your API key.
//
	"analytics-plugin": {
		"name": "AnalyticsFlurry",
		"debug": false,
		"api-key": ""
	},
	
//
// ###  social-plugin
//
// Settings for the social plugin (Facebook). Insert your app ID. Add [login permissions](https://developers.facebook.com/docs/facebook-login/permissions) as needed or leave empty to use only `basic_info`.
//
// iOS apps require the app ID to be in the `Info.plist` under the `FacebookAppID` key and a part of the URL scheme. See LemonadeExchange's `Info.plist` for an example. Reference Facebook's [iOS Documentation](https://developers.facebook.com/docs/ios/getting-started/#configure).
//
// Android apps require the app ID to be a string in `strings.xml` and referenced from `AndroidManifest.xml` as metadata. See LemonadeExchange's Android project for an example. Reference Facebook's [Android Documentation](https://developers.facebook.com/docs/android/getting-started/#login).
//
	"social-plugin": {
		"name": "Facebook",
		"debug": true,
		"app-id": "",
		"login-permissions": "",
		"profile-image-width": 100
	},

//
// ###  ads-plugin
//
// Settings for the advertisements plugin. Insert your API key. Mode can be `test` or `live`.
//
	"ads-plugin": {
		"name": "AdsMobFox",
		"debug": true,
		"api-key": "",
		"mode": "test"
	},

//
// ###  economy-plugin
//
// Settings for the virtual economy plugin. Generate random 32-character strings for `secret1` and `secret2`. Insert your Android public key obtained from your Google Play Developer Console (optional).
//
	"economy-plugin": {
		"name": "Soomla",
		"debug": true,
		"secret1": "01234567890123456789012345678901",
		"secret2": "01234567890123456789012345678901",
		"android-public-key": " ",
		"currencies": [{
			"name": "Example Currency",
			"description": "",
			"itemId": "currency_example"
		}],
		"initial-balances": {
			"currency_example": 10
		},
		"currency-packs": [{
			"name": "Example Currency Pack",
			"description": "",
			"itemId": "small_currency_pack1",
			"currency_amount": 50,
			"currency_itemId": "currency_example",
			"create_market_item": [
				"com.wizardfu.helloworld.small_currency_pack1",
				0.99
			],
			"facebook_product_url": "http://cocos2dx.org/small_currency_pack1.html"
		}],
		"single-use-goods": [{
			"name": "Example Single Use Good",
			"description": "",
			"itemId": "single_use_good1",
			"create_virtual_item": ["currency_example", 100]
		}],
		"lifetime-goods": [{
			"name": "Example Lifetime Good",
			"description": "",
			"itemId": "lifetime_good1",
			"create_virtual_item": ["currency_example", 1000]
		}],
		"equippable-goods": [{
			"name": "Example Equippable Good",
			"description": "",
			"equipping": "category", /* can be "category", "local" or "global" */
			"itemId": "equippable_good1",
			"create_virtual_item": ["currency_example", 250]
		}],
		"good-upgrades": [{
			"name": "Example Lifetime Good - Level 2",
			"description": "",
			"itemId": "good_upgrade2",
			"good_itemId": "lifetime_good1",
			"prev_itemId": null,
			"next_itemId": "good_upgrade3",
			"create_virtual_item": ["currency_example", 150]
		}],
		"good-packs": [{
			"good_itemId": "single_use_good1",
			"good_amount": 10,
			"name": "10 Example Single Use Goods",
			"description": "",
			"itemId": "single_use_good1_pack10",
			"create_virtual_item": ["currency_example", 900]
		}],
		"non-consumables": [{
			"name": "Example Non-Consumable Item",
			"description": "",
			"itemId": "non_consumable1",
			"create_nonconsumable_item": ["non_consumable1", 1.99]
		}],
		"categories": [{
			"name": "Upgrades",
			"goods_itemIds": ["good_upgrade2"]
		}]
	},
// end pro

	unused: null
};

//
// ###  loader-image
//
// Customize the loader scene's image. Convert an [image to base64](http://webcodertools.com/imagetobase64converter), then paste here.
//
App.config["loader"]["image"] = "data:image/png;base64,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";

