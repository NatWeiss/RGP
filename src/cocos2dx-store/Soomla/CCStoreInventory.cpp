//
// Created by Fedor Shubin on 5/21/13.
//

#include "CCStoreInventory.h"
#include "CCStoreUtils.h"
#include "CCSoomlaNdkBridge.h"

namespace soomla {
#define TAG "SOOMLA StoreInventory"

    USING_NS_CC;

    static CCStoreInventory *s_SharedStoreInventory = NULL;

    CCStoreInventory *CCStoreInventory::sharedStoreInventory() {
        return s_SharedStoreInventory;
    }

    CCStoreInventory::CCStoreInventory() {

    }

    CCStoreInventory::~CCStoreInventory() {

    }

    bool CCStoreInventory::init() {
        return true;
    }

    void CCStoreInventory::buyItem(char const *itemId, CCSoomlaError **soomlaError) {
        CCStoreUtils::logDebug(TAG,
                __String::createWithFormat("SOOMLA/COCOS2DX Calling buyItem with: %s", itemId)->getCString());

        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInventory::buyItem"), "method");
        params->setObject(__String::create(itemId), "itemId");
        CCSoomlaNdkBridge::callNative(params, soomlaError);
    }

    int CCStoreInventory::getItemBalance(char const *itemId, CCSoomlaError **soomlaError) {
        CCStoreUtils::logDebug(TAG,
                __String::createWithFormat("SOOMLA/COCOS2DX Calling getItemBalance with: %s", itemId)->getCString());
        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInventory::getItemBalance"), "method");
        params->setObject(__String::create(itemId), "itemId");
        __Dictionary *retParams = (__Dictionary *) CCSoomlaNdkBridge::callNative(params, soomlaError);

        if (retParams == NULL) {
        	return 0;
        }

		__Integer *retValue = (__Integer *) retParams->objectForKey("return");
		if (retValue) {
			return retValue->getValue();
		} else {
			return 0;
		}
    }

    void CCStoreInventory::giveItem(char const *itemId, int amount, CCSoomlaError **soomlaError) {
        CCStoreUtils::logDebug(TAG, __String::createWithFormat(
                "SOOMLA/COCOS2DX Calling giveItem with itemId: %s and amount %d", itemId, amount)->getCString());

        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInventory::giveItem"), "method");
        params->setObject(__String::create(itemId), "itemId");
        params->setObject(__Integer::create(amount), "amount");
        CCSoomlaNdkBridge::callNative(params, soomlaError);
    }

    void CCStoreInventory::takeItem(char const *itemId, int amount, CCSoomlaError **soomlaError) {
        CCStoreUtils::logDebug(TAG, __String::createWithFormat(
                "SOOMLA/COCOS2DX Calling takeItem with itemId: %s and amount %d", itemId, amount)->getCString());

        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInventory::takeItem"), "method");
        params->setObject(__String::create(itemId), "itemId");
        params->setObject(__Integer::create(amount), "amount");
        CCSoomlaNdkBridge::callNative(params, soomlaError);
    }

    void CCStoreInventory::equipVirtualGood(char const *itemId, CCSoomlaError **soomlaError) {
        CCStoreUtils::logDebug(TAG,
                __String::createWithFormat("SOOMLA/COCOS2DX Calling equipVirtualGood with: %s", itemId)->getCString());

        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInventory::equipVirtualGood"), "method");
        params->setObject(__String::create(itemId), "itemId");
        CCSoomlaNdkBridge::callNative(params, soomlaError);
   }

    void CCStoreInventory::unEquipVirtualGood(char const *itemId, CCSoomlaError **soomlaError) {
        CCStoreUtils::logDebug(TAG,
                __String::createWithFormat("SOOMLA/COCOS2DX Calling unEquipVirtualGood with: %s", itemId)->getCString());

        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInventory::unEquipVirtualGood"), "method");
        params->setObject(__String::create(itemId), "itemId");
        CCSoomlaNdkBridge::callNative(params, soomlaError);
    }

    bool CCStoreInventory::isVirtualGoodEquipped(char const *itemId, CCSoomlaError **soomlaError) {
        CCStoreUtils::logDebug(TAG,
                __String::createWithFormat("SOOMLA/COCOS2DX Calling isVirtualGoodEquipped with: %s", itemId)->getCString());

        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInventory::isVirtualGoodEquipped"), "method");
        params->setObject(__String::create(itemId), "itemId");
        __Dictionary *retParams = (__Dictionary *) CCSoomlaNdkBridge::callNative(params, soomlaError);

        if (retParams == NULL) {
        	return false;
        }

		__Bool *retValue = (__Bool *) retParams->objectForKey("return");
		if (retValue) {
			return retValue->getValue();
		} else {
			return false;
		}
    }

