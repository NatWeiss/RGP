//
//  CCPurchasableVirtualItem.cpp
//  cocos2dx-store
//
//  Created by Igor Yegoroff on 5/17/13.
//
//

#include "CCPurchasableVirtualItem.h"

#include "../PurchaseTypes/CCPurchaseWithVirtualItem.h"
#include "../PurchaseTypes/CCPurchaseWithMarket.h"

namespace soomla {
    
    using namespace cocos2d;
    
    bool CCPurchasableVirtualItem::init(cocos2d::__String* name, cocos2d::__String* description, cocos2d::__String* itemId, CCPurchaseType * purchaseType) {
        bool bRet = CCVirtualItem::init(name, description, itemId);
        if (bRet) {
            setPurchaseType(purchaseType);
        }
        return bRet;
    }
    
    bool CCPurchasableVirtualItem::initWithDictionary(cocos2d::__Dictionary* dict) {
        bool bRet = CCVirtualItem::initWithDictionary(dict);
        if (bRet) {
            fillPurchaseTypeFromDict(dict);
            return true;
        } else {
            return false;
        }
    }

    CCPurchasableVirtualItem *CCPurchasableVirtualItem::create(cocos2d::__String* name, cocos2d::__String* description, cocos2d::__String* itemId, CCPurchaseType * purchaseType) {
        CCPurchasableVirtualItem * pRet = new CCPurchasableVirtualItem();
        if (pRet) {
            pRet->autorelease();
            pRet->init(name, description, itemId, purchaseType);
        }
        return pRet;
    }

    CCPurchasableVirtualItem *CCPurchasableVirtualItem::createWithDictionary(cocos2d::__Dictionary* dict) {
        CCPurchasableVirtualItem * pRet = new CCPurchasableVirtualItem();
        if (pRet) {
            pRet->autorelease();
            pRet->initWithDictionary(dict);
        }
        return pRet;
    }
    
    CCPurchasableVirtualItem::~CCPurchasableVirtualItem() {
        CC_SAFE_RELEASE(mPurchaseType);
    }
    
    cocos2d::__Dictionary*CCPurchasableVirtualItem::toDictionary() {
        __Dictionary* dict = CCVirtualItem::toDictionary();

        putPurchaseTypeToDict(dict);

        return dict;
    }

    void CCPurchasableVirtualItem::fillPurchaseTypeFromDict(__Dictionary *dict) {
        __Dictionary *purchasableDict = dynamic_cast<__Dictionary *>(dict->objectForKey(JSON_PURCHASABLE_ITEM));
        CC_ASSERT(purchasableDict);
        __String* purchaseTypeStr = dynamic_cast<__String *>(purchasableDict->objectForKey(JSON_PURCHASE_TYPE));
        CCAssert(purchaseTypeStr != NULL, "invalid object type in dictionary");
        if (purchaseTypeStr->compare(JSON_PURCHASE_TYPE_MARKET) == 0) {
            __Dictionary *marketItemDict = dynamic_cast<__Dictionary *>(purchasableDict->objectForKey(JSON_PURCHASE_MARKET_ITEM));
            CC_ASSERT(marketItemDict);
            setPurchaseType(CCPurchaseWithMarket::createWithMarketItem(
                    CCMarketItem::createWithDictionary(marketItemDict)));
        } else if (purchaseTypeStr->compare(JSON_PURCHASE_TYPE_VI) == 0) {
            __String *itemId = dynamic_cast<__String *>(purchasableDict->objectForKey(JSON_PURCHASE_VI_ITEMID));
            CC_ASSERT(itemId);
            __Integer *amount = dynamic_cast<__Integer *>(purchasableDict->objectForKey(JSON_PURCHASE_VI_AMOUNT));
            CC_ASSERT(amount);

            setPurchaseType(CCPurchaseWithVirtualItem::create(itemId, amount));
        } else {
            cocos2d::log("Couldn't determine what type of class is the given purchaseType.");
        }
    }

    void CCPurchasableVirtualItem::putPurchaseTypeToDict(__Dictionary *dict) {
        __Dictionary *purchasableObj = __Dictionary::create();

        if (dynamic_cast<CCPurchaseWithMarket *>(mPurchaseType)) {
            purchasableObj->setObject(__String::create(JSON_PURCHASE_TYPE_MARKET), JSON_PURCHASE_TYPE);

            CCPurchaseWithMarket *purchaseWithMarket = (CCPurchaseWithMarket *)mPurchaseType;
            CCMarketItem *mi = purchaseWithMarket->getMarketItem();
            purchasableObj->setObject(mi->toDictionary(), JSON_PURCHASE_MARKET_ITEM);
        }
        else if (dynamic_cast<CCPurchaseWithVirtualItem *>(mPurchaseType)) {
            CCPurchaseWithVirtualItem *purchaseWithVirtualItem = (CCPurchaseWithVirtualItem *)mPurchaseType;
            purchasableObj->setObject(__String::create(JSON_PURCHASE_TYPE_VI), JSON_PURCHASE_TYPE);
            purchasableObj->setObject(purchaseWithVirtualItem->getItemId(), JSON_PURCHASE_VI_ITEMID);
            purchasableObj->setObject(purchaseWithVirtualItem->getAmount(), JSON_PURCHASE_VI_AMOUNT);
        } else {
            CC_ASSERT(false);
        }

        dict->setObject(purchasableObj, JSON_PURCHASABLE_ITEM);
    }


}