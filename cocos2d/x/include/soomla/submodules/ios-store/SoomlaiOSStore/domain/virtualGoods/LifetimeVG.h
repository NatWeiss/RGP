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

#import "VirtualGood.h"

/**
 * A Lifetime virtual good is a special time that allows you to offer virtual goods that are bought only once.
 *
 * The LifetimeVG's characteristics are:
 *  1. Can only be purchased once.
 *  2. Your users can't have more than one of this item. In other words, (0 <= [LifetimeVG's balance] <= 1) == true.
 *
 * - Example usage: 'No Ads', 'Double Coins'
 *
 * This VirtualItem is purchasable.
 * In case you purchase this item in the App Store (PurchaseWithMarket), You need to define the app store item in
 * iTunes Connect. ( https://itunesconnect.apple.com )
 */
@interface LifetimeVG : VirtualGood

@end
