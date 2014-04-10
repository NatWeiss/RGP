//
//  JSONConstsX.cpp
//  cocos2dx-store
//
//  Created by Igor Yegoroff on 5/17/13.
//
//

#include "SoomlaJSONConsts.h"

namespace soomla {
    char const* JSON_STORE_CURRENCIES         = "currencies";
    char const* JSON_STORE_CURRENCYPACKS      = "currencyPacks";
    char const* JSON_STORE_GOODS              = "goods";
    char const* JSON_STORE_CATEGORIES         = "categories";
    char const* JSON_STORE_NONCONSUMABLES     = "nonConsumables";
    char const* JSON_STORE_GOODS_SU           = "singleUse";
    char const* JSON_STORE_GOODS_PA           = "goodPacks";
    char const* JSON_STORE_GOODS_UP           = "goodUpgrades";
    char const* JSON_STORE_GOODS_LT           = "lifetime";
    char const* JSON_STORE_GOODS_EQ           = "equippable";
    
    char const* JSON_ITEM_NAME                = "name";
    char const* JSON_ITEM_DESCRIPTION         = "description";
    char const* JSON_ITEM_ITEMID              = "itemId";
    
    char const* JSON_CATEGORY_NAME            = "name";
    char const* JSON_CATEGORY_GOODSITEMIDS    = "goods_itemIds";
    
    char const* JSON_MARKETITEM_PRODUCT_ID    = "productId";
    char const* JSON_MARKETITEM_CONSUMABLE    = "consumable";
    char const* JSON_MARKETITEM_PRICE         = "price";
    
    char const* JSON_EQUIPPABLE_EQUIPPING     = "equipping";
    
    char const* JSON_VGP_GOOD_ITEMID          = "good_itemId";
    char const* JSON_VGP_GOOD_AMOUNT          = "good_amount";
    
    char const* JSON_VGU_GOOD_ITEMID          = "good_itemId";
    char const* JSON_VGU_PREV_ITEMID          = "prev_itemId";
    char const* JSON_VGU_NEXT_ITEMID          = "next_itemId";
    
    char const* JSON_CURRENCYPACK_CURRENCYAMOUNT = "currency_amount";
    char const* JSON_CURRENCYPACK_CURRENCYITEMID = "currency_itemId";
    
    char const* JSON_PURCHASABLE_ITEM         = "purchasableItem";
    
    char const* JSON_PURCHASE_TYPE            = "purchaseType";
    char const* JSON_PURCHASE_TYPE_MARKET     = "market";
    char const* JSON_PURCHASE_TYPE_VI         = "virtualItem";
    
    char const* JSON_PURCHASE_MARKET_ITEM     = "marketItem";
    
    char const* JSON_PURCHASE_VI_ITEMID       = "pvi_itemId";
    char const* JSON_PURCHASE_VI_AMOUNT       = "pvi_amount";
}