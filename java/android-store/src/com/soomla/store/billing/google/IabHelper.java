/* Copyright (c) 2012 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.soomla.store.billing.google;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentSender.SendIntentException;
import android.content.ServiceConnection;
import android.content.SharedPreferences;
import android.os.*;
import android.text.TextUtils;

import com.android.vending.billing.IInAppBillingService;
import com.soomla.store.SoomlaApp;
import com.soomla.store.StoreConfig;
import com.soomla.store.StoreUtils;
import com.soomla.store.billing.IabException;
import com.soomla.store.billing.IabInventory;
import com.soomla.store.billing.IabPurchase;
import com.soomla.store.billing.IabResult;
import com.soomla.store.billing.IabSkuDetails;
import com.soomla.store.data.ObscuredSharedPreferences;

import org.json.JSONException;

import java.util.ArrayList;
import java.util.List;


/**
 * Provides convenience methods for in-app billing. You can create one instance of this
 * class for your application and use it to process in-app billing operations.
 * It provides synchronous (blocking) and asynchronous (non-blocking) methods for
 * many common in-app billing operations, as well as automatic signature
 * verification.
 *
 * After instantiating, you must perform setup in order to start using the object.
 * To perform setup, call the {@link #startSetup} method and provide a listener;
 * that listener will be notified when setup is complete, after which (and not before)
 * you may call other methods.
 *
 * After setup is complete, you will typically want to request an inventory of owned
 * items and subscriptions. See {@link #queryInventory}, {@link #queryInventoryAsync}
 * and related methods.
 *
 * When you are done with this object, don't forget to call {@link #dispose}
 * to ensure proper cleanup. This object holds a binding to the in-app billing
 * service, which will leak unless you dispose of it correctly. If you created
 * the object on an Activity's onCreate method, then the recommended
 * place to dispose of it is the Activity's onDestroy method.
 *
 * A note about threading: When using this object from a background thread, you may
 * call the blocking versions of methods; when using from a UI thread, call
 * only the asynchronous versions and handle the results via callbacks.
 * Also, notice that you can only call one asynchronous operation at a time;
 * attempting to start a second asynchronous operation while the first one
 * has not yet completed will result in an exception being thrown.
 *
 * @author Bruno Oliveira (Google)
 *
 */
public class IabHelper {
    private static String TAG = "IabHelper";

    // Is setup done?
    boolean mSetupDone = false;

    // Are subscriptions supported?
    boolean mSubscriptionsSupported = false;

    // Is an asynchronous operation in progress?
    // (only one at a time can be in progress)
    boolean mAsyncInProgress = false;

    // (for logging/debugging)
    // if mAsyncInP!?*.java;!?*.form;!?*.class;!?*.groovy;!?*.scala;!?*.flex;!?*.kt;!?*.cljrogress == true, what asynchronous operation is in progress?
    String mAsyncOperation = "";

    // Connection to the service
    IInAppBillingService mService;
    ServiceConnection mServiceConn;

    // The request code used to launch purchase flow
    int mRequestCode;

    // The item type of the current purchase flow
    String mPurchasingItemType;

    // The SKU of the item in the current purchase flow
    String mPurchasingItemSku;

    // Keys for the responses from InAppBillingService
    public static final String RESPONSE_CODE = "RESPONSE_CODE";
    public static final String RESPONSE_GET_SKU_DETAILS_LIST = "DETAILS_LIST";
    public static final String RESPONSE_BUY_INTENT = "BUY_INTENT";
    public static final String RESPONSE_INAPP_PURCHASE_DATA = "INAPP_PURCHASE_DATA";
    public static final String RESPONSE_INAPP_SIGNATURE = "INAPP_DATA_SIGNATURE";
    public static final String RESPONSE_INAPP_ITEM_LIST = "INAPP_PURCHASE_ITEM_LIST";
    public static final String RESPONSE_INAPP_PURCHASE_DATA_LIST = "INAPP_PURCHASE_DATA_LIST";
    public static final String RESPONSE_INAPP_SIGNATURE_LIST = "INAPP_DATA_SIGNATURE_LIST";
    public static final String INAPP_CONTINUATION_TOKEN = "INAPP_CONTINUATION_TOKEN";

    // Item types
    public static final String ITEM_TYPE_INAPP = "inapp";
    public static final String ITEM_TYPE_SUBS = "subs";

    // some fields on the getSkuDetails response bundle
    public static final String GET_SKU_DETAILS_ITEM_LIST = "ITEM_ID_LIST";
    public static final String GET_SKU_DETAILS_ITEM_TYPE_LIST = "ITEM_TYPE_LIST";

    /**
     * Creates an instance. After creation, it will not yet be ready to use. You must perform
     * setup by calling {@link #startSetup} and wait for setup to complete. This constructor does not
     * block and is safe to call from a UI thread.
     */
    public IabHelper() {
        StoreUtils.LogDebug(TAG, "IAB helper created.");
    }

