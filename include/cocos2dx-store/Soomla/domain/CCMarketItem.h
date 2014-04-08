//
// Created by Fedor Shubin on 5/19/13.
//



#ifndef __MarketItemX_H_
#define __MarketItemX_H_

#include "cocos2d.h"
#include "../SoomlaMacros.h"
#include "../data/SoomlaJSONConsts.h"

namespace soomla {
	/** \class CCMarketItem
		\brief An item you can purchase in the App Store or in Google Play.

		An item you can purchase in the App Store or in Google Play.
	 */
    class CCMarketItem : public cocos2d::Ref {
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::CCString *, mProductId, ProductId, JSON_MARKETITEM_PRODUCT_ID);
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::CCInteger *, mConsumable, Consumable, JSON_MARKETITEM_CONSUMABLE);
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::CCDouble *, mPrice, Price, JSON_MARKETITEM_PRICE);
    public:
        enum Consumable {
            NONCONSUMABLE,
            CONSUMABLE,
            SUBSCRIPTION,
        };
        CCMarketItem(): mProductId(NULL), mConsumable(NULL), mPrice(NULL) {};

		/**
		   Create a CCMarketItem.
		   \param productId The item's ID in the native store.
		   \param consumable Whether or not the item is consumable.
		   \param price The price of the item, in USD.
		   \return The item.
		 */
        static CCMarketItem *create(cocos2d::CCString *productId, cocos2d::CCInteger *consumable, cocos2d::CCDouble * price);

		/**
		   Create a CCMarketItem from a dictionary.
		   \param dict A dictionary containing keys for the item's product ID, price and consumable status.
		   \return The item.
		*/
		static CCMarketItem *createWithDictionary(cocos2d::CCDictionary* dict);

        bool init(cocos2d::CCString *productId, cocos2d::CCInteger *consumable, cocos2d::CCDouble * price);
        virtual bool initWithDictionary(cocos2d::CCDictionary* dict);

        virtual ~CCMarketItem();

        virtual cocos2d::CCDictionary* toDictionary();
    };
};


#endif //__MarketItemX_H_
