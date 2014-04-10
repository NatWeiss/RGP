//
// Created by Fedor Shubin on 5/21/13.
//


#import <Foundation/Foundation.h>
#import "IStoreAssets.h"

@interface StoreAssetsBridge : NSObject <IStoreAssets>{
    int version;
    NSMutableArray* virtualCurrenciesArray;
    NSMutableArray* virtualGoodsArray;
    NSMutableArray* virtualCurrencyPacksArray;
    NSMutableArray* virtualCategoriesArray;
    NSMutableArray* nonConsumablesArray;
}

+ (StoreAssetsBridge *)sharedInstance;
- (void)initializeWithStoreAssetsDict:(NSDictionary*)storeAssetsDict andVersion:(int)oVersion;

@end
