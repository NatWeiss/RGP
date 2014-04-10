package com.soomla.example;

import android.app.Activity;
import android.content.ClipData;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.os.Handler;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import com.soomla.store.*;
import com.soomla.store.data.ObscuredSharedPreferences;
import com.soomla.store.domain.virtualCurrencies.VirtualCurrency;
import com.soomla.store.exceptions.VirtualItemNotFoundException;

public class StoreExampleActivity extends Activity {
    /**
     * Called when the activity is first created.
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);

        mRobotView = (ImageView) findViewById(R.id.drag_img);
        mRobotView.setOnTouchListener(new MyTouchListener());
        findViewById(R.id.rightbox).setOnDragListener(new MyDragListener());

        Typeface font = Typeface.createFromAsset(getAssets(), "GoodDog.otf");
        ((TextView) findViewById(R.id.title_text)).setTypeface(font);
        ((TextView) findViewById(R.id.main_text)).setTypeface(font);

        /**
         * We initialize StoreController and initialize event handler before
         * we open the store.
         */

        /**
         * Compute your public key (that you got from the Android Market publisher site).
         *
         * Instead of just storing the entire literal string here embedded in the
         * program,  construct the key at runtime from pieces or
         * use bit manipulation (for example, XOR with some other string) to hide
         * the actual key.  The key itself is not secret information, but we don't
         * want to make it easy for an adversary to replace the public key with one
         * of their own and then fake messages from the server.
         *
         * Generally, encryption keys / passwords should only be kept in memory
         * long enough to perform the operation they need to perform.
         */
        IStoreAssets storeAssets = new MuffinRushAssets();
        mEventHandler = new ExampleEventHandler(mHandler, this);
        StoreController.getInstance().initialize(storeAssets,
                "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAphC8H7OYag8u8l1WayR7dHMKFC+XC09tLk9A6FnxqsJPF4+Y4iJ4NTs24PVYWB4y/DQjfo3b7z6DqXBYgAOMYn7I3VIbjzgbit+DgGWfmiKWCQotcG5jWEsTiGMy+yRkJ6mwvWyVt8c3EfYrgrIfDMYrzIpk+F0PK/ybDiQmj4j2H9PB3NwOMpaGCkKM3IrEY66fclnJpO3nDqN7Lun5mGAlni5eMKkwM5f5O8DUD65y/MmXTwUddXKnIaurY6giRcJktK6zWsFopxf2EzDb1byP3ISiwxZAgic5BfQYh3HAbeEMD0CvRCHQIctJ8k7zn63NmaemPR7lFjY1GNWeowIDAQAB",
                "aaaaabbbbbb");

        // Checking if it's a first run and adding 10000 currencies if it is.
        // OFCOURSE... THIS IS JUST FOR TESTING.
        SharedPreferences prefs = new ObscuredSharedPreferences(SoomlaApp.getAppContext().getSharedPreferences(StoreConfig.PREFS_NAME, Context.MODE_PRIVATE));
        boolean initialized = prefs.getBoolean(FIRST_RUN, false);
        if (!initialized) {
            try {
                for (VirtualCurrency currency : storeAssets.getCurrencies()) {
                    StoreInventory.giveVirtualItem(currency.getItemId(), 10000);
                }
                SharedPreferences.Editor edit = prefs.edit();
                edit.putBoolean(FIRST_RUN, true);
                edit.commit();
            } catch (VirtualItemNotFoundException e) {
                StoreUtils.LogError("Example Activity", "Couldn't add first 10000 currencies.");
            }
        }

    }

    public void robotBackHome(){
        mHandler.post(new Runnable() {
            @Override
            public void run() {
                ViewGroup left = (ViewGroup)findViewById(R.id.leftbox);
                ViewGroup right = (ViewGroup)findViewById(R.id.rightbox);

                if (mRobotView.getParent() != left){
                    right.removeView(mRobotView);
                    left.addView(mRobotView);
                }
            }
        });
    }

    private final class MyTouchListener implements View.OnTouchListener {

        @Override
        public boolean onTouch(View view, MotionEvent motionEvent) {
            if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                ClipData data = ClipData.newPlainText("", "");
                View.DragShadowBuilder shadowBuilder = new View.DragShadowBuilder(view);
                view.startDrag(data, shadowBuilder, view, 0);
                view.setVisibility(View.INVISIBLE);
                return true;
            } else {
                return false;
            }
        }
    }

    private final class MyDragListener implements View.OnDragListener {
        Drawable enterShape = getResources().getDrawable(R.drawable.shape_droptarget);
        Drawable normalShape = getResources().getDrawable(R.drawable.shape);

        @Override
        public boolean onDrag(View v, DragEvent event) {
            View view = (View) event.getLocalState();
//            ViewGroup owner = (ViewGroup) view.getParent();
//            LinearLayout container = (LinearLayout) v;
            switch (event.getAction()) {
                case DragEvent.ACTION_DRAG_STARTED:
                    break;
                case DragEvent.ACTION_DRAG_ENTERED:
                    v.setBackgroundDrawable(enterShape);
                    break;
                case DragEvent.ACTION_DRAG_EXITED:
                    v.setBackgroundDrawable(normalShape);
                    break;
                case DragEvent.ACTION_DROP:
                    // Dropped, reassign View to ViewGroup

                    ViewGroup left = (ViewGroup)findViewById(R.id.leftbox);
                    ViewGroup right = (ViewGroup)findViewById(R.id.rightbox);

                    if (right == v){
                        left.removeView(view);
                        right.addView(view);
                        view.setVisibility(View.VISIBLE);

                        openStore();
                    }
                    break;
                case DragEvent.ACTION_DRAG_ENDED:
                    view.setVisibility(View.VISIBLE);

                    v.setBackgroundDrawable(normalShape);
                default:
                    break;
            }
            return true;
        }
    }

    private void openStore() {
        Intent intent = new Intent(getApplicationContext(), StoreGoodsActivity.class);
        startActivity(intent);
        robotBackHome();
    }

    private Handler mHandler = new Handler();
    private ImageView mRobotView;
    private ExampleEventHandler mEventHandler;

    private static final String PREFS_NAME      = "store.prefs";
    private static final String FIRST_RUN       = "a#AA#BB#C";
}

