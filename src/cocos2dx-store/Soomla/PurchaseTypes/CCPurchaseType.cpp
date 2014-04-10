//
//  PurchaseTypeX.cpp
//  cocos2dx-store
//
//  Created by Igor Yegoroff on 5/17/13.
//
//

#include "CCPurchaseType.h"

namespace soomla {
    
    bool CCPurchaseType::init() {
        return true;
    }
    
    CCPurchaseType *CCPurchaseType::create() {
        CCPurchaseType * pRet = new CCPurchaseType();
        if (pRet) {
            pRet->autorelease();
            pRet->init();
        }
        return pRet;
    }
    
    CCPurchaseType::~CCPurchaseType() {}
}