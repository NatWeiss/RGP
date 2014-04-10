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
 * An upgrade virtual good is one VG in a series of VGs that define an upgrade scale of an associated VirtualGood.
 *
 * This type of virtual good is best explained with an example:
 * Lets say you have a strength attribute to your character in the game and that strength is on the scale 1-5.
 * You want to provide your users with the ability to upgrade that strength. This is what you'll need to create:
 *  1. SingleUseVG for 'strength'
 *  2. UpgradeVG for strength 'level 1'
 *  3. UpgradeVG for strength 'level 2'
 *  4. UpgradeVG for strength 'level 3'
 *  5. UpgradeVG for strength 'level 4'
 *  6. UpgradeVG for strength 'level 5'
 *
 * Now, when the user buys this UpgradeVG, we check and make sure the appropriate conditions are met and buy it for you
 * (which actually means we upgrading the associated VirtualGood).
 *
 * This VirtualItem is purchasable.
 * In case you purchase this item in the App Store (PurchaseWithMarket), You need to define the app store item in
 * iTunes Connect. ( https://itunesconnect.apple.com )
 */
@interface UpgradeVG : LifetimeVG {
    NSString* goodItemId;
    NSString* prevGoodItemId;
    NSString* nextGoodItemId;
}

@property (nonatomic, retain) NSString* goodItemId;
@property (nonatomic, retain) NSString* prevGoodItemId;
@property (nonatomic, retain) NSString* nextGoodItemId;

/** Constructor
 *
 * oName see parent
 * oDescription see parent
 * oItemId see parent
 * oPurchaseType see parent
 * oGoodItemId is the itemId of the VirtualGood associated with this Upgrade. It can be any VirtualGood type.
 * oPrevItemId is the itemId of the previous UpgradeVG. MUST BE AN UpgardeVG's itemId !
 * oNextItemId is the itemId of the following UpgradeVG. MUST BE AN UpgardeVG's itemId !
 */
- (id)initWithName:(NSString *)oName andDescription:(NSString *)oDescription andItemId:(NSString *)oItemId andPurchaseType:(PurchaseType *)oPurchaseType andLinkedGood:(NSString*)oGoodItemId andPreviousUpgrade:(NSString*)oPrevItemId andNextUpgrade:(NSString*)oNextItemId;

@end
