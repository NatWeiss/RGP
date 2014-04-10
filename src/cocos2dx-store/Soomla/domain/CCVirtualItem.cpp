//
//  CCVirtualItem.cpp
//  cocos2dx-store
//
//  Created by Igor Yegoroff on 5/16/13.
//
//

#include "CCVirtualItem.h"

namespace soomla {
    
    using namespace cocos2d;

    CCVirtualItem *CCVirtualItem::create(cocos2d::__String* name, cocos2d::__String* description, cocos2d::__String* itemId) {
        CCVirtualItem * pRet = new CCVirtualItem();
        if (pRet) {
            pRet->autorelease();
            pRet->init(name, description, itemId);
        }
        return pRet;
    }

    CCVirtualItem *CCVirtualItem::createWithDictionary(cocos2d::__Dictionary* dict) {
        CCVirtualItem * pRet = new CCVirtualItem();
        if (pRet) {
            pRet->autorelease();
            pRet->initWithDictionary(dict);
        }
        return pRet;
    }

    bool CCVirtualItem::init(cocos2d::__String* name, cocos2d::__String* description, cocos2d::__String* itemId) {
        setName(name);
        setDescription(description);
        setItemId(itemId);
        
        return true;
    }
    
    bool CCVirtualItem::initWithDictionary(cocos2d::__Dictionary* dict) {
        fillNameFromDict(dict);
        fillDescriptionFromDict(dict);
        fillItemIdFromDict(dict);
        
        return true;
    }
    
    CCVirtualItem::~CCVirtualItem() {
        CC_SAFE_RELEASE(mName);
        CC_SAFE_RELEASE(mDescription);
        CC_SAFE_RELEASE(mItemId);
    }
    
    __Dictionary*CCVirtualItem::toDictionary() {
        __Dictionary* dict = __Dictionary::create();
        putNameToDict(dict);
        putDescriptionToDict(dict);
        putItemIdToDict(dict);

        return dict;
    }
}
