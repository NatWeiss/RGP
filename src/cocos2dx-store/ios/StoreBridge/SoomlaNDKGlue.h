//
// Created by Fedor Shubin on 5/24/13.
//


#import <Foundation/Foundation.h>
#include <string>

@interface SoomlaNDKGlue : NSObject
+ (NSObject *)dispatchNDKCall:(NSDictionary *)parameters;
+ (void)dispatchNDKCallback:(NSNotification*)notification;
@end
