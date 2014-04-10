LOCAL_PATH := $(call my-dir)
include $(CLEAR_VARS)

LOCAL_MODULE := jsb_appbindings_static
LOCAL_MODULE_FILENAME := libappbindings
LOCAL_SRC_FILES := ../../jsb_app_bindings.cpp ../../AppBindings.cpp
LOCAL_CPP_FEATURES += exceptions
LOCAL_CFLAGS := -DCOCOS2D_JAVASCRIPT
LOCAL_C_INCLUDES := $(LOCAL_PATH)/../..
LOCAL_WHOLE_STATIC_LIBRARIES := spidermonkey_static cocos_jsb_static
include $(BUILD_STATIC_LIBRARY)

$(call import-module,external/spidermonkey/prebuilt/android)
$(call import-module,bindings)