    /**
     * Callback for setup process. This listener's {@link #onIabSetupFinished} method is called
     * when the setup process is complete.
     */
    public interface OnIabSetupFinishedListener {
        /**
         * Called to notify that setup is complete.
         *
         * @param result The result of the setup process.
         */
        public void onIabSetupFinished(IabResult result);
    }

    /**
     * Starts the setup process. This will start up the setup process asynchronously.
     * You will be notified through the listener when the setup process is complete.
     * This method is safe to call from a UI thread.
     *
     * @param listener The listener to notify when the setup process is complete.
     */
    public void startSetup(final OnIabSetupFinishedListener listener) {
        // If already set up, can't do it again.
        if (mSetupDone) throw new IllegalStateException("IAB helper is already set up.");

        // Connection to IAB service
        StoreUtils.LogDebug(TAG, "Starting in-app billing setup.");
        mServiceConn = new ServiceConnection() {
            @Override
            public void onServiceDisconnected(ComponentName name) {
                StoreUtils.LogDebug(TAG, "Billing service disconnected.");
                mService = null;
            }

            @Override
            public void onServiceConnected(ComponentName name, IBinder service) {
                StoreUtils.LogDebug(TAG, "Billing service connected.");
                mService = IInAppBillingService.Stub.asInterface(service);
                String packageName = SoomlaApp.getAppContext().getPackageName();
                try {
                    StoreUtils.LogDebug(TAG, "Checking for in-app billing 3 support.");

                    // check for in-app billing v3 support
                    int response = mService.isBillingSupported(3, packageName, ITEM_TYPE_INAPP);
                    if (response != IabResult.BILLING_RESPONSE_RESULT_OK) {
                        if (listener != null) {
                            listener.onIabSetupFinished(new IabResult(response,
                                    "Error checking for billing v3 support."));
                        }

                        // if in-app purchases aren't supported, neither are subscriptions.
                        mSubscriptionsSupported = false;
                        return;
                    }
                    StoreUtils.LogDebug(TAG, "In-app billing version 3 supported for " + packageName);

                    // check for v3 subscriptions support
                    response = mService.isBillingSupported(3, packageName, ITEM_TYPE_SUBS);
                    if (response == IabResult.BILLING_RESPONSE_RESULT_OK) {
                        StoreUtils.LogDebug(TAG, "Subscriptions AVAILABLE.");
                        mSubscriptionsSupported = true;
                    }
                    else {
                        StoreUtils.LogDebug(TAG, "Subscriptions NOT AVAILABLE. Response: " + response);
                    }

                    mSetupDone = true;
                }
                catch (RemoteException e) {
                    if (listener != null) {
                        listener.onIabSetupFinished(new IabResult(IabResult.IABHELPER_REMOTE_EXCEPTION,
                                                    "RemoteException while setting up in-app billing."));
                    }
                    e.printStackTrace();
                    return;
                }

                if (listener != null) {
                    listener.onIabSetupFinished(new IabResult(IabResult.BILLING_RESPONSE_RESULT_OK, "Setup successful."));
                }
            }
        };

        Intent serviceIntent = new Intent("com.android.vending.billing.InAppBillingService.BIND");
        serviceIntent.setPackage("com.android.vending");
        if (!SoomlaApp.getAppContext().getPackageManager().queryIntentServices(serviceIntent, 0).isEmpty()) {
            // service available to handle that Intent
            SoomlaApp.getAppContext().bindService(serviceIntent, mServiceConn, Context.BIND_AUTO_CREATE);
        }
        else {
            // no service available to handle that Intent
            if (listener != null) {
                listener.onIabSetupFinished(
                        new IabResult(IabResult.BILLING_RESPONSE_RESULT_BILLING_UNAVAILABLE,
                        "Billing service unavailable on device."));
            }
        }
    }

    /**
     * Dispose of object, releasing resources. It's very important to call this
     * method when you are done with this object. It will release any resources
     * used by it such as service connections. Naturally, once the object is
     * disposed of, it can't be used again.
     */
    public void dispose() {
        StoreUtils.LogDebug(TAG, "Disposing.");
        mSetupDone = false;
        if (mServiceConn != null) {
            StoreUtils.LogDebug(TAG, "Unbinding from service.");
            if (SoomlaApp.getAppContext() != null && mService != null) SoomlaApp.getAppContext().unbindService(mServiceConn);
            mServiceConn = null;
            mService = null;
            mPurchaseListener = null;
        }
    }

    /** Returns whether subscriptions are supported. */
    public boolean subscriptionsSupported() {
        return mSubscriptionsSupported;
    }


    /**
     * Callback that notifies when a purchase is finished.
     */
    public interface OnIabPurchaseFinishedListener {
        /**
         * Called to notify that an in-app purchase finished. If the purchase was successful,
         * then the sku parameter specifies which item was purchased. If the purchase failed,
         * the sku and extraData parameters may or may not be null, depending on how far the purchase
         * process went.
         *
         * @param result The result of the purchase.
         * @param info The purchase information (null if purchase failed)
         */
        public void onIabPurchaseFinished(IabResult result, IabPurchase info);
    }

