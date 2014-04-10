//
// Created by Fedor Shubin on 5/21/13.
//


#include "CCStoreInfo.h"
#include "../domain/virtualGoods/CCSingleUseVG.h"
#include "../domain/virtualGoods/CCEquippableVG.h"
#include "../domain/virtualGoods/CCSingleUsePackVG.h"
#include "../CCSoomlaNdkBridge.h"
#include "../CCStoreUtils.h"
#include "../domain/virtualCurrencies/CCVirtualCurrency.h"
#include "../domain/virtualCurrencies/CCVirtualCurrencyPack.h"
#include "../domain/CCNonConsumableItem.h"
#include "../domain/CCMarketItem.h"

namespace soomla {

#define TAG "SOOMLA StoreInfo"

#define SAFE_CREATE(__T__, __ret__, __retParams__)			\
	Ref *_tempVi = createWithRetParams(__retParams__);	\
	__T__ __ret__ = dynamic_cast<__T__>(_tempVi);			\
	CC_ASSERT(__ret__);

    USING_NS_CC;

    static CCStoreInfo *s_SharedStoreInfo = NULL;

    CCStoreInfo *CCStoreInfo::sharedStoreInfo() {
        return s_SharedStoreInfo;
    }

    void CCStoreInfo::createShared(CCIStoreAssets *storeAssets) {
        CCStoreInfo *ret = new CCStoreInfo();
        if (ret->init(storeAssets)) {
            s_SharedStoreInfo = ret;
        } else {
            delete ret;
        }
    }

    bool CCStoreInfo::init(CCIStoreAssets *storeAssets) {
        __Array *currenciesJSON = __Array::create();
        {
            __Array *currencies = storeAssets->getCurrencies();
            Ref *obj;
            CCARRAY_FOREACH(currencies, obj) {
				currenciesJSON->addObject(((CCVirtualCurrency *)obj)->toDictionary());
			}
        }

        __Array *packsJSON = __Array::create();
        {
            __Array *packs = storeAssets->getCurrencyPacks();
            Ref *obj;
            CCARRAY_FOREACH(packs, obj) {
				packsJSON->addObject(((CCVirtualCurrencyPack *)obj)->toDictionary());
			}
        }

        __Array *suGoods = __Array::create();
        __Array *ltGoods = __Array::create();
        __Array *eqGoods = __Array::create();
        __Array *upGoods = __Array::create();
        __Array *paGoods = __Array::create();

        Ref *obj;
        CCARRAY_FOREACH(storeAssets->getGoods(), obj) {
			if (dynamic_cast<CCSingleUseVG *>(obj)) {
				suGoods->addObject(((CCSingleUseVG *)obj)->toDictionary());
			} else if (dynamic_cast<CCEquippableVG *>(obj)) {
				eqGoods->addObject(((CCEquippableVG *)obj)->toDictionary());
			} else if (dynamic_cast<CCLifetimeVG *>(obj)) {
				ltGoods->addObject(((CCLifetimeVG *)obj)->toDictionary());
			} else if (dynamic_cast<CCSingleUsePackVG *>(obj)) {
				paGoods->addObject(((CCSingleUsePackVG *)obj)->toDictionary());
			} else if (dynamic_cast<CCUpgradeVG *>(obj)) {
				upGoods->addObject(((CCUpgradeVG *)obj)->toDictionary());
			}
		}

        __Dictionary *goodsJSON = __Dictionary::create();
        goodsJSON->setObject(suGoods, JSON_STORE_GOODS_SU);
        goodsJSON->setObject(ltGoods, JSON_STORE_GOODS_LT);
        goodsJSON->setObject(eqGoods, JSON_STORE_GOODS_EQ);
        goodsJSON->setObject(upGoods, JSON_STORE_GOODS_UP);
        goodsJSON->setObject(paGoods, JSON_STORE_GOODS_PA);

        __Array *categoriesJSON = __Array::create();
        {
            __Array *categories = storeAssets->getCategories();
            Ref *obj;
            CCARRAY_FOREACH(categories, obj) {
				categoriesJSON->addObject(((CCVirtualCategory *)obj)->toDictionary());
			}
        }


        __Array *nonConsumablesJSON = __Array::create();
        {
            __Array *nonConsumables = storeAssets->getNonConsumableItems();
            Ref *obj;
            CCARRAY_FOREACH(nonConsumables, obj) {
				nonConsumablesJSON->addObject(((CCNonConsumableItem *)obj)->toDictionary());
			}
        }

        __Dictionary *storeAssetsObj = __Dictionary::create();
        storeAssetsObj->setObject(categoriesJSON, JSON_STORE_CATEGORIES);
        storeAssetsObj->setObject(currenciesJSON, JSON_STORE_CURRENCIES);
        storeAssetsObj->setObject(packsJSON, JSON_STORE_CURRENCYPACKS);
        storeAssetsObj->setObject(goodsJSON, JSON_STORE_GOODS);
        storeAssetsObj->setObject(nonConsumablesJSON, JSON_STORE_NONCONSUMABLES);

        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreAssets::init"), "method");
        params->setObject(__Integer::create(storeAssets->getVersion()), "version");
        params->setObject(storeAssetsObj, "storeAssets");
        CCSoomlaNdkBridge::callNative(params, NULL);


        return true;
    }

