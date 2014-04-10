LOCAL_PATH := $(call my-dir)
include $(CLEAR_VARS)

LOCAL_MODULE := jsb_facebook_static
LOCAL_MODULE_FILENAME := libfacebook
LOCAL_SRC_FILES := ../../jsb_facebook.cpp ../Facebook_android.cpp
LOCAL_CFLAGS := -DCOCOS2D_JAVASCRIPT
LOCAL_C_INCLUDES := $(LOCAL_PATH)/../..
LOCAL_WHOLE_STATIC_LIBRARIES := spidermonkey_static cocos_jsb_static
include $(BUILD_STATIC_LIBRARY)

$(call import-module,external/spidermonkey/prebuilt/android)
$(call import-module,bindings)
