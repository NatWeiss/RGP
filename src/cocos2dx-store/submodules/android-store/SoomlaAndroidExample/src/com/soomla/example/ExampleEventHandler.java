package com.soomla.example;


import android.os.Handler;
import android.widget.Toast;
import com.soomla.store.BusProvider;
import com.soomla.store.SoomlaApp;
import com.soomla.store.StoreConfig;
import com.soomla.store.events.*;
import com.squareup.otto.Subscribe;


public class ExampleEventHandler {

    private Handler mHandler;
    private StoreExampleActivity mActivityI;
    public ExampleEventHandler(Handler handler, StoreExampleActivity activityI){
        mHandler = handler;
        mActivityI = activityI;

        BusProvider.getInstance().register(this);
    }

    @Subscribe
    public void onMarketPurchase(MarketPurchaseEvent marketPurchaseEvent) {
        showToastIfDebug(marketPurchaseEvent.getPurchasableVirtualItem().getName() + " was just purchased");
    }

    @Subscribe
    public void onMarketRefund(MarketRefundEvent marketRefundEvent) {
        showToastIfDebug(marketRefundEvent.getPurchasableVirtualItem().getName() + " was just refunded");
    }

    @Subscribe
    public void onVirtualItemPurchased(ItemPurchasedEvent itemPurchasedEvent) {
        showToastIfDebug(itemPurchasedEvent.getPurchasableVirtualItem().getName() + " was just purchased");
    }

    @Subscribe
    public void onVirtualGoodEquipped(GoodEquippedEvent virtualGoodEquippedEvent) {
        showToastIfDebug(virtualGoodEquippedEvent.getGood().getName() + " was just equipped");
    }

    @Subscribe
    public void onVirtualGoodUnequipped(GoodUnEquippedEvent virtualGoodUnEquippedEvent) {
        showToastIfDebug(virtualGoodUnEquippedEvent.getGood().getName() + " was just unequipped");
    }

    @Subscribe
    public void onBillingSupported(BillingSupportedEvent billingSupportedEvent) {
        showToastIfDebug("Billing is supported");
    }

    @Subscribe
    public void onBillingNotSupported(BillingNotSupportedEvent billingNotSupportedEvent) {
        showToastIfDebug("Billing is not supported");
    }

    @Subscribe
    public void onMarketPurchaseStarted(MarketPurchaseStartedEvent marketPurchaseStartedEvent) {
        showToastIfDebug("Market purchase started for: " + marketPurchaseStartedEvent.getPurchasableVirtualItem().getName());
    }

    @Subscribe
    public void onMarketPurchaseCancelled(MarketPurchaseCancelledEvent marketPurchaseCancelledEvent) {
        showToastIfDebug("Market purchase cancelled for: " + marketPurchaseCancelledEvent.getPurchasableVirtualItem().getName());
    }

    @Subscribe
    public void onItemPurchaseStarted(ItemPurchaseStartedEvent itemPurchaseStartedEvent) {
        showToastIfDebug("Item purchase started for: " + itemPurchaseStartedEvent.getPurchasableVirtualItem().getName());
    }

    @Subscribe
    public void onUnexpectedErrorInStore(UnexpectedStoreErrorEvent unexpectedStoreErrorEvent) {
        showToastIfDebug("Unexpected error occurred !");
    }

    @Subscribe
    public void onIabServiceStarted(IabServiceStartedEvent iabServiceStartedEvent) {
        showToastIfDebug("Iab Service started");
    }
	
    @Subscribe
    public void onIabServiceStopped(IabServiceStoppedEvent iabServiceStoppedEvent) {
        showToastIfDebug("Iab Service stopped");
    }

    @Subscribe
    public void onCurrencyBalanceChanged(CurrencyBalanceChangedEvent currencyBalanceChangedEvent) {
        showToastIfDebug("(currency) " + currencyBalanceChangedEvent.getCurrency().getName() + " balance was changed to " + currencyBalanceChangedEvent.getBalance() + ".");
    }

    @Subscribe
    public void onGoodBalanceChanged(GoodBalanceChangedEvent goodBalanceChangedEvent) {
        showToastIfDebug("(good) " + goodBalanceChangedEvent.getGood().getName() + " balance was changed to " + goodBalanceChangedEvent.getBalance() + ".");
    }

    @Subscribe
    public void onRestoreTransactionsFinished(RestoreTransactionsFinishedEvent restoreTransactionsFinishedEvent) {
        showToastIfDebug("restoreTransactions: " + restoreTransactionsFinishedEvent.isSuccess() + ".");
    }

    @Subscribe
    public void onRestoreTransactionsStarted(RestoreTransactionsStartedEvent restoreTransactionsStartedEvent) {
        showToastIfDebug("restoreTransactions Started");
    }

    @Subscribe
    public void onStoreControllerInitialized(StoreControllerInitializedEvent storeControllerInitializedEvent) {
        String [] s = {"no_ads"};
//        StoreController.getInstance().getItemDetails(s);
        showToastIfDebug("storeControllerInitialized");
    }

    private void showToastIfDebug(final String msg) {
        if (StoreConfig.logDebug){
            mHandler.post(new Runnable() {
                @Override
                public void run() {
                    Toast toast = Toast.makeText(SoomlaApp.getAppContext(), msg, 2000);
                    toast.show();
                }
            });
        }
    }
}
