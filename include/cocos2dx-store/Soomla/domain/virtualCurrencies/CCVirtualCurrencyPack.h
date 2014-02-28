//
// Created by Fedor Shubin on 5/19/13.
//



#ifndef __VirtualCurrencyPackX_H_
#define __VirtualCurrencyPackX_H_

#include "../../SoomlaMacros.h"
#include "../CCPurchasableVirtualItem.h"

namespace soomla {
	/** \class CCVirtualCurrencyPack
		\brief A virtual currency pack.

		A virtual currency pack. Virtual currency is purchased in packs with
		real money.
	 */
    class CCVirtualCurrencyPack : public CCPurchasableVirtualItem {
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::CCInteger *, mCurrencyAmount, CurrencyAmount, JSON_CURRENCYPACK_CURRENCYAMOUNT);
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::CCString *, mCurrencyItemId, CurrencyItemId, JSON_CURRENCYPACK_CURRENCYITEMID);
    public:
	CCVirtualCurrencyPack(): CCPurchasableVirtualItem(), mCurrencyAmount(NULL), mCurrencyItemId(NULL) {};

		/**
		   Create a CCVirtualCurrencyPack.
		   \param name The currency pack's name.
		   \param description The currency pack's description.
		   \param itemId The currency pack's itemId.
		   \param currencyAmount The amount of virtual currency you get when buying this.
		   \param currencyItemId The itemId of the currency.
		   \param purchaseType The purchase type for this item.
		   \return The pack.
		*/
        static CCVirtualCurrencyPack *create(cocos2d::CCString* name, cocos2d::CCString* description,
											 cocos2d::CCString* itemId, cocos2d::CCInteger* currencyAmount, cocos2d::CCString* currencyItemId,
											 CCPurchaseType * purchaseType);

		/**
		   Create a CCVirtualCurrencyPack.
		   \param dict A dictionary containing keys to each of the parameters required by the create function.
		   \return The pack.
		*/
        static CCVirtualCurrencyPack *createWithDictionary(cocos2d::CCDictionary *dict);

        bool init(cocos2d::CCString* name, cocos2d::CCString* description,
                cocos2d::CCString* itemId, cocos2d::CCInteger* currencyAmount, cocos2d::CCString* currencyItemId,
                CCPurchaseType * purchaseType);
        bool initWithDictionary(cocos2d::CCDictionary *dict);

        cocos2d::CCDictionary *toDictionary();

        virtual ~CCVirtualCurrencyPack();
    };
};


#endif //__VirtualCurrencyPackX_H_
