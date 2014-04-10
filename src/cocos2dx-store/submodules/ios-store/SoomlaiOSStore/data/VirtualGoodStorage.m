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

#import "VirtualGoodStorage.h"
#import "VirtualGood.h"
#import "StorageManager.h"
#import "KeyValDatabase.h"
#import "EventHandling.h"
#import "StoreUtils.h"
#import "StoreInfo.h"
#import "VirtualItemNotFoundException.h"
#import "UpgradeVG.h"
#import "EquippableVG.h"
#import "KeyValueStorage.h"

@implementation VirtualGoodStorage

- (id)init {
    if (self = [super init]) {
        tag = @"SOOMLA VirtualGoodStorage";
    }
    return self;
}

- (void)removeUpgradesFrom:(VirtualGood*)good {
    [self removeUpgradesFrom:good withEvent:YES];
}
- (void)removeUpgradesFrom:(VirtualGood*)good withEvent:(BOOL)notify {
    LogDebug(tag, ([NSString stringWithFormat:@"Removing upgrade information from virtual good: %@", good.name]));
    
    NSString* key = [KeyValDatabase keyGoodUpgrade:good.itemId];
    
    [[[StorageManager getInstance] keyValueStorage] deleteValueForKey:key];
    
    [EventHandling postGoodUpgrade:good withGoodUpgrade:nil];
}

- (void)assignCurrentUpgrade:(UpgradeVG*)upgradeVG toGood:(VirtualGood*)good {
    [self assignCurrentUpgrade:upgradeVG toGood:good withEvent:YES];
}
- (void)assignCurrentUpgrade:(UpgradeVG*)upgradeVG toGood:(VirtualGood*)good withEvent:(BOOL)notify {
    if ([[self currentUpgradeOf:good].itemId isEqualToString:upgradeVG.itemId]) {
        return;
    }
    
    LogDebug(tag, ([NSString stringWithFormat:@"Assigning upgrade %@ to virtual good: %@", upgradeVG.name, good.name]));
    
    NSString* key = [KeyValDatabase keyGoodUpgrade:good.itemId];
    
    [[[StorageManager getInstance] keyValueStorage] setValue:upgradeVG.itemId forKey:key];
    
    [EventHandling postGoodUpgrade:good withGoodUpgrade:upgradeVG];
}

- (UpgradeVG*)currentUpgradeOf:(VirtualGood*)good {
    LogDebug(tag, ([NSString stringWithFormat:@"Fetching upgrade to virtual good: %@", good.name]));
    
    NSString* key = [KeyValDatabase keyGoodUpgrade:good.itemId];
    
    NSString* upItemId = [[[StorageManager getInstance] keyValueStorage] getValueForKey:key];
    
    if(!upItemId) {
        LogDebug(tag, ([NSString stringWithFormat:@"You tried to fetch the current upgrade of %@ but there's no upgrade in the DB for it.", good.name]));
        return nil;
    }
    
    @try {
        return (UpgradeVG*)[[StoreInfo getInstance] virtualItemWithId:upItemId];
    } @catch (VirtualItemNotFoundException* ex){
        LogError(tag, @"The current upgrade's itemId from the DB is not found in StoreInfo.");
    } @catch (NSException* e) {
        LogError(tag, @"Something bad happend while trying to decrypt or fetch current upgrade.");
    }
    
    return nil;
}

- (BOOL)isGoodEquipped:(EquippableVG*)good {
    LogDebug(tag, ([NSString stringWithFormat:@"checking if virtual good with itemId: %@ is equipped", good.itemId]));
    
    NSString* key = [KeyValDatabase keyGoodEquipped:good.itemId];
    NSString* val = [[[StorageManager getInstance] keyValueStorage] getValueForKey:key];
    
    if (!val || [val length]==0){
        return NO;
    }
    
    // we're returning YES as long as there's a value for the required key.
    return YES;
}

- (void)equipGood:(EquippableVG*)good {
    [self equipGood:good withEvent:YES];
}
- (void)equipGood:(EquippableVG*)good withEvent:(BOOL)notify {
    if ([self isGoodEquipped:good]) {
        return;
    }
    
    [self privEquipGood:good withEquipValue:YES withEvent:notify];
}

- (void)unequipGood:(EquippableVG*)good {
    [self unequipGood:good withEvent:YES];
}
- (void)unequipGood:(EquippableVG*)good withEvent:(BOOL)notify {
    if (![self isGoodEquipped:good]) {
        return;
    }
    
    [self privEquipGood:good withEquipValue:NO withEvent:notify];
}

- (void)privEquipGood:(EquippableVG*)good withEquipValue:(BOOL)equip withEvent:(BOOL)notify{
    LogDebug(tag, ([NSString stringWithFormat:@"%@ %@.", (equip ? @"equipping" : @"unequipping"), good.name]));
    
    NSString* key = [KeyValDatabase keyGoodEquipped:good.itemId];
    
    if (equip) {
        [[[StorageManager getInstance] keyValueStorage] setValue:@"equipped" forKey:key];
        if (notify) {
            [EventHandling postGoodEquipped:good];
        }
    } else {
        [[[StorageManager getInstance] keyValueStorage] deleteValueForKey:key];
        if (notify) {
            [EventHandling postGoodUnEquipped:good];
        }
    }
}

- (NSString*)keyBalance:(NSString*)itemId {
    return [KeyValDatabase keyGoodBalance:itemId];
}

- (void)postBalanceChangeToItem:(VirtualItem*)item withBalance:(int)balance andAmountAdded:(int)amountAdded {
    [EventHandling postChangedBalance:balance forGood:(VirtualGood*)item withAmount:amountAdded];
}

@end
