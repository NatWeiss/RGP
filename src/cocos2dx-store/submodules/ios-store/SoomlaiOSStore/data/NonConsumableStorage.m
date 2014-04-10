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

#import "NonConsumableStorage.h"
#import "StorageManager.h"
#import "NonConsumableItem.h"
#import "StoreUtils.h"
#import "KeyValueStorage.h"
#import "KeyValDatabase.h"

@implementation NonConsumableStorage

static NSString* TAG = @"SOOMLA NonConsumableStorage";

- (BOOL)nonConsumableExists:(NonConsumableItem*)nonConsumableItem{
    LogDebug(TAG, @"trying to figure out if the given NonConsumable item exists.")
    
    NSString* key = [KeyValDatabase keyNonConsExists:nonConsumableItem.itemId];
    NSString* val = [[[StorageManager getInstance] keyValueStorage] getValueForKey:key];
    return val != nil;
}

- (BOOL)add:(NonConsumableItem*)nonConsumableItem{
    LogDebug(TAG, ([NSString stringWithFormat:@"Adding NonConsumabel %@", nonConsumableItem.itemId]));
    
    NSString* key = [KeyValDatabase keyNonConsExists:nonConsumableItem.itemId];
    [[[StorageManager getInstance] keyValueStorage] setValue:@"" forKey:key];
    return 1;
}

- (BOOL)remove:(NonConsumableItem*)nonConsumableItem{
    LogDebug(TAG, ([NSString stringWithFormat:@"Removing NonConsumabel %@", nonConsumableItem.itemId]));
    
    NSString* key = [KeyValDatabase keyNonConsExists:nonConsumableItem.itemId];
    [[[StorageManager getInstance] keyValueStorage] deleteValueForKey:key];
    return 0;
}


@end
