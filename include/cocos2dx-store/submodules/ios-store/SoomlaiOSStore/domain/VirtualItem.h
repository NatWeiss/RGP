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

/** ABSTRACT
 * This class is the parent of all virtual items in the application.
 */
@interface VirtualItem : NSObject {
    NSString* name;
    NSString* description;
    NSString* itemId;
}

@property (retain, nonatomic) NSString* name;
@property (retain, nonatomic) NSString* description;
@property (retain, nonatomic) NSString* itemId;


- (id)init;

/** Constructor
 *
 * oName is the name of the virtual item.
 * oDescription is the description of the virtual item. If you use SOOMLA's storefront, This will show up
 *                       in the store in the description section.
 * oItemId is the itemId of the virtual item.
 */
- (id)initWithName:(NSString*)oName andDescription:(NSString*)oDescription andItemId:(NSString*)oItemId;

/** Constructor
 *
 * Generates an instance of VirtualItem from a NSDictionary.
 * dict is a NSDictionary representation of the wanted VirtualItem.
 */
- (id)initWithDictionary:(NSDictionary*)dict;

/**
 * Converts the current VirtualItem to a NSDictionary.
 */
- (NSDictionary*)toDictionary;

/**
 * By performing this action, you give your user a curtain amount of the specific VirtualItem.
 * The giving process is different from the "buy" process. You just give your user something and you get
 * nothing in return.
 * amount is the amount of the specific item to be given.
 */
- (int)giveAmount:(int)amount;
- (int)giveAmount:(int)amount withEvent:(BOOL)notify;

/**
 * By performing this action, you take curtain amount of the specific VirtualItem from your user.
 * amount is the amount of the specific item to be taken.
 */
- (int)takeAmount:(int)amount;
- (int)takeAmount:(int)amount withEvent:(BOOL)notify;

/**
 * This function resets the balance to the given balance.
 * balance is the balance of the current virtual item.
 */
- (int)resetBalance:(int)balance;
- (int)resetBalance:(int)balance withEvent:(BOOL)notify;
@end
