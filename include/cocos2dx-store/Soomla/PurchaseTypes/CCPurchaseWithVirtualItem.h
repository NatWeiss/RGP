//
// Created by Fedor Shubin on 5/19/13.
//



#ifndef __PurchaseWithVirtualItemX_H_
#define __PurchaseWithVirtualItemX_H_

#include "CCPurchaseType.h"

namespace soomla {
	/** \class CCPurchaseWithVirtualItem
		\brief This type of Purchase is used to let users purchase PurchasableVirtualItems with other virtual items.

		This type of Purchase is used to let users purchase PurchasableVirtualItems with other virtual items.
	*/
    class CCPurchaseWithVirtualItem : public CCPurchaseType {
        CC_SYNTHESIZE_RETAIN(cocos2d::__String *, mItemId, ItemId);
        CC_SYNTHESIZE_RETAIN(cocos2d::__Integer *, mAmount, Amount);
    public:
        CCPurchaseWithVirtualItem(): mItemId(NULL), mAmount(NULL) {}

		/** 
			Create a CCPurchaseWithVirtualItem
			\param itemId The itemId of the item used to purchase with this type.
			\param amount The amount of the item that is needed.
			\return The purchase type.
		*/
        static CCPurchaseWithVirtualItem * create(cocos2d::__String *itemId, cocos2d::__Integer *amount);

        virtual bool init(cocos2d::__String *itemId, cocos2d::__Integer *amount);

        virtual ~CCPurchaseWithVirtualItem();
    };

};

#endif //__PurchaseWithVirtualItemX_H_
