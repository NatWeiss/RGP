package com.soomla.example;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.BaseAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import com.soomla.store.BusProvider;
import com.soomla.store.StoreController;
import com.soomla.store.data.StorageManager;
import com.soomla.store.data.StoreInfo;
import com.soomla.store.domain.virtualGoods.VirtualGood;
import com.soomla.store.events.CurrencyBalanceChangedEvent;
import com.soomla.store.events.GoodBalanceChangedEvent;
import com.soomla.store.exceptions.InsufficientFundsException;
import com.soomla.store.purchaseTypes.PurchaseWithVirtualItem;
import com.squareup.otto.Subscribe;

import java.io.IOException;
import java.util.HashMap;

public class StoreGoodsActivity extends Activity {

    private StoreAdapter mStoreAdapter;
    private HashMap<String, Object> mImages;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.listview);

        StoreController.getInstance().startIabServiceInBg();

        TextView title = (TextView)findViewById(R.id.title);

        title.setText("Virtual Goods");

        mImages = generateImagesHash();

        mStoreAdapter = new StoreAdapter();


        /* configuring the list with an adapter */

        final Activity activity = this;
        ListView list = (ListView) findViewById(R.id.list);
        list.setAdapter(mStoreAdapter);
        list.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> adapterView, View view, int i, long l) {

               /*
                * the user decided to make and actual purchase of virtual goods. we try to purchase and
                * StoreController tells us if the user has enough funds to make the purchase. If he won't
                * have enough than an InsufficientFundsException will be thrown.
                */

                VirtualGood good = StoreInfo.getGoods().get(i);
                try {
                    good.buy();
                } catch (InsufficientFundsException e) {
                    AlertDialog ad = new AlertDialog.Builder(activity).create();
                    ad.setCancelable(false);
                    ad.setMessage("You don't have enough muffins.");
                    ad.setButton(DialogInterface.BUTTON_NEUTRAL, "OK", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.dismiss();
                        }
                    });
                    ad.show();

                }
            }
        });

    }

    @Override
    protected void onResume() {
        super.onResume();

        BusProvider.getInstance().register(this);

        /* fetching the currency balance and placing it in the balance label */
        TextView muffinsBalance = (TextView)findViewById(R.id.balance);
        muffinsBalance.setText("" + StorageManager.getVirtualCurrencyStorage().
                getBalance(StoreInfo.getCurrencies().get(0)));
    }

    @Override
    protected void onPause() {
        super.onPause();

        BusProvider.getInstance().unregister(this);
    }

    @Override
    protected void onDestroy() {
        StoreController.getInstance().stopIabServiceInBg();
        super.onDestroy();
    }

    private HashMap<String, Object> generateImagesHash() {
        final HashMap<String, Object> images = new HashMap<String, Object>();
        images.put(MuffinRushAssets.CHOCLATECAKE_ITEM_ID, R.drawable.chocolate_cake);
        images.put(MuffinRushAssets.CREAMCUP_ITEM_ID, R.drawable.cream_cup);
        images.put(MuffinRushAssets.MUFFINCAKE_ITEM_ID, R.drawable.fruit_cake);
        images.put(MuffinRushAssets.PAVLOVA_ITEM_ID, R.drawable.pavlova);
        return images;
    }

    @Subscribe
    public void onCurrencyBalanceChanged(CurrencyBalanceChangedEvent currencyBalanceChangedEvent) {
        /* fetching the currency balance and placing it in the balance label */
        TextView muffinsBalance = (TextView)findViewById(R.id.balance);
        muffinsBalance.setText("" + currencyBalanceChangedEvent.getBalance());
    }

    @Subscribe
    public void onGoodBalanceChanged(GoodBalanceChangedEvent goodBalanceChangedEvent) {
        VirtualGood good = goodBalanceChangedEvent.getGood();
        int id = 0;
        for(int i=0; i<StoreInfo.getGoods().size(); i++) {
            if (StoreInfo.getGoods().get(i).getItemId().equals(good.getItemId())) {
                id = i;
                break;
            }
        }

        ListView list = (ListView) findViewById(R.id.list);
        TextView info = (TextView)list.getChildAt(id).findViewById(R.id.item_info);
        PurchaseWithVirtualItem pwvi = (PurchaseWithVirtualItem) good.getPurchaseType();
        info.setText("price: " + pwvi.getAmount() +
                " balance: " + goodBalanceChangedEvent.getBalance());
    }

    private class StoreAdapter extends BaseAdapter {

        public StoreAdapter() {
        }

        public int getCount() {
            return mImages.size();
        }

        public Object getItem(int position) {
            return position;
        }

        public long getItemId(int position) {
            return position;
        }

        public View getView(int position, View convertView, ViewGroup parent) {
            View vi = convertView;
            if(convertView == null){
                vi = getLayoutInflater().inflate(R.layout.list_item, null);
            }

            TextView title = (TextView)vi.findViewById(R.id.title);
            TextView content = (TextView)vi.findViewById(R.id.content);
            ImageView thumb_image=(ImageView)vi.findViewById(R.id.list_image);
            TextView info = (TextView)vi.findViewById(R.id.item_info);

            VirtualGood good = StoreInfo.getGoods().get(position);//VirtualGood) data.get(position).get(StoreGoodsActivity.KEY_GOOD);

            // Setting all values in listview
            vi.setTag(good.getItemId());
            title.setText(good.getName());
            content.setText(good.getDescription());
            thumb_image.setImageResource((Integer)mImages.get(good.getItemId()));
            PurchaseWithVirtualItem pwvi = (PurchaseWithVirtualItem) good.getPurchaseType();
            info.setText("price: " + pwvi.getAmount() +
                    " balance: " + StorageManager.getVirtualGoodsStorage().getBalance(good));

            return vi;
        }
    }

    public void wantsToBuyPacks(View v) throws IOException {

        Intent intent = new Intent(getApplicationContext(), StorePacksActivity.class);
        startActivity(intent);
    }

    public void restoreTransactions(View v) throws IOException{
        StoreController.getInstance().refreshInventory(false);
    }
}