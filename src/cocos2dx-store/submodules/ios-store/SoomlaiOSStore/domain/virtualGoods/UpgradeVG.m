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

#import "UpgradeVG.h"
#import "JSONConsts.h"
#import "StorageManager.h"
#import "VirtualGoodStorage.h"
#import "StoreUtils.h"
#import "StoreInfo.h"
#import "VirtualItemNotFoundException.h"

@implementation UpgradeVG

@synthesize prevGoodItemId, goodItemId, nextGoodItemId;

static NSString* TAG = @"SOOMLA UpgradeVG";

- (id)initWithName:(NSString *)oName andDescription:(NSString *)oDescription andItemId:(NSString *)oItemId andPurchaseType:(PurchaseType *)oPurchaseType andLinkedGood:(NSString*)oGoodItemId andPreviousUpgrade:(NSString*)oPrevItemId andNextUpgrade:(NSString*)oNextItemId {
    if (self = [super initWithName:oName andDescription:oDescription andItemId:oItemId andPurchaseType:oPurchaseType]) {
        self.prevGoodItemId = oPrevItemId;
        self.goodItemId = oGoodItemId;
        self.nextGoodItemId = oNextItemId;
    }
    
    return self;
}

- (id)initWithDictionary:(NSDictionary *)dict {
    if (self = [super initWithDictionary:dict]) {
        self.goodItemId = [dict objectForKey:JSON_VGU_GOOD_ITEMID];
        self.prevGoodItemId = [dict objectForKey:JSON_VGU_PREV_ITEMID];
        self.nextGoodItemId = [dict objectForKey:JSON_VGU_NEXT_ITEMID];
    }
    
    return self;
}

- (NSDictionary*)toDictionary {
    NSDictionary* parentDict = [super toDictionary];
    
    NSMutableDictionary* toReturn = [[NSMutableDictionary alloc] initWithDictionary:parentDict];
    [toReturn setValue:self.goodItemId forKey:JSON_VGU_GOOD_ITEMID];
    [toReturn setValue:(self.prevGoodItemId ? self.prevGoodItemId : @"") forKey:JSON_VGU_PREV_ITEMID];
    [toReturn setValue:(self.nextGoodItemId ? self.nextGoodItemId : @"") forKey:JSON_VGU_NEXT_ITEMID];
    
    return toReturn;
}

/**
 * Assigning the current upgrade to the associated VirtualGood (mGood).
 *
 * This action doesn't check nothing!! It just assigns the current UpgradeVG to the associated mGood.
 *
 * amount is NOT USED HERE !
 */
- (int)giveAmount:(int)amount withEvent:(BOOL)notify {
    LogDebug(TAG, ([NSString stringWithFormat:@"Assigning %@ to: %@", self.name, self.goodItemId]));
    
    VirtualGood* good = NULL;
    @try {
        good = (VirtualGood*)[[StoreInfo getInstance] virtualItemWithId:self.goodItemId];
    } @catch (VirtualItemNotFoundException* ex) {
        LogError(TAG, ([NSString stringWithFormat:@"VirtualGood with itemId: %@ doesn't exist! Can't upgrade.", self.goodItemId]));
        return 0;
    }
    [[[StorageManager getInstance] virtualGoodStorage] assignCurrentUpgrade:self toGood:good withEvent:notify];
    
    return [super giveAmount:amount withEvent:notify];
}

/**
 * This is actually a downgrade of the associated VirtualGood (with goodItemId).
 * We check if the current Upgrade is really associated with the VirtualGood and:
 *  if YES we downgrade to the previous upgrade (or removing upgrades in case of null).
 *  if NO we return (do nothing).
 *
 * amount is NOT USED HERE !
 */
- (int)takeAmount:(int)amount withEvent:(BOOL)notify {
    VirtualGood* good = NULL;
    @try {
        good = (VirtualGood*)[[StoreInfo getInstance] virtualItemWithId:self.goodItemId];
    } @catch (VirtualItemNotFoundException* ex) {
        LogError(TAG, ([NSString stringWithFormat:@"VirtualGood with itemId: %@ doesn't exist! Can't downgrade.", self.goodItemId]));
        return 0;
    }
    UpgradeVG* upgradeVG = [[[StorageManager getInstance] virtualGoodStorage] currentUpgradeOf:good];
    if (upgradeVG != self) {
        LogError(TAG, ([NSString stringWithFormat:@"You can't take what's not yours. The UpgradeVG %@ is not assigned to the VirtualGood: %@. (or maybe it's NULL?)", self.name, good.name]));
        return 0;
    }
    
    if (self.prevGoodItemId && self.prevGoodItemId.length>0) {
        UpgradeVG* prevUpgradeVG = NULL;
        @try {
            prevUpgradeVG = (UpgradeVG*)[[StoreInfo getInstance]virtualItemWithId:self.prevGoodItemId];
        } @catch (VirtualItemNotFoundException* ex) {
            LogError(TAG, ([NSString stringWithFormat:@"Previous UpgradeVG with itemId: %@ doesn't exist! Can't downgrade.", self.prevGoodItemId]));
            return 0;
        }
        
        LogDebug(TAG, ([NSString stringWithFormat:@"Downgrading %@ to %@", good.name, prevUpgradeVG.name]));
        [[[StorageManager getInstance] virtualGoodStorage] assignCurrentUpgrade:prevUpgradeVG toGood:good withEvent:notify];
    } else {
        LogDebug(TAG, ([NSString stringWithFormat:@"Downgrading %@ to NO-UPGRADE", good.name]));
        [[[StorageManager getInstance] virtualGoodStorage] removeUpgradesFrom:good withEvent:notify];
    }
    
    return [super takeAmount:amount withEvent:notify];
}

/**
 * We want to enforce the logic of allowing/rejecting upgrades here so users won't buy when they are not supposed to.
 * If you want to give your users upgrades for free, use the "give" function.
 */
- (BOOL)canBuy {
    VirtualGood* good = NULL;
    @try {
        good = (VirtualGood*)[[StoreInfo getInstance] virtualItemWithId:self.goodItemId];
    } @catch (VirtualItemNotFoundException* ex) {
        LogError(TAG, ([NSString stringWithFormat:@"VirtualGood with itemId: %@ doesn't exist! Returning NO (can't buy).", self.goodItemId]));
        return NO;
    }
    UpgradeVG* upgradeVG = [[[StorageManager getInstance] virtualGoodStorage] currentUpgradeOf:good];
    return (((!upgradeVG && (!self.prevGoodItemId || (self.prevGoodItemId.length == 0))) ||
            (upgradeVG && (([upgradeVG.nextGoodItemId isEqualToString:self.itemId]) || ([upgradeVG.prevGoodItemId isEqualToString:self.itemId]))))
            && [super canBuy]);
}



@end
