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
#import <sqlite3.h>

/**
 * The KeyValDatabase provides basic key-value store above SQLite.
 */
@interface KeyValDatabase : NSObject{
@private
    sqlite3 *database;
}

- (id)init;

/**
 * Sets the given value to the given key
 *
 * key is the key of the key-val pair.
 * val is the val of the key-val pair.
 */
- (void)setVal:(NSString *)val forKey:(NSString *)key;

/**
 * Gets the value for the given key.
 *
 * key the key of the key-val pair.
 */
- (NSString*)getValForKey:(NSString *)key;
- (NSDictionary*)getKeysValsForQuery:(NSString*)query;
- (NSArray*)getValsForQuery:(NSString*)query;
- (void)deleteKeyValWithKey:(NSString *)key;


/** SOOMLA keys **/

+ (NSString*) keyGoodBalance:(NSString*)itemId;
+ (NSString*) keyGoodEquipped:(NSString*)itemId;
+ (NSString*) keyGoodUpgrade:(NSString*)itemId;
+ (NSString*) keyCurrencyBalance:(NSString*)itemId;
+ (NSString*) keyNonConsExists:(NSString*)productId;
+ (NSString*) keyMetaStoreInfo;
+ (NSString*) keyMetaStorefrontInfo;

@end
