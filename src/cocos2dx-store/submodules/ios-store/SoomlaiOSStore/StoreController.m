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

#import "StoreController.h"
#import "StoreConfig.h"
#import "StorageManager.h"
#import "StoreInfo.h"
#import "EventHandling.h"
#import "VirtualGood.h"
#import "VirtualCategory.h"
#import "VirtualCurrency.h"
#import "VirtualCurrencyPack.h"
#import "VirtualCurrencyStorage.h"
#import "NonConsumableStorage.h"
#import "VirtualGoodStorage.h"
#import "InsufficientFundsException.h"
#import "NotEnoughGoodsException.h"
#import "VirtualItemNotFoundException.h"
#import "ObscuredNSUserDefaults.h"
#import "MarketItem.h"
#import "NonConsumableItem.h"
#import "StoreUtils.h"
#import "PurchaseWithMarket.h"

#import "SoomlaVerification.h"

@implementation StoreController

@synthesize initialized;

static NSString* TAG = @"SOOMLA StoreController";

- (BOOL)checkInit {
    if (!self.initialized) {
        LogDebug(TAG, @"You can't perform any of StoreController's actions before it was initialized. Initialize it once when your game loads.");
        return NO;
    }
    
    return YES;
}

+ (StoreController*)getInstance{
    static StoreController* _instance = nil;
    
    @synchronized( self ) {
        if( _instance == nil ) {
            _instance = [[StoreController alloc] init];
        }
    }
    
    return _instance;
}

- (BOOL)initializeWithStoreAssets:(id<IStoreAssets>)storeAssets andCustomSecret:(NSString*)secret {
    
    if (secret && secret.length > 0) {
        [ObscuredNSUserDefaults setString:secret forKey:@"ISU#LL#SE#REI"];
    } else if ([[ObscuredNSUserDefaults stringForKey:@"ISU#LL#SE#REI" withDefaultValue:@""] isEqualToString:@""]){
        LogError(TAG, @"secret is null or empty. can't initialize store !!");
        return NO;
    }
    
    LogDebug(TAG, @"StoreController Initializing ...");
    
    [ObscuredNSUserDefaults setInt:[storeAssets getVersion] forKey:@"SA_VER_NEW"];
    
    [StorageManager getInstance];
    [[StoreInfo getInstance] initializeWithIStoreAssets:storeAssets];
    
    if ([SKPaymentQueue canMakePayments]) {
        [[SKPaymentQueue defaultQueue] addTransactionObserver:self];
        
        [EventHandling postBillingSupported];
    } else {
        [EventHandling postBillingNotSupported];
    }
    
    [self refreshMarketItemsDetails];
    
    self.initialized = YES;
    [EventHandling postStoreControllerInitialized];
    
    return YES;
}

- (BOOL)buyInMarketWithMarketItem:(MarketItem*)marketItem{
    if (![self checkInit]) return NO;
    
    if ([SKPaymentQueue canMakePayments]) {
        SKMutablePayment *payment = [[SKMutablePayment alloc] init] ;
        payment.productIdentifier = marketItem.productId;
        payment.quantity = 1;
        [[SKPaymentQueue defaultQueue] addPayment:payment];
        
        @try {
            PurchasableVirtualItem* pvi = [[StoreInfo getInstance] purchasableItemWithProductId:marketItem.productId];
            [EventHandling postMarketPurchaseStarted:pvi];
        }
        @catch (NSException *exception) {
            LogError(TAG, ([NSString stringWithFormat:@"Couldn't find a purchasable item with productId: %@", marketItem.productId]));
        }
    } else {
        LogError(TAG, @"Can't make purchases. Parental control is probably enabled.");
        return NO;
    }
    
    return YES;
}

- (void) refreshInventory {
    [self restoreTransactions];
    [self refreshMarketItemsDetails];
}

- (void)restoreTransactions {
    if(![self checkInit]) return;
    
    LogDebug(TAG, @"Sending restore transaction request");
    if ([SKPaymentQueue canMakePayments]) {
        [[SKPaymentQueue defaultQueue] restoreCompletedTransactions];
    }
    
    [EventHandling postRestoreTransactionsStarted];
}

