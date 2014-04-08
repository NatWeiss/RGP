//
// Created by Fedor Shubin on 5/20/13.
//

#ifndef __CCStoreController_H_
#define __CCStoreController_H_

#include "cocos2d.h"
#include "CCIStoreAssets.h"
#include "CCSoomlaError.h"

namespace soomla {
	/** \class CCStoreController
		\brief An interface to the native StoreController class.

		An interface to the native StoreController class, use this class to
		access the native StoreController functionality.
	 */
    class CCStoreController: public cocos2d::Ref {
    public:
		/**
		   This class is singleton, use this function to access it.
		*/
        static CCStoreController* sharedStoreController();

		/**
		   Initialize StoreController on native side and allow using its
		   functions.
           \param storeAssets An instance of your store's assets class.
           \param storeParams A CCDictionary containing parameters for CCStoreController (These were previously found in CCSoomla).
             This dictionary can contain the following:
             "soomSec": CCString - The value of the primary encryption key.
             "customSecret": CCString - The value of the secondary encryption key.
             "androidPublicKey": CCString - Your Android public key.
             "SSV": CCBool - Whether or not to enable server side verification of purchases.
		 */
        static void createShared(CCIStoreAssets *storeAssets, cocos2d::CCDictionary *storeParams);

        CCStoreController(void);
        virtual ~CCStoreController(void);
        virtual bool init(CCIStoreAssets *storeAssets, cocos2d::CCDictionary *storeParams);

		/**
		   Buy an item from the App Store or Google Play.
		   \param productId The Product ID of the item in the App Store or Google Play
		   \param soomlaError A CCSoomlaError for error checking.
		 */
        void buyMarketItem(char const *productId, CCSoomlaError **soomlaError);

		/**
		   Restore this user's previous transactions.
		 */
        void restoreTransactions();

#if (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
		/**
		   Find out if the user restored his transactions.
		   \return Whether or not the user restored his transactions.
		*/		
        bool transactionsAlreadyRestored();
#endif
		
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
		void startIabServiceInBg();
		void stopIabServiceInBg();
#endif
    };
};

#endif // !__CCStoreController_H_
