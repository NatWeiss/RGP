//
// Created by Fedor Shubin on 5/19/13.
//



#ifndef __UpgradeVGX_H_
#define __UpgradeVGX_H_

#include "CCVirtualGood.h"
#include "../../SoomlaMacros.h"

namespace soomla {
	/** \class CCUpgradeVG
		\brief An upgrade virtual good is one VG in a series of VGs that define an upgrade scale of an associated VirtualGood.
	 
		This type of virtual good is best explained with an example:
		Lets say you have a strength attribute to your character in the game and that strength is on the scale 1-5.
		You want to provide your users with the ability to upgrade that strength. This is what you'll need to create:
		1. SingleUseVG for 'strength'
		2. UpgradeVG for strength 'level 1'
		3. UpgradeVG for strength 'level 2'
		4. UpgradeVG for strength 'level 3'
		5. UpgradeVG for strength 'level 4'
		6. UpgradeVG for strength 'level 5'
	 
		Now, when the user buys this UpgradeVG, we check and make sure the appropriate conditions are met and buy it for you
		(which actually means we upgrading the associated VirtualGood).
	 */
    class CCUpgradeVG : public CCVirtualGood {
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::__String *, mGoodItemId, GoodItemId, JSON_VGU_GOOD_ITEMID);
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::__String *, mPrevItemId, PrevItemId, JSON_VGU_PREV_ITEMID);
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::__String *, mNextItemId, NextItemId, JSON_VGU_NEXT_ITEMID);
    public:
	CCUpgradeVG(): CCVirtualGood(), mGoodItemId(NULL), mPrevItemId(NULL), mNextItemId(NULL) {};

		/** 
			Create a CCUpgradeVG.
			\param goodItemId is the itemId of the VirtualGood associated with this Upgrade. It can be any VirtualGood type.
			\param prevItemId is the itemId of the previous UpgradeVG. MUST BE AN UpgardeVG's itemId !
			\param nextItemId is the itemId of the following UpgradeVG. MUST BE AN UpgardeVG's itemId !
			\param name The good's name.
			\param description The good's description.
			\param itemId The good's itemId.
			\purchaseType The good's purchaseType.
			\return The virtual good.
		 */
		static CCUpgradeVG *create(cocos2d::__String* goodItemId, cocos2d::__String* prevItemId, cocos2d::__String* nextItemId,
								   cocos2d::__String* name, cocos2d::__String* description,
								   cocos2d::__String* itemId, CCPurchaseType * purchaseType);

		/**
		   Create a CCUpgradeVG.
		   \param dict A dictionary containing keys to each of the parameters required by the create function.
		   \return The virtual good.
		*/
		static CCUpgradeVG *createWithDictionary(cocos2d::__Dictionary *dict);

        bool init(cocos2d::__String* goodItemId, cocos2d::__String* prevItemId, cocos2d::__String* nextItemId,
                cocos2d::__String* name, cocos2d::__String* description,
                cocos2d::__String* itemId, CCPurchaseType * purchaseType);
        bool initWithDictionary(cocos2d::__Dictionary *dict);

        cocos2d::__Dictionary *toDictionary();

        virtual ~CCUpgradeVG();
    };
};

#endif //__UpgradeVGX_H_
