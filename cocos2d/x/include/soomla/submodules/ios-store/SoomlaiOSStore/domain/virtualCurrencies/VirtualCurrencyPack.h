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

#import "PurchasableVirtualItem.h"

@class VirtualCurrency;

/**
 * Every game has its virtualCurrencies. Here you represent a pack of a specific VirtualCurrency.
 * For example: If you have a "Coin" as a virtual currency, you will
 * sell packs of "Coins". e.g. "10 Coins Set" or "Super Saver Pack".
 *
 * This VirtualItem is purchasable.
 * In case you purchase this item in the App Store (PurchaseWithMarket), You need to define the app store item in
 * iTunes Connect. ( https://itunesconnect.apple.com )
 */
@interface VirtualCurrencyPack : PurchasableVirtualItem{
    int     currencyAmount;
    NSString* currencyItemId;
}

@property int     currencyAmount;
@property (retain, nonatomic) NSString* currencyItemId;

/** Constructor
 *
 * oName see parent
 * oDescription see parent
 * oItemId see parent
 * oCurrencyAmount is the amount of currency in the pack.
 * oCurrencyItemId is the itemId of the currency associated with this pack.
 * oPurchaseType see parent
 */
- (id)initWithName:(NSString*)oName andDescription:(NSString*)oDescription
     andItemId:(NSString*)oItemId andCurrencyAmount:(int)oCurrencyAmount andCurrency:(NSString*)oCurrencyItemId
     andPurchaseType:(PurchaseType*)oPurchaseType;

/** Constructor
 *
 * see parent
 */
- (id)initWithDictionary:(NSDictionary*)dict;

/**
 * see parent
 */
- (NSDictionary*)toDictionary;

@end