    // The listener registered on launchPurchaseFlow, which we have to call back when
    // the purchase finishes
    OnIabPurchaseFinishedListener mPurchaseListener;

    public void launchPurchaseFlow(Activity act, String sku, int requestCode, OnIabPurchaseFinishedListener listener) {
        launchPurchaseFlow(act, sku, requestCode, listener, "");
    }

    public void launchPurchaseFlow(Activity act, String sku, int requestCode,
            OnIabPurchaseFinishedListener listener, String extraData) {
        launchPurchaseFlow(act, sku, ITEM_TYPE_INAPP, requestCode, listener, extraData);
    }

    public void launchSubscriptionPurchaseFlow(Activity act, String sku, int requestCode,
            OnIabPurchaseFinishedListener listener) {
        launchSubscriptionPurchaseFlow(act, sku, requestCode, listener, "");
    }

    public void launchSubscriptionPurchaseFlow(Activity act, String sku, int requestCode,
            OnIabPurchaseFinishedListener listener, String extraData) {
        launchPurchaseFlow(act, sku, ITEM_TYPE_SUBS, requestCode, listener, extraData);
    }

    /**
     * Initiate the UI flow for an in-app purchase. Call this method to initiate an in-app purchase,
     * which will involve bringing up the Google Play screen. The calling activity will be paused while
     * the user interacts with Google Play, and the result will be delivered via the activity's
     * {@link android.app.Activity#onActivityResult} method, at which point you must call
     * this object's {@link #handleActivityResult} method to continue the purchase flow. This method
     * MUST be called from the UI thread of the Activity.
     *
     * @param act The calling activity.
     * @param sku The sku of the item to purchase.
     * @param itemType indicates if it's a product or a subscription (ITEM_TYPE_INAPP or ITEM_TYPE_SUBS)
     * @param requestCode A request code (to differentiate from other responses --
     *     as in {@link android.app.Activity#startActivityForResult}).
     * @param listener The listener to notify when the purchase process finishes
     * @param extraData Extra data (developer payload), which will be returned with the purchase data
     *     when the purchase completes. This extra data will be permanently bound to that purchase
     *     and will always be returned when the purchase is queried.
     */
    public void launchPurchaseFlow(Activity act, String sku, String itemType, int requestCode,
                        OnIabPurchaseFinishedListener listener, String extraData) {
        checkSetupDone("launchPurchaseFlow");
        flagStartAsync("launchPurchaseFlow");
        IabResult result;

        if (itemType.equals(ITEM_TYPE_SUBS) && !mSubscriptionsSupported) {
            IabResult r = new IabResult(IabResult.IABHELPER_SUBSCRIPTIONS_NOT_AVAILABLE,
                    "Subscriptions are not available.");
            if (listener != null) listener.onIabPurchaseFinished(r, null);
            return;
        }

        try {
            StoreUtils.LogDebug(TAG, "Constructing buy intent for " + sku + ", item type: " + itemType);
            Bundle buyIntentBundle = mService.getBuyIntent(3, SoomlaApp.getAppContext().getPackageName(), sku, itemType, extraData);
            buyIntentBundle.putString("PURCHASE_SKU", sku);
            int response = getResponseCodeFromBundle(buyIntentBundle);
            if (response != IabResult.BILLING_RESPONSE_RESULT_OK) {
                StoreUtils.LogError(TAG, "Unable to buy item, Error response: " + IabResult.getResponseDesc(response));
                
                IabPurchase failPurchase = new IabPurchase(itemType, "{\"productId\":" + sku + "}", null);
                result = new IabResult(response, "Unable to buy item");
                if (listener != null) listener.onIabPurchaseFinished(result, failPurchase);
                // make sure to end the async operation...
                flagEndAsync();
                act.finish();
                return;
            }

            PendingIntent pendingIntent = buyIntentBundle.getParcelable(RESPONSE_BUY_INTENT);
            StoreUtils.LogDebug(TAG, "Launching buy intent for " + sku + ". Request code: " + requestCode);
            mRequestCode = requestCode;
            mPurchaseListener = listener;
            mPurchasingItemSku = sku;
            mPurchasingItemType = itemType;

            act.startIntentSenderForResult(pendingIntent.getIntentSender(),
                                           requestCode, new Intent(),
                                           Integer.valueOf(0), Integer.valueOf(0),
                                           Integer.valueOf(0));
        } catch (SendIntentException e) {
            StoreUtils.LogError(TAG, "SendIntentException while launching purchase flow for sku " + sku);
            e.printStackTrace();

            result = new IabResult(IabResult.IABHELPER_SEND_INTENT_FAILED, "Failed to send intent.");
            if (listener != null) listener.onIabPurchaseFinished(result, null);
        } catch (RemoteException e) {
            StoreUtils.LogError(TAG, "RemoteException while launching purchase flow for sku " + sku);
            e.printStackTrace();

            result = new IabResult(IabResult.IABHELPER_REMOTE_EXCEPTION, "Remote exception while starting purchase flow");
            if (listener != null) listener.onIabPurchaseFinished(result, null);
        } catch (JSONException e) {
            StoreUtils.LogError(TAG, "Failed to generate failing purchase.");
            e.printStackTrace();
            
            result = new IabResult(IabResult.IABHELPER_BAD_RESPONSE, "Failed to generate failing purchase.");
            if (mPurchaseListener != null) mPurchaseListener.onIabPurchaseFinished(result, null);
        }
    }

