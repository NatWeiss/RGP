LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := jsb_facebook_static

LOCAL_MODULE_FILENAME := libfacebook

LOCAL_SRC_FILES := jsb_facebook.cpp \
	Facebook.mm

LOCAL_CFLAGS := -DCOCOS2D_JAVASCRIPT
LOCAL_EXPORT_CFLAGS := -DCOCOS2D_JAVASCRIPT

#LOCAL_CFLAGS := -Wno-psabi
#LOCAL_EXPORT_CFLAGS := -Wno-psabi

LOCAL_C_INCLUDES := $(LOCAL_PATH)/../cocos2d-x/plugin/protocols/include \
	$(LOCAL_PATH)/../cocos2d-x/plugin/protocols/platform/android \
	$(LOCAL_PATH)/../external/spidermonkey/include/android \
	$(LOCAL_PATH)/manual

LOCAL_EXPORT_C_INCLUDES := $(LOCAL_PATH)/../cocos2d-x/plugin/protocols/include \
	$(LOCAL_PATH)/../cocos2d-x/plugin/protocols/platform/android \
	$(LOCAL_PATH)/../external/spidermonkey/include/ios \
	$(LOCAL_PATH)/manual

#LOCAL_LDLIBS := -landroid
#LOCAL_LDLIBS += -llog

#LOCAL_STATIC_LIBRARIES := android_native_app_glue

LOCAL_WHOLE_STATIC_LIBRARIES := spidermonkey_static
LOCAL_WHOLE_STATIC_LIBRARIES += cocos_jsb_static
LOCAL_WHOLE_STATIC_LIBRARIES += cocos_network_static
LOCAL_WHOLE_STATIC_LIBRARIES += websockets_static

include $(BUILD_STATIC_LIBRARY)

#$(call import-module,android/native_app_glue)

$(call import-module,external/spidermonkey/prebuilt/android)
$(call import-module,bindings)
$(call import-module,network)
$(call import-module,websockets/prebuilt/android)
