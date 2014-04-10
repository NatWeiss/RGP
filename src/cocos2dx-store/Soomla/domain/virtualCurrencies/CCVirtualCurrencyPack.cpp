//
// Created by Fedor Shubin on 5/19/13.
//


#include "CCVirtualCurrencyPack.h"

USING_NS_CC;

namespace soomla {
    CCVirtualCurrencyPack *CCVirtualCurrencyPack::create(__String *name, __String *description, __String *itemId, __Integer *currencyAmount, __String *currencyItemId, CCPurchaseType *purchaseType) {
        CCVirtualCurrencyPack *ret = new CCVirtualCurrencyPack();
        ret->autorelease();
        ret->init(name, description, itemId, currencyAmount, currencyItemId, purchaseType);
        return ret;
    }

    CCVirtualCurrencyPack *CCVirtualCurrencyPack::createWithDictionary(__Dictionary *dict) {
        CCVirtualCurrencyPack *ret = new CCVirtualCurrencyPack();
        ret->autorelease();
        ret->initWithDictionary(dict);
        return ret;
    }

    bool CCVirtualCurrencyPack::init(__String *name, __String *description, __String *itemId, __Integer *currencyAmount, __String *currencyItemId, CCPurchaseType *purchaseType) {
        bool res = CCPurchasableVirtualItem::init(name, description, itemId, purchaseType);
        if (res) {
            setCurrencyAmount(currencyAmount);
            setCurrencyItemId(currencyItemId);
            return true;
        } else {
            return false;
        }
    }

    bool CCVirtualCurrencyPack::initWithDictionary(__Dictionary *dict) {
        bool res = CCPurchasableVirtualItem::initWithDictionary(dict);
        if (res) {
            fillCurrencyAmountFromDict(dict);
            fillCurrencyItemIdFromDict(dict);

            return true;
        } else {
            return false;
        }
    }

    __Dictionary *CCVirtualCurrencyPack::toDictionary() {
        __Dictionary *dict = CCPurchasableVirtualItem::toDictionary();

        putCurrencyAmountToDict(dict);
        putCurrencyItemIdToDict(dict);

        return dict;
    }

    CCVirtualCurrencyPack::~CCVirtualCurrencyPack() {
        CC_SAFE_RELEASE(mCurrencyAmount);
        CC_SAFE_RELEASE(mCurrencyItemId);
    }
}    
