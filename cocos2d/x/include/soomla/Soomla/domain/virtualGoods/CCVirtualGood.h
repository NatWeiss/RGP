//
// Created by Fedor Shubin on 5/19/13.
//



#ifndef __VirtualGoodX_H_
#define __VirtualGoodX_H_

#include "../CCPurchasableVirtualItem.h"

namespace soomla {
	/** \class CCVirtualGood
		\brief A virtual good.
		
		This is an abstract representation of the application's virtual good.
		Your game's virtual economy revolves around virtual goods. This class defines the abstract
		and most common virtual good while the descendants of this class defines specific definitions of VirtualGood.
	 */

    class CCVirtualGood : public CCPurchasableVirtualItem {
    public:
		/**
		   Create a CCVirtualGood.
		   \param name The virtual good's name.
		   \param description The virtual good's description.
		   \param itemId The virtual good's itemId.
		   \param purchaseType The purchase type for this virtual good.
		   \return The virtual good.
		*/
        static CCVirtualGood *create(cocos2d::__String* name, cocos2d::__String* description,
                cocos2d::__String* itemId, CCPurchaseType * purchaseType);

		/**
		   Create a CCLifetimeVG.
		   \param dict A dictionary containing keys to each of the parameters required by the create function.
		   \return The virtual good.
		*/
        static CCVirtualGood *createWithDictionary(cocos2d::__Dictionary *dict);
    };
};


#endif //__VirtualGoodX_H_