    /**
     * Handles an activity result that's part of the purchase flow in in-app billing. If you
     * are calling {@link #launchPurchaseFlow}, then you must call this method from your
     * Activity's {@link android.app.Activity@onActivityResult} method. This method
     * MUST be called from the UI thread of the Activity.
     *
     * @param requestCode The requestCode as you received it.
     * @param resultCode The resultCode as you received it.
     * @param data The data (Intent) as you received it.
     * @return Returns true if the result was related to a purchase flow and was handled;
     *     false if the result was not related to a purchase, in which case you should
     *     handle it normally.
     */
    public boolean handleActivityResult(int requestCode, int resultCode, Intent data) {
        IabResult result;
        if (requestCode != mRequestCode) return false;

        checkSetupDone("handleActivityResult");

        // end of async purchase operation
        flagEndAsync();

        if (data == null) {
            StoreUtils.LogError(TAG, "Null data in IAB activity result.");
            result = new IabResult(IabResult.IABHELPER_BAD_RESPONSE, "Null data in IAB result");
            if (mPurchaseListener != null) mPurchaseListener.onIabPurchaseFinished(result, null);
            return true;
        }

        int responseCode = getResponseCodeFromIntent(data);
        String purchaseData = data.getStringExtra(RESPONSE_INAPP_PURCHASE_DATA);
        String dataSignature = data.getStringExtra(RESPONSE_INAPP_SIGNATURE);

        if (resultCode == Activity.RESULT_OK && responseCode == IabResult.BILLING_RESPONSE_RESULT_OK) {
            StoreUtils.LogDebug(TAG, "Successful resultcode from purchase activity.");
            StoreUtils.LogDebug(TAG, "IabPurchase data: " + purchaseData);
            StoreUtils.LogDebug(TAG, "Data signature: " + dataSignature);
            StoreUtils.LogDebug(TAG, "Extras: " + data.getExtras());
            StoreUtils.LogDebug(TAG, "Expected item type: " + mPurchasingItemType);

            if (purchaseData == null || dataSignature == null) {
                StoreUtils.LogError(TAG, "BUG: either purchaseData or dataSignature is null.");
                StoreUtils.LogDebug(TAG, "Extras: " + data.getExtras().toString());
                result = new IabResult(IabResult.IABHELPER_UNKNOWN_ERROR, "IAB returned null purchaseData or dataSignature");
                if (mPurchaseListener != null) mPurchaseListener.onIabPurchaseFinished(result, null);
                return true;
            }

            IabPurchase purchase = null;
            try {
                purchase = new IabPurchase(mPurchasingItemType, purchaseData, dataSignature);
                String sku = purchase.getSku();

                SharedPreferences prefs = new ObscuredSharedPreferences(
                        SoomlaApp.getAppContext().getSharedPreferences(StoreConfig.PREFS_NAME, Context.MODE_PRIVATE));
                String publicKey = prefs.getString(StoreConfig.PUBLIC_KEY, "");

                // Verify signature
                if (!Security.verifyPurchase(publicKey, purchaseData, dataSignature)) {
                    StoreUtils.LogError(TAG, "IabPurchase signature verification FAILED for sku " + sku);
                    result = new IabResult(IabResult.IABHELPER_VERIFICATION_FAILED, "Signature verification failed for sku " + sku);
                    if (mPurchaseListener != null) mPurchaseListener.onIabPurchaseFinished(result, purchase);
                    return true;
                }
                StoreUtils.LogDebug(TAG, "IabPurchase signature successfully verified.");
            }
            catch (JSONException e) {
                StoreUtils.LogError(TAG, "Failed to parse purchase data.");
                e.printStackTrace();
                result = new IabResult(IabResult.IABHELPER_BAD_RESPONSE, "Failed to parse purchase data.");
                if (mPurchaseListener != null) mPurchaseListener.onIabPurchaseFinished(result, null);
                return true;
            }

            if (mPurchaseListener != null) {
                mPurchaseListener.onIabPurchaseFinished(new IabResult(IabResult.BILLING_RESPONSE_RESULT_OK, "Success"), purchase);
            }
        }
        else if (resultCode == Activity.RESULT_OK) {
            // result code was OK, but in-app billing response was not OK.
            StoreUtils.LogDebug(TAG, "Result code was OK but in-app billing response was not OK: " + IabResult.getResponseDesc(responseCode));
            if (mPurchaseListener != null) {
                result = new IabResult(responseCode, "Problem purchashing item.");
                mPurchaseListener.onIabPurchaseFinished(result, null);
            }
        }
        else if (resultCode == Activity.RESULT_CANCELED) {
            StoreUtils.LogDebug(TAG, "IabPurchase canceled. Response: " + IabResult.getResponseDesc(responseCode));
            try {
                IabPurchase purchase = new IabPurchase(mPurchasingItemType, "{\"productId\":" + mPurchasingItemSku + "}", null);
                result = new IabResult(IabResult.BILLING_RESPONSE_RESULT_USER_CANCELED, "User canceled.");
                if (mPurchaseListener != null) mPurchaseListener.onIabPurchaseFinished(result, purchase);
            } catch (JSONException e) {
                StoreUtils.LogError(TAG, "Failed to generate canceled purchase.");
                e.printStackTrace();
                result = new IabResult(IabResult.IABHELPER_BAD_RESPONSE, "Failed to generate canceled purchase.");
                if (mPurchaseListener != null) mPurchaseListener.onIabPurchaseFinished(result, null);
                return true;
            }
        }
        else {
            StoreUtils.LogError(TAG, "IabPurchase failed. Result code: " + Integer.toString(resultCode)
                    + ". Response: " + IabResult.getResponseDesc(responseCode));
            result = new IabResult(IabResult.IABHELPER_UNKNOWN_PURCHASE_RESPONSE, "Unknown purchase response.");
            if (mPurchaseListener != null) mPurchaseListener.onIabPurchaseFinished(result, null);
        }
        return true;
    }

