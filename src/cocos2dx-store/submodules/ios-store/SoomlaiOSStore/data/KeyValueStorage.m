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

#import "KeyValueStorage.h"
#import "KeyValDatabase.h"
#import "StoreEncryptor.h"
#import "StorageManager.h"
#import "KeyValDatabase.h"
#import "ObscuredNSUserDefaults.h"
#import "StoreConfig.h"

@implementation KeyValueStorage

@synthesize kvDatabase;

- (id)init{
    self = [super init];
    if (self){
        self.kvDatabase = [[KeyValDatabase alloc] init];
        
        int mt_ver = [ObscuredNSUserDefaults intForKey:@"MT_VER" withDefaultValue:0];
        int sa_ver_old = [ObscuredNSUserDefaults intForKey:@"SA_VER_OLD" withDefaultValue:-1];
        int sa_ver_new = [ObscuredNSUserDefaults intForKey:@"SA_VER_NEW" withDefaultValue:1];
        if (mt_ver < METADATA_VERSION || sa_ver_old < sa_ver_new) {
            [ObscuredNSUserDefaults setInt:METADATA_VERSION forKey:@"MT_VER"];
            [ObscuredNSUserDefaults setInt:sa_ver_new forKey:@"SA_VER_OLD"];
            
            [kvDatabase deleteKeyValWithKey:[StoreEncryptor encryptString:[KeyValDatabase keyMetaStoreInfo]]];
        }
    }
    
    return self;
}

- (NSString*)getValueForKey:(NSString*)key {
    key = [StoreEncryptor encryptString:key];
    NSString* val = [kvDatabase getValForKey:key];
    if (val && [val length]>0){
        return [StoreEncryptor decryptToString:val];
    }
    
    return NULL;
}

- (void)setValue:(NSString*)val forKey:(NSString*)key {
    key = [StoreEncryptor encryptString:key];
    [kvDatabase setVal:[StoreEncryptor encryptString:val] forKey:key];
}

- (void)deleteValueForKey:(NSString*)key {
    key = [StoreEncryptor encryptString:key];
    [kvDatabase deleteKeyValWithKey:key];
}

- (NSDictionary*)getKeysValuesForNonEncryptedQuery:(NSString*)query {
    NSDictionary* dbResults = [kvDatabase getKeysValsForQuery:query];
    NSMutableDictionary* results = [NSMutableDictionary dictionary];
    NSArray* keys = [dbResults allKeys];
    for (NSString* key in keys) {
        NSString* val = [dbResults objectForKey:key];
        if (val && [val length]>0){
            NSString* valDec = [StoreEncryptor decryptToString:val];
            if (valDec && [valDec length]>0){
                [results setObject:valDec forKey:key];
            }
        }
    }
    
    return results;
}

- (NSArray*)getValuesForNonEncryptedQuery:(NSString*)query {
    NSArray* vals = [kvDatabase getValsForQuery:query];
    NSMutableArray* results = [NSMutableArray array];
    for (NSString* val in vals) {
        if (val && [val length]>0){
            NSString* valDec = [StoreEncryptor decryptToString:val];
            if (valDec && [valDec length]>0){
                [results addObject:valDec];
            }
        }
    }
    
    return results;
}


- (NSString*)getValueForNonEncryptedKey:(NSString*)key {
    NSString* val = [kvDatabase getValForKey:key];
    if (val && [val length]>0){
        return [StoreEncryptor decryptToString:val];
    }
    
    return NULL;
}

- (void)setValue:(NSString*)val forNonEncryptedKey:(NSString*)key {
    [kvDatabase setVal:[StoreEncryptor encryptString:val] forKey:key];
}

- (void)deleteValueForNonEncryptedKey:(NSString*)key {
    [kvDatabase deleteKeyValWithKey:key];
}

@end
