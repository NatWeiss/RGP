LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := jsb_pluginx_static

LOCAL_MODULE_FILENAME := libcocos2dxjsbpluginx

LOCAL_SRC_FILES :=\
$(addprefix manual/, \
	jsb_pluginx_basic_conversions.cpp \
	jsb_pluginx_extension_registration.cpp \
	jsb_pluginx_manual_callback.cpp \
	jsb_pluginx_manual_protocols.cpp \
	jsb_pluginx_spidermonkey_specifics.cpp \
	pluginxUTF8.cpp \
) \
auto/jsb_pluginx_protocols_auto.cpp 

LOCAL_CFLAGS := -DCOCOS2D_JAVASCRIPT
LOCAL_EXPORT_CFLAGS := -DCOCOS2D_JAVASCRIPT

#LOCAL_CFLAGS := -Wno-psabi
#LOCAL_EXPORT_CFLAGS := -Wno-psabi

LOCAL_C_INCLUDES := $(LOCAL_PATH)/../../plugin/protocols/include \
	$(LOCAL_PATH)/../../plugin/protocols/platform/android \
	$(LOCAL_PATH)/../../external/spidermonkey/include/ios \
	$(LOCAL_PATH)/manual

LOCAL_EXPORT_C_INCLUDES := $(LOCAL_PATH)/../../plugin/protocols/include \
	$(LOCAL_PATH)/../../plugin/protocols/platform/android \
	$(LOCAL_PATH)/../../external/spidermonkey/include/ios \
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

$(call import-module,spidermonkey/prebuilt/android)
$(call import-module,scripting/javascript/bindings)
$(call import-module,network)
$(call import-module,websockets/prebuilt/android)
