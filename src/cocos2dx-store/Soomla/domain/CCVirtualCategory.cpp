//
// Created by Fedor Shubin on 5/19/13.
//


#include "CCVirtualCategory.h"

USING_NS_CC;

namespace soomla {
    CCVirtualCategory *CCVirtualCategory::create(__String *name, __Array *goodItemIds) {
        CCVirtualCategory *ret = new CCVirtualCategory();
        ret->autorelease();
        ret->init(name, goodItemIds);
        return ret;
    }

    CCVirtualCategory *CCVirtualCategory::createWithDictionary(__Dictionary *dict) {
        CCVirtualCategory *ret = new CCVirtualCategory();
        ret->autorelease();
        ret->initWithDictionary(dict);
        return ret;
    }

    bool CCVirtualCategory::init(__String *name, __Array *goodItemIds) {
        setName(name);
        setGoodItemIds(goodItemIds);

        return true;
    }

    bool CCVirtualCategory::initWithDictionary(__Dictionary *dict) {
        fillNameFromDict(dict);
        fillGoodItemIdsFromDict(dict);

        return true;
    }

    __Dictionary *CCVirtualCategory::toDictionary() {
        __Dictionary *dict = __Dictionary::create();

        putNameToDict(dict);
        putGoodItemIdsToDict(dict);

        return dict;
    }

    CCVirtualCategory::~CCVirtualCategory() {
        CC_SAFE_RELEASE(mName);
        CC_SAFE_RELEASE(mGoodItemIds);
    }
}
