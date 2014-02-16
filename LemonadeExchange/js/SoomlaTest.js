//
// Created by NatWeiss on 2/7/14.
//

function doSoomlaStoreTest() {
	var i,
		a,
		balance;
	
	// create a test store
	Soomla.StoreController.createShared(MuffinRushAssets(), {
		soomSec: "ExampleSoomSecret",
		androidPublicKey: "ExamplePublicKey",
		customSecret: "ExampleCustomSecret"
	});

	// test currencies
	a = Soomla.storeInfo.getVirtualCurrencies();
	cc.log("Currencies: " + JSON.stringify(a));
	for (i = 0; i < a.length; i += 1) {
		balance = Soomla.storeInventory.getItemBalance(a[i].itemId);
		cc.log("User has " + balance + " of " + a[i].itemId);
		if (balance < 10000) {
			Soomla.storeInventory.giveItem(a[i].itemId, 10000 - balance);
		}
		
		// test cloning
		a[i].itemId = "error-object-not-cloned";
	}
	a = Soomla.storeInfo.getVirtualCurrencies();
	cc.log("Currencies after clone test: " + JSON.stringify(a));
	
	// test goods
	a = Soomla.storeInfo.getVirtualGoods();
	cc.log("Goods: " + JSON.stringify(a));
	for (i = 0; i < a.length; i += 1) {
		// tbd...
	}
	
	// more tests tbd...
}