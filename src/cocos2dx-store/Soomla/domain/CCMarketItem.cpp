//
// Created by Fedor Shubin on 5/19/13.
//


#include "CCMarketItem.h"

USING_NS_CC;

namespace soomla {

    CCMarketItem *CCMarketItem::create(__String *productId, __Integer *consumable, __Double *price) {
        CCMarketItem *ret = new CCMarketItem();
        ret->autorelease();
        ret->init(productId, consumable, price);
        return ret;
    }

    CCMarketItem *CCMarketItem::createWithDictionary(__Dictionary *dict) {
        CCMarketItem *ret = new CCMarketItem();
        ret->autorelease();
        ret->initWithDictionary(dict);
        return ret;
    }

    bool CCMarketItem::init(__String *productId, __Integer *consumable, __Double *price) {
        setProductId(productId);
        setConsumable(consumable);
        setPrice(price);

        return true;
    }

    bool CCMarketItem::initWithDictionary(__Dictionary *dict) {
        fillProductIdFromDict(dict);
        fillConsumableFromDict(dict);
        fillPriceFromDict(dict);

        return true;
    }

    CCMarketItem::~CCMarketItem() {
        CC_SAFE_RELEASE(mProductId);
        CC_SAFE_RELEASE(mConsumable);
        CC_SAFE_RELEASE(mPrice);
    }

    __Dictionary *CCMarketItem::toDictionary() {
        __Dictionary *dict = __Dictionary::create();

        putProductIdToDict(dict);
        putConsumableToDict(dict);
        putPriceToDict(dict);

        return dict;
    }
};