    public IabInventory queryInventory(boolean querySkuDetails, List<String> moreSkus) throws IabException {
        return queryInventory(querySkuDetails, moreSkus, null);
    }

    /**
     * Queries the inventory. This will query all owned items from the server, as well as
     * information on additional skus, if specified. This method may block or take long to execute.
     * Do not call from a UI thread. For that, use the non-blocking version {@link #queryInventoryAsync}.
     *
     * @param querySkuDetails if true, SKU details (price, description, etc) will be queried as well
     *     as purchase information.
     * @param moreItemSkus additional PRODUCT skus to query information on, regardless of ownership.
     *     Ignored if null or if querySkuDetails is false.
     * @param moreSubsSkus additional SUBSCRIPTIONS skus to query information on, regardless of ownership.
     *     Ignored if null or if querySkuDetails is false.
     * @throws IabException if a problem occurs while refreshing the inventory.
     */
    public IabInventory queryInventory(boolean querySkuDetails, List<String> moreItemSkus,
                                        List<String> moreSubsSkus) throws IabException {
        checkSetupDone("queryInventory");
        try {
            IabInventory inv = new IabInventory();
            int r = queryPurchases(inv, ITEM_TYPE_INAPP);
            if (r != IabResult.BILLING_RESPONSE_RESULT_OK) {
                throw new IabException(r, "Error refreshing inventory (querying owned items).");
            }

            if (querySkuDetails) {
                r = querySkuDetails(ITEM_TYPE_INAPP, inv, moreItemSkus);
                if (r != IabResult.BILLING_RESPONSE_RESULT_OK) {
                    throw new IabException(r, "Error refreshing inventory (querying prices of items).");
                }
            }

            // if subscriptions are supported, then also query for subscriptions
            if (mSubscriptionsSupported) {
                r = queryPurchases(inv, ITEM_TYPE_SUBS);
                if (r != IabResult.BILLING_RESPONSE_RESULT_OK) {
                    throw new IabException(r, "Error refreshing inventory (querying owned subscriptions).");
                }

                if (querySkuDetails) {
                    r = querySkuDetails(ITEM_TYPE_SUBS, inv, moreItemSkus);
                    if (r != IabResult.BILLING_RESPONSE_RESULT_OK) {
                        throw new IabException(r, "Error refreshing inventory (querying prices of subscriptions).");
                    }
                }
            }

            return inv;
        }
        catch (RemoteException e) {
            throw new IabException(IabResult.IABHELPER_REMOTE_EXCEPTION, "Remote exception while refreshing inventory.", e);
        }
        catch (JSONException e) {
            throw new IabException(IabResult.IABHELPER_BAD_RESPONSE, "Error parsing JSON response while refreshing inventory.", e);
        }
    }

    /**
     * Listener that notifies when an inventory query operation completes.
     */
    public interface QueryInventoryFinishedListener {
        /**
         * Called to notify that an inventory query operation completed.
         *
         * @param result The result of the operation.
         * @param inv The inventory.
         */
        public void onQueryInventoryFinished(IabResult result, IabInventory inv);
    }


