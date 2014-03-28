//
// Created by Fedor Shubin on 5/19/13.
//



#ifndef __LifetimeVGX_H_
#define __LifetimeVGX_H_

#include "CCVirtualGood.h"

namespace soomla {
	/** \class CCLifetimeVG
		\brief A lifetime virtual good.

		A lifetime virtual good. You can only own one of these.
	*/
    class CCLifetimeVG : public CCVirtualGood {
    public:
		/**
		   Create a CCLifetimeVG.
		   \param name The virtual good's name.
		   \param description The virtual good's description.
		   \param itemId The virtual good's itemId.
		   \param purchaseType The purchase type for this virtual good.
		   \return The virtual good.
		*/
        static CCLifetimeVG *create(cocos2d::__String* name, cocos2d::__String* description,
                cocos2d::__String* itemId, CCPurchaseType * purchaseType);
		
		/**
		   Create a CCLifetimeVG.
		   \param dict A dictionary containing keys to each of the parameters required by the create function.
		   \return The virtual good.
		*/
        static CCLifetimeVG *createWithDictionary(cocos2d::__Dictionary *dict);
    };
};

#endif //__LifetimeVGX_H_