    CCVirtualItem *CCStoreInfo::getItemByItemId(char const *itemId, CCSoomlaError **soomlaError) {
        CCStoreUtils::logDebug(TAG,
							   __String::createWithFormat("Trying to fetch an item with itemId: %s", itemId)->getCString());

        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInfo::getItemByItemId"), "method");
        params->setObject(__String::create(itemId), "itemId");
        __Dictionary *retParams = (__Dictionary *) CCSoomlaNdkBridge::callNative(params, soomlaError);
        if (!*soomlaError) {
            SAFE_CREATE(CCVirtualItem *, ret, retParams);
            return ret;
        } else {
            return NULL;
        }
    }

    CCPurchasableVirtualItem *CCStoreInfo::getPurchasableItemWithProductId(char const *productId, CCSoomlaError **soomlaError) {
        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInfo::getPurchasableItemWithProductId"), "method");
        params->setObject(__String::create(productId), "productId");
        __Dictionary *retParams = (__Dictionary *) CCSoomlaNdkBridge::callNative(params, soomlaError);
        if (!soomlaError) {
            SAFE_CREATE(CCPurchasableVirtualItem *, ret, retParams);
            return ret;
        } else {
            return NULL;
        }
    }

    CCVirtualCategory *CCStoreInfo::getCategoryForVirtualGood(char const *goodItemId, CCSoomlaError **soomlaError) {
        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInfo::getCategoryForVirtualGood"), "method");
        params->setObject(__String::create(goodItemId), "goodItemId");
        __Dictionary *retParams = (__Dictionary *) CCSoomlaNdkBridge::callNative(params, soomlaError);
        if (!soomlaError) {
            SAFE_CREATE(CCVirtualCategory *, ret, retParams);
            return ret;
        } else {
            return NULL;
        }
    }

    CCUpgradeVG *CCStoreInfo::getFirstUpgradeForVirtualGood(char const *goodItemId) {
        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInfo::getFirstUpgradeForVirtualGood"), "method");
        params->setObject(__String::create(goodItemId), "goodItemId");
        __Dictionary *retParams = (__Dictionary *) CCSoomlaNdkBridge::callNative(params, NULL);
        SAFE_CREATE(CCUpgradeVG *, ret, retParams);
        return ret;
    }

    CCUpgradeVG *CCStoreInfo::getLastUpgradeForVirtualGood(char const *goodItemId) {
        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInfo::getLastUpgradeForVirtualGood"), "method");
        params->setObject(__String::create(goodItemId), "goodItemId");
        __Dictionary *retParams = (__Dictionary *) CCSoomlaNdkBridge::callNative(params, NULL);
        SAFE_CREATE(CCUpgradeVG *, ret, retParams);
        return ret;
    }

    __Array *CCStoreInfo::getUpgradesForVirtualGood(char const *goodItemId) {
        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInfo::getUpgradesForVirtualGood"), "method");
        params->setObject(__String::create(goodItemId), "goodItemId");
		__Dictionary *retParams = (__Dictionary *) CCSoomlaNdkBridge::callNative(params, NULL);
		__Array *retArray = (__Array *)retParams->objectForKey("return");

        __Array *ret = __Array::create();
        Ref *obj;
        CCARRAY_FOREACH(retArray, obj) {
			__Dictionary *dict = dynamic_cast<__Dictionary *>(obj);
			CC_ASSERT(dict);
			
			__Dictionary *container = __Dictionary::create();
			container->setObject(dict, "return");
			SAFE_CREATE(CCUpgradeVG *, item, container);
			ret->addObject(item);
		}
        return ret;
    }

    __Array *CCStoreInfo::getVirtualCurrencies() {
        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInfo::getVirtualCurrencies"), "method");
		__Dictionary *retParams = (__Dictionary *) CCSoomlaNdkBridge::callNative(params, NULL);
		__Array *retArray = (__Array *)retParams->objectForKey("return");

        __Array *ret = __Array::create();
        Ref *obj;
        CCARRAY_FOREACH(retArray, obj) {
			__Dictionary *dict = dynamic_cast<__Dictionary *>(obj);
			CC_ASSERT(dict);
			
			__Dictionary *container = __Dictionary::create();
			container->setObject(dict, "return");
			SAFE_CREATE(CCVirtualCurrency *, item, container);
			ret->addObject(item);
		}
        return ret;
    }

