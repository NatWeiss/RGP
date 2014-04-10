//
//  EventDispatcherBridge.m
//  Trying
//
//  Created by Refael Dakar on 12/03/13.
//
//

#include <iostream>
#include <string>
#import "EventDispatcherBridge.h"
#import "EventHandling.h"
#import "CCEventHandler.h"
#import "VirtualCurrencyPack.h"
#import "MarketItem.h"
#import "VirtualGood.h"
#import "VirtualCurrency.h"
#import "UpgradeVG.h"
#import "EquippableVG.h"
#import "PurchasableVirtualItem.h"
#import "SoomlaNDKGlue.h"

@implementation EventDispatcherBridge

+ (EventDispatcherBridge *)sharedInstance {
    static EventDispatcherBridge * instance = nil;
    if (!instance) {
        instance = [[EventDispatcherBridge alloc] init];
    }
    return instance;
}


- (id) init {
    if (self = [super init]) {
        [EventHandling observeAllEventsWithObserver:self withSelector:@selector(eventFired:)];
    }
    
    return self;
}

- (void)eventFired:(NSNotification*)notification{
    [SoomlaNDKGlue dispatchNDKCallback:notification];
}


@end