    int CCStoreInventory::getGoodUpgradeLevel(char const *goodItemId, CCSoomlaError **soomlaError) {
        CCStoreUtils::logDebug(TAG,
                __String::createWithFormat("SOOMLA/COCOS2DX Calling getGoodUpgradeLevel with: %s", goodItemId)->getCString());
        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInventory::getGoodUpgradeLevel"), "method");
        params->setObject(__String::create(goodItemId), "goodItemId");
        __Dictionary *retParams = (__Dictionary *) CCSoomlaNdkBridge::callNative(params, soomlaError);

        if (retParams == NULL) {
        	return 0;
        }

		__Integer *retValue = (__Integer *) retParams->objectForKey("return");
		if (retValue) {
			return retValue->getValue();
		} else {
			return 0;
		}
    }

    std::string CCStoreInventory::getGoodCurrentUpgrade(char const *goodItemId, CCSoomlaError **soomlaError) {
        CCStoreUtils::logDebug(TAG,
                __String::createWithFormat("SOOMLA/COCOS2DX Calling getGoodCurrentUpgrade with: %s", goodItemId)->getCString());
        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInventory::getGoodCurrentUpgrade"), "method");
        params->setObject(__String::create(goodItemId), "goodItemId");
        __Dictionary *retParams = (__Dictionary *) CCSoomlaNdkBridge::callNative(params, soomlaError);

        if (retParams == NULL) {
        	return "";
        }

		__String *retValue = (__String *) retParams->objectForKey("return");
		if (retValue) {
			return retValue->getCString();
		} else {
			return "";
		}
    }

    void CCStoreInventory::upgradeGood(char const *goodItemId, CCSoomlaError **soomlaError) {
        CCStoreUtils::logDebug(TAG,
                __String::createWithFormat("SOOMLA/COCOS2DX Calling upgradeGood with: %s", goodItemId)->getCString());

        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInventory::upgradeGood"), "method");
        params->setObject(__String::create(goodItemId), "goodItemId");
        CCSoomlaNdkBridge::callNative(params, soomlaError);
    }

    void CCStoreInventory::removeGoodUpgrades(char const *goodItemId, CCSoomlaError **soomlaError) {
        CCStoreUtils::logDebug(TAG,
                __String::createWithFormat("SOOMLA/COCOS2DX Calling removeGoodUpgrades with: %s", goodItemId)->getCString());

        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInventory::removeGoodUpgrades"), "method");
        params->setObject(__String::create(goodItemId), "goodItemId");
        CCSoomlaNdkBridge::callNative(params, soomlaError);
    }

    bool CCStoreInventory::nonConsumableItemExists(char const *nonConsItemId, CCSoomlaError **soomlaError) {
        CCStoreUtils::logDebug(TAG,
                __String::createWithFormat("SOOMLA/COCOS2DX Calling nonConsumableItemExists with: %s", nonConsItemId)->getCString());

        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInventory::nonConsumableItemExists"), "method");
        params->setObject(__String::create(nonConsItemId), "nonConsItemId");
        __Dictionary *retParams = (__Dictionary *) CCSoomlaNdkBridge::callNative(params, soomlaError);

        if (retParams == NULL) {
        	return false;
        }

		__Bool *retValue = (__Bool *) retParams->objectForKey("return");
		if (retValue) {
			return retValue->getValue();
		} else {
			return false;
		}
    }

    void CCStoreInventory::addNonConsumableItem(char const *nonConsItemId, CCSoomlaError **soomlaError) {
        CCStoreUtils::logDebug(TAG,
                __String::createWithFormat("SOOMLA/COCOS2DX Calling addNonConsumableItem with: %s", nonConsItemId)->getCString());

        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInventory::addNonConsumableItem"), "method");
        params->setObject(__String::create(nonConsItemId), "nonConsItemId");
        CCSoomlaNdkBridge::callNative(params, soomlaError);
   }

    void CCStoreInventory::removeNonConsumableItem(char const *nonConsItemId, CCSoomlaError **soomlaError) {
        CCStoreUtils::logDebug(TAG,
                __String::createWithFormat("SOOMLA/COCOS2DX Calling removeNonConsumableItem with: %s", nonConsItemId)->getCString());

        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInventory::removeNonConsumableItem"), "method");
        params->setObject(__String::create(nonConsItemId), "nonConsItemId");
        CCSoomlaNdkBridge::callNative(params, soomlaError);
    }
}
