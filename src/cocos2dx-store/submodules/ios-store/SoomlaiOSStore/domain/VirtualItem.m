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
#import "JSONConsts.h"

@implementation VirtualItem

@synthesize name, description, itemId;

- (id)init{
    self = [super init];
    if ([self class] == [VirtualItem class]) {
        @throw [NSException exceptionWithName:NSInternalInconsistencyException
                                       reason:@"Error, attempting to instantiate AbstractClass directly." userInfo:nil];
    }
    
    return self;
}

- (id)initWithName:(NSString*)oName andDescription:(NSString*)oDescription andItemId:(NSString*)oItemId {
    self = [super init];
    if ([self class] == [VirtualItem class]) {
        @throw [NSException exceptionWithName:NSInternalInconsistencyException
                                       reason:@"Error, attempting to instantiate AbstractClass directly." userInfo:nil];
    }
    
    if (self) {
        self.name = oName;
        self.description = oDescription;
        self.itemId = oItemId;
    }
    
    return self;
}


- (id)initWithDictionary:(NSDictionary*)dict{
    self = [super init];
    if ([self class] == [VirtualItem class]) {
        @throw [NSException exceptionWithName:NSInternalInconsistencyException
                                       reason:@"Error, attempting to instantiate AbstractClass directly." userInfo:nil];
    }
    
    if (self) {
        self.name = [dict objectForKey:JSON_ITEM_NAME];
        self.itemId = [dict objectForKey:JSON_ITEM_ITEMID];
        self.description = [dict objectForKey:JSON_ITEM_DESCRIPTION] ?: @"";
    }
    
    return self;
}

- (NSDictionary*)toDictionary{
    return [[NSDictionary alloc] initWithObjectsAndKeys:
            self.name, JSON_ITEM_NAME,
            self.description, JSON_ITEM_DESCRIPTION,
            self.itemId, JSON_ITEM_ITEMID,
            nil];
}

- (int)giveAmount:(int)amount {
    return [self giveAmount:amount withEvent:YES];
}
- (int)giveAmount:(int)amount withEvent:(BOOL)notify {
    @throw [NSException exceptionWithName:NSInternalInconsistencyException
                                   reason:[NSString stringWithFormat:@"You must override %@ in a subclass",
                                           NSStringFromSelector(_cmd)]
                                 userInfo:nil];
}

- (int)takeAmount:(int)amount {
    return [self takeAmount:amount withEvent:YES];
}
- (int)takeAmount:(int)amount withEvent:(BOOL)notify {
    @throw [NSException exceptionWithName:NSInternalInconsistencyException
                                   reason:[NSString stringWithFormat:@"You must override %@ in a subclass",
                                           NSStringFromSelector(_cmd)]
                                 userInfo:nil];
}


- (int)resetBalance:(int)balance {
    return [self resetBalance:balance withEvent:YES];
}
- (int)resetBalance:(int)balance withEvent:(BOOL)notify {
    @throw [NSException exceptionWithName:NSInternalInconsistencyException
                                   reason:[NSString stringWithFormat:@"You must override %@ in a subclass",
                                           NSStringFromSelector(_cmd)]
                                 userInfo:nil];
}

@end