    /**
     * Asynchronous wrapper for inventory query. This will perform an inventory
     * query as described in {@link #queryInventory}, but will do so asynchronously
     * and call back the specified listener upon completion. This method is safe to
     * call from a UI thread.
     *
     * @param querySkuDetails as in {@link #queryInventory}
     * @param moreSkus as in {@link #queryInventory}
     * @param listener The listener to notify when the refresh operation completes.
     */
    public void queryInventoryAsync(final boolean querySkuDetails,
                               final List<String> moreSkus,
                               final QueryInventoryFinishedListener listener) {
        final Handler handler = new Handler(Looper.getMainLooper());
        checkSetupDone("queryInventory");
        flagStartAsync("refresh inventory");
        (new Thread(new Runnable() {
            public void run() {
                IabResult result = new IabResult(IabResult.BILLING_RESPONSE_RESULT_OK, "IabInventory refresh successful.");
                IabInventory inv = null;
                try {
                    inv = queryInventory(querySkuDetails, moreSkus);
                }
                catch (IabException ex) {
                    result = ex.getResult();
                }

                flagEndAsync();

                final IabResult result_f = result;
                final IabInventory inv_f = inv;
                handler.post(new Runnable() {
                    public void run() {
                        listener.onQueryInventoryFinished(result_f, inv_f);
                    }
                });
            }
        })).start();
    }

    public void queryInventoryAsync(QueryInventoryFinishedListener listener) {
        queryInventoryAsync(true, null, listener);
    }

    public void queryInventoryAsync(boolean querySkuDetails, QueryInventoryFinishedListener listener) {
        queryInventoryAsync(querySkuDetails, null, listener);
    }


    /**
     * Consumes a given in-app product. Consuming can only be done on an item
     * that's owned, and as a result of consumption, the user will no longer own it.
     * This method may block or take long to return. Do not call from the UI thread.
     * For that, see {@link #consumeAsync}.
     *
     * @param itemInfo The PurchaseInfo that represents the item to consume.
     * @throws IabException if there is a problem during consumption.
     */
     public void consume(IabPurchase itemInfo) throws IabException {
        checkSetupDone("consume");

        if (!itemInfo.getItemType().equals(ITEM_TYPE_INAPP)) {
            throw new IabException(IabResult.IABHELPER_INVALID_CONSUMPTION,
                    "Items of type '" + itemInfo.getItemType() + "' can't be consumed.");
        }

        try {
            String token = itemInfo.getToken();
            String sku = itemInfo.getSku();
            if (token == null || token.equals("")) {
               StoreUtils.LogError(TAG, "Can't consume "+ sku + ". No token.");
               throw new IabException(IabResult.IABHELPER_MISSING_TOKEN, "PurchaseInfo is missing token for sku: "
                   + sku + " " + itemInfo);
            }

            StoreUtils.LogDebug(TAG, "Consuming sku: " + sku + ", token: " + token);
            int response = mService.consumePurchase(3, SoomlaApp.getAppContext().getPackageName(), token);
            if (response == IabResult.BILLING_RESPONSE_RESULT_OK) {
               StoreUtils.LogDebug(TAG, "Successfully consumed sku: " + sku);
            }
            else {
               StoreUtils.LogDebug(TAG, "Error consuming consuming sku " + sku + ". " + IabResult.getResponseDesc(response));
               throw new IabException(response, "Error consuming sku " + sku);
            }
        }
        catch (RemoteException e) {
            throw new IabException(IabResult.IABHELPER_REMOTE_EXCEPTION, "Remote exception while consuming. PurchaseInfo: " + itemInfo, e);
        }
    }

    /**
     * Callback that notifies when a consumption operation finishes.
     */
    public interface OnConsumeFinishedListener {
        /**
         * Called to notify that a consumption has finished.
         *
         * @param purchase The purchase that was (or was to be) consumed.
         * @param result The result of the consumption operation.
         */
        public void onConsumeFinished(IabPurchase purchase, IabResult result);
    }

    /**
     * Callback that notifies when a multi-item consumption operation finishes.
     */
    public interface OnConsumeMultiFinishedListener {
        /**
         * Called to notify that a consumption of multiple items has finished.
         *
         * @param purchases The purchases that were (or were to be) consumed.
         * @param results The results of each consumption operation, corresponding to each
         *     sku.
         */
        public void onConsumeMultiFinished(List<IabPurchase> purchases, List<IabResult> results);
    }

    /**
     * Asynchronous wrapper to item consumption. Works like {@link #consume}, but
     * performs the consumption in the background and notifies completion through
     * the provided listener. This method is safe to call from a UI thread.
     *
     * @param purchase The purchase to be consumed.
     * @param listener The listener to notify when the consumption operation finishes.
     */
    public void consumeAsync(IabPurchase purchase, OnConsumeFinishedListener listener) {
        checkSetupDone("consume");
        List<IabPurchase> purchases = new ArrayList<IabPurchase>();
        purchases.add(purchase);
        consumeAsyncInternal(purchases, listener, null);
    }

