//
//  CCVirtualItem.h
//  cocos2dx-store
//
//  Created by Igor Yegoroff on 5/16/13.
//
//

#ifndef __cocos2dx_store__VirtualItem__
#define __cocos2dx_store__VirtualItem__

#include "cocos2d.h"
#include "../SoomlaMacros.h"
#include "../data/SoomlaJSONConsts.h"

namespace soomla {
	/** \class CCVirtualItem
		\brief A virtual item.

		A virtual item, the base class for all virtual items.
	*/    
    class CCVirtualItem : public cocos2d::Ref {
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::CCString*, mName, Name, JSON_ITEM_NAME);
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::CCString*, mDescription, Description, JSON_ITEM_DESCRIPTION);
        SL_SYNTHESIZE_RETAIN_WITH_DICT(cocos2d::CCString*, mItemId, ItemId, JSON_ITEM_ITEMID);
        
    public:
        CCVirtualItem(): mName(NULL), mDescription(NULL), mItemId(NULL) {}

		/**
		   Create a CCVirtualItem.
		   \param name The item's name.
		   \param description The item's description.
		   \param itemId The item's itemId
		   \return The item.
		*/
        static CCVirtualItem * create(cocos2d::CCString* name, cocos2d::CCString* description, cocos2d::CCString* itemId);

		/**
		   Create a  CCVirtualItem.
		   \param dict A dictionary containing keys to each of the parameters required by the create function.
		   \return The item.
		*/
		static CCVirtualItem * createWithDictionary(cocos2d::CCDictionary* dict);

        virtual bool init(cocos2d::CCString* name, cocos2d::CCString* description, cocos2d::CCString* itemId);
        virtual bool initWithDictionary(cocos2d::CCDictionary* dict);
        
        virtual ~CCVirtualItem();
        
        virtual cocos2d::CCDictionary* toDictionary();
    };
    
}



#endif /* defined(__cocos2dx_store__VirtualItem__) */
