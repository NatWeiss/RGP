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

 import java.util.List;

 /**
  * A utility class that defines interfaces for passing callbacks
  * to in-app billing events.
  */
public class IabCallbacks {

    public interface IabInitListener {
        public void success(boolean alreadyInBg);
        public void fail(String message);
    }


    public interface OnPurchaseListener {
        public void success(IabPurchase purchase);
        public void cancelled(IabPurchase purchase);
        public void alreadyOwned(IabPurchase purchase);
        public void fail(String message);
    }

    public interface OnQueryInventoryListener {
        public void success(List<IabPurchase> purchases, List<IabSkuDetails> skuDetails);
        public void fail(String message);
    }

    public interface OnConsumeListener {
        public void success(IabPurchase purchase);
        public void fail(String message);
    }

}
