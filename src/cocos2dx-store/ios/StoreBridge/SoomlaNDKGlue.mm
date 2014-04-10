//
// Created by Fedor Shubin on 5/24/13.
//

#import "SoomlaNDKGlue.h"
#import "StoreControllerBridge.h"
#import "StoreAssetsBridge.h"
#import "StoreController.h"
#import "StoreInventoryBridge.h"
#import "StoreInfoBridge.h"
#import "VirtualItemNotFoundException.h"
#import "EventDispatcherBridge.h"
#import "NotEnoughGoodsException.h"
#import "InsufficientFundsException.h"
#import "EventHandling.h"
#import "VirtualCurrency.h"
#import "VirtualGood.h"
#import "EquippableVG.h"
#import "UpgradeVG.h"
#import "CCSoomlaNdkBridgeIos.h"
#import "StoreUtils.h"
#include "jansson.h"
#import "MarketItem.h"

static EventDispatcherBridge *eventDispatcherBridge = [EventDispatcherBridge sharedInstance];

@implementation SoomlaNDKGlue {
}

static NSString* TAG = @"SOOMLA SoomlaNDKGlue";

+ (NSObject *)dispatchNDKCall:(NSDictionary *)parameters {
    NSString *methodName = [parameters objectForKey:@"method"];

    NSMutableDictionary *retParameters = [NSMutableDictionary dictionary];

    @try {
        if ([methodName isEqualToString:@"CCStoreAssets::init"]) {
            NSNumber *version = (NSNumber *) [parameters objectForKey:@"version"];
            NSDictionary *storeAssetsDict = (NSDictionary *) [parameters objectForKey:@"storeAssets"];
	    [[StoreAssetsBridge sharedInstance] initializeWithStoreAssetsDict:storeAssetsDict andVersion:version.intValue];
        }
        else if ([methodName isEqualToString:@"CCStoreController::init"]) {
            NSString *customSecret = (NSString *) [parameters objectForKey:@"customSecret"];

	    [[StoreController getInstance] initializeWithStoreAssets:[StoreAssetsBridge sharedInstance]
                                                     andCustomSecret:customSecret];
        }
        else if ([methodName isEqualToString:@"CCStoreController::buyMarketItem"]) {
            NSString *productId = (NSString *) [parameters objectForKey:@"productId"];
            StoreControllerBridge::buyMarketItem(productId);
        }
        else if ([methodName isEqualToString:@"CCStoreController::restoreTransactions"]) {
            StoreControllerBridge::restoreTransactions();
        }
        else if ([methodName isEqualToString:@"CCStoreController::transactionsAlreadyRestored"]) {
            bool res = StoreControllerBridge::transactionsAlreadyRestored();
            [retParameters setObject:[NSNumber numberWithBool:res] forKey:@"return"];
        }
        else if ([methodName isEqualToString:@"CCStoreController::refreshInventory"]) {
            StoreControllerBridge::refreshInventory();
        }
        else if ([methodName isEqualToString:@"CCStoreController::setSoomSec"]) {
            NSString *soomSec = (NSString *) [parameters objectForKey:@"soomSec"];
            StoreControllerBridge::setSoomSec([soomSec UTF8String]);
        }
        else if ([methodName isEqualToString:@"CCStoreController::setSSV"]) {
            bool ssv = [(NSNumber*)[parameters objectForKey:@"ssv"] boolValue];
            StoreControllerBridge::setSSV(ssv);
        }
        else if ([methodName isEqualToString:@"CCStoreController::refreshMarketItemsDetails"]) {
            StoreControllerBridge::refreshMarketItemsDetails();
        }
        else if ([methodName isEqualToString:@"CCStoreInventory::buyItem"]) {
            NSString *itemId = (NSString *) [parameters objectForKey:@"itemId"];
            StoreInventoryBridge::buy([itemId UTF8String]);
        }
        else if ([methodName isEqualToString:@"CCStoreInventory::getItemBalance"]) {
            NSString *itemId = (NSString *) [parameters objectForKey:@"itemId"];
            int res = StoreInventoryBridge::getItemBalance([itemId UTF8String]);
            [retParameters setObject:[NSNumber numberWithInt:res] forKey:@"return"];
        }
        else if ([methodName isEqualToString:@"CCStoreInventory::giveItem"]) {
            NSString *itemId = (NSString *) [parameters objectForKey:@"itemId"];
            NSNumber *amount = (NSNumber *) [parameters objectForKey:@"amount"];
            StoreInventoryBridge::giveItem([itemId UTF8String], [amount intValue]);
        }
        else if ([methodName isEqualToString:@"CCStoreInventory::takeItem"]) {
            NSString *itemId = (NSString *) [parameters objectForKey:@"itemId"];
            NSNumber *amount = (NSNumber *) [parameters objectForKey:@"amount"];
            StoreInventoryBridge::takeItem([itemId UTF8String], [amount intValue]);
        }
        else if ([methodName isEqualToString:@"CCStoreInventory::equipVirtualGood"]) {
            NSString *itemId = (NSString *) [parameters objectForKey:@"itemId"];
            StoreInventoryBridge::equipVirtualGood([itemId UTF8String]);
        }
        else if ([methodName isEqualToString:@"CCStoreInventory::unEquipVirtualGood"]) {
            NSString *itemId = (NSString *) [parameters objectForKey:@"itemId"];
            StoreInventoryBridge::unEquipVirtualGood([itemId UTF8String]);
        }
        else if ([methodName isEqualToString:@"CCStoreInventory::isVirtualGoodEquipped"]) {
            NSString *itemId = (NSString *) [parameters objectForKey:@"itemId"];
            bool res = StoreInventoryBridge::isVirtualGoodEquipped([itemId UTF8String]);
            [retParameters setObject:[NSNumber numberWithBool:res] forKey:@"return"];
        }
        else if ([methodName isEqualToString:@"CCStoreInventory::getGoodUpgradeLevel"]) {
            NSString *goodItemId = (NSString *) [parameters objectForKey:@"goodItemId"];
            int res = StoreInventoryBridge::getGoodUpgradeLevel([goodItemId UTF8String]);
            [retParameters setObject:[NSNumber numberWithInt:res] forKey:@"return"];
        }
        else if ([methodName isEqualToString:@"CCStoreInventory::getGoodCurrentUpgrade"]) {
            NSString *goodItemId = (NSString *) [parameters objectForKey:@"goodItemId"];
            string res = StoreInventoryBridge::getGoodCurrentUpgrade([goodItemId UTF8String]);
            [retParameters setObject:[NSString stringWithCString:res.c_str() encoding:NSUTF8StringEncoding] forKey:@"return"];
        }
        else if ([methodName isEqualToString:@"CCStoreInventory::upgradeGood"]) {
            NSString *goodItemId = (NSString *) [parameters objectForKey:@"goodItemId"];
            StoreInventoryBridge::upgradeVirtualGood([goodItemId UTF8String]);
        }
        else if ([methodName isEqualToString:@"CCStoreInventory::removeGoodUpgrades"]) {
            NSString *goodItemId = (NSString *) [parameters objectForKey:@"goodItemId"];
            StoreInventoryBridge::removeUpgrades([goodItemId UTF8String]);
        }
        else if ([methodName isEqualToString:@"CCStoreInventory::nonConsumableItemExists"]) {
            NSString *nonConsItemId = (NSString *) [parameters objectForKey:@"nonConsItemId"];
            bool res = StoreInventoryBridge::nonConsumableItemExists([nonConsItemId UTF8String]);
            [retParameters setObject:[NSNumber numberWithBool:res] forKey:@"return"];
        }
        else if ([methodName isEqualToString:@"CCStoreInventory::addNonConsumableItem"]) {
            NSString *nonConsItemId = (NSString *) [parameters objectForKey:@"nonConsItemId"];
            StoreInventoryBridge::addNonConsumableItem([nonConsItemId UTF8String]);
        }
        else if ([methodName isEqualToString:@"CCStoreInventory::removeNonConsumableItem"]) {
            NSString *nonConsItemId = (NSString *) [parameters objectForKey:@"nonConsItemId"];
            StoreInventoryBridge::removeNonConsumableItem([nonConsItemId UTF8String]);
        }
        else if ([methodName isEqualToString:@"CCStoreInfo::getItemByItemId"]) {
            NSString *itemId = (NSString *) [parameters objectForKey:@"itemId"];
            NSDictionary *retObj = StoreInfoBridge::getItemByItemId(itemId);
            [retParameters setObject: retObj forKey: @"return"];
        }
        else if ([methodName isEqualToString:@"CCStoreInfo::getPurchasableItemWithProductId"]) {
            NSString *productId = (NSString *) [parameters objectForKey:@"productId"];
            NSDictionary *retObj = StoreInfoBridge::getPurchasableItemWithProductId(productId);
            [retParameters setObject: retObj forKey: @"return"];
        }
        else if ([methodName isEqualToString:@"CCStoreInfo::getCategoryForVirtualGood"]) {
            NSString *goodItemId = (NSString *) [parameters objectForKey:@"goodItemId"];
            NSDictionary *retObj = StoreInfoBridge::getCategoryForVirtualGood(goodItemId);
            [retParameters setObject: retObj forKey: @"return"];
        }
        else if ([methodName isEqualToString:@"CCStoreInfo::getFirstUpgradeForVirtualGood"]) {
            NSString *goodItemId = (NSString *) [parameters objectForKey:@"goodItemId"];
            NSDictionary *retObj = StoreInfoBridge::getFirstUpgradeForVirtualGood(goodItemId);
            [retParameters setObject: retObj forKey: @"return"];
        }
        else if ([methodName isEqualToString:@"CCStoreInfo::getLastUpgradeForVirtualGood"]) {
            NSString *goodItemId = (NSString *) [parameters objectForKey:@"goodItemId"];
            NSDictionary *retObj = StoreInfoBridge::getLastUpgradeForVirtualGood(goodItemId);
            [retParameters setObject: retObj forKey: @"return"];
        }
        else if ([methodName isEqualToString:@"CCStoreInfo::getUpgradesForVirtualGood"]) {
            NSString *goodItemId = (NSString *) [parameters objectForKey:@"goodItemId"];
            NSArray *retObj = StoreInfoBridge::getUpgradesForVirtualGood(goodItemId);
            [retParameters setObject: retObj forKey: @"return"];
        }
        else if ([methodName isEqualToString:@"CCStoreInfo::getVirtualCurrencies"]) {
            NSArray *retObj = StoreInfoBridge::getVirtualCurrencies();
            [retParameters setObject: retObj forKey: @"return"];
        }
        else if ([methodName isEqualToString:@"CCStoreInfo::getVirtualGoods"]) {
            NSArray *retObj = StoreInfoBridge::getVirtualGoods();
            [retParameters setObject: retObj forKey: @"return"];
        }
        else if ([methodName isEqualToString:@"CCStoreInfo::getVirtualCurrencyPacks"]) {
            NSArray *retObj = StoreInfoBridge::getVirtualCurrencyPacks();
            [retParameters setObject: retObj forKey: @"return"];
        }
        else if ([methodName isEqualToString:@"CCStoreInfo::getNonConsumableItems"]) {
            NSArray *retObj = StoreInfoBridge::getNonConsumableItems();
            [retParameters setObject: retObj forKey: @"return"];
        }
        else if ([methodName isEqualToString:@"CCStoreInfo::getVirtualCategories"]) {
            NSArray *retObj = StoreInfoBridge::getVirtualCategories();
            [retParameters setObject: retObj forKey: @"return"];
        }
        else {
            LogError(TAG, ([NSString stringWithFormat:@"Unsupported method %@", methodName]));
        }
    }
    @catch (VirtualItemNotFoundException* e) {
        [retParameters setObject: [NSNumber numberWithInt: -1] forKey: @"errorCode"];
    }
    @catch (InsufficientFundsException* e) {
        [retParameters setObject: [NSNumber numberWithInt: -2] forKey: @"errorCode"];
    }
    @catch (NotEnoughGoodsException* e) {
        [retParameters setObject: [NSNumber numberWithInt: -3] forKey: @"errorCode"];
    }
    return retParameters;
}

