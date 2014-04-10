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
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::__String *, mProductId, ProductId, JSON_MARKETITEM_PRODUCT_ID);
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::__Integer *, mConsumable, Consumable, JSON_MARKETITEM_CONSUMABLE);
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::__Double *, mPrice, Price, JSON_MARKETITEM_PRICE);
        CC_SYNTHESIZE_RETAIN(cocos2d::__Double *, mMarketPrice, MarketPrice);
        CC_SYNTHESIZE_RETAIN(cocos2d::__String *, mMarketTitle, MarketTitle);
        CC_SYNTHESIZE_RETAIN(cocos2d::__String *, mMarketDescription, MarketDescription);
    public:
        enum Consumable {
            NONCONSUMABLE,
            CONSUMABLE,
            SUBSCRIPTION,
        };
        CCMarketItem(): mProductId(NULL), mConsumable(NULL), mPrice(NULL), mMarketPrice(NULL), mMarketTitle(NULL), mMarketDescription(NULL) {};

		/**
		   Create a CCMarketItem.
		   \param productId The item's ID in the native store.
		   \param consumable Whether or not the item is consumable.
		   \param price The price of the item, in USD.
		   \return The item.
		 */
        static CCMarketItem *create(cocos2d::__String *productId, cocos2d::__Integer *consumable, cocos2d::__Double * price);

		/**
		   Create a CCMarketItem from a dictionary.
		   \param dict A dictionary containing keys for the item's product ID, price and consumable status.
		   \return The item.
		*/
		static CCMarketItem *createWithDictionary(cocos2d::__Dictionary* dict);

        bool init(cocos2d::__String *productId, cocos2d::__Integer *consumable, cocos2d::__Double * price);
        virtual bool initWithDictionary(cocos2d::__Dictionary* dict);

        virtual ~CCMarketItem();

        virtual cocos2d::__Dictionary* toDictionary();
    };
};


#endif //__MarketItemX_H_
