//
//  VirtualCurrencyX.cpp
//  cocos2dx-store
//
//  Created by Igor Yegoroff on 5/17/13.
//
//

#include "CCVirtualCurrency.h"

namespace soomla {
    
    CCVirtualCurrency* CCVirtualCurrency::create(cocos2d::__String* name, cocos2d::__String* description, cocos2d::__String* itemId) {
        CCVirtualCurrency* pRet = new CCVirtualCurrency();
        if (pRet) {
            pRet->autorelease();
            pRet->init(name, description, itemId);
        }
        return pRet;
    }

    CCVirtualCurrency* CCVirtualCurrency::createWithDictionary(cocos2d::__Dictionary* dict) {
        CCVirtualCurrency* pRet = new CCVirtualCurrency();
        if (pRet) {
            pRet->autorelease();
            pRet->initWithDictionary(dict);
        }
        return pRet;
    }
}