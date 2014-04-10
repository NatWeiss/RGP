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

#import "StoreUtils.h"
#import "StoreConfig.h"
#import "OpenUDID.h"
#import "ObscuredNSUserDefaults.h"
#import <UIKit/UIKit.h>

@implementation StoreUtils

static NSString* TAG = @"SOOMLA StoreUtils";

+ (void)LogDebug:(NSString*)tag withMessage:(NSString*)msg {
    if (STORE_DEBUG_LOG) {
        NSLog(@"[Debug] %@: %@", tag, msg);
    }
}

+ (void)LogError:(NSString*)tag withMessage:(NSString*)msg {
    NSLog(@"[*** ERROR ***] %@: %@", tag, msg);
}

+ (NSString*)deviceIdPreferVendor {
    if ([[UIDevice currentDevice] respondsToSelector:@selector(identifierForVendor)]) {
        return [[[UIDevice currentDevice] identifierForVendor] UUIDString];
    } else {
        return [SOOM_OpenUDID value];
    }
}

/* We check for UDID_SOOMLA to support devices with older versions of ios-store */
+ (NSString*)deviceId {
    NSString* udid = [[NSUserDefaults standardUserDefaults] stringForKey:@"UDID_SOOMLA"];
    if (!udid || [udid length] == 0) {
	return [self deviceIdPreferVendor];
    }
    return udid;
}

+ (NSMutableDictionary*)jsonStringToDict:(NSString*)str {
    NSError* error = NULL;
    NSMutableDictionary *dict =
    [NSJSONSerialization JSONObjectWithData: [str dataUsingEncoding:NSUTF8StringEncoding]
                                    options: NSJSONReadingMutableContainers
                                      error: &error];
    if (error) {
        LogError(TAG, ([NSString stringWithFormat:@"There was a problem parsing the given JSON string: %@ error: %@", str, [error localizedDescription]]));
        
        return NULL;
    }
    
    return dict;
}

+ (NSMutableArray*)jsonStringToArray:(NSString*)str {
    NSError* error = NULL;
    NSMutableArray *arr =
    [NSJSONSerialization JSONObjectWithData: [str dataUsingEncoding:NSUTF8StringEncoding]
                                    options: NSJSONReadingMutableContainers
                                      error: &error];
    if (error) {
        LogError(TAG, ([NSString stringWithFormat:@"There was a problem parsing the given JSON string: %@ error: %@", str, [error localizedDescription]]));
        
        return NULL;
    }
    
    return arr;
}

+ (NSString*)dictToJsonString:(NSDictionary*)dict {
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:dict
                                                       options:NSJSONWritingPrettyPrinted
                                                         error:&error];
    
    if (! jsonData) {
        LogError(TAG, ([NSString stringWithFormat:@"There was a problem parsing the given NSDictionary. error: %@", [error localizedDescription]]));
        
        return NULL;
    }
    
    return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
}

+ (NSString*)arrayToJsonString:(NSArray*)arr {
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:arr
                                                       options:NSJSONWritingPrettyPrinted
                                                         error:&error];
    
    if (! jsonData) {
        LogError(TAG, ([NSString stringWithFormat:@"There was a problem parsing the given NSArray. error: %@", [error localizedDescription]]));
        
        return NULL;
    }
    
    return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
}

@end