- (BOOL)transactionsAlreadyRestored {
    return [ObscuredNSUserDefaults boolForKey:@"RESTORED" withDefaultValue:NO];
}

#pragma mark -
#pragma mark SKPaymentTransactionObserver methods

- (void)paymentQueue:(SKPaymentQueue *)queue updatedTransactions:(NSArray *)transactions
{
    for (SKPaymentTransaction *transaction in transactions)
    {
        switch (transaction.transactionState)
        {
            case SKPaymentTransactionStatePurchased:
                [self completeTransaction:transaction];
                break;
            case SKPaymentTransactionStateFailed:
                [self failedTransaction:transaction];
                break;
            case SKPaymentTransactionStateRestored:
                [self restoreTransaction:transaction];
            default:
                break;
        }
    }
}

- (void)finalizeTransaction:(SKPaymentTransaction *)transaction forPurchasable:(PurchasableVirtualItem*)pvi {
    [EventHandling postMarketPurchase:pvi andReceiptUrl:[[NSBundle mainBundle] appStoreReceiptURL]];
    [pvi giveAmount:1];
    [EventHandling postItemPurchased:pvi];
    
    // Remove the transaction from the payment queue.
    [[SKPaymentQueue defaultQueue] finishTransaction: transaction];
}

- (void)purchaseVerified:(NSNotification*)notification{
    [[NSNotificationCenter defaultCenter] removeObserver:self name:EVENT_MARKET_PURCHASE_VERIF object:sv];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:EVENT_UNEXPECTED_ERROR_IN_STORE object:sv];
    
    sv = nil;
    
    NSDictionary* userInfo = notification.userInfo;
    PurchasableVirtualItem* purchasable = [userInfo objectForKey:DICT_ELEMENT_PURCHASABLE];
    BOOL verified = [(NSNumber*)[userInfo objectForKey:DICT_ELEMENT_VERIFIED] boolValue];
    SKPaymentTransaction* transaction = [userInfo objectForKey:DICT_ELEMENT_TRANSACTION];
    
    if (verified) {
        [self finalizeTransaction:transaction forPurchasable:purchasable];
    } else {
        LogError(TAG, @"Failed to verify transaction receipt. The user will not get what he just bought.");
        [[SKPaymentQueue defaultQueue] finishTransaction: transaction];
        [EventHandling postUnexpectedError:ERR_VERIFICATION_FAIL forObject:self];
    }
}

- (void)unexpectedVerificationError:(NSNotification*)notification{
    [[NSNotificationCenter defaultCenter] removeObserver:self name:EVENT_MARKET_PURCHASE_VERIF object:sv];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:EVENT_UNEXPECTED_ERROR_IN_STORE object:sv];
    
    sv = nil;
}

- (void)givePurchasedItem:(SKPaymentTransaction *)transaction
{
    @try {
        PurchasableVirtualItem* pvi = [[StoreInfo getInstance] purchasableItemWithProductId:transaction.payment.productIdentifier];
        
        if (VERIFY_PURCHASES) {
            sv = [[SoomlaVerification alloc] initWithTransaction:transaction andPurchasable:pvi];
            
            [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(purchaseVerified:) name:EVENT_MARKET_PURCHASE_VERIF object:sv];
            [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(unexpectedVerificationError:) name:EVENT_UNEXPECTED_ERROR_IN_STORE object:sv];
            
            [sv verifyData];
        } else {
            [self finalizeTransaction:transaction forPurchasable:pvi];
        }
        
    } @catch (VirtualItemNotFoundException* e) {
        LogError(TAG, ([NSString stringWithFormat:@"An error occured when handling copmleted purchase for PurchasableVirtualItem with productId: %@"
                        @". It's unexpected so an unexpected error is being emitted.", transaction.payment.productIdentifier]));
        [EventHandling postUnexpectedError:ERR_PURCHASE_FAIL forObject:self];
    }
}

- (void) completeTransaction: (SKPaymentTransaction *)transaction
{
    LogDebug(TAG, ([NSString stringWithFormat:@"Transaction completed for product: %@", transaction.payment.productIdentifier]));
    [self givePurchasedItem:transaction];
}

