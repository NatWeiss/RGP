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
			TAG = "SoomlaNDK: ";

		var self = {},
			module = {
				soomSec: DEFAULT_SOOM_SEC,
				customSec: DEFAULT_CUSTOM_SEC,
				purchasingItem: null,
				storeInventory: {}
			},
			hasCrypto = (typeof CryptoJS !== "undefined" && CryptoJS.AES),
			hasBase64 = (typeof btoa !== "undefined");
		
		// log
		module.log = function(msg) {
			if (DEBUG) {
				cc.log(TAG + msg);
			}
		};
		
		// encrypt
		module.encrypt = function(str) {
			str += ""; // ensure it's a string
			if (hasCrypto) {
				return CryptoJS.AES.encrypt(str, module.soomSec + module.customSec);
			} else if (hasBase64) {
				return btoa(str);
			}
			return str;
		};

		// decrypt
		module.decrypt = function(str) {
			str += ""; // ensure it's a string
			if (hasCrypto) {
				return CryptoJS.AES.decrypt(str, module.soomSec + module.customSec).toString(CryptoJS.enc.Utf8);
			} else if (hasBase64) {
				return atob(str);
			}
			return str;
		};
		
		// load inventory
		module.loadInventory = function() {
			var inventory;
			if (module.soomSec === DEFAULT_SOOM_SEC || module.customSec === DEFAULT_CUSTOM_SEC) {
				module.log("Cannot load inventory yet because one or two secrets have not been set");
				return;
			}
			if (ALWAYS_RESET_INVENTORY) {
				cc.sys.localStorage.removeItem(INVENTORY_ID);
			}
			
			inventory = cc.sys.localStorage.getItem(INVENTORY_ID);
			if (inventory) {
				try {
					inventory = JSON.parse(module.decrypt(inventory));
				} catch (e) {
					module.log("ERROR parsing inventory. Possible tampering. Starting clean.");
					inventory = "";
				}
			}
			
			module.storeInventory = inventory || {
				currencies: {}
			};
			module.log("Loaded Soomla store inventory: " + JSON.stringify(module.storeInventory));
		};
		
		// save inventory
		module.saveInventory = function() {
			var inventory = module.encrypt(JSON.stringify(module.storeInventory));
			cc.sys.localStorage.setItem(INVENTORY_ID, inventory);
			module.log("Saved Soomla store inventory: " + JSON.stringify(module.storeInventory));
		};
		
		// get class name of goods key
		module.goodsKeyToClassName = function(key) {
			switch (key) {
				case "singleUse": return "SingleUseVG";
				case "lifetime": return "LifetimeVG";
				case "equippable": return "EquippableVG";
				case "goodUpgrades": return "UpgradeVG";
				case "goodPacks": return "SingleUsePackVG";
			}
			return "";
		};
		
		// find an item id
		module.findItemId = function(root, key, id, depth) {
			var key,
				ret;
			depth = depth || 0;
			if (depth > 7) {
				return;
			}
			
			for (k in root) {
				if (root.hasOwnProperty(k)) {
					// try this child
					if (typeof root[k][key] !== "undefined") {
						//module.log("id: " + root[k][key] + ", depth: " + depth);
						if (root[k][key] === id) {
							return root[k];
						}
					}
					
					// search child's children
					if (typeof root[k] === "object") {
						ret = module.findItemId(root[k], key, id, depth + 1);
						if (typeof ret !== "undefined") {
							return ret;
						}
					}
				}
			}
		};
		
		// call a dynamically prototyped function
		module.callMy = function(method) {
			if (typeof self[method] === "function") {
				self[method]();
			}
		};
		
		// handle payments
		module.onPaymentSuccess = function() {
			if (module.purchasingItem) {
				module.log("Purchased " + module.purchasingItem["currency_amount"]
					+ " x " + module.purchasingItem["currency_itemId"]);

				// give the amount
				Soomla.storeInventory.giveItem(
					module.purchasingItem["currency_itemId"],
					module.purchasingItem["currency_amount"]
				);

				module.callMy("onCurrencyUpdate");
			} else {
				module.log("Invalid purchasing item");
			}
			module.purchasingItem = null;
			module.callMy("onPaymentComplete");
		};
		module.onPaymentFailure = function() {
			module.log("Purchase failed");
			module.purchasingItem = null;
			module.callMy("onPaymentComplete");
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
				module.version = params.version;
				module.storeAssets = params.storeAssets;
				//module.log("Init Soomla store assets: " + JSON.stringify(module.storeAssets));
			}
			//
			// CCStoreController
			//
			else if(params.method === "CCStoreController::init") {
				module.customSec = params.customSecret + "";
				module.log("Custom secret: " + module.customSec.substring(0,4) + "...");
				module.loadInventory();
			}
			else if (params.method === "CCStoreController::setSoomSec") {
				module.soomSec = params.soomSec + "";
				module.log("Soomla secret: " + module.soomSec.substring(0,4) + "...");
				module.loadInventory();
			}
			else if (params.method === "CCStoreController::setSSV") {
				module.ssv = params.ssv;
				module.log("SSV: " + module.ssv);
			}
			else if(params.method === "CCStoreController::setAndroidPublicKey") {
				module.androidPublicKey = params.androidPublicKey + "";
				module.log("Android public key: " + module.androidPublicKey.substring(0,4) + "...");
			}
			else if(params.method === "CCStoreController::buyMarketItem") {
				// find productId
				len = module.storeAssets.currencyPacks.length;
				x = null;
				for (i = 0; i < len; i += 1) {
					x = module.storeAssets.currencyPacks[i];
					if (x.purchasableItem && x.purchasableItem.marketItem.productId === params.productId) {
						break;
					}
					x = null;
				}
				
				// buy item
				if (x === null) {
					module.log("Unable to find productId: " + params.productId);
					module.onPaymentFailure();
				} else {
					module.log("Buying " + x.purchasableItem.marketItem.productId);
					module.purchasingItem = JSON.parse(JSON.stringify(x));
					
					if (self.buy) {
						self.buy(module.purchasingItem["facebook_product_url"], module.onPaymentSuccess, module.onPaymentFailure);
					} else {
						module.log("App has not implemented CCSoomlaNdkBridge.buy method");
					}
				}
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
				x = module.findItemId(module.storeAssets, "itemId", params.itemId) || {};
				ret = {item: x, className: x.className || ""};
			}
			else if(params.method === "CCStoreInfo::getPurchasableItemWithProductId") {
				x = module.findItemId(module.storeAssets, "itemId", params.productId) || {};
				if (typeof x.purchasableItem === "undefined" || !x.purchasableItem) {
					x = {};
				}
				ret = {item: x, className: x.className || ""};
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
				len = module.storeAssets.currencies.length;
				for (i = 0; i < len; i += 1) {
					ret.push({
						item: module.storeAssets.currencies[i],
						className: module.storeAssets.currencies[i].className
					});
				}
			}
			else if(params.method === "CCStoreInfo::getVirtualGoods") {
				ret = [];
				for (key in module.storeAssets.goods) {
					if (module.storeAssets.goods.hasOwnProperty(key)) {
						x = module.storeAssets.goods[key];
						if (typeof x !== "undefined") {
							for (i = 0; i < x.length; i += 1) {
								ret.push({
									item: x[i],
									className: module.goodsKeyToClassName(key)
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
				ret = module.storeInventory.currencies[params.itemId] || 0;
			}
			else if(params.method === "CCStoreInventory::giveItem") {
				x = module.storeInventory.currencies[params.itemId] || 0;
				x += params.amount;
				module.storeInventory.currencies[params.itemId] = x;
				module.saveInventory();
			}
			else if(params.method === "CCStoreInventory::takeItem") {
				x = module.storeInventory.currencies[params.itemId] || 0;
				x -= params.amount;
				module.storeInventory.currencies[params.itemId] = x;
				module.saveInventory();
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
				module.log("Unknown native call method: " + JSON.stringify(params));
			}

			// assign return value
			returnParams.result["return"] = ret;
			
			// since we are using JSON stringify + parse theres no worries about object cloning! :)
			return JSON.stringify(returnParams);
		};
		
		self.setDebug = function(debug) {
			DEBUG = debug;
		};

		// test encrypt / decrypt
		module.testEncryption = function() {
			var original = "something",
				encrypted = module.encrypt(original);
			module.log("Encrypt(" + original + "): " + encrypted);
			module.log("Decrypt(" + encrypted + "): " + module.decrypt(encrypted));
		};

		// do some tests
		//if (DEBUG) {
		//	module.testEncryption();
		//}
		
		// self now becomes Soomla.CCSoomlaNdkBridge whilst
		// all our module variables remain private
		return self;
	}()); // end of CCSoomlaNdkBridge module closure

} // end of check if CCSoomlaNdkBridge is undefined
