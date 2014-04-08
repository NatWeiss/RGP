//
//  VirtualCurrencyX.h
//  cocos2dx-store
//
//  Created by Igor Yegoroff on 5/17/13.
//
//

#ifndef __cocos2dx_store__VirtualCurrencyX__
#define __cocos2dx_store__VirtualCurrencyX__

#include "../CCVirtualItem.h"

namespace soomla {
	/** \class CCVirtualCurrency
		\brief A virtual currency.

		A virtual currency. Virtual currencies are used to purchase virtual items.
	 */
    class CCVirtualCurrency : public CCVirtualItem {
    public:
        CCVirtualCurrency(): CCVirtualItem() {}

		/**
		   Create a CCVirtualCurrency.
		   \param name The currency's name.
		   \param description The currency's description.
		   \param itemId The currency's itemId
		   \return The currency.
		*/
        static CCVirtualCurrency* create(cocos2d::CCString* name, cocos2d::CCString* description, cocos2d::CCString* itemId);

		/**
		   Create a CCVirtualCurrency.
		   \param dict A dictionary containing keys to each of the parameters required by the create function.
		   \return The currency.
		*/
		static CCVirtualCurrency* createWithDictionary(cocos2d::CCDictionary* dict);
    };
}

#endif /* defined(__cocos2dx_store__VirtualCurrencyX__) */
