//
// Created by Fedor Shubin on 5/19/13.
//


#include "CCNonConsumableItem.h"

USING_NS_CC;

namespace soomla {
    CCNonConsumableItem *CCNonConsumableItem::create(__String *name, __String *description, __String *itemId, CCPurchaseType *purchaseType) {
        CCNonConsumableItem *ret = new CCNonConsumableItem();
        ret->autorelease();
        ret->init(name, description, itemId, purchaseType);
        return ret;
    }

    CCNonConsumableItem *CCNonConsumableItem::createWithDictionary(__Dictionary *dict) {
        CCNonConsumableItem *ret = new CCNonConsumableItem();
        ret->autorelease();
        ret->initWithDictionary(dict);
        return ret;
    }
};
