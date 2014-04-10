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

#import "NonConsumableItem.h"
#import "StorageManager.h"
#import "NonConsumableStorage.h"
#import "StoreUtils.h"

@implementation NonConsumableItem

static NSString* TAG = @"SOOMLA NonConsumableItem";

- (id)initWithName:(NSString*)oName andDescription:(NSString*)oDescription
         andItemId:(NSString*)oItemId andPurchaseType:(PurchaseType*)oPurchaseType {
    if (self = [super initWithName:oName andDescription:oDescription andItemId:oItemId andPurchaseType:oPurchaseType]) {
        
    }
    
    return self;
}

- (id)initWithDictionary:(NSDictionary*)dict {
    if (self = [super initWithDictionary:dict]) {
        
    }
    
    return self;
}

- (NSDictionary*)toDictionary {
    return [super toDictionary];
}

- (int)giveAmount:(int)amount withEvent:(BOOL)notify {
    return [[[StorageManager getInstance] nonConsumableStorage] add:self];
}

- (int)takeAmount:(int)amount withEvent:(BOOL)notify {
    return [[[StorageManager getInstance] nonConsumableStorage] remove:self];
}

- (int)resetBalance:(int)balance withEvent:(BOOL)notify {
    if (balance > 0) {
        return [[[StorageManager getInstance] nonConsumableStorage] add:self];
    } else {
        return [[[StorageManager getInstance] nonConsumableStorage] remove:self];
    }
}

- (BOOL)canBuy {
    if ([[[StorageManager getInstance] nonConsumableStorage] nonConsumableExists:self]) {
        LogDebug(TAG, @"You can't buy a NonConsumableItem that was already given to the user.");
        return NO;
    }
    
    return YES;
}

@end
