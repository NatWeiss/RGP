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

#import "LifetimeVG.h"

/**
 * EquippingModel is the way EquippableVG is equipped.
 * LOCAL    - The current EquippableVG's equipping status doesn't affect any other EquippableVG.
 * CATEGORY - In the containing category, if this EquippableVG is equipped, all other EquippableVGs are unequipped.
 * GLOBAL   - In the whole game, if this EquippableVG is equipped, all other EquippableVGs are unequipped.
 */
typedef enum {
    kLocal = 0,
    kCategory = 1,
    kGlobal = 2
} EquippingModel;
#define EquippingModelArray @"local", @"category", @"global", nil

/**
 * An Equippable virtual good is a special type of Lifetime Virtual good.
 * In addition to the fact that this virtual good can be purchased once, it can be equipped by your users.
 * - Equipping means that the user decides to currently use a specific virtual good.
 *
 * The EquippableVG's characteristics are:
 *  1. Can be purchased only once.
 *  2. Can be equipped by the user.
 *  3. Inherits the definition of LifetimeVG.
 *
 * There are 3 ways to equip an EquippableVG:
 *  1. LOCAL    - The current EquippableVG's equipping status doesn't affect any other EquippableVG.
 *  2. CATEGORY - In the containing category, if this EquippableVG is equipped, all other EquippableVGs are unequipped.
 *  3. GLOBAL   - In the whole game, if this EquippableVG is equipped, all other EquippableVGs are unequipped.
 *
 * - Example Usage: different characters (play with a specific character),
 *                  'binoculars' (users might only want to take them at night)
 *
 * This VirtualItem is purchasable.
 * In case you purchase this item in the App Store (PurchaseWithMarket), You need to define the app store item in
 * iTunes Connect. ( https://itunesconnect.apple.com )
 */
@interface EquippableVG : LifetimeVG {
    EquippingModel equippingModel;
}

@property EquippingModel equippingModel;

/** Constructor
 *
 * oEquippingModel is the way this EquippableVG is equipped.
 * oName see parent
 * oDescription see parent
 * oItemId see parent
 * oPurchaseType see parent
 */
- (id)initWithName:(NSString *)oName andDescription:(NSString *)oDescription
         andItemId:(NSString *)oItemId andPurchaseType:(PurchaseType *)oPurchaseType andEquippingModel:(EquippingModel)oEquippingModel;

/**
 * This function equips the current EquippableVG
 * throws NotEnoughGoodsException
 */
- (void)equip;
- (void)equipWithEvent:(BOOL)notify;

/**
 * This function unequips the current EquippableVG
 */
- (void)unequip;
- (void)unequipWithEvent:(BOOL)notify;

+(NSString*) equippingModelEnumToString:(EquippingModel)emVal;
+(EquippingModel) equippingModelStringToEnum:(NSString*)emStr;

@end