- (void) restoreTransaction: (SKPaymentTransaction *)transaction
{
    LogDebug(TAG, ([NSString stringWithFormat:@"Restore transaction for product: %@", transaction.payment.productIdentifier]));
    [self givePurchasedItem:transaction];
}

- (void) failedTransaction: (SKPaymentTransaction *)transaction
{
    if (transaction.error.code != SKErrorPaymentCancelled) {
        LogError(TAG, ([NSString stringWithFormat:@"An error occured for product id \"%@\" with code \"%ld\" and description \"%@\"", transaction.payment.productIdentifier, (long)transaction.error.code, transaction.error.localizedDescription]));
        
        [EventHandling postUnexpectedError:ERR_PURCHASE_FAIL forObject:self];
    }
    else{
        
        @try {
            PurchasableVirtualItem* pvi = [[StoreInfo getInstance] purchasableItemWithProductId:transaction.payment.productIdentifier];
            
            [EventHandling postMarketPurchaseCancelled:pvi];
        }
        @catch (VirtualItemNotFoundException* e) {
            LogError(TAG, ([NSString stringWithFormat:@"Couldn't find the CANCELLED VirtualCurrencyPack OR MarketItem with productId: %@"
                            @". It's unexpected so an unexpected error is being emitted.", transaction.payment.productIdentifier]));
            [EventHandling postUnexpectedError:ERR_GENERAL forObject:self];
        }
        
    }
    [[SKPaymentQueue defaultQueue] finishTransaction: transaction];
}

- (void)paymentQueueRestoreCompletedTransactionsFinished:(SKPaymentQueue *)queue {
    [ObscuredNSUserDefaults setBool:YES forKey:@"RESTORED"];
    [EventHandling postRestoreTransactionsFinished:YES];
}

- (void)paymentQueue:(SKPaymentQueue *)queue restoreCompletedTransactionsFailedWithError:(NSError *)error {
    [EventHandling postRestoreTransactionsFinished:NO];
}

- (void)refreshMarketItemsDetails {
    SKProductsRequest *productsRequest = [[SKProductsRequest alloc] initWithProductIdentifiers:[[NSSet alloc] initWithArray:[[StoreInfo getInstance] allProductIds]]];
    productsRequest.delegate = self;
    [productsRequest start];
}

- (void)productsRequest:(SKProductsRequest *)request didReceiveResponse:(SKProductsResponse *)response
{
    NSMutableArray* marketItems = [NSMutableArray array];
    NSArray *products = response.products;
    for(SKProduct* product in products) {
        NSString* title = product.localizedTitle;
        NSString* description = product.localizedDescription;
        NSDecimalNumber* price = product.price;
        NSLocale* locale = product.priceLocale;
        NSString* productId = product.productIdentifier;
        LogDebug(TAG, ([NSString stringWithFormat:@"title: %@  price: %@  productId: %@  desc: %@",title,[price descriptionWithLocale:locale],productId,description]));

        @try {
            PurchasableVirtualItem* pvi = [[StoreInfo getInstance] purchasableItemWithProductId:productId];
            
            PurchaseType* purchaseType = pvi.purchaseType;
            if ([purchaseType isKindOfClass:[PurchaseWithMarket class]]) {
                MarketItem* mi = ((PurchaseWithMarket*)purchaseType).marketItem;
                mi.marketDescription = description;
                mi.marketPrice = price;
                mi.marketLocale = locale;
                mi.marketTitle = title;
                
                [marketItems addObject:mi];
            }
        }
        @catch (VirtualItemNotFoundException* e) {
            LogError(TAG, ([NSString stringWithFormat:@"Couldn't find the PurchasableVirtualItem with productId: %@"
                            @". It's unexpected so an unexpected error is being emitted.", productId]));
            [EventHandling postUnexpectedError:ERR_GENERAL forObject:self];
        }
    }
    
    for (NSString *invalidProductId in response.invalidProductIdentifiers)
    {
        LogError(TAG, ([NSString stringWithFormat: @"Invalid product id (when trying to fetch item details): %@" , invalidProductId]));
    }
    
    [EventHandling postMarketItemsRefreshed:marketItems];
}


@end
