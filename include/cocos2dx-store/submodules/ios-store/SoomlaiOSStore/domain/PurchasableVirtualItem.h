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

#import "VirtualItem.h"

@class PurchaseType;

/** ABSTRACT
 * A representation of an VirtualItem you can actually purchase.
 */
@interface PurchasableVirtualItem : VirtualItem {
    PurchaseType* purchaseType;
}

@property (retain, nonatomic) PurchaseType* purchaseType;

/** Constructor
 *
 * oName see parent
 * oDescription see parent
 * oItemId see parent
 * oPurchaseType is the way this item is purchased.
 */
- (id)initWithName:(NSString *)oName andDescription:(NSString *)oDescription
         andItemId:(NSString *)oItemId andPurchaseType:(PurchaseType*)oPurchaseType;

/**
 * see parent
 */
- (id)initWithDictionary:(NSDictionary*)dict;

/**
 * see parent
 */
- (NSDictionary*)toDictionary;

/**
 * Use this function to buy a Virtual Item. This action uses the associated PurchaseType to perform the purchase.
 *
 * throws InsufficientFundsException
 */
- (void)buy;

/**
 * Determines if you are in a states that allows you to buy a specific VirtualItem.
 */
- (BOOL)canBuy;

@end
