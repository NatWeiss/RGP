///
/// > Created using [RapidGame](http://wizardfu.com/rapidgame). See the `LICENSE` file for the license governing this code.
///

///
/// The game client's config file. Used to localize the game, configure plugins and provide other settings and preferences.
///
/// Note that this data can also be placed in the `project.json` file. At runtime, the `Game` object merges this array with `cc.game.config`.
///
var Game = Game || {};

Game.config = {
///
/// ###  analytics-plugin
///
/// Settings for the analytics plugin. Insert your API key.
///
	"analytics-plugin": {
		"name": "AnalyticsFlurry",
		"debug": false,
		"api-key": ""
	},
	
///
/// ###  social-plugin
///
/// Settings for the social plugin (Facebook). Insert your app ID. Add [login permissions](https://developers.facebook.com/docs/facebook-login/permissions) as needed or leave empty to use only `basic_info`.
///
/// iOS apps require the app ID to be in the `Info.plist` under the `FacebookAppID` key and a part of the URL scheme. See LemonadeExchange's `Info.plist` for an example. Reference Facebook's [iOS Documentation](https://developers.facebook.com/docs/ios/getting-started/#configure).
///
/// Android apps require the app ID to be a string in `strings.xml` and referenced from `AndroidManifest.xml` as metadata. See LemonadeExchange's Android project for an example. Reference Facebook's [Android Documentation](https://developers.facebook.com/docs/android/getting-started/#login).
///
	"social-plugin": {
		"name": "Facebook",
		"debug": false,
		"app-id": "",
		"login-permissions": "",
		"profile-image-width": 100
	},

///
/// ###  ads-plugin
///
/// Settings for the advertisements plugin. Insert your API key. Mode can be `test` or `live`.
///
	"ads-plugin": {
		"name": "AdsMobFox",
		"debug": false,
		"api-key": "",
		"mode": "test"
	},

///
/// ###  economy-plugin
///
/// Settings for the virtual economy plugin. Generate random 32-character strings for `secret1` and `secret2`. Insert your Android public key obtained from your Google Play Developer Console (optional).
///
	"economy-plugin": {
		"name": "Soomla",
		"debug": false,
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

	unused: null
};
