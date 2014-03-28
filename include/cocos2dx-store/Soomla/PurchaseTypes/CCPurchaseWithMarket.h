//
// Created by Fedor Shubin on 5/19/13.
//



#ifndef __PurchaseWithMarketX_H_
#define __PurchaseWithMarketX_H_

#include "CCPurchaseType.h"
#include "../domain/CCMarketItem.h"

namespace soomla {
	/** \class CCPurchaseWithMarket
		\brief This type of Purchase is used to let users purchase PurchasableVirtualItems with real money.

		This type of Purchase is used to let users purchase PurchasableVirtualItems with real money.
	 */
    class CCPurchaseWithMarket : public CCPurchaseType {
        CC_SYNTHESIZE_RETAIN(CCMarketItem *, mMarketItem, MarketItem);
    public:
        CCPurchaseWithMarket(): mMarketItem(NULL) {};

		/** 
			Create a CCPurchaseWithMarket
			\param productId is the productId to purchase in the native store.
			\param price is the price in the native store.
			\return The purchase type.
		 */
        static CCPurchaseWithMarket *create(cocos2d::__String *productId, cocos2d::__Double *price);

		/** 
			Create a CCPurchaseWithMarket
			\param marketItem A CCMarketItem that represents this item.
			\return The purchase type.
		 */
        static CCPurchaseWithMarket *createWithMarketItem(CCMarketItem *marketItem);
        bool initWithMarketItem(CCMarketItem *marketItem);
    };
};


#endif //__PurchaseWithMarketX_H_
