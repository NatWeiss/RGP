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
 * SingleUse virtual goods are the most common type of VirtualGood.
 *
 * The SingleUseVG's characteristics are:
 *  1. Can be purchased unlimited number of times.
 *  2. Has a balance and saved in the database. Its balance goes up when you "give" it or "buy" it. The balance goes
 *      down when it's taken or refunded (in case of an unfriendly refund).
 *
 * - Usage Examples: 'Hat', 'Sword'
 *
 * This VirtualItem is purchasable.
 * In case you purchase this item in the App Store (PurchaseWithMarket), You need to define the app store item in
 * iTunes Connect. ( https://itunesconnect.apple.com )
 */
@interface SingleUseVG : VirtualGood {
    
}

@end
