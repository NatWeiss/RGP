*This project is a part of [The SOOMLA Project](http://project.soom.la) which is a series of open source initiatives with a joint goal to help mobile game developers get better stores and more in-app purchases.*

Haven't you ever wanted an in-app purchase one liner that looks like this!?

```Java
    StoreInventory.buy("[itemId]");
```

## android-store

**April 1st, 2014**: We've added the option to refresh market items details from the IAB Service (default is Google Play). You can call 'refreshInventory(true)' from StoreController when you want and all your PurchasableItems that has a PurchaseType of PurchaseWithMarket will update the values of: MarketPrice, MarketTitle, MarketDescription. android-store automatically running the operation when you intialize StoreController.

**March 26th, 2014**: We've split out Google Play to a plugin so we'll be able to add more billing providers to android-store.  http://blog.soom.la/2014/03/google-play-will-not-be-the-only-option-for-long.html

**December 11th, 2013**: Refunds have been readded. *android-store* now checks if owned items have been refunded and takes them away when `StoreController` is initialized.

> Note: removal of refunded items may take a while due to the way IABv3 caches information on the device. Try disabling and enabling WiFi on the device to refresh the cache.

The current virtual economny model is called **modelV3**. Want to learn more about it? Try these:  
* [Economy Model Objects](https://github.com/soomla/android-store/wiki/Economy-Model-Objects)  
* [Handling Store Operations](https://github.com/soomla/android-store/wiki/Handling-Store-Operations)

android-store is an open code initiative as part of The SOOMLA Project. It is a Java API that simplifies Google Play's in-app purchasing API and compliments it with storage, security and event handling. The project also includes a sample app for reference. 


Check out our [Wiki] (https://github.com/soomla/android-store/wiki) for more information about the project and how to use it better.

## Getting Started

* Before doing anything, SOOMLA recommends that you go through [Android In-app Billing](http://developer.android.com/guide/google/play/billing/index.html).

1. Recursively clone android-store. Copy all files from android-store/SoomlaAndroidStore subfolders to their equivalent folders in your Android project:

 `git clone --recursive git@github.com:soomla/android-store.git`
 
 	> This will clone android-store and android-store-google-play which is the default billing provider.

2. Make the following changes to your AndroidManifest.xml:

  Set `SoomlaApp` as the main Application by placing it in the `application` tag:

    ```xml
    <application ...
                 android:name="com.soomla.store.SoomlaApp">
    ```

  Add the following permission:

    ```xml
    <uses-permission android:name="com.android.vending.BILLING" />
    ```

  Add the activity to your `application` element, android-store needs to spawn a transparent activity to make purchases:

    ```xml
        <activity android:name="com.soomla.store.StoreController$IabActivity"
                  android:theme="@android:style/Theme.Translucent.NoTitleBar.Fullscreen"/>
    ```
3. Change the value of `StoreConfig.SOOM_SEC` to a secret of you choice. Do this now!
   **You can't change this value after you publish your game!**

4. Create your own implementation of _IStoreAssets_ in order to describe your specific game's assets ([example](https://github.com/soomla/android-store/blob/master/SoomlaAndroidExample/src/com/soomla/example/MuffinRushAssets.java)). Initialize _StoreController_ with the class you just created:

      ```Java
       StoreController.getInstance().initialize(new YourStoreAssetsImplementation(),
                                           "[YOUR PUBLIC KEY FROM GOOGLE PLAY]",
                                           "[YOUR CUSTOM GAME SECRET HERE]");
      ```

    > The custom secret is your encryption secret for data saved in the DB. This secret is NOT the secret from step 3 (select a different value).

    > Initialize `StoreController` ONLY ONCE when your application loads.

And that's it ! You have storage and in-app purchasing capabilities... ALL-IN-ONE.


## What's next? In App Purchasing.


When we implemented modelV3, we were thinking about ways people buy things inside apps. We figured many ways you can let your users purchase stuff in your game and we designed the new modelV3 to support 2 of them: PurchaseWithMarket and PurchaseWithVirtualItem.

**PurchaseWithMarket** is a PurchaseType that allows users to purchase a VirtualItem with Google Play.  
**PurchaseWithVirtualItem** is a PurchaseType that lets your users purchase a VirtualItem with a different VirtualItem. For Example: Buying 1 Sword with 100 Gems.

In order to define the way your various virtual items (Goods, Coins ...) are purchased, you'll need to create your implementation of IStoreAsset (the same one from step 4 in the "Getting Started" above).

Here is an example:

Lets say you have a _VirtualCurrencyPack_ you call `TEN_COINS_PACK` and a _VirtualCurrency_ you call `COIN_CURRENCY`:

```Java
VirtualCurrencyPack TEN_COINS_PACK = new VirtualCurrencyPack(
        "10 Coins",                                     // name
        "A pack of 10 coins",                           // description
        "10_coins",                                     // item id
        10,                                             // number of currencies in the pack
        COIN_CURRENCY_ITEM_ID,                          // the currency associated with this pack
        new PurchaseWithMarket("com.soomla.ten_coin_pack", 1.99));
```
 
Now you can use _StoreInventory_ to buy your new VirtualCurrencyPack:

```Java
StoreInventory.buy(TEN_COINS_PACK.getItemId());
```
    
And that's it! android-store knows how to contact Google Play for you and will redirect your users to their purchasing system to complete the transaction.
Don't forget to define your _IStoreEventHandler_ in order to get the events of successful or failed purchases (see [Event Handling](https://github.com/soomla/android-store#event-handling)).

## In App Billing Service

We currently support Google Play as the default IAB service. We're working to add more billing services.

The billing service is started and stopped for every operation you're running on StoreContoroller (buyWithMarket, restoreTransactions ...).

We recommend that you open the IAB Serbice and keep it open in the background in cases where you have an in-game storefront. This is how you do that:

When you open the store, call:  
```Java
StoreController.getInstance().startIabServiceInBg();
```

When the store is closed, call:  
```Java
StoreController.getInstance().stopIabServiceInBg();
```

Be careful with that. Don't leave the service running in the background without closing it.


## Debugging

In order to debug android-store, set `StoreConfig.logDebug` to `true`. This will print all of _android-store's_ debugging messages to logcat.

## Storage & Meta-Data


When you initialize _StoreController_, it automatically initializes two other classes: _StorageManager_ and _StoreInfo_. _StorageManager_ is the father of all storage related instances in your game. Use it to access tha balances of virtual currencies and virtual goods (usually, using their itemIds). _StoreInfo_ is the mother of all meta data information about your specific game. It is initialized with your implementation of `IStoreAssets` and you can use it to retrieve information about your specific game.  
We've also added _StoreInventory_ which is a utility class to help you do store related operations even easier.

The on-device storage is encrypted and kept in a SQLite database. SOOMLA is preparing a cloud-based storage service that will allow this SQLite to be synced to a cloud-based repository that you'll define.

**Example Usages**

* Give the user 10 pieces of a virtual currency with itemId "currency_coin":

    ```Java
    StoreInventory.giveVirtualItem("currency_coin", 10);
    ```
    
* Take 10 virtual goods with itemId "green_hat":

    ```Java
    StoreInventory.takeVirtualItem("green_hat", 10);
    ```
    
* Get the current balance of a virtual good with itemId "green_hat" (here we decided to show you the 'long' way. you can also use StoreInventory):

    ```Java
    VirtualGood greenHat = (VirtualGood)StoreInfo.getVirtualItem("green_hat");
    int greenHatsBalance = StorageManager.getVirtualGoodsStorage().getBalance(greenHat);
    ```
    
## Security


If you want to protect your game from 'bad people' (and who doesn't?!), you might want to follow some guidelines:

+ SOOMLA keeps the game's data in an encrypted database. In order to encrypt your data, SOOMLA generates a private key out of several parts of information. The Custom Secret is one of them. SOOMLA recommends that you provide this value when initializing `StoreController` and before you release your game. BE CAREFUL: You can change this value once! If you try to change it again, old data from the database will become unavailable.
+ Following Google's recommendation, SOOMLA also recommends that you split your public key and construct it on runtime or even use bit manipulation on it in order to hide it. The key itself is not secret information but if someone replaces it, your application might get fake messages that might harm it.

## Event Handling


For event handling, we use Square's great open-source project [otto](http://square.github.com/otto/). In ordered to be notified of store related events, you can register for specific events and create your game-specific behaviour to handle them.

> Your behaviour is an addition to the default behaviour implemented by SOOMLA. You don't replace SOOMLA's behaviour.

In order to register for events:

1. In the class that should receive the event create a function with the annotation '@Subscribe'. Example:

    ```Java
    @Subscribe public void onPlayPurchaseEvent(PlayPurchaseEvent playPurchaseEvent) {
        ...
    }
    ```
    
2. You'll also have to register your class in the event bus (and unregister when needed):

   ```Java
   BusProvider.getInstance().register(this);
   ```
   
   ```Java
   BusProvider.getInstance().unregister(this);
   ```

> If your class is an Activity, register in 'onResume' and unregister in 'onPause'

You can find a full event handler example [here](https://github.com/soomla/android-store/blob/master/SoomlaAndroidExample/src/com/soomla/example/ExampleEventHandler.java).

[List of events](https://github.com/soomla/android-store/tree/master/SoomlaAndroidStore/src/com/soomla/store/events)

[Full documentation and explanation of otto](http://square.github.com/otto/)

## Contribution


We want you!

Fork -> Clone -> Implement -> Test -> Pull-Request. We have great RESPECT for contributors.

## SOOMLA, Elsewhere ...


+ [Framework Page](http://project.soom.la/)
+ [On Facebook](https://www.facebook.com/pages/The-SOOMLA-Project/389643294427376)
+ [On AngelList](https://angel.co/the-soomla-project)

## License

MIT License. Copyright (c) 2012 SOOMLA. http://project.soom.la
+ http://www.opensource.org/licenses/MIT