    __Array *CCStoreInfo::getVirtualGoods() {
        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInfo::getVirtualGoods"), "method");
		__Dictionary *retParams = (__Dictionary *) CCSoomlaNdkBridge::callNative(params, NULL);
		__Array *retArray = (__Array *)retParams->objectForKey("return");

        __Array *ret = __Array::create();
        Ref *obj;
        CCARRAY_FOREACH(retArray, obj) {
			__Dictionary *dict = dynamic_cast<__Dictionary *>(obj);
			CC_ASSERT(dict);
			
			__Dictionary *container = __Dictionary::create();
			container->setObject(dict, "return");
			SAFE_CREATE(CCVirtualGood *, item, container);
			ret->addObject(item);
		}
        return ret;
    }

    __Array *CCStoreInfo::getVirtualCurrencyPacks() {
        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInfo::getVirtualCurrencyPacks"), "method");
        __Dictionary *retParams = (__Dictionary *) CCSoomlaNdkBridge::callNative(params, NULL);
		__Array *retArray = (__Array *)retParams->objectForKey("return");
		
        __Array *ret = __Array::create();
        Ref *obj;
        CCARRAY_FOREACH(retArray, obj) {
			__Dictionary *dict = dynamic_cast<__Dictionary *>(obj);
			CC_ASSERT(dict);

			__Dictionary *container = __Dictionary::create();
			container->setObject(dict, "return");
			SAFE_CREATE(CCVirtualCurrencyPack *, item, container);
			ret->addObject(item);
		}
        return ret;
    }

    __Array *CCStoreInfo::getNonConsumableItems() {
        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInfo::getNonConsumableItems"), "method");
		__Dictionary *retParams = (__Dictionary *) CCSoomlaNdkBridge::callNative(params, NULL);
		__Array *retArray = (__Array *)retParams->objectForKey("return");
		
		__Array *ret = __Array::create();
		Ref *obj;
		CCARRAY_FOREACH(retArray, obj) {
			__Dictionary *dict = dynamic_cast<__Dictionary *>(obj);
			CC_ASSERT(dict);

			__Dictionary *container = __Dictionary::create();
			container->setObject(dict, "return");
			SAFE_CREATE(CCNonConsumableItem *, item, container);
			ret->addObject(item);
		}
		return ret;
    }

    __Array *CCStoreInfo::getVirtualCategories() {
        __Dictionary *params = __Dictionary::create();
        params->setObject(__String::create("CCStoreInfo::getVirtualCategories"), "method");
		__Dictionary *retParams = (__Dictionary *) CCSoomlaNdkBridge::callNative(params, NULL);
		__Array *retArray = (__Array *)retParams->objectForKey("return");
		
		__Array *ret = __Array::create();
		Ref *obj;
		CCARRAY_FOREACH(retArray, obj) {
			__Dictionary *dict = dynamic_cast<__Dictionary *>(obj);
			CC_ASSERT(dict);

			__Dictionary *container = __Dictionary::create();
			container->setObject(dict, "return");
			SAFE_CREATE(CCVirtualCategory *, item, container);
			ret->addObject(item);
		}
		return ret;
    }

    Ref *CCStoreInfo::createWithRetParams(__Dictionary *retParams) {
        __Dictionary *retValue = dynamic_cast<__Dictionary *>(retParams->objectForKey("return"));
        CC_ASSERT(retValue);
        __String *className = dynamic_cast<__String *>(retValue->objectForKey("className"));
		__Dictionary *item = dynamic_cast<__Dictionary *>(retValue->objectForKey("item"));
        CC_ASSERT(item);
		
        if (className->compare("VirtualItem") == 0) {
            return CCVirtualItem::createWithDictionary(item);
        }
        else if (className->compare("MarketItem") == 0) {
            return CCMarketItem::createWithDictionary(item);
        }
        else if (className->compare("NonConsumableItem") == 0) {
            return CCNonConsumableItem::createWithDictionary(item);
        }
        else if (className->compare("PurchasableVirtualItem") == 0) {
            return CCPurchasableVirtualItem::createWithDictionary(item);
        }
        else if (className->compare("VirtualCategory") == 0) {
            return CCVirtualCategory::createWithDictionary(item);
        }
        else if (className->compare("VirtualCurrency") == 0) {
            return CCVirtualCurrency::createWithDictionary(item);
        }
        else if (className->compare("VirtualCurrencyPack") == 0) {
            return CCVirtualCurrencyPack::createWithDictionary(item);
        }
        else if (className->compare("EquippableVG") == 0) {
            return CCEquippableVG::createWithDictionary(item);
        }
        else if (className->compare("LifetimeVG") == 0) {
            return CCLifetimeVG::createWithDictionary(item);
        }
        else if (className->compare("SingleUsePackVG") == 0) {
            return CCSingleUsePackVG::createWithDictionary(item);
        }
        else if (className->compare("SingleUseVG") == 0) {
            return CCSingleUseVG::createWithDictionary(item);
        }
        else if (className->compare("UpgradeVG") == 0) {
            return CCUpgradeVG::createWithDictionary(item);
        }
        else if (className->compare("VirtualGood") == 0) {
            return CCVirtualGood::createWithDictionary(item);
        } else {
            CC_ASSERT(false);
            return NULL;
        }
    }

#undef SAFE_CREATE

}

