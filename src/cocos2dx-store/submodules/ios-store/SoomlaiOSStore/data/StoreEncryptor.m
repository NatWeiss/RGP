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

#import "StoreEncryptor.h"
#import "StoreConfig.h"
#import <CommonCrypto/CommonCryptor.h>
#import "FBEncryptorAES.h"
#import "ObscuredNSUserDefaults.h"
#import "StoreUtils.h"

@implementation StoreEncryptor

/*
 * The encryption key is comprised of the custom secret and a unique global identifier for the specific application.
 * NOTE: change the custom secret in StoreConfig.h.
 */
+ (NSString*)key
{
    return [[ObscuredNSUserDefaults stringForKey:@"ISU#LL#SE#REI" withDefaultValue:@""] stringByAppendingString:[StoreUtils deviceId]];
}

+ (NSString *)encryptString:(NSString *)data{
    @synchronized(self) {
        return [FBEncryptorAES encryptBase64String:data
                                         keyString:[self key]
                                     separateLines:NO];
    }
}

+ (NSString *)decryptToString:(NSString *)data{
    @synchronized(self) {
        return [FBEncryptorAES decryptBase64String:data
                                         keyString:[self key]];
    }
}

+ (NSString *)encryptNumber:(NSNumber *)data{
    @synchronized(self) {
        return [self encryptString:[data stringValue]];
    }
}

+ (NSNumber *)decryptToNumber:(NSString *)data{
    @synchronized(self) {
        data = [self decryptToString:data];
        NSNumberFormatter * f = [[NSNumberFormatter alloc] init];
        [f setNumberStyle:NSNumberFormatterDecimalStyle];
        return [f numberFromString:data];
    }
}

+ (NSString *)encryptBoolean:(BOOL)data{
    @synchronized(self) {
        return [self encryptString:[[NSNumber numberWithBool:data] stringValue]];
    }
}

+ (BOOL)decryptToBoolean:(NSString *)data{
    @synchronized(self) {
        data = [self decryptToString:data];
        NSNumber *res = [NSNumber numberWithInt:[data intValue]];
        return [res boolValue];
    }
}

@end


