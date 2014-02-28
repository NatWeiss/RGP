//
// Created by Fedor Shubin on 5/21/13.
//

#ifndef __CCStoreInventory_H_
#define __CCStoreInventory_H_

#include "cocos2d.h"
#include "CCSoomlaError.h"

namespace soomla {
	/** \class CCStoreInventory
		\brief An interface to the native StoreInventory class.

		An interface to the native StoreInventory class, use this class to
		access the native StoreInventory functionality.
	 */
    class CCStoreInventory: public cocos2d::CCObject {
    public:
		/**
		   This class is singleton, use this function to access it.
		 */
        static CCStoreInventory* sharedStoreInventory();
        CCStoreInventory(void);
        virtual ~CCStoreInventory(void);
        virtual bool init();

		/**
		   Buy a virtual item from the store.
		   \param itemId The itemId of the item you want to buy.
		   \param soomlaError A CCSoomlaError for error checking.
		 */
        void buyItem(const char *itemId, CCSoomlaError **soomlaError);

		/**
		   Get the balance for an item.
		   \param itemId The itemId of the item for which you want to get the balance.
		   \param soomlaError A CCSoomlaError for error checking.
		*/
        int getItemBalance(const char *itemId, CCSoomlaError **soomlaError);

		/**
		   Give the user an item.
		   \param itemId The itemId of the item you want to give.
		   \param amount The amount you want to give the user.
		   \param soomlaError A CCSoomlaError for error checking.
		*/
		void giveItem(const char *itemId, int amount, CCSoomlaError **soomlaError);

		/**
		   Take away an item from the user.
		   \param itemId The itemId of the item you want to take away.
		   \param amount The amount you want to take from the user.
		   \param soomlaError A CCSoomlaError for error checking.
		*/
        void takeItem(const char *itemId, int amount, CCSoomlaError **soomlaError);

		/**
		   Equip an item.
		   \param itemId The itemId of the item you want to equip.
		   \param soomlaError A CCSoomlaError for error checking.
		*/
        void equipVirtualGood(const char *itemId, CCSoomlaError **soomlaError);

		/**
		   Unequip an item.
		   \param itemId The itemId of the item you want to unequip.
		   \param soomlaError A CCSoomlaError for error checking.
		*/
		void unEquipVirtualGood(const char *itemId, CCSoomlaError **soomlaError);

		/**
		   Test if an item is equipped.
		   \param itemId The itemId of the item you want to test.
		   \param soomlaError A CCSoomlaError for error checking.
		   \return Whether or not the item is equipped.
		*/
        bool isVirtualGoodEquipped(const char *itemId, CCSoomlaError **soomlaError);

		/**
		   Get the upgrade level of a good.
		   \param itemId The itemId of the good.
		   \param soomlaError A CCSoomlaError for error checking.
		   \return The upgarde level.
		 */
        int getGoodUpgradeLevel(const char *goodItemId, CCSoomlaError **soomlaError);

		/**
		   Get the current upgrade level of a good.
		   \param itemId The itemId of the good.
		   \param soomlaError A CCSoomlaError for error checking.
		   \return The itemId of current upgrade.
		*/
		std::string getGoodCurrentUpgrade(const char *goodItemId, CCSoomlaError **soomlaError); //TODO: return c string?

		/**
		   Upgrade a good.
		   \param itemId The itemId of the good.
		   \param soomlaError A CCSoomlaError for error checking.
		*/
        void upgradeGood(const char *goodItemId, CCSoomlaError **soomlaError);

		/**
		   Remove all upgrades from a good.
		   \param itemId The itemId of the good.
		   \param soomlaError A CCSoomlaError for error checking.
		*/
		void removeGoodUpgrades(const char *goodItemId, CCSoomlaError **soomlaError);

		/**
		   Test if a non consumable item exists.
		   \param itemId The itemId of the good.
		   \param soomlaError A CCSoomlaError for error checking.
		   \return Whether or not it exists.
		*/
        bool nonConsumableItemExists(const char *nonConsItemId, CCSoomlaError **soomlaError);

		/**
		   Give the user a non consumable item.
		   \param itemId The itemId of the item.
		   \param soomlaError A CCSoomlaError for error checking.
		*/
        void addNonConsumableItem(const char *nonConsItemId, CCSoomlaError **soomlaError);

		/**
		   Take away a non consumable item from the user.
		   \param itemId The itemId of the item.
		   \param soomlaError A CCSoomlaError for error checking.
		*/
        void removeNonConsumableItem(const char *nonConsItemId, CCSoomlaError **soomlaError);
    };
};

#endif //__CCStoreInventory_H_
