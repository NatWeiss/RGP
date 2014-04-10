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

/**
 * This class is a definition of a category. A single category can be associated with many virtual goods.
 * The purposes of virtual category is it to arrange virtual goods to their specific categories.
 */
@interface VirtualCategory : NSObject{
    NSString* name;
    NSArray*  goodsItemIds;
}

@property (retain, nonatomic) NSString* name;
@property (retain, nonatomic) NSArray*  goodsItemIds;

/** Constructor
 *
 * oName is the category's name.
 * oGoodsItemIds is the list of itemIds of VirtualGoods in this category.
 */
- (id)initWithName:(NSString*)oName andGoodsItemIds:(NSArray*)oGoodsItemIds;

/** Constructor
 *
 * Generates an instance of VirtualCategory from a NSDictionary.
 * dict is a NSDictionary representation of the wanted VirtualCategory.
 */
- (id)initWithDictionary:(NSDictionary*)dict;

/**
 * Converts the current VirtualCategory to a NSDictionary.
 */
- (NSDictionary*)toDictionary;

@end
