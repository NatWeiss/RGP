//
//  CCPurchasableVirtualItem.h
//  cocos2dx-store
//
//  Created by Igor Yegoroff on 5/17/13.
//
//

#ifndef __cocos2dx_store__PurchasableVirtualItem__
#define __cocos2dx_store__PurchasableVirtualItem__

#include "CCVirtualItem.h"
#include "../PurchaseTypes/CCPurchaseType.h"

namespace soomla {
	/** \class CCPurchasableVirtualItem
		\brief A purchasable virtual item.

		A purchasable virtual item. The base class for all purchasable virtual items.
	*/
    class CCPurchasableVirtualItem : public CCVirtualItem {
        SL_SYNTHESIZE_RETAIN_WITH_DICT_DCL(CCPurchaseType*, mPurchaseType, PurchaseType);
    public:
        CCPurchasableVirtualItem(): CCVirtualItem(), mPurchaseType(NULL) {}

		/**
		   Create a CCPurchasableVirtualItem.
		   \param name The item's name.
		   \param description The item's description.
		   \param itemId The item's itemId
		   \param purchaseType Either purchase with market or purchase with virtual good.
		   \return The item.
		*/
        static CCPurchasableVirtualItem * create(cocos2d::__String* name, cocos2d::__String* description, cocos2d::__String* itemId, CCPurchaseType * purchaseType);

		/**
		   Create a CCPurchasableVirtualItem.
		   \param dict A dictionary containing keys to each of the parameters required by the create function.
		   \return The item.
		*/
        static CCPurchasableVirtualItem * createWithDictionary(cocos2d::__Dictionary* dict);

        virtual bool init(cocos2d::__String* name, cocos2d::__String* description, cocos2d::__String* itemId, CCPurchaseType * purchaseType);
        virtual bool initWithDictionary(cocos2d::__Dictionary* dict);
        
        virtual ~CCPurchasableVirtualItem();
        
        virtual cocos2d::__Dictionary* toDictionary();
    };
}

#endif /* defined(__cocos2dx_store__PurchasableVirtualItem__) */
