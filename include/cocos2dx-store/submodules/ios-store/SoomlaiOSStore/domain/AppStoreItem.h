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

typedef enum {
    kConsumable = 1,
    kNonConsumable = 2,
    kAutoRenewableSubscription = 3,
    kNonRenewableSubscription = 4,
    kFreeSubscription = 5
} Consumable;

/**
 * This class represents an item in the App Store.
 * Every PurchasableVirtualItem with PurchaseType of PurchaseWithMarket has an instance of this class which is a
 * representation of the same currency pack as an item on the App Store.
 */
@interface AppStoreItem : NSObject{
    NSString* productId;
    Consumable consumable;
    double  price;
}

@property (nonatomic, retain) NSString* productId;
@property Consumable consumable;
@property double  price;

/** Constructor
 *
 * oProductId is the Id of the current item in the App Store.
 * oConsumable is the type of the current item in the App Store.
 * oPrice is the actual $$ cost of the current item in the App Store.
 */
- (id)initWithProductId:(NSString*)oProductId andConsumable:(Consumable)oConsumable andPrice:(double)oPrice;
- (id)initWithDictionary:(NSDictionary*)dict;
- (NSDictionary*)toDictionary;

@end
