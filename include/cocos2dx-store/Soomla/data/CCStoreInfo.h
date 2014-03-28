//
// Created by Fedor Shubin on 5/21/13.
//


#ifndef __CCStoreInfo_H_
#define __CCStoreInfo_H_

#include "cocos2d.h"
#include "../CCSoomlaError.h"
#include "../CCIStoreAssets.h"
#include "../domain/CCVirtualItem.h"
#include "../domain/virtualGoods/CCUpgradeVG.h"
#include "../domain/CCVirtualCategory.h"

namespace soomla {
	/** \class CCStoreInfo
		\brief An interface to the native StoreInfo class.

		An interface to the native StoreInfo class, use this class to
		access the native StoreInfo functionality.
	*/
	class CCStoreInfo: cocos2d::Ref {
    public:
		/**
		   This class is singleton, use this function to access it.
		*/
        static CCStoreInfo *sharedStoreInfo();
        static void createShared(CCIStoreAssets *storeAssets);
        virtual bool init(CCIStoreAssets *storeAssets);

		/**
		   Get a virtual item corresponding to an itemID.
		   \param itemId The itemId of the item.
		   \param soomlaError A CCSoomlaError for error checking.
		   \return The item as a CCVirtualItem.
		 */
        CCVirtualItem *getItemByItemId(const char *itemId, CCSoomlaError **soomlaError);

		/**
		   Get a purchasble virtual item corresponding to a productID.
		   \param productId The productIdId of the item.
		   \param soomlaError A CCSoomlaError for error checking.
		   \return The item as a CCPurchasableVirtualItem.
		*/
		CCPurchasableVirtualItem *getPurchasableItemWithProductId(const char *productId, CCSoomlaError **soomlaError);

		/**
		   Get a virtual good's category
		   \param itemId The itemId of the good.
		   \param soomlaError A CCSoomlaError for error checking.
		   \return The category of the good.
		*/
		CCVirtualCategory *getCategoryForVirtualGood(const char *goodItemId, CCSoomlaError **soomlaError);

		/**
		   Get the first upgrade of a good
		   \param itemId The itemId of the good.
		   \return The first upgrade of the good.
		*/
        CCUpgradeVG *getFirstUpgradeForVirtualGood(const char *goodItemId);

		/**
		   Get the last upgrade of a good
		   \param itemId The itemId of the good.
		   \return The last upgrade of the good.
		*/
		CCUpgradeVG *getLastUpgradeForVirtualGood(const char *goodItemId);

		/**
		   Get all upgrades of a good
		   \param itemId The itemId of the good.
		   \return The uprades in an Array.
		*/
        cocos2d::__Array *getUpgradesForVirtualGood(const char *goodItemId);

		/**
		   Get all virtual currencies.
		   \return The virtual currencies in an Array.
		*/
		cocos2d::__Array *getVirtualCurrencies();

		/**
		   Get all virtual goods.
		   \return The virtual goods in an Array.
		*/
        cocos2d::__Array *getVirtualGoods();

		/**
		   Get all virtual currency packs.
		   \return The virtual currency packs in an Array.
		*/
        cocos2d::__Array *getVirtualCurrencyPacks();

		/**
		   Get all non consumable items.
		   \return The non consumable items in an Array.
		*/
        cocos2d::__Array *getNonConsumableItems();

		/**
		   Get all virtual categories.
		   \return The virtual categories in an Array.
		*/
		cocos2d::__Array *getVirtualCategories();
    private:
        cocos2d::Ref *createWithRetParams(cocos2d::__Dictionary *retParams);
    };
};

#endif //__CCStoreInfo_H_
