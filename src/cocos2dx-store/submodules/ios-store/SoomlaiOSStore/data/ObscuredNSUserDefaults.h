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

@interface ObscuredNSUserDefaults : NSObject {
}

+ (BOOL)boolForKey:(NSString *)defaultName withDefaultValue:(BOOL)def;
+ (NSString*)stringForKey:(NSString *)defaultName withDefaultValue:(NSString*)def;
+ (void)setBool:(BOOL)value forKey:(NSString *)defaultName;
+ (void)setString:(NSString*)value forKey:(NSString *)defaultName;
+ (int)intForKey:(NSString *)defaultName withDefaultValue:(int)def;
+ (int)intForKey:(NSString *)defaultName withDefaultValue:(int)def andDeviceId:(NSString*)deviceId;
+ (void)setInt:(int)value forKey:(NSString *)defaultName;
+ (long long)longlongForKey:(NSString *)defaultName withDefaultValue:(long long)def;
+ (void)setLongLong:(long long)value forKey:(NSString *)defaultName;

@end
