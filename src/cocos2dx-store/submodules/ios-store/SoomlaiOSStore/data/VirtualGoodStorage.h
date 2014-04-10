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

#import <Foundation/Foundation.h>
#import "VirtualItemStorage.h"

@class VirtualGood;
@class UpgradeVG;
@class EquippableVG;

/**
 * This class provide basic storage operations on VirtualGoods.
 */
@interface VirtualGoodStorage : VirtualItemStorage

- (id)init;

/**
 * This function removes any upgrade associated with the given VirtualGood.
 * good is the VirtualGood to remove upgrade from.
 */
- (void)removeUpgradesFrom:(VirtualGood*)good;
- (void)removeUpgradesFrom:(VirtualGood*)good withEvent:(BOOL)notify;

/**
 * Assigns a specific upgrade to the given VirtualGood.
 * good is the VirtualGood to upgrade.
 * upgradeVG is the upgrade to assign.
 */
- (void)assignCurrentUpgrade:(UpgradeVG*)upgradeVG toGood:(VirtualGood*)good;
- (void)assignCurrentUpgrade:(UpgradeVG*)upgradeVG toGood:(VirtualGood*)good withEvent:(BOOL)notify;

/**
 * Retrieves the current upgrade for the given VirtualGood.
 * good is the VirtualGood to retrieve upgrade for.
 */
- (UpgradeVG*)currentUpgradeOf:(VirtualGood*)good;

/**
 * Check the equipping status of the given EquippableVG.
 * good is the EquippableVG to check the status for.
 */
- (BOOL)isGoodEquipped:(EquippableVG*)good;

/**
 * Equip the given EquippableVG.
 * good is the EquippableVG to equip.
 */
- (void)equipGood:(EquippableVG*)good;
- (void)equipGood:(EquippableVG*)good withEvent:(BOOL)notify;

/**
 * UnEquip the given EquippableVG.
 * good is the EquippableVG to unequip.
 */
- (void)unequipGood:(EquippableVG*)good;
- (void)unequipGood:(EquippableVG*)good withEvent:(BOOL)notify;

@end
