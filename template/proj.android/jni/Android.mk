LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := cocos2djs_shared

LOCAL_MODULE_FILENAME := libcocos2djs

LOCAL_SRC_FILES := hellojavascript/main.cpp \
                   ../../src/AppDelegate.cpp \
                   ../../src/Extras.cpp

LOCAL_C_INCLUDES := $(LOCAL_PATH)/../../src \
				$(LOCAL_PATH)/../../lib/cocos2dx-prebuilt/include \
				$(LOCAL_PATH)/../../lib/cocos2dx-prebuilt/include/cocos \
				$(LOCAL_PATH)/../../lib/cocos2dx-prebuilt/include/cocos/2d/platform/android \
				$(LOCAL_PATH)/../../lib/cocos2dx-prebuilt/include/cocos/editor-support \
				$(LOCAL_PATH)/../../lib/cocos2dx-prebuilt/include/cocos/scripting/javascript/bindings \
				$(LOCAL_PATH)/../../lib/cocos2dx-prebuilt/include/cocos/scripting/auto-generated/js-bindings \
				$(LOCAL_PATH)/../../lib/cocos2dx-prebuilt/include/external/spidermonkey/include/ios

LOCAL_WHOLE_STATIC_LIBRARIES := cocos_jsb_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_extension_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_chipmunk_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_localstorage_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_network_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_builder_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_studio_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_gui_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_spine_static
LOCAL_WHOLE_STATIC_LIBRARIES += cocosbuilder_static
LOCAL_WHOLE_STATIC_LIBRARIES += cocostudio_static
LOCAL_WHOLE_STATIC_LIBRARIES += spine_static
LOCAL_WHOLE_STATIC_LIBRARIES += cocos2dx_store_static
LOCAL_WHOLE_STATIC_LIBRARIES += PluginProtocolStatic
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_pluginx_static

LOCAL_EXPORT_CFLAGS := -DCOCOS2D_DEBUG=2 -DCOCOS2D_JAVASCRIPT

include $(BUILD_SHARED_LIBRARY)


$(call import-module,scripting/javascript/bindings)
$(call import-module,scripting/javascript/bindings/extension)
$(call import-module,scripting/javascript/bindings/chipmunk)
$(call import-module,scripting/javascript/bindings/localstorage)
$(call import-module,scripting/javascript/bindings/network)
$(call import-module,scripting/javascript/bindings/cocosbuilder)
$(call import-module,scripting/javascript/bindings/cocostudio)
$(call import-module,scripting/javascript/bindings/gui)
$(call import-module,scripting/javascript/bindings/spine)
$(call import-module,editor-support/cocosbuilder)
$(call import-module,editor-support/cocostudio)
$(call import-module,editor-support/spine)
$(call import-module,editor-support/cocosbuilder)
$(call import-module,plugin/protocols/proj.android/jni)
$(call import-module,../soomla/cocos2dx-store/android/jni)
$(call import-module,plugin/jsbindings)