+ (void)dispatchNDKCallback:(NSNotification*)notification {
    NSMutableDictionary *parameters = [NSMutableDictionary dictionary];
    if ([notification.name isEqualToString:EVENT_BILLING_NOT_SUPPORTED]) {
        [parameters setObject:@"CCEventHandler::onBillingNotSupported" forKey:@"method"];
    }
    else if ([notification.name isEqualToString:EVENT_BILLING_SUPPORTED]) {
        [parameters setObject:@"CCEventHandler::onBillingSupported" forKey:@"method"];
    }
    else if ([notification.name isEqualToString:EVENT_CURRENCY_BALANCE_CHANGED]) {
        [parameters setObject:@"CCEventHandler::onCurrencyBalanceChanged" forKey:@"method"];
        [parameters setObject:[(VirtualCurrency*)[notification.userInfo objectForKey:DICT_ELEMENT_CURRENCY] itemId] forKey:@"itemId"];
        [parameters setObject:(NSNumber*)[notification.userInfo objectForKey:DICT_ELEMENT_BALANCE] forKey:@"balance"];
        [parameters setObject:(NSNumber*)[notification.userInfo objectForKey:DICT_ELEMENT_AMOUNT_ADDED] forKey:@"amountAdded"];
    }
    else if ([notification.name isEqualToString:EVENT_GOOD_BALANCE_CHANGED]) {
        [parameters setObject:@"CCEventHandler::onGoodBalanceChanged" forKey:@"method"];
        [parameters setObject:[(VirtualGood*)[notification.userInfo objectForKey:DICT_ELEMENT_GOOD] itemId] forKey:@"itemId"];
        [parameters setObject:(NSNumber*)[notification.userInfo objectForKey:DICT_ELEMENT_BALANCE] forKey:@"balance"];
        [parameters setObject:(NSNumber*)[notification.userInfo objectForKey:DICT_ELEMENT_AMOUNT_ADDED] forKey:@"amountAdded"];
    }
    else if ([notification.name isEqualToString:EVENT_GOOD_EQUIPPED]) {
        EquippableVG* good = (EquippableVG*)[notification.userInfo objectForKey:DICT_ELEMENT_EquippableVG];
        [parameters setObject:@"CCEventHandler::onGoodEquipped" forKey:@"method"];
        [parameters setObject:[good itemId] forKey:@"itemId"];
    }
    else if ([notification.name isEqualToString:EVENT_GOOD_UNEQUIPPED]) {
        EquippableVG* good = (EquippableVG*)[notification.userInfo objectForKey:DICT_ELEMENT_EquippableVG];
        [parameters setObject:@"CCEventHandler::onGoodUnEquipped" forKey:@"method"];
        [parameters setObject:[good itemId] forKey:@"itemId"];
    }
    else if ([notification.name isEqualToString:EVENT_GOOD_UPGRADE]) {
        VirtualGood* good = (VirtualGood*)[notification.userInfo objectForKey:DICT_ELEMENT_GOOD];
        UpgradeVG* vgu = (UpgradeVG*)[notification.userInfo objectForKey:DICT_ELEMENT_UpgradeVG];
        [parameters setObject:@"CCEventHandler::onGoodUpgrade" forKey:@"method"];
        [parameters setObject:[good itemId] forKey:@"itemId"];
        [parameters setObject:[vgu itemId] forKey:@"vguItemId"];
    }
    else if ([notification.name isEqualToString:EVENT_ITEM_PURCHASED]) {
        PurchasableVirtualItem* pvi = (PurchasableVirtualItem*)[notification.userInfo objectForKey:DICT_ELEMENT_PURCHASABLE];
        [parameters setObject:@"CCEventHandler::onItemPurchased" forKey:@"method"];
        [parameters setObject:[pvi itemId] forKey:@"itemId"];
    }
    else if ([notification.name isEqualToString:EVENT_ITEM_PURCHASE_STARTED]) {
        PurchasableVirtualItem* pvi = (PurchasableVirtualItem*)[notification.userInfo objectForKey:DICT_ELEMENT_PURCHASABLE];
        [parameters setObject:@"CCEventHandler::onItemPurchaseStarted" forKey:@"method"];
        [parameters setObject:[pvi itemId] forKey:@"itemId"];
    }
    else if ([notification.name isEqualToString:EVENT_MARKET_PURCHASE_CANCELLED]) {
        PurchasableVirtualItem* pvi = (PurchasableVirtualItem*)[notification.userInfo objectForKey:DICT_ELEMENT_PURCHASABLE];
        [parameters setObject:@"CCEventHandler::onMarketPurchaseCancelled" forKey:@"method"];
        [parameters setObject:[pvi itemId] forKey:@"itemId"];
    }
    else if ([notification.name isEqualToString:EVENT_MARKET_PURCHASED]) {
        PurchasableVirtualItem* pvi = (PurchasableVirtualItem*)[notification.userInfo objectForKey:DICT_ELEMENT_PURCHASABLE];
        NSURL *url = [notification.userInfo objectForKey:DICT_ELEMENT_RECEIPT];
        [parameters setObject:@"CCEventHandler::onMarketPurchase" forKey:@"method"];
        [parameters setObject:[pvi itemId] forKey:@"itemId"];
        [parameters setObject:[url absoluteString] forKey:@"receiptUrl"];
    }
    else if ([notification.name isEqualToString:EVENT_MARKET_PURCHASE_STARTED]) {
        PurchasableVirtualItem* pvi = (PurchasableVirtualItem*)[notification.userInfo objectForKey:DICT_ELEMENT_PURCHASABLE];
        [parameters setObject:@"CCEventHandler::onMarketPurchaseStarted" forKey:@"method"];
        [parameters setObject:[pvi itemId] forKey:@"itemId"];
    }
    else if ([notification.name isEqualToString:EVENT_MARKET_ITEMS_REFRESHED]) {
        NSArray* marketItems = (NSArray*)[notification.userInfo objectForKey:DICT_ELEMENT_MARKET_ITEMS];
        NSMutableArray* jsonArr = [NSMutableArray array];
        for (MarketItem* mi in marketItems) {
            [jsonArr addObject:[mi toDictionary]];
        }
        [parameters setObject:@"CCEventHandler::onMarketItemsRefreshed" forKey:@"method"];
        [parameters setObject: jsonArr forKey:@"marketItems"];
    }
    else if ([notification.name isEqualToString:EVENT_MARKET_PURCHASE_VERIF]) {
        PurchasableVirtualItem* pvi = (PurchasableVirtualItem*)[notification.userInfo objectForKey:DICT_ELEMENT_PURCHASABLE];
        [parameters setObject:@"CCEventHandler::onMarketPurchaseVerification" forKey:@"method"];
        [parameters setObject:[pvi itemId] forKey:@"itemId"];
    }
    else if ([notification.name isEqualToString:EVENT_RESTORE_TRANSACTIONS_FINISHED]) {
        BOOL success = [(NSNumber*)[notification.userInfo objectForKey:DICT_ELEMENT_SUCCESS] boolValue];
        [parameters setObject:@"CCEventHandler::onRestoreTransactionsFinished" forKey:@"method"];
        [parameters setObject: [NSNumber numberWithBool: success] forKey:@"success"];
    }
    else if ([notification.name isEqualToString:EVENT_RESTORE_TRANSACTIONS_STARTED]) {
        [parameters setObject:@"CCEventHandler::onRestoreTransactionsStarted" forKey:@"method"];
    }
    else if ([notification.name isEqualToString:EVENT_UNEXPECTED_ERROR_IN_STORE]) {
        [parameters setObject:@"CCEventHandler::onUnexpectedErrorInStore" forKey:@"method"];
    }
    else if ([notification.name isEqualToString:EVENT_STORECONTROLLER_INIT]) {
	[parameters setObject:@"CCEventHandler::onStoreControllerInitialized" forKey:@"method"];
    }
    else {
	LogError(TAG, ([NSString stringWithFormat:@"Unknow notification %@", notification.name]));
        return;
    }

    json_t *jsonPrms = NULL;

    if (parameters != nil) {
        NSError *error = nil;
        NSData *jsonData = [NSJSONSerialization
                dataWithJSONObject:parameters
                           options:NSJSONWritingPrettyPrinted
                             error:&error];

        if (error != nil)
            return;

        NSString *jsonPrmsString = [[NSString alloc] initWithData:jsonData
                                                         encoding:NSUTF8StringEncoding];

        json_error_t jerror;
        jsonPrms = json_loads([jsonPrmsString UTF8String], 0, &jerror);

        if (!jsonPrms) {
            fprintf(stderr, "error: at line #%d: %s\n", jerror.line, jerror.text);
            return;
        }

        [jsonPrmsString release];
    }

    soomla::CCSoomlaNdkBridgeIos::ndkCallback(jsonPrms);
    if (jsonPrms) {
        json_decref(jsonPrms);
    }
}

@end
