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

#include "StoreControllerBridge.h"
#import "StoreController.h"
#import "VirtualItemNotFoundException.h"
#import "InsufficientFundsException.h"
#import "NotEnoughGoodsException.h"
#import "EventDispatcherBridge.h"
#import "PurchasableVirtualItem.h"
#import "StoreInfo.h"
#import "PurchaseWithMarket.h"
#import "MarketItem.h"
#import "StoreConfig.h"
#import "StoreUtils.h"

/**
 * This implementation is used to let cocos2dx functions perform actions on StoreController.
 *
 * You can see the documentation of every function in StoreController.
 */

void StoreControllerBridge::buyMarketItem(NSString *productId)  {
    @try {
        PurchasableVirtualItem* pvi = [[StoreInfo getInstance] purchasableItemWithProductId:productId];
        if ([pvi.purchaseType isKindOfClass:[PurchaseWithMarket class]]) {
            [[StoreController getInstance] buyInMarketWithMarketItem:((PurchaseWithMarket*)pvi.purchaseType).marketItem];
        } else {
            @throw [[VirtualItemNotFoundException alloc] initWithLookupField:@"productId" andLookupValue:productId];
        }
    }
    @catch (VirtualItemNotFoundException *exception) {
        @throw exception;
    }
}

void StoreControllerBridge::restoreTransactions() {
    [[StoreController getInstance] restoreTransactions];
}

bool StoreControllerBridge::transactionsAlreadyRestored() {
    return [[StoreController getInstance] transactionsAlreadyRestored];
}

void StoreControllerBridge::refreshMarketItemsDetails() {
    [[StoreController getInstance] refreshMarketItemsDetails];
}

void StoreControllerBridge::refreshInventory() {
    [[StoreController getInstance] refreshInventory];
}

void StoreControllerBridge::setSoomSec(string soomSec) {
    if (SOOM_SEC) {
        [SOOM_SEC release];
    }
    SOOM_SEC = [[NSString stringWithUTF8String:soomSec.c_str()] retain];
}

void StoreControllerBridge::setSSV(bool ssv) {
    LogDebug(@"SOOMLA StoreControllerBridge", ([NSString stringWithFormat:@"Setting iOS SSV to: %@", ssv?@"true":@"false"]));
    VERIFY_PURCHASES = ssv;
}
