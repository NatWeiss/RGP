//
// Created by Fedor Shubin on 5/19/13.
//



#include "cocos2d.h"
#include "../SoomlaMacros.h"
#include "../data/SoomlaJSONConsts.h"

#ifndef __VirtualCategoryX_H_
#define __VirtualCategoryX_H_

namespace soomla {
	/** \class CCVirtualCategory
		\brief A category for virtual items.

		A category for virtual items.
	 */
    class CCVirtualCategory : public cocos2d::Ref {
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::__String*, mName, Name, JSON_CATEGORY_NAME);
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::__Array*, mGoodItemIds, GoodItemIds, JSON_CATEGORY_GOODSITEMIDS);
    public:
	CCVirtualCategory(): mName(NULL), mGoodItemIds(NULL) {};

		/**
		   Create a virtual category
		   \param name The name of the category
		   \param goodItemIds An array containing the itemIds of all the items in this category.
		   \return The category
		 */
        static CCVirtualCategory *create(cocos2d::__String *name, cocos2d::__Array *goodItemIds);

		/**
		   Create a virtual category
		   \param dict A dictionary containing keys to each of the parameters required by the create function.
		   \return The category
		*/
		static CCVirtualCategory *createWithDictionary(cocos2d::__Dictionary *dict);

        bool init(cocos2d::__String *name, cocos2d::__Array *goodItemIds);
        bool initWithDictionary(cocos2d::__Dictionary *dict);

        cocos2d::__Dictionary *toDictionary();

        virtual ~CCVirtualCategory();
    };
};


#endif //__VirtualCategoryX_H_
