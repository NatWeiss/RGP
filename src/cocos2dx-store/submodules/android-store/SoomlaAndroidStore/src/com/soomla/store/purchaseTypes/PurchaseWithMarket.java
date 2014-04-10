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

package com.soomla.store.purchaseTypes;

import com.soomla.store.BusProvider;
import com.soomla.store.StoreController;
import com.soomla.store.StoreUtils;
import com.soomla.store.domain.MarketItem;
import com.soomla.store.events.ItemPurchaseStartedEvent;
import com.soomla.store.exceptions.InsufficientFundsException;

/**
 * This type of IabPurchase is used to let users purchase PurchasableVirtualItems with Google Play (with real $$).
 */
public class PurchaseWithMarket extends PurchaseType {

    /** Constructor
     *
     * @param productId is the productId to purchase in the Market.
     * @param price is the price in the Market.
     */
    public PurchaseWithMarket(String productId, double price) {
        mMarketItem = new MarketItem(productId, MarketItem.Managed.UNMANAGED, price);
    }

    /** Constructor
     *
     * @param marketItem is the representation of the item in Google Play.
     */
    public PurchaseWithMarket(MarketItem marketItem) {
        mMarketItem = marketItem;
    }

    /**
     * see parent
     */
    @Override
    public void buy() throws InsufficientFundsException {
        StoreUtils.LogDebug(TAG, "Starting in-app purchase for productId: " + mMarketItem.getProductId());
        
        BusProvider.getInstance().post(new ItemPurchaseStartedEvent(getAssociatedItem()));
        try {
            StoreController.getInstance().buyWithMarket(mMarketItem, "");
        } catch (IllegalStateException e) {
            StoreUtils.LogError(TAG, "Error when purchasing item");
        }
    }

    public MarketItem getMarketItem() {
        return mMarketItem;
    }

    private static final String TAG = "SOOMLA PurchaseWithMarket";

    private MarketItem mMarketItem;
}