    /**
     * Same as {@link #consumeAsync}, but for multiple items at once.
     * @param purchases The list of PurchaseInfo objects representing the purchases to consume.
     * @param listener The listener to notify when the consumption operation finishes.
     */
    public void consumeAsync(List<IabPurchase> purchases, OnConsumeMultiFinishedListener listener) {
        checkSetupDone("consume");
        consumeAsyncInternal(purchases, null, listener);
    }




    // Checks that setup was done; if not, throws an exception.
    void checkSetupDone(String operation) {
        if (!mSetupDone) {
            StoreUtils.LogError(TAG, "Illegal state for operation (" + operation + "): IAB helper is not set up.");
            throw new IllegalStateException("IAB helper is not set up. Can't perform operation: " + operation);
        }
    }

    // Workaround to bug where sometimes response codes come as Long instead of Integer
    int getResponseCodeFromBundle(Bundle b) {
        Object o = b.get(RESPONSE_CODE);
        if (o == null) {
            StoreUtils.LogDebug(TAG, "Bundle with null response code, assuming OK (known issue)");
            return IabResult.BILLING_RESPONSE_RESULT_OK;
        }
        else if (o instanceof Integer) return ((Integer)o).intValue();
        else if (o instanceof Long) return (int)((Long)o).longValue();
        else {
            StoreUtils.LogError(TAG, "Unexpected type for bundle response code.");
            StoreUtils.LogError(TAG, o.getClass().getName());
            throw new RuntimeException("Unexpected type for bundle response code: " + o.getClass().getName());
        }
    }

    // Workaround to bug where sometimes response codes come as Long instead of Integer
    int getResponseCodeFromIntent(Intent i) {
        Object o = i.getExtras().get(RESPONSE_CODE);
        if (o == null) {
            StoreUtils.LogError(TAG, "Intent with no response code, assuming OK (known issue)");
            return IabResult.BILLING_RESPONSE_RESULT_OK;
        }
        else if (o instanceof Integer) return ((Integer)o).intValue();
        else if (o instanceof Long) return (int)((Long)o).longValue();
        else {
            StoreUtils.LogError(TAG, "Unexpected type for intent response code.");
            StoreUtils.LogError(TAG, o.getClass().getName());
            throw new RuntimeException("Unexpected type for intent response code: " + o.getClass().getName());
        }
    }

    void flagStartAsync(String operation) {
        if (mAsyncInProgress) throw new IllegalStateException("Can't start async operation (" +
                operation + ") because another async operation(" + mAsyncOperation + ") is in progress.");
        mAsyncOperation = operation;
        mAsyncInProgress = true;
        StoreUtils.LogDebug(TAG, "Starting async operation: " + operation);
    }

    void flagEndAsync() {
        StoreUtils.LogDebug(TAG, "Ending async operation: " + mAsyncOperation);
        mAsyncOperation = "";
        mAsyncInProgress = false;
    }

    int queryPurchases(IabInventory inv, String itemType) throws JSONException, RemoteException {
        // Query purchases
        StoreUtils.LogDebug(TAG, "Querying owned items, item type: " + itemType);
        StoreUtils.LogDebug(TAG, "Package name: " + SoomlaApp.getAppContext().getPackageName());
        boolean verificationFailed = false;
        String continueToken = null;

        do {
            StoreUtils.LogDebug(TAG, "Calling getPurchases with continuation token: " + continueToken);
            Bundle ownedItems = mService.getPurchases(3, SoomlaApp.getAppContext().getPackageName(),
                    itemType, continueToken);

            int response = getResponseCodeFromBundle(ownedItems);
            StoreUtils.LogDebug(TAG, "Owned items response: " + String.valueOf(response));
            if (response != IabResult.BILLING_RESPONSE_RESULT_OK) {
                StoreUtils.LogDebug(TAG, "getPurchases() failed: " + IabResult.getResponseDesc(response));
                return response;
            }
            if (!ownedItems.containsKey(RESPONSE_INAPP_ITEM_LIST)
                    || !ownedItems.containsKey(RESPONSE_INAPP_PURCHASE_DATA_LIST)
                    || !ownedItems.containsKey(RESPONSE_INAPP_SIGNATURE_LIST)) {
                StoreUtils.LogError(TAG, "Bundle returned from getPurchases() doesn't contain required fields.");
                return IabResult.IABHELPER_BAD_RESPONSE;
            }

            ArrayList<String> ownedSkus = ownedItems.getStringArrayList(
                        RESPONSE_INAPP_ITEM_LIST);
            ArrayList<String> purchaseDataList = ownedItems.getStringArrayList(
                        RESPONSE_INAPP_PURCHASE_DATA_LIST);
            ArrayList<String> signatureList = ownedItems.getStringArrayList(
                        RESPONSE_INAPP_SIGNATURE_LIST);

            SharedPreferences prefs = new ObscuredSharedPreferences(
                    SoomlaApp.getAppContext().getSharedPreferences(StoreConfig.PREFS_NAME, Context.MODE_PRIVATE));
            String publicKey = prefs.getString(StoreConfig.PUBLIC_KEY, "");
            for (int i = 0; i < purchaseDataList.size(); ++i) {
                String purchaseData = purchaseDataList.get(i);
                String signature = signatureList.get(i);
                String sku = ownedSkus.get(i);
                if (Security.verifyPurchase(publicKey, purchaseData, signature)) {
                    StoreUtils.LogDebug(TAG, "Sku is owned: " + sku);
                    IabPurchase purchase = new IabPurchase(itemType, purchaseData, signature);

                    if (TextUtils.isEmpty(purchase.getToken())) {
                        StoreUtils.LogWarning(TAG, "BUG: empty/null token!");
                        StoreUtils.LogDebug(TAG, "IabPurchase data: " + purchaseData);
                    }

                    // Record ownership and token
                    inv.addPurchase(purchase);
                }
                else {
                    StoreUtils.LogWarning(TAG, "IabPurchase signature verification **FAILED**. Not adding item.");
                    StoreUtils.LogDebug(TAG, "   IabPurchase data: " + purchaseData);
                    StoreUtils.LogDebug(TAG, "   Signature: " + signature);
                    verificationFailed = true;
                }
            }

            continueToken = ownedItems.getString(INAPP_CONTINUATION_TOKEN);
            StoreUtils.LogDebug(TAG, "Continuation token: " + continueToken);
        } while (!TextUtils.isEmpty(continueToken));

        return verificationFailed ? IabResult.IABHELPER_VERIFICATION_FAILED : IabResult.BILLING_RESPONSE_RESULT_OK;
    }

