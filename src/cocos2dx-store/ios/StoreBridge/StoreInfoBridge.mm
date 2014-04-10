/*
 * Copyright (C) 2012 Soomla Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "StoreInfoBridge.h"
#import "VirtualCurrencyPack.h"
#import "VirtualGood.h"
#import "StoreInfo.h"
#import "UpgradeVG.h"
#import "MarketItem.h"
#import "VirtualItemNotFoundException.h"
#import "PurchasableVirtualItem.h"
#import "PurchaseWithMarket.h"
#import "PurchaseWithVirtualItem.h"
#import "VirtualCategory.h"
#import "VirtualCurrency.h"
#import "NonConsumableItem.h"

/**
 * This implementation is used to let cocos2dx functions retrieve data from StoreInfo.
 *
 * You can see the documentation of every function in StoreInfo.
 */


NSDictionary *StoreInfoBridge::getItemByItemId(NSString *itemId) {
    @try {
        VirtualItem* vi = [[StoreInfo getInstance] virtualItemWithId:itemId];
        NSString *className = NSStringFromClass([vi class]);
        NSDictionary* nameWithClass = [NSDictionary dictionaryWithObjectsAndKeys:
                [vi toDictionary], @"item",
                className, @"className", nil];
        return nameWithClass;
    }
    @catch (VirtualItemNotFoundException* e) {
        NSLog(@"Couldn't find a VirtualItem with itemId: %@.", itemId);
        @throw e;
    }
}

NSDictionary *StoreInfoBridge::getPurchasableItemWithProductId(NSString *productId) {
    @try {
        PurchasableVirtualItem*pvi = [[StoreInfo getInstance] purchasableItemWithProductId:productId];
        NSString *className = NSStringFromClass([pvi class]);
        NSDictionary* nameWithClass = [NSDictionary dictionaryWithObjectsAndKeys:
                [pvi toDictionary], @"item",
                className, @"className", nil];
        return nameWithClass;
    }
    @catch (VirtualItemNotFoundException* e) {
        NSLog(@"Couldn't find a PurchasableVirtualItem with productId: %@.", productId);
        @throw e;
    }
}

NSDictionary *StoreInfoBridge::getCategoryForVirtualGood(NSString *goodItemId) {
    @try {
        return [[[StoreInfo getInstance] categoryForGoodWithItemId:goodItemId] toDictionary];
    }
    @catch (VirtualItemNotFoundException* e) {
        NSLog(@"Couldn't find a VirtualCategory for VirtualGood with itemId: %@.", goodItemId);
        @throw e;
    }
}

NSDictionary *StoreInfoBridge::getFirstUpgradeForVirtualGood(NSString *goodItemId) {
    @try {
        UpgradeVG *upgradeVG = [[StoreInfo getInstance] firstUpgradeForGoodWithItemId: goodItemId];
        NSString *className = NSStringFromClass([upgradeVG class]);
        NSDictionary* nameWithClass = [NSDictionary dictionaryWithObjectsAndKeys:
                [upgradeVG toDictionary], @"item",
                className, @"className", nil];
        return nameWithClass;
    }
    @catch (VirtualItemNotFoundException* e) {
        NSLog(@"Couldn't find a VirtualCategory for VirtualGood with itemId: %@.", goodItemId);
        @throw e;
    }
}

NSDictionary *StoreInfoBridge::getLastUpgradeForVirtualGood(NSString *goodItemId) {
    @try {
        UpgradeVG *upgradeVG = [[StoreInfo getInstance] lastUpgradeForGoodWithItemId: goodItemId];
        NSString *className = NSStringFromClass([upgradeVG class]);
        NSDictionary* nameWithClass = [NSDictionary dictionaryWithObjectsAndKeys:
                [upgradeVG toDictionary], @"item",
                className, @"className", nil];
        return nameWithClass;
    }
    @catch (VirtualItemNotFoundException* e) {
        NSLog(@"Couldn't find a VirtualCategory for VirtualGood with itemId: %@.", goodItemId);
        @throw e;
    }
}

NSArray *StoreInfoBridge::getUpgradesForVirtualGood(NSString *goodItemId) {
    NSMutableArray *retArray = [NSMutableArray array];
    NSArray *upgrades = [[StoreInfo getInstance] upgradesForGoodWithItemId:goodItemId];

    if (upgrades) {
        for(UpgradeVG* upgradeVG in upgrades) {
	    NSString *className = NSStringFromClass([upgradeVG class]);
	    [retArray addObject:@{@"item" : [upgradeVG toDictionary], @"className" : className}];
        }
    }

    return retArray;
}

NSArray *StoreInfoBridge::getVirtualCurrencies() {
    NSMutableArray *retArray = [NSMutableArray array];
    NSArray *virtualCurrencies = [[StoreInfo getInstance] virtualCurrencies];

    if (virtualCurrencies) {
        for(VirtualCurrency*virtualCurrency in virtualCurrencies) {
	    NSString *className = NSStringFromClass([virtualCurrency class]);
	    [retArray addObject:@{@"item" : [virtualCurrency toDictionary], @"className" : className}];
        }
    }

    return retArray;
}

NSArray *StoreInfoBridge::getVirtualGoods() {
    NSMutableArray *retArray = [NSMutableArray array];
    NSArray *virtualGoods = [[StoreInfo getInstance] virtualGoods];

    if (virtualGoods) {
        for(VirtualGood *virtualGood in virtualGoods) {
	    NSString *className = NSStringFromClass([virtualGood class]);
	    [retArray addObject:@{@"item" : [virtualGood toDictionary], @"className" : className}];
        }
    }

    return retArray;
}

NSArray *StoreInfoBridge::getVirtualCurrencyPacks() {
    NSMutableArray *retArray = [NSMutableArray array];
    NSArray *virtualCurrencyPacks = [[StoreInfo getInstance] virtualCurrencyPacks];

    if (virtualCurrencyPacks) {
        for(VirtualCurrencyPack *virtualCurrencyPack in virtualCurrencyPacks) {
	    NSString *className = NSStringFromClass([virtualCurrencyPack class]);
	    [retArray addObject:@{@"item" : [virtualCurrencyPack toDictionary], @"className" : className}];
        }
    }

    return retArray;
}

NSArray *StoreInfoBridge::getNonConsumableItems() {
    NSMutableArray *retArray = [NSMutableArray array];
    NSArray *nonConsumableItems = [[StoreInfo getInstance] nonConsumableItems];

    if (nonConsumableItems) {
        for(NonConsumableItem *nonConsumableItem in nonConsumableItems) {
	    NSString *className = NSStringFromClass([nonConsumableItem class]);
	    [retArray addObject:@{@"item" : [nonConsumableItem toDictionary], @"className" : className}];
        }
    }

    return retArray;
}

NSArray *StoreInfoBridge::getVirtualCategories() {
    NSMutableArray *retArray = [NSMutableArray array];
    NSArray *virtualCategories = [[StoreInfo getInstance] virtualCategories];

    if (virtualCategories) {
        for(VirtualCategory *virtualCategory in virtualCategories) {
	    NSString *className = NSStringFromClass([virtualCategory class]);
	    [retArray addObject:@{@"item" : [virtualCategory toDictionary], @"className" : className}];
        }
    }

    return retArray;
}

