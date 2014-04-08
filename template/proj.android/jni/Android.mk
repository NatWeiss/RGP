LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := cocos2djs_shared

LOCAL_MODULE_FILENAME := libcocos2djs

LOCAL_SRC_FILES := hellojavascript/main.cpp \
                   ../../src/AppDelegate.cpp

LOCAL_C_INCLUDES := $(LOCAL_PATH)/../../src \
				$(LOCAL_PATH)/../../lib/cocos2dx-prebuilt/include \
				$(LOCAL_PATH)/../../lib/cocos2dx-prebuilt/include/cocos \
				$(LOCAL_PATH)/../../lib/cocos2dx-prebuilt/include/cocos/2d/platform/android \
				$(LOCAL_PATH)/../../lib/cocos2dx-prebuilt/include/cocos/editor-support \
				$(LOCAL_PATH)/../../lib/cocos2dx-prebuilt/include/external/spidermonkey/include/android

LOCAL_WHOLE_STATIC_LIBRARIES := cocos_jsb_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_extension_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_chipmunk_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_localstorage_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_network_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_builder_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_studio_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_ui_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_spine_static
LOCAL_WHOLE_STATIC_LIBRARIES += cocosbuilder_static
LOCAL_WHOLE_STATIC_LIBRARIES += cocostudio_static
LOCAL_WHOLE_STATIC_LIBRARIES += spine_static
LOCAL_WHOLE_STATIC_LIBRARIES += cocos2dx_store_static
LOCAL_WHOLE_STATIC_LIBRARIES += PluginProtocolStatic
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_pluginx_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_facebook_static

LOCAL_EXPORT_CFLAGS := -DCOCOS2D_DEBUG=2 -DCOCOS2D_JAVASCRIPT

include $(BUILD_SHARED_LIBRARY)


$(call import-module,bindings)
$(call import-module,bindings/manual/chipmunk)
$(call import-module,bindings/manual/cocosbuilder)
$(call import-module,bindings/manual/cocostudio)
$(call import-module,bindings/manual/extension)
$(call import-module,bindings/manual/localstorage)
$(call import-module,bindings/manual/network)
$(call import-module,bindings/manual/spine)
$(call import-module,bindings/manual/ui)
$(call import-module,plugin/protocols/proj.android/jni)
$(call import-module,../soomla/cocos2dx-store/android/jni)
$(call import-module,bindings-pluginx)
$(call import-module,facebook)