    int querySkuDetails(String itemType, IabInventory inv, List<String> moreSkus)
                                throws RemoteException, JSONException {
        StoreUtils.LogDebug(TAG, "Querying SKU details.");
        ArrayList<String> skuList = new ArrayList<String>();
        skuList.addAll(inv.getAllOwnedSkus(itemType));
        if (moreSkus != null) skuList.addAll(moreSkus);

        if (skuList.size() == 0) {
            StoreUtils.LogDebug(TAG, "queryPrices: nothing to do because there are no SKUs.");
            return IabResult.BILLING_RESPONSE_RESULT_OK;
        }

        Bundle querySkus = new Bundle();
        querySkus.putStringArrayList(GET_SKU_DETAILS_ITEM_LIST, skuList);
        Bundle skuDetails = mService.getSkuDetails(3, SoomlaApp.getAppContext().getPackageName(),
                itemType, querySkus);

        if (!skuDetails.containsKey(RESPONSE_GET_SKU_DETAILS_LIST)) {
        	int response = getResponseCodeFromBundle(skuDetails);
            if (response != IabResult.BILLING_RESPONSE_RESULT_OK) {
                StoreUtils.LogDebug(TAG, "getSkuDetails() failed: " + IabResult.getResponseDesc(response));
                return response;
            }
            else {
            	StoreUtils.LogError(TAG, "getSkuDetails() returned a bundle with neither an error nor a detail list.");
                return IabResult.IABHELPER_BAD_RESPONSE;
            }
        }

        ArrayList<String> responseList = skuDetails.getStringArrayList(
                RESPONSE_GET_SKU_DETAILS_LIST);

        for (String thisResponse : responseList) {
            IabSkuDetails d = new IabSkuDetails(itemType, thisResponse);
            StoreUtils.LogDebug(TAG, "Got sku details: " + d);
            inv.addSkuDetails(d);
        }
        return IabResult.BILLING_RESPONSE_RESULT_OK;
    }

    void consumeAsyncInternal(final List<IabPurchase> purchases,
                              final OnConsumeFinishedListener singleListener,
                              final OnConsumeMultiFinishedListener multiListener) {
        final Handler handler = new Handler();
        flagStartAsync("consume");
        (new Thread(new Runnable() {
            public void run() {
                final List<IabResult> results = new ArrayList<IabResult>();
                for (IabPurchase purchase : purchases) {
                    try {
                        consume(purchase);
                        results.add(new IabResult(IabResult.BILLING_RESPONSE_RESULT_OK, "Successful consume of sku " + purchase.getSku()));
                    }
                    catch (IabException ex) {
                        results.add(ex.getResult());
                    }
                }

                flagEndAsync();
                if (singleListener != null) {
                    handler.post(new Runnable() {
                        public void run() {
                            singleListener.onConsumeFinished(purchases.get(0), results.get(0));
                        }
                    });
                }
                if (multiListener != null) {
                    handler.post(new Runnable() {
                        public void run() {
                            multiListener.onConsumeMultiFinished(purchases, results);
                        }
                    });
                }
            }
        })).start();
    }

    public boolean isAsyncInProgress() {
        return mAsyncInProgress;
    }
}
