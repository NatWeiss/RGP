/**
 * Created by vedi on 1/28/14.
 */
function MuffinRushAssets() {

  const MUFFIN_CURRENCY_ITEM_ID = "currency_muffin";
  const TENMUFF_PACK_PRODUCT_ID = "android.test.refunded";
  const FIFTYMUFF_PACK_PRODUCT_ID = "android.test.canceled";
  const FOURHUNDMUFF_PACK_PRODUCT_ID = "android.test.purchased";
  const THOUSANDMUFF_PACK_PRODUCT_ID = "android.test.item_unavailable";
  const NO_ADDS_NONCONS_PRODUCT_ID = "no_ads";

  const MUFFINCAKE_ITEM_ID = "fruit_cake";
  const PAVLOVA_ITEM_ID = "pavlova";
  const CHOCLATECAKE_ITEM_ID = "chocolate_cake";
  const CREAMCUP_ITEM_ID = "cream_cup";


  /** Virtual Currencies **/
  var muffinCurrency = Soomla.Models.VirtualCurrency.create({
    name: "Muffins",
    description: "",
    itemId: MUFFIN_CURRENCY_ITEM_ID
  });


  /** Virtual Currency Packs **/
  var tenmuffPack = Soomla.Models.VirtualCurrencyPack.create({
    name: "10 Muffins",
    description: "Test refund of an item",
    itemId: "muffins_10",
    currency_amount: 10,
    currency_itemId: MUFFIN_CURRENCY_ITEM_ID,
    purchasableItem: Soomla.Models.PurchaseWithMarket.createWithMarketItem(TENMUFF_PACK_PRODUCT_ID, 0.99)
  });

  var fiftymuffPack = Soomla.Models.VirtualCurrencyPack.create({
    name: "50 Muffins",
    description: "Test cancellation of an item",
    itemId: "muffins_50",
    currency_amount: 50,
    currency_itemId: MUFFIN_CURRENCY_ITEM_ID,
    purchasableItem: Soomla.Models.PurchaseWithMarket.createWithMarketItem(FIFTYMUFF_PACK_PRODUCT_ID, 1.99)
  });

  var fourhundmuffPack = Soomla.Models.VirtualCurrencyPack.create({
    name: "400 Muffins",
    description: "Test purchase of an item",
    itemId: "muffins_400",
    currency_amount: 400,
    currency_itemId: MUFFIN_CURRENCY_ITEM_ID,
    purchasableItem: Soomla.Models.PurchaseWithMarket.createWithMarketItem(FOURHUNDMUFF_PACK_PRODUCT_ID, 4.99)
  });

  var thousandmuffPack = Soomla.Models.VirtualCurrencyPack.create({
    name: "1000 Muffins",
    description: "Test item unavailable",
    itemId: "muffins_1000",
    currency_amount: 1000,
    currency_itemId: MUFFIN_CURRENCY_ITEM_ID,
    purchasableItem: Soomla.Models.PurchaseWithMarket.createWithMarketItem(THOUSANDMUFF_PACK_PRODUCT_ID, 8.99)
  });

  /** Virtual Goods **/
  var muffincakeGood = Soomla.Models.SingleUseVG.create({
    name: "Fruit Cake",
    description: "Customers buy a double portion on each purchase of this cake",
    itemId: "fruit_cake",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 225
    })
  });

  var pavlovaGood = Soomla.Models.SingleUseVG.create({
    name: "Pavlova",
    description: "Gives customers a sugar rush and they call their friends",
    itemId: "pavlova",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 175
    })
  });

  var tenPavlovaGoods = Soomla.Models.SingleUsePackVG.create({
    good_itemId: "pavlova",
    good_amount: 10,
    name: "10 Pavlova",
    description: "Gives customers a sugar rush and they call their friends",
    itemId: "pavlova_10",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 1750
    })
  });

  var choclatecakeGood = Soomla.Models.SingleUseVG.create({
    name: "Chocolate Cake",
    description: "A classic cake to maximize customer satisfaction",
    itemId: "chocolate_cake",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 250
    })
  });

  var creamcupGood = Soomla.Models.SingleUseVG.create({
    name: "Cream Cup",
    description: "Increase bakery reputation with this original pastry",
    itemId: "cream_cup",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 50
    })
  });

  var tenCreamcupGoods = Soomla.Models.SingleUsePackVG.create({
    good_itemId: "cream_cup",
    good_amount: 10,
    name: "10 Cream Cup",
    description: "Increase bakery reputation with this original pastry",
    itemId: "cream_cup_10",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 500
    })
  });

  var showRoomGood = Soomla.Models.LifetimeVG.create({
    name: "Show Room",
    description: "Show Room ",
    itemId: "show_room",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 100
    })
  });

  var showRoomGood0 = Soomla.Models.UpgradeVG.create({
    good_itemId: "show_room",
    prev_itemId: null,
    next_itemId: "show_room_1",
    name: "Show Room L0",
    description: "",
    itemId: "show_room_0",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 220
    })
  });

  var showRoomGood1 = Soomla.Models.UpgradeVG.create({
    good_itemId: "show_room",
    prev_itemId: "show_room_0",
    next_itemId: "show_room_2",
    name: "Show Room L1",
    description: "",
    itemId: "show_room_1",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 220
    })
  });

  var showRoomGood2 = Soomla.Models.UpgradeVG.create({
    good_itemId: "show_room",
    prev_itemId: "show_room_1",
    next_itemId: "show_room_3",
    name: "Show Room L2",
    description: "",
    itemId: "show_room_2",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 220
    })
  });

  var showRoomGood3 = Soomla.Models.UpgradeVG.create({
    good_itemId: "show_room",
    prev_itemId: "show_room_2",
    next_itemId: "show_room_4",
    name: "Show Room L3",
    description: "",
    itemId: "show_room_3",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 220
    })
  });

  var showRoomGood4 = Soomla.Models.UpgradeVG.create({
    good_itemId: "show_room",
    prev_itemId: "show_room_3",
    next_itemId: null,
    name: "Show Room L4",
    description: "",
    itemId: "show_room_4",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 220
    })
  });

  var deliveryVehicleGood = Soomla.Models.LifetimeVG.create({
    name: "Delivery Vehicle",
    description: "Delivery Vehicle",
    itemId: "delivery_vehicle",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 20
    })
  });

  var deliveryVehicleGood0 = Soomla.Models.UpgradeVG.create({
    good_itemId: "delivery_vehicle",
    prev_itemId: null,
    next_itemId: "delivery_vehicle_1",
    name: "Delivery Vehicle 0",
    description: "",
    itemId: "delivery_vehicle_0",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 20
    })
  });

  var deliveryVehicleGood1 = Soomla.Models.UpgradeVG.create({
    good_itemId: "delivery_vehicle",
    prev_itemId: "delivery_vehicle_0",
    next_itemId: "delivery_vehicle_2",
    name: "Delivery Vehicle 1",
    description: "",
    itemId: "delivery_vehicle_1",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 20
    })
  });

  var deliveryVehicleGood2 = Soomla.Models.UpgradeVG.create({
    good_itemId: "delivery_vehicle",
    prev_itemId: "delivery_vehicle_1",
    next_itemId: "delivery_vehicle_3",
    name: "Delivery Vehicle 2",
    description: "",
    itemId: "delivery_vehicle_2",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 20
    })
  });

  var deliveryVehicleGood3 = Soomla.Models.UpgradeVG.create({
    good_itemId: "delivery_vehicle",
    prev_itemId: "delivery_vehicle_2",
    next_itemId: "delivery_vehicle_4",
    name: "Delivery Vehicle 3",
    description: "",
    itemId: "delivery_vehicle_3",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 20
    })
  });

  var deliveryVehicleGood4 = Soomla.Models.UpgradeVG.create({
    good_itemId: "delivery_vehicle",
    prev_itemId: "delivery_vehicle_3",
    next_itemId: null,
    name: "Delivery Vehicle 4",
    description: "",
    itemId: "delivery_vehicle_4",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 20
    })
  });

  var fatCatGood = Soomla.Models.EquippableVG.create({
    equipping: Soomla.Models.EquippableVG.EquippingModel.CATEGORY,
    name: "Fat Cat",
    description: "Fat cat description",
    itemId: "fat_cat",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 27
    })
  });

  var happiHippoGood = Soomla.Models.EquippableVG.create({
    equipping: Soomla.Models.EquippableVG.EquippingModel.CATEGORY,
    name: "Happi Hippo",
    description: "Happi Hippo description",
    itemId: "happi_hippo",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 44
    })
  });

  var funkeyMonkeyGood = Soomla.Models.EquippableVG.create({
    equipping: Soomla.Models.EquippableVG.EquippingModel.CATEGORY,
    name: "Funkey Monkey",
    description: "Funkey Monkey description",
    itemId: "funkey_monkey",
    purchasableItem: Soomla.Models.PurchaseWithVirtualItem.create({
      pvi_itemId: MUFFIN_CURRENCY_ITEM_ID,
      pvi_amount: 35
    })
  });


  /** Virtual Categories **/
  var cakes = Soomla.Models.VirtualCategory.create({
    name: "Cakes",
    goods_itemIds: [
      MUFFINCAKE_ITEM_ID,
      PAVLOVA_ITEM_ID,
      "pavlova_10",
      CHOCLATECAKE_ITEM_ID,
      CREAMCUP_ITEM_ID,
      "cream_cup_10"
    ]
  });

  var upgrades = Soomla.Models.VirtualCategory.create({
    name: "Upgrades",
    goods_itemIds: [
      "show_room_0",
      "show_room_1",
      "show_room_2",
      "show_room_3",
      "show_room_4",
      "delivery_vehicle_0",
      "delivery_vehicle_1",
      "delivery_vehicle_2",
      "delivery_vehicle_3",
      "delivery_vehicle_4"
    ]
  });

  var characters = Soomla.Models.VirtualCategory.create({
    name: "Characters",
    goods_itemIds: [
      "fat_cat",
      "happi_hippo",
      "funkey_monkey"
    ]
  });

  /** Google MANAGED Items **/

  var noAdsNoncons = Soomla.Models.NonConsumableItem.create({
    name: "No Ads",
    description: "Test purchase of MANAGED item.",
    itemId: "no_ads",
    purchasableItem: Soomla.Models.PurchaseWithMarket.create({
      marketItem: Soomla.Models.MarketItem.create({
        productId: NO_ADDS_NONCONS_PRODUCT_ID,
        consumable: Soomla.Models.MarketItem.Consumable.NONCONSUMABLE,
        price: 1.99
      })
    })
  });

  var muffinRushAssets = Soomla.IStoreAssets.create({
    categories: [cakes, upgrades, characters],
    currencies: [muffinCurrency],
    currencyPacks: [tenmuffPack, fiftymuffPack, fourhundmuffPack, thousandmuffPack],
    goods: {
      singleUse: [muffincakeGood, pavlovaGood, choclatecakeGood, creamcupGood],
      lifetime: [showRoomGood, deliveryVehicleGood],
      equippable: [fatCatGood, happiHippoGood, funkeyMonkeyGood],
      goodUpgrades: [showRoomGood0, showRoomGood1, showRoomGood2, showRoomGood3, showRoomGood4,
        deliveryVehicleGood0, deliveryVehicleGood1, deliveryVehicleGood2, deliveryVehicleGood3, deliveryVehicleGood4],
      goodPacks: [tenPavlovaGoods, tenCreamcupGoods]
    },
    nonConsumables: [noAdsNoncons],
    version: 1
  });

  return muffinRushAssets;
}