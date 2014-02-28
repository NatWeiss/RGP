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

#ifndef __StoreInventoryBridge__
#define __StoreInventoryBridge__

#include <string>
#import "VirtualItemNotFoundException.h"

using namespace std;

class StoreInventoryBridge {
public:
    static void buy(string itemId);
    static int getItemBalance(string itemId);
    static void giveItem(string itemId, int amount);
    static void takeItem(string itemId, int amount);
    static void equipVirtualGood(string goodItemId);
    static void unEquipVirtualGood(string goodItemId);
    static bool isVirtualGoodEquipped(string goodItemId);
    static int getGoodUpgradeLevel(string goodItemId) ;
    static string getGoodCurrentUpgrade(string goodItemId);
    static void upgradeVirtualGood(string goodItemId);
    static void removeUpgrades(string goodItemId);
    static bool nonConsumableItemExists(string nonConsItemId);
    static void addNonConsumableItem(string nonConsItemId) ;
    static void removeNonConsumableItem(string nonConsItemId);    
};

#endif
