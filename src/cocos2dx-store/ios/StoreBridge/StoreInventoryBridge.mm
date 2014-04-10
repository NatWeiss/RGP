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

#include "StoreInventoryBridge.h"

#import "StoreInventory.h"
#import "VirtualItemNotFoundException.h"
#import "InsufficientFundsException.h"
#import "NotEnoughGoodsException.h"


/**
 * This implementation is used to let cocos2dx functions perform actions on StoreInventory.
 *
 * You can see the documentation of every function in StoreInventory.
 */

void StoreInventoryBridge::buy(string itemId) {
    @try {
        NSString * str = [[NSString alloc] initWithBytes:itemId.c_str() length:strlen(itemId.c_str()) encoding:NSUTF8StringEncoding];
        [StoreInventory buyItemWithItemId:str];
    }
    @catch (VirtualItemNotFoundException *ex1) {
        @throw ex1;;
    }
    @catch (InsufficientFundsException *ex2) {
        @throw ex2;
    }
}

int StoreInventoryBridge::getItemBalance(string itemId) {
    @try {
        NSString * str = [[NSString alloc] initWithBytes:itemId.c_str() length:strlen(itemId.c_str()) encoding:NSUTF8StringEncoding];
        return [StoreInventory getItemBalance:str];
    }
    @catch (VirtualItemNotFoundException *ex1) {
        @throw ex1;
    }
}

void StoreInventoryBridge::giveItem(string itemId, int amount) {
    @try {
        NSString * str = [[NSString alloc] initWithBytes:itemId.c_str() length:strlen(itemId.c_str()) encoding:NSUTF8StringEncoding];
        [StoreInventory giveAmount:amount ofItem:str];
    }
    @catch (VirtualItemNotFoundException *ex1) {
        @throw ex1;
    }
}

void StoreInventoryBridge::takeItem(string itemId, int amount) {
    @try {
        NSString * str = [[NSString alloc] initWithBytes:itemId.c_str() length:strlen(itemId.c_str()) encoding:NSUTF8StringEncoding];
        [StoreInventory takeAmount:amount ofItem:str];
    }
    @catch (VirtualItemNotFoundException *ex1) {
        @throw ex1;
    }
}

void StoreInventoryBridge::equipVirtualGood(string goodItemId) {
    @try {
        NSString * str = [[NSString alloc] initWithBytes:goodItemId.c_str() length:strlen(goodItemId.c_str()) encoding:NSUTF8StringEncoding];
        [StoreInventory equipVirtualGoodWithItemId:str];
    }
    @catch (VirtualItemNotFoundException *ex1) {
        @throw ex1;
    }
    @catch (NotEnoughGoodsException *ex2) {
        @throw ex2;
    }
}

void StoreInventoryBridge::unEquipVirtualGood(string goodItemId) {
    @try {
        NSString * str = [[NSString alloc] initWithBytes:goodItemId.c_str() length:strlen(goodItemId.c_str()) encoding:NSUTF8StringEncoding];
        [StoreInventory unEquipVirtualGoodWithItemId:str];
    }
    @catch (VirtualItemNotFoundException *ex1) {
        @throw ex1;
    }
}

bool StoreInventoryBridge::isVirtualGoodEquipped(string goodItemId) {
    @try {
        NSString * str = [[NSString alloc] initWithBytes:goodItemId.c_str() length:strlen(goodItemId.c_str()) encoding:NSUTF8StringEncoding];
        return [StoreInventory isVirtualGoodWithItemIdEquipped:str];
    }
    @catch (VirtualItemNotFoundException *ex1) {
        @throw ex1;
    }
}

int StoreInventoryBridge::getGoodUpgradeLevel(string goodItemId) {
    @try {
        NSString * str = [[NSString alloc] initWithBytes:goodItemId.c_str() length:strlen(goodItemId.c_str()) encoding:NSUTF8StringEncoding];
        return [StoreInventory goodUpgradeLevel:str];
    }
    @catch (VirtualItemNotFoundException *ex1) {
        @throw ex1;
    }
}

string StoreInventoryBridge::getGoodCurrentUpgrade(string goodItemId) {
    @try {
        NSString * str = [[NSString alloc] initWithBytes:goodItemId.c_str() length:strlen(goodItemId.c_str()) encoding:NSUTF8StringEncoding];
        NSString* vguItemId = [StoreInventory goodCurrentUpgrade:str];
        return [vguItemId UTF8String];
    }
    @catch (VirtualItemNotFoundException *exception) {
        @throw exception;
    }
}

void StoreInventoryBridge::upgradeVirtualGood(string goodItemId) {
    @try {
        NSString * str = [[NSString alloc] initWithBytes:goodItemId.c_str() length:strlen(goodItemId.c_str()) encoding:NSUTF8StringEncoding];
        [StoreInventory upgradeVirtualGood:str];
    }
    @catch (VirtualItemNotFoundException *ex1) {
        @throw ex1;
    }
    @catch (InsufficientFundsException *ex2) {
        @throw ex2;
    }
}

void StoreInventoryBridge::removeUpgrades(string goodItemId) {
    @try {
        NSString * str = [[NSString alloc] initWithBytes:goodItemId.c_str() length:strlen(goodItemId.c_str()) encoding:NSUTF8StringEncoding];
        [StoreInventory removeUpgrades:str];
    }
    @catch (VirtualItemNotFoundException *ex1) {
        @throw ex1;
    }
}

bool StoreInventoryBridge::nonConsumableItemExists(string nonConsItemId) {
    @try {
        NSString * str = [[NSString alloc] initWithBytes:nonConsItemId.c_str() length:strlen(nonConsItemId.c_str()) encoding:NSUTF8StringEncoding];
        return [StoreInventory nonConsumableItemExists:str];
    }
    @catch (VirtualItemNotFoundException *ex1) {
        @throw ex1;
    }
}

void StoreInventoryBridge::addNonConsumableItem(string nonConsItemId) {
    @try {
        NSString * str = [[NSString alloc] initWithBytes:nonConsItemId.c_str() length:strlen(nonConsItemId.c_str()) encoding:NSUTF8StringEncoding];
        [StoreInventory addNonConsumableItem:str];
    }
    @catch (VirtualItemNotFoundException *ex1) {
        @throw ex1;
    }
}

void StoreInventoryBridge::removeNonConsumableItem(string nonConsItemId) {
    @try {
        NSString * str = [[NSString alloc] initWithBytes:nonConsItemId.c_str() length:strlen(nonConsItemId.c_str()) encoding:NSUTF8StringEncoding];
        [StoreInventory removeNonConsumableItem:str];
    }
    @catch (VirtualItemNotFoundException *ex1) {
        @throw ex1;
    }
}

