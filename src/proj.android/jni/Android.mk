LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

$(info APP_PLATFORM=$(APP_PLATFORM))
$(info APP_ABI=$(APP_ABI))
$(info APP_OPTIM=$(APP_OPTIM))
$(info APP_CPPFLAGS=$(APP_CPPFLAGS))

LOCAL_MODULE := cocos2djs_shared

LOCAL_MODULE_FILENAME := libcocos2djs

LOCAL_ARM_MODE := arm

LOCAL_WHOLE_STATIC_LIBRARIES := cocos_jsb_static
# begin pro
LOCAL_WHOLE_STATIC_LIBRARIES += cocos2dx_store_static
LOCAL_WHOLE_STATIC_LIBRARIES += PluginProtocolStatic
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_pluginx_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_facebook_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_appbindings_static
# end pro

include $(BUILD_SHARED_LIBRARY)


$(call import-module,bindings)
# begin pro
$(call import-module,plugin/jsbindings)
$(call import-module,cocos2dx-store/android/jni)
$(call import-module,facebook/proj.android/jni)
$(call import-module,app/proj.android/jni)
# end pro
