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
package com.soomla.store.billing;

import android.app.Activity;
import android.content.Intent;

import java.util.List;

/**
 * This interface defines the functionality that needs to be implemented in
 * orders to create an in-app billing service (e.g. Google Play, Amazon, Samsung Apps...)
 */
public interface IIabService {

    public boolean isIabServiceInitialized();

    public void consume(IabPurchase purchase) throws IabException;

    public void consumeAsync(IabPurchase purchase, final IabCallbacks.OnConsumeListener consumeListener);

    public boolean handleActivityResult(int requestCode, int resultCode, Intent data);

    public void launchPurchaseFlow(Activity act,
                                   String sku,
                                   final IabCallbacks.OnPurchaseListener purchaseListener,
                                   String extraData);

    public void queryInventoryAsync(boolean querySkuDetails,
                                    List<String> moreSkus,
                                    IabCallbacks.OnQueryInventoryListener queryInventoryListener);

    public void initializeBillingService(IabCallbacks.IabInitListener initListener);

    public void startIabServiceInBg(IabCallbacks.IabInitListener initListener);

    public void stopIabServiceInBg(IabCallbacks.IabInitListener initListener);

}
