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

#import "VirtualGood.h"

@class SingleUseVG;

/**
 * SingleUsePacks are just bundles of SingleUse virtual goods.
 * This kind of virtual good can be used to let your users buy more than one SingleUseVG at once.
 *
 * The SingleUsePackVG's characteristics are:
 *  1. Can be purchased unlimited number of times.
 *  2. Doesn't Have a balance in the database. The SingleUseVG there's associated with this pack has its own balance. When
 *      your users buy a SingleUsePackVG, the balance of the associated SingleUseVG goes up in the amount that this pack
 *      represents (mGoodAmount).
 *
 *  - Usage Examples: 'Box Of Chocolates', '10 Swords'
 *
 * This VirtualItem is purchasable.
 * In case you purchase this item in the App Store (PurchaseWithMarket), You need to define the app store item in
 * iTunes Connect. ( https://itunesconnect.apple.com )
 */
@interface SingleUsePackVG : VirtualGood {
    NSString* goodItemId;
    int amount;
}

@property (nonatomic, retain) NSString* goodItemId;
@property int amount;

/** Constructor
 *
 * oName see parent
 * oDescription see parent
 * oItemId see parent
 * oPurchaseType see parent
 * oGoodItemId is the SingleUseVG associated with this pack - MUST BE A SingleUseVG itemId !
 * oAmount is the number of SingleUseVG in the pack.
 */
- (id)initWithName:(NSString *)oName andDescription:(NSString *)oDescription andItemId:(NSString *)oItemId andPurchaseType:(PurchaseType *)oPurchaseType andSingleUseGood:(NSString*)oGoodItemId andAmount:(int)oAmount;

@end
