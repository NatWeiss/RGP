//
// Created by Fedor Shubin on 5/19/13.
//


#include "CCSingleUsePackVG.h"

USING_NS_CC;

namespace soomla {
    CCSingleUsePackVG *CCSingleUsePackVG::create(__String *goodItemId, __Integer *goodAmount, __String *name, __String *description, __String *itemId, CCPurchaseType *purchaseType) {
        CCSingleUsePackVG *ret = new CCSingleUsePackVG();
        ret->autorelease();
        ret->init(goodItemId, goodAmount, name, description, itemId, purchaseType);
        return ret;
    }

    CCSingleUsePackVG *CCSingleUsePackVG::createWithDictionary(__Dictionary *dict) {
        CCSingleUsePackVG *ret = new CCSingleUsePackVG();
        ret->autorelease();
        ret->initWithDictionary(dict);
        return ret;
    }

    bool CCSingleUsePackVG::init(__String *goodItemId, __Integer *goodAmount, __String *name, __String *description, __String *itemId, CCPurchaseType *purchaseType) {
        bool res = CCVirtualGood::init(name, description, itemId, purchaseType);
        if (res) {
            setGoodItemId(goodItemId);
            setGoodAmount(goodAmount);
            return true;
        } else {
            return false;
        }
    }

    bool CCSingleUsePackVG::initWithDictionary(__Dictionary *dict) {
        bool res = CCVirtualGood::initWithDictionary(dict);
        if (res) {
            fillGoodItemIdFromDict(dict);
            fillGoodAmountFromDict(dict);
            return true;
        } else {
            return false;
        }
    }

    __Dictionary *CCSingleUsePackVG::toDictionary() {
        __Dictionary *dict = CCVirtualGood::toDictionary();

        putGoodItemIdToDict(dict);
        putGoodAmountToDict(dict);

        return dict;
    }

    CCSingleUsePackVG::~CCSingleUsePackVG() {
        CC_SAFE_RELEASE(mGoodItemId);
        CC_SAFE_RELEASE(mGoodAmount);
    }
}