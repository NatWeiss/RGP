//
// Created by Fedor Shubin on 5/19/13.
//


#include "CCPurchaseWithMarket.h"

namespace soomla {
    CCPurchaseWithMarket *CCPurchaseWithMarket::create(cocos2d::__String *productId, cocos2d::__Double *price) {
        return createWithMarketItem(CCMarketItem::create(
                productId, cocos2d::__Integer::create(CCMarketItem::CONSUMABLE), price));
    }

    CCPurchaseWithMarket *CCPurchaseWithMarket::createWithMarketItem(CCMarketItem *marketItem) {
        CCPurchaseWithMarket *ret = new CCPurchaseWithMarket();
        ret->autorelease();
        ret->initWithMarketItem(marketItem);
        return ret;
    }

    bool CCPurchaseWithMarket::initWithMarketItem(CCMarketItem *marketItem) {
        bool res = CCPurchaseType::init();
        if (res) {
            setMarketItem(marketItem);
            return true;
        } else {
            return false;
        }
    }

    CCPurchaseWithMarket::~CCPurchaseWithMarket() {
        CC_SAFE_RELEASE(mMarketItem);
    }
}
