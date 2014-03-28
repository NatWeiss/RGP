//
// Created by Fedor Shubin on 5/19/13.
//



#ifndef __SingleUseVGX_H_
#define __SingleUseVGX_H_

#include <iostream>


#include "CCVirtualGood.h"

namespace soomla {
	/** \class CCSingleUseVG
		\brief A consumable virtual good.

		A consumable virtual good. You own as many of these as you want.
	*/
    class CCSingleUseVG : public CCVirtualGood {
    public:
		/**
		   Create a CCSingleUseVG.
		   \param name The virtual good's name.
		   \param description The virtual good's description.
		   \param itemId The virtual good's itemId.
		   \param purchaseType The purchase type for this virtual good.
		   \return The virtual good.
		*/
        static CCSingleUseVG *create(cocos2d::__String* name, cocos2d::__String* description,
                cocos2d::__String* itemId, CCPurchaseType * purchaseType);

		/**
		   Create a CCSingleUseVG.
		   \param dict A dictionary containing keys to each of the parameters required by the create function.
		   \return The virtual good.
		*/
		static CCSingleUseVG *createWithDictionary(cocos2d::__Dictionary *dict);
    };
};

#endif //__SingleUseVGX_H_
