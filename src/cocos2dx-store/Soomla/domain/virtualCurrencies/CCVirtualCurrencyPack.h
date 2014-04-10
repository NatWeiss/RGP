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
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::__Integer *, mCurrencyAmount, CurrencyAmount, JSON_CURRENCYPACK_CURRENCYAMOUNT);
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::__String *, mCurrencyItemId, CurrencyItemId, JSON_CURRENCYPACK_CURRENCYITEMID);
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
        static CCVirtualCurrencyPack *create(cocos2d::__String* name, cocos2d::__String* description,
											 cocos2d::__String* itemId, cocos2d::__Integer* currencyAmount, cocos2d::__String* currencyItemId,
											 CCPurchaseType * purchaseType);

		/**
		   Create a CCVirtualCurrencyPack.
		   \param dict A dictionary containing keys to each of the parameters required by the create function.
		   \return The pack.
		*/
        static CCVirtualCurrencyPack *createWithDictionary(cocos2d::__Dictionary *dict);

        bool init(cocos2d::__String* name, cocos2d::__String* description,
                cocos2d::__String* itemId, cocos2d::__Integer* currencyAmount, cocos2d::__String* currencyItemId,
                CCPurchaseType * purchaseType);
        bool initWithDictionary(cocos2d::__Dictionary *dict);

        cocos2d::__Dictionary *toDictionary();

        virtual ~CCVirtualCurrencyPack();
    };
};


#endif //__VirtualCurrencyPackX_H_
