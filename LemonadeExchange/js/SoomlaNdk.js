//
// Created by NatWeiss on 2/7/14.
//
// Uses CryptoJS AES encryption for local store inventory security.
// To enable, make sure your HTML file includes aes.js, for example:
//     <script src="https://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/aes.js"></script>
// More info:
//     https://code.google.com/p/crypto-js/
//

// we only create a Javascript Soomla NDK bridge if it's missing.
// on iOS or Android, it will not be missing and this file is ignored.
// on HTML5, the bridge is missing so it automatically gets created here.
if (typeof Soomla.CCSoomlaNdkBridge === "undefined"){

	// create the Soomla NDK bridge in a closure so we can have private variables
	Soomla.CCSoomlaNdkBridge = (function(){
		var DEBUG = true,
			ALWAYS_RESET_INVENTORY = false,
			DEFAULT_SOOM_SEC = "DEFAULT",
			DEFAULT_CUSTOM_SEC = "DEFAULT",
			INVENTORY_ID = "soomla.inventory",
			TAG = "SoomlaNDK:";

		var self = {},
			private = {soomSec: DEFAULT_SOOM_SEC, customSec: DEFAULT_CUSTOM_SEC},
			hasCrypto = (typeof CryptoJS !== "undefined" && CryptoJS.AES),
			hasBase64 = (typeof btoa !== "undefined");
		
		// log
		private.log = function() {
			if (DEBUG) {
				[].unshift.call(arguments, TAG);
				cc.log.apply(self, arguments);
			}
		};
		
		// encrypt
		private.encrypt = function(str) {
			str += ""; // ensure it's a string
			if (hasCrypto) {
				return CryptoJS.AES.encrypt(str, private.soomSec + private.customSec);
			} else if (hasBase64) {
				return btoa(str);
			}
			return str;
		};

		// decrypt
		private.decrypt = function(str) {
			str += ""; // ensure it's a string
			if (hasCrypto) {
				return CryptoJS.AES.decrypt(str, private.soomSec + private.customSec).toString(CryptoJS.enc.Utf8);
			} else if (hasBase64) {
				return atob(str);
			}
			return str;
		};
		
		// load inventory
		private.loadInventory = function() {
			var inventory;
			if (private.soomSec === DEFAULT_SOOM_SEC || private.customSec === DEFAULT_CUSTOM_SEC) {
				private.log("Cannot load inventory yet because one or two secrets have not been set");
				return;
			}
			if (ALWAYS_RESET_INVENTORY) {
				sys.localStorage.removeItem(INVENTORY_ID);
			}
			
			inventory = sys.localStorage.getItem(INVENTORY_ID);
			if (inventory) {
				try {
					inventory = JSON.parse(private.decrypt(inventory));
				} catch (e) {
					private.log("ERROR parsing inventory! Hack attempt? Starting clean.");
					inventory = "";
				}
			}
			
			private.storeInventory = inventory || {
				currencies: {}
			};
			private.log("Loaded Soomla store inventory: " + JSON.stringify(private.storeInventory));
		};
		
		// save inventory
		private.saveInventory = function() {
			var inventory = private.encrypt(JSON.stringify(private.storeInventory));
			sys.localStorage.setItem(INVENTORY_ID, inventory);
		};
		
		// get class name of goods key
		private.goodsKeyToClassName = function(key) {
			switch (key) {
				case "singleUse": return "SingleUseVG";
				case "lifetime": return "LifetimeVG";
				case "equippable": return "EquippableVG";
				case "goodUpgrades": return "UpgradeVG";
				case "goodPacks": return "SingleUsePackVG";
			}
			return "";
		};
		
		// call "native" method
		self.callNative = function(paramsString) {
			var i,
				key,
				x,
				len,
				params = JSON.parse(paramsString),
				ret,
				returnParams = {
					success: true,
					code: 0,
					info: "",
					result: {}
				};

			//
			// CCStoreAssets
			//
			if (params.method === "CCStoreAssets::init") {
				private.version = params.version;
				private.storeAssets = params.storeAssets;
				//private.log("Init Soomla store assets: " + JSON.stringify(private.storeAssets));
			}
			//
			// CCStoreController
			//
			else if(params.method === "CCStoreController::init") {
				private.customSec = params.customSecret + "";
				private.log("Custom secret: " + private.customSec);
				private.loadInventory();
			}
			else if (params.method === "CCStoreController::setSoomSec") {
				private.soomSec = params.soomSec + "";
				private.log("Soomla secret: " + private.soomSec);
				private.loadInventory();
			}
			else if (params.method === "CCStoreController::setSSV") {
				private.ssv = params.ssv;
				private.log("SSV: " + private.ssv);
			}
			else if(params.method === "CCStoreController::setAndroidPublicKey") {
				private.androidPublicKey = params.androidPublicKey + "";
				private.log("Android public key: " + private.androidPublicKey);
			}
			else if(params.method === "CCStoreController::buyMarketItem") {
				// params.productId
			}
			else if(params.method === "CCStoreController::restoreTransactions") {
			}
			else if(params.method === "CCStoreController::transactionsAlreadyRestored") {
			}
			else if(params.method === "CCStoreController::startIabServiceInBg") {
			}
			else if(params.method === "CCStoreController::stopIabServiceInBg") {
			}
			//
			// CCStoreInfo
			//
			else if(params.method === "CCStoreInfo::getItemByItemId") {
				// params.itemId
			}
			else if(params.method === "CCStoreInfo::getPurchasableItemWithProductId") {
				// params.productId
			}
			else if(params.method === "CCStoreInfo::getCategoryForVirtualGood") {
				// params.goodItemId
			}
			else if(params.method === "CCStoreInfo::getFirstUpgradeForVirtualGood") {
				// params.goodItemId
			}
			else if(params.method === "CCStoreInfo::getLastUpgradeForVirtualGood") {
				// params.goodItemId
			}
			else if(params.method === "CCStoreInfo::getUpgradesForVirtualGood") {
				// params.goodItemId
			}
			else if (params.method === "CCStoreInfo::getVirtualCurrencies") {
				ret = [];
				len = private.storeAssets.currencies.length;
				for (i = 0; i < len; i += 1) {
					ret.push({
						item: private.storeAssets.currencies[i],
						className: private.storeAssets.currencies[i].className
					});
				}
			}
			else if(params.method === "CCStoreInfo::getVirtualGoods") {
				ret = [];
				for (key in private.storeAssets.goods) {
					if (private.storeAssets.goods.hasOwnProperty(key)) {
						x = private.storeAssets.goods[key];
						if (typeof x !== "undefined") {
							for (i = 0; i < x.length; i += 1) {
								ret.push({
									item: x[i],
									className: private.goodsKeyToClassName(key)
								});
							}
						}
					}
				}
			}
			else if(params.method === "CCStoreInfo::getVirtualCurrencyPacks") {
			}
			else if(params.method === "CCStoreInfo::getNonConsumableItems") {
			}
			else if(params.method === "CCStoreInfo::getVirtualCategories") {
			}
			//
			// CCStoreInventory
			//
			else if(params.method === "CCStoreInventory::buyItem") {
			}
			else if(params.method === "CCStoreInventory::getItemBalance") {
				ret = private.storeInventory.currencies[params.itemId] || 0;
			}
			else if(params.method === "CCStoreInventory::giveItem") {
				private.storeInventory.currencies[params.itemId] += params.amount;
				private.saveInventory();
			}
			else if(params.method === "CCStoreInventory::takeItem") {
				private.storeInventory.currencies[params.itemId] -= params.amount;
				private.saveInventory();
			}
			else if(params.method === "CCStoreInventory::equipVirtualGood") {
				// params.itemId
			}
			else if(params.method === "CCStoreInventory::unEquipVirtualGood") {
				// params.itemId
			}
			else if(params.method === "CCStoreInventory::isVirtualGoodEquipped") {
				// params.itemId
			}
			else if(params.method === "CCStoreInventory::getGoodUpgradeLevel") {
				// params.goodItemId
			}
			else if(params.method === "CCStoreInventory::getGoodUpgradeLevel") {
				// params.goodItemId
			}
			else if(params.method === "CCStoreInventory::getGoodCurrentUpgrade") {
				// params.goodItemId
			}
			else if(params.method === "CCStoreInventory::upgradeGood") {
				// params.goodItemId
			}
			else if(params.method === "CCStoreInventory::removeGoodUpgrades") {
				// params.goodItemId
			}
			else if(params.method === "CCStoreInventory::nonConsumableItemExists") {
				// params.nonConsItemId
			}
			else if(params.method === "CCStoreInventory::addNonConsumableItem") {
				// params.nonConsItemId
			}
			else if(params.method === "CCStoreInventory::removeNonConsumableItem") {
				// params.nonConsItemId
			}
			else {
				private.log("Unknown native call method: " + App.logify(params));
			}

			// assign return value
			returnParams.result.return = ret;
			
			// since we are using JSON stringify + parse theres no worries about object cloning! :)
			return JSON.stringify(returnParams);
		};
		
		self.setDebug = function(debug) {
			DEBUG = debug;
		};

		// test encrypt / decrypt
		private.testEncryption = function() {
			var original = "something",
				encrypted = private.encrypt(original);
			private.log("Encrypt(" + original + "): " + encrypted);
			private.log("Decrypt(" + encrypted + "): " + private.decrypt(encrypted));
		};

		// do some tests
		//if (DEBUG) {
		//	private.testEncryption();
		//}
		
		// self now becomes Soomla.CCSoomlaNdkBridge whilst
		// all our private variables remain private
		return self;
	}()); // end of CCSoomlaNdkBridge module closure

} // end of check if CCSoomlaNdkBridge is undefined
