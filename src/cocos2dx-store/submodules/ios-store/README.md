*This project is a part of [The SOOMLA Project](http://project.soom.la) which is a series of open source initiatives with a joint goal to help mobile game developers get better stores and more in-app purchases.*

Haven't you ever wanted an in-app purchase one liner that looks like this ?!

```objective-c
    [StoreInventory buyItemWithItemId:@"[itemId]"]
```

ios-store
---
**March 31st, 2014:** StoreController will **automatically try to fetch prices** for PurchasableItems that has a purchase type of PurchaseWithMarket. The product ids that'll be found in the App Store will update the associated 'AppStoreItem' in special fields: appStorePrice, appStoreLocale, appStoreTitle, appStoreDescription.

**September 29th, 2013:** Server Side Verification is now implemented into ios-store. The server is a complimentary server provided by [SOOMLA](http://soom.la) to help you get your in-game purchases a bit more secured. This feature is not enabled by default. In order to enable Server Side verification go to StoreConfig.m and set  **VERIFY_PURCHASES = YES**.

Want to learn more about modelV3? Try these:  
* [Economy Model Objects](https://github.com/soomla/ios-store/wiki/Economy-Model-Objects)  
* [Handling Store Operations](https://github.com/soomla/ios-store/wiki/Handling-Store-Operations)

The ios-store is our iOS-flavored code initiative part of The SOOMLA Project. It is an iOS SDK that simplifies the App Store's in-app purchasing API and complements it with storage, security and event handling. The project also includes a sample app for reference. 

>If you also want to create a **storefront** you can do that using SOOMLA's [In-App Purchase Store Designer](http://soom.la).

Check out our [Wiki] (https://github.com/soomla/ios-store/wiki) for more information about the project and how to use it better.

Getting Started (using source code)
---

#### **WE USE ARC !**


* Before doing anything, SOOMLA recommends that you go through [Selling with In-App Purchase](https://developer.apple.com/appstore/in-app-purchase/index.html).

1. Clone ios-store. Copy all files from ../ios-store/SoomlaiOSStore/SoomlaiOSStore into your iOS project:

 `git clone git@github.com:soomla/ios-store.git`

2. Make sure you have the following frameworks in your application's project: **Security, libsqlite3.0.dylib, StoreKit**.

3. Change the value of SOOM_SEC in StoreConfig.m to a secret of you choice. Do this now! **You can't change this value after you publish your game!**

4. We use [OpenUDID](https://github.com/ylechelle/OpenUDID) when we can't use Apple's approved way of fetching the UDID (using 'identifierForVendor'). We use ARC but OpenUDID doesn't use ARC. Open your *Project Properties* -> *Build Phases* -> *Compile Sources* and and add the flag '-fno-objc-arc' to OpenUDID.m.

5. Create your own implementation of _IStoreAssets_ in order to describe your specific game's assets. Initialize _StoreController_ with the class you just created:

      ```objective-c
       [[StoreController getInstance] initializeWithStoreAssets:[[YourStoreAssetsImplementation alloc] init] andCustomSecret:@"[YOUR CUSTOM SECRET HERE]"];
      ```

    > The custom secret is your encryption secret for data saved in the DB. This secret is NOT the secret from step 4 (select a different value).

    > Initialize `StoreController` ONLY ONCE when your application loads.

And that's it ! You have Storage and in-app purchasing capabilities... ALL-IN-ONE.

What's next? In App Purchasing.
---

When we implemented modelV3, we were thinking about ways people buy things inside apps. We figured many ways you can let your users purchase stuff in your game and we designed the new modelV3 to support 2 of them: PurchaseWithMarket and PurchaseWithVirtualItem.

**PurchaseWithMarket** is a PurchaseType that allows users to purchase a VirtualItem with the App Store.  
**PurchaseWithVirtualItem** is a PurchaseType that lets your users purchase a VirtualItem with a different VirtualItem. For Example: Buying 1 Sword with 100 Gems.

In order to define the way your various virtual items (Goods, Coins ...) are purchased, you'll need to create your implementation of IStoreAsset (the same one from step 4 in the "Getting Started" above).

Here is an example:

Lets say you have a _VirtualCurrencyPack_ you call `TEN_COINS_PACK` and a _VirtualCurrency_ you call `COIN_CURRENCY`:

```objective-c
VirtualCurrencyPack* TEN_COINS_PACK = [[VirtualCurrencyPack alloc] initWithName:@"10 Coins" 
											   andDescription:@"A pack of 10 coins" 
											        andItemId:@"10_coins" 
											andCurrencyAmount:10 
											 	  andCurrency:COIN_CURRENCY_ITEM_ID 
											  andPurchaseType:[[PurchaseWithMarket alloc] initWithProductId:TEN_COINS_PACK_PRODUCT_ID andPrice:1.99]];
```

Now you can use _StoreInventory_ to buy your new VirtualCurrencyPack:

```objective-c
    [StoreInventory buyItemWithItemId:TEN_COINS_PACK.itemId];
```

And that's it! ios-store knows how to contact the App Store for you and redirect the user to their purchasing system to complete the transaction. Don't forget to subscribe to events of successful or failed purchases (see [Event Handling](https://github.com/soomla/ios-store#event-handling)).

Storage & Meta-Data
---

When you initialize _StoreController_, it automatically initializes two other classes: _StorageManager_ and _StoreInfo_. _StorageManager_ is the father of all storage related instances in your game. Use it to access tha balances of virtual currencies and virtual goods (usually, using their itemIds). _StoreInfo_ is the mother of all meta data information about your specific game. It is initialized with your implementation of `IStoreAssets` and you can use it to retrieve information about your specific game.

The on-device storage is encrypted and kept in a SQLite database. SOOMLA is preparing a cloud-based storage service that will allow this SQLite to be synced to a cloud-based repository that you'll define. Stay tuned... this is just one of the goodies we prepare for you.

**Example Usages**

* Give the user 10 pieces of a virtual currency with itemId "currency_coin":

    ```objective-c
    [StoreInventory giveAmount:10 ofItem:@"currency_coin"];
    ```
    
* Take 10 virtual goods with itemId "green_hat":

    ```objective-c
    [StoreInventory takeAmount:10 ofItem:@"currency_coin"];
    ```
    
* Get the current balance of a virtual good with itemId "green_hat" (here we decided to show you the 'long' way. you can also use StoreInventory):

    ```objective-c
    VirtualGood* greenHat = (VirtualGood*)[[StoreInfo getInstance] virtualItemWithId:@"green_hat"];
    int greenHatsBalance = [[[StorageManager getInstance] virtualGoodStorage] balanceForItem:greenHat];
    ```
    
Security
---

If you want to protect your application from 'bad people' (and who doesn't?!), you might want to follow some guidelines:

+ SOOMLA keeps the game's data in an encrypted database. In order to encrypt your data, SOOMLA generates a private key out of several parts of information. StoreConfig's STORE_CUSTOM_SECRET is one of them. SOOMLA recommends that you change this value before you release your game. BE CAREFUL: You can change this value once! If you try to change it again, old data from the database will become unavailable.


Event Handling
---

SOOMLA lets you get notifications on various events and implement your own application specific behaviour.

> Your behaviour is an addition to the default behaviour implemented by SOOMLA. You don't replace SOOMLA's behaviour.

In order to observe store events you need to import EventHandling.h and then you can add a notification to *NSNotificationCenter*:

    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(yourCustomSelector:) name:EVENT_ITEM_PURCHASED object:nil];
    
OR, you can observe all events with the same selector by calling:

    [EventHandling observeAllEventsWithObserver:self withSelector:@selector(yourCustomSelector:)];

Our way of saying "Thanks !"
---

Other open-source projects that we use:

* [FBEncryptor](https://github.com/dev5tec/FBEncryptor)

Contribution
---

We want you!

Fork -> Clone -> Implement -> Test -> Pull-Request. We have great RESPECT for contributors.

SOOMLA, Elsewhere ...
---

+ [Framework Page](http://project.soom.la/)
+ [On Facebook](https://www.facebook.com/pages/The-SOOMLA-Project/389643294427376).
+ [On AngelList](https://angel.co/the-soomla-project)

License
---
MIT License. Copyright (c) 2012 SOOMLA. http://project.soom.la
+ http://www.opensource.org/licenses/MIT

