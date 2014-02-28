//
// Created by Fedor Shubin on 5/19/13.
//

#ifndef __NonConsumableItemX_H_
#define __NonConsumableItemX_H_

#include "CCPurchasableVirtualItem.h"

namespace soomla {
	/** \class CCNonConsumableItem
		\brief A non consumable virtual item.

		A non consumable virtual item.
	*/

    class CCNonConsumableItem : public CCPurchasableVirtualItem {
    public:
        CCNonConsumableItem(): CCPurchasableVirtualItem() {}

		/**
		   Create a CCNonConsumableItem.
		   \param name The item's name.
		   \param description The item's description.
		   \param itemId The item's itemId
		   \param purchaseType Either purchase with market or purchase with virtual good.
		   \return The item.
		*/
		static CCNonConsumableItem * create(cocos2d::CCString* name, cocos2d::CCString* description, cocos2d::CCString* itemId,
            CCPurchaseType *purchaseType);

		/**
		   Create a CCNonConsumableItem.
		   \param dict A dictionary containing keys to each of the parameters required by the create function.
		   \return The item.
		*/
		static CCNonConsumableItem * createWithDictionary(cocos2d::CCDictionary* dict);
    };
};

#endif //__NonConsumableItemX_H_
