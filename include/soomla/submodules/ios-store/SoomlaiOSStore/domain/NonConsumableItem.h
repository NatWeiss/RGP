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

/**
 * A representation of a non-consumable item in the App Store. 
 * These kinds of items are bought by the user once and kept for him forever.
 *
 * Don't get confused... this is not a Lifetime VirtualGood. It's an item in the App Store.
 * This item will be retrieved when you "restoreTransactions"
 */
@interface NonConsumableItem : PurchasableVirtualItem {
}

/** Constructor
 *
 * oName see parent
 * oDescription see parent
 * oItemId see parent
 * oPurchaseType see parent
 */
- (id)initWithName:(NSString*)oName andDescription:(NSString*)oDescription
                andItemId:(NSString*)oItemId andPurchaseType:(PurchaseType*)oPurchaseType;

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
