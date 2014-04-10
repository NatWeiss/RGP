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

package com.soomla.store.data;

import android.content.Context;
import android.content.SharedPreferences;
import android.text.TextUtils;
import com.soomla.store.SoomlaApp;
import com.soomla.store.StoreConfig;
import com.soomla.store.util.AESObfuscator;
import com.soomla.store.StoreUtils;

import java.util.HashMap;

/**
 * This class provides basic storage operations for a simple key-value store.
 */
public class KeyValueStorage {

    /** Constructor
     *
     */
    public KeyValueStorage() {
    }

    /**
     * Fetch the value for the given key.
     * @param key is the key in the key-val pair.
     * @return the value for the given key.
     */
    public String getValue(String key) {
        StoreUtils.LogDebug(TAG, "trying to fetch a value for key: " + key);

        key = getAESObfuscator().obfuscateString(key);

        String val = getDatabase().getKeyVal(key);

        if (val != null && !TextUtils.isEmpty(val)) {
            try {
                val = getAESObfuscator().unobfuscateToString(val);
            } catch (AESObfuscator.ValidationException e) {
                StoreUtils.LogError(TAG, e.getMessage());
                val = "";
            }

            StoreUtils.LogDebug(TAG, "the fetched value is " + val);
        }
        return val;
    }


    public void setNonEncryptedKeyValue(String key, String val) {
        StoreUtils.LogDebug(TAG, "setting " + val + " for key: " + key);

        val = getAESObfuscator().obfuscateString(val);

        getDatabase().setKeyVal(key, val);
    }


    public void deleteNonEncryptedKeyValue(String key) {
        StoreUtils.LogDebug(TAG, "deleting " + key);

        getDatabase().deleteKeyVal(key);
    }

    public String getNonEncryptedKeyValue(String key) {
        StoreUtils.LogDebug(TAG, "trying to fetch a value for key: " + key);

        String val = getDatabase().getKeyVal(key);

        if (val != null && !TextUtils.isEmpty(val)) {
            try {
                val = getAESObfuscator().unobfuscateToString(val);
            } catch (AESObfuscator.ValidationException e) {
                StoreUtils.LogError(TAG, e.getMessage());
                val = "";
            }

            StoreUtils.LogDebug(TAG, "the fetched value is " + val);
        }
        return val;
    }

    public HashMap<String, String> getNonEncryptedQueryValues(String query) {
        StoreUtils.LogDebug(TAG, "trying to fetch a values for query: " + query);

        HashMap<String, String> vals = getDatabase().getQueryVals(query);
        HashMap<String, String> results = new HashMap<String, String>();
        for(String key : vals.keySet()) {
            String val = vals.get(key);
            if (val != null && !TextUtils.isEmpty(val)) {
                try {
                    val = getAESObfuscator().unobfuscateToString(val);
                    results.put(key, val);
                } catch (AESObfuscator.ValidationException e) {
                    StoreUtils.LogError(TAG, e.getMessage());
                }
            }
        }

        StoreUtils.LogDebug(TAG, "fetched " + results.size() + " results");

        return results;
    }

    /**
     * Sets the given value to the given key.
     * @param key is the key in the key-val pair.
     * @param val is the val in the key-val pair.
     */
    public void setValue(String key, String val) {
        StoreUtils.LogDebug(TAG, "setting " + val + " for key: " + key);

        key = getAESObfuscator().obfuscateString(key);
        val = getAESObfuscator().obfuscateString(val);

        getDatabase().setKeyVal(key, val);
    }

    /**
     * Deletes a key-val pair with the given key.
     * @param key is the key in the key-val pair.
     */
    public void deleteKeyValue(String key) {
        StoreUtils.LogDebug(TAG, "deleting " + key);

        key = getAESObfuscator().obfuscateString(key);

        getDatabase().deleteKeyVal(key);
    }

    private synchronized KeyValDatabase getDatabase(){

        if (mKvDatabase == null) {
            mKvDatabase = new KeyValDatabase(SoomlaApp.getAppContext());

            SharedPreferences prefs = new ObscuredSharedPreferences(
                    SoomlaApp.getAppContext().getSharedPreferences(StoreConfig.PREFS_NAME, Context.MODE_PRIVATE));
            int mt_ver = prefs.getInt("MT_VER", 0);
            int sa_ver_old = prefs.getInt("SA_VER_OLD", -1);
            int sa_ver_new = prefs.getInt("SA_VER_NEW", 0);
            if (mt_ver < StoreConfig.METADATA_VERSION || sa_ver_old < sa_ver_new) {
                SharedPreferences.Editor edit = prefs.edit();
                edit.putInt("MT_VER", StoreConfig.METADATA_VERSION);
                edit.putInt("SA_VER_OLD", sa_ver_new);
                edit.commit();

                String keyStoreInfo = mObfuscator.obfuscateString(KeyValDatabase.keyMetaStoreInfo());
                mKvDatabase.deleteKeyVal(keyStoreInfo);
            }
        }

        return mKvDatabase;
    }

    private static AESObfuscator getAESObfuscator(){
        if (mObfuscator == null) {
            mObfuscator = new AESObfuscator(StoreConfig.obfuscationSalt, SoomlaApp.getAppContext().getPackageName(), StoreUtils.deviceId());
        }

        return mObfuscator;
    }


    /** Private Members **/

    private static final String TAG = "SOOMLA KeyValueStorage";
    private static AESObfuscator mObfuscator;
    private static KeyValDatabase mKvDatabase;
}
