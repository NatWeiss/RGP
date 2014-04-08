//
// Created by Fedor Shubin on 5/19/13.
//

#ifndef __EquippableVGX_H_
#define __EquippableVGX_H_


#include "CCLifetimeVG.h"

namespace soomla {
	/** \class CCEquippableVG
		\brief An equippable virtual good.

		An equippable virtual good. You can only own one of these. They can be
		equipped and unequipped at will.
	 */
	class CCEquippableVG : public CCLifetimeVG {
    public:
        typedef enum {
            kLocal = 0,
            kCategory = 1,
            kGlobal = 2
        } EquippingModel;

        SL_SYNTHESIZE_RETAIN_WITH_DICT_DCL(cocos2d::CCInteger *, mEquippingModel, EquippingModel);
    public:
	CCEquippableVG(): CCLifetimeVG(), mEquippingModel(NULL) {};

		/**
		   Create a CCEquippableVG
		   \param equippingModel Can be one of: local = 0, category = 1, global = 2. See EquippingModel.
		   \param name The virtual good's name.
		   \param description The virtual good's description.
		   \param itemId The virtual good's itemId.
		   \param purchaseType The purchase type for this virtual good.
		   \return The virtual good.
		 */
        static CCEquippableVG *create(cocos2d::CCInteger *equippingModel, cocos2d::CCString* name, cocos2d::CCString* description,
									  cocos2d::CCString* itemId, CCPurchaseType * purchaseType);

		/**
		   Create a CCEquippableVG.
		   \param dict A dictionary containing keys to each of the parameters required by the create function.
		   \return The virtual good.
		*/
        static CCEquippableVG *createWithDictionary(cocos2d::CCDictionary *dict);

        bool init(cocos2d::CCInteger *equippingModel, cocos2d::CCString* name, cocos2d::CCString* description,
                cocos2d::CCString* itemId, CCPurchaseType * purchaseType);
        bool initWithDictionary(cocos2d::CCDictionary *dict);

        cocos2d::CCDictionary *toDictionary();

        virtual ~CCEquippableVG();
    };
};


#endif //__EquippableVGX_H_
