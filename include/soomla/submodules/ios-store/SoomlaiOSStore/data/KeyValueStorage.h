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

@class KeyValDatabase;

/**
 * This class provides basic storage operations for a simple key-value store.
 */
@interface KeyValueStorage : NSObject {
    KeyValDatabase* kvDatabase;
}

@property (nonatomic, retain)KeyValDatabase* kvDatabase;

/**
 * Fetch the value for the given key.
 * key is the key in the key-val pair.
 */
- (NSString*)getValueForKey:(NSString*)key;

/**
 * Sets the given value to the given key.
 * key is the key in the key-val pair.
 * val is the val in the key-val pair.
 */
- (void)setValue:(NSString*)val forKey:(NSString*)key;

/**
 * Deletes a key-val pair with the given key.
 * key is the key in the key-val pair.
 */
- (void)deleteValueForKey:(NSString*)key;

- (NSDictionary*)getKeysValuesForNonEncryptedQuery:(NSString*)query;
- (NSArray*)getValuesForNonEncryptedQuery:(NSString*)query;

/**
 * Fetch the value for the given key.
 * key is the key in the key-val pair.
 */
- (NSString*)getValueForNonEncryptedKey:(NSString*)key;

/**
 * Sets the given value to the given key.
 * key is the key in the key-val pair.
 * val is the val in the key-val pair.
 */
- (void)setValue:(NSString*)val forNonEncryptedKey:(NSString*)key;

/**
 * Deletes a key-val pair with the given key.
 * key is the key in the key-val pair.
 */
- (void)deleteValueForNonEncryptedKey:(NSString*)key;

@end
