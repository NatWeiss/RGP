
#include "AppDelegate.h"

#include "cocosbuilder/js_bindings_ccbreader.h"
#include "SimpleAudioEngine.h"
#include "jsb_cocos2dx_auto.hpp"
#include "jsb_cocos2dx_ui_auto.hpp"
#include "jsb_cocos2dx_studio_auto.hpp"
#include "jsb_cocos2dx_extension_auto.hpp"
#include "jsb_cocos2dx_builder_auto.hpp"
#include "ui/jsb_cocos2dx_ui_manual.h"
#include "extension/jsb_cocos2dx_extension_manual.h"
#include "cocostudio/jsb_cocos2dx_studio_manual.h"
#include "localstorage/js_bindings_system_registration.h"
#include "chipmunk/js_bindings_chipmunk_registration.h"
#include "jsb_opengl_registration.h"

#include "bindings/manual/network/XMLHTTPRequest.h"
#include "bindings/auto/jsb_pluginx_protocols_auto.hpp"
#include "cocos2dx-store/Soomla/jsb/jsb_soomla.h"

/*
#include "cocos2d.h"
#include "SimpleAudioEngine.h"
#include "ScriptingCore.h"
#include "jsb_cocos2dx_auto.hpp"
#include "jsb_cocos2dx_extension_auto.hpp"
#include "jsb_cocos2dx_builder_auto.hpp"
#include "jsb_cocos2dx_studio_auto.hpp"
#include "jsb_cocos2dx_gui_auto.hpp"
#include "jsb_cocos2dx_spine_auto.hpp"
#include "extension/jsb_cocos2dx_extension_manual.h"
#include "cocostudio/jsb_cocos2dx_studio_manual.h"
#include "gui/jsb_cocos2dx_gui_manual.h"
#include "cocos2d_specifics.hpp"
#include "cocosbuilder/cocosbuilder_specifics.hpp"
#include "chipmunk/js_bindings_chipmunk_registration.h"
#include "localstorage/js_bindings_system_registration.h"
#include "jsb_opengl_registration.h"
#include "network/XMLHTTPRequest.h"
#include "network/jsb_websocket.h"
#include "cocosbuilder/js_bindings_ccbreader.h"
//#include "jsb_pluginx_protocols_auto.hpp"
//#include "jsb_soomla.h"

//#import <UIKit/UIKit.h>
//#import <Foundation/Foundation.h>
//#import <NSWorkspace.h>
*/

#ifndef JSBool
#define JSBool bool
#define JS_TRUE (bool)1
#define JS_FALSE (bool)0
#endif

const char* const kJSNamespace = "App";

using namespace std;
using namespace cocos2d;
using namespace CocosDenshion;

#if( CC_TARGET_PLATFORM == CC_PLATFORM_MAC )

	#import <Cocoa/Cocoa.h>

	void __openURL(const char* urlCstr)
	{
		NSString* str = [[NSString alloc] initWithUTF8String:urlCstr];
		NSURL* url = [[NSURL alloc] initWithString:str];
		[[NSWorkspace sharedWorkspace] openURL:url];
		[url release];
		[str release];
	}

#elif( CC_TARGET_PLATFORM == CC_PLATFORM_IOS )
	;
#endif

JSBool jsval_to_binary_data(JSContext *cx, jsval v, void** ret, uint32_t *byteLength) {
	JSObject *tmp_arg = JSVAL_TO_OBJECT(v);

	//JSBool ok = JS_ValueToObject( cx, v, tmp_arg );
	//JSB_PRECONDITION3( ok, cx, JS_FALSE, "Error converting value to object");
	JSB_PRECONDITION3( tmp_arg && JS_IsTypedArrayObject( tmp_arg ), cx, JS_FALSE, "Not a TypedArray object");
	
	*ret = JS_GetArrayBufferViewData( tmp_arg );
	*byteLength = JS_GetTypedArrayByteLength( tmp_arg );

	return JS_TRUE;
}


namespace cocos2d
{
	class Extras : public Ref
	{
		public:
			static Texture2D* addImageRaw(const char* name, void* data, int dataLength)
			{
				auto cacher = Director::getInstance()->getTextureCache();
				string path = FileUtils::getInstance()->fullPathForFilename(name);
				if (path.size() == 0)
					return nullptr;
				printf("Adding raw image: %s, length %d\n", path.c_str(), dataLength);
				if (dataLength == 0)
					return nullptr;
				
				
				auto texture = cacher->getTextureForKey(name);
				if( texture == nullptr )
				{
					auto image = new Image();
					if( image )
					{
						texture = cacher->addImage(image, name);
						printf("Added texture %x, image %x\n", (uint32_t)(uint64_t)texture, (uint32_t)(uint64_t)image);
					}
				}
				return texture;
			}
	};
}

JSBool js_cocos2dx_CCExtras_addImageRaw(JSContext *cx, uint32_t argc, jsval *vp)
{
	jsval *argv = JS_ARGV(cx, vp);
	JSBool ok = JS_TRUE;
	JSObject *obj = JS_THIS_OBJECT(cx, vp);
	//js_proxy_t *proxy = jsb_get_js_proxy(obj);
	//cocos2d::CCTextureCache* cobj = (cocos2d::CCTextureCache *)(proxy ? proxy->ptr : NULL);
	//JSB_PRECONDITION2( cobj, cx, JS_FALSE, "Invalid Native Object");
	if (argc == 2) {
		const char* arg0;
		void* arg1;
		uint32_t arg2;
		std::string arg0_tmp; ok &= jsval_to_std_string(cx, argv[0], &arg0_tmp); arg0 = arg0_tmp.c_str();
		JSB_PRECONDITION2(ok, cx, JS_FALSE, "Error processing arguments 1/2");
		ok &= jsval_to_binary_data(cx, argv[1], &arg1, &arg2);
		JSB_PRECONDITION2(ok, cx, JS_FALSE, "Error processing arguments 2/2");
		cocos2d::Texture2D* ret = cocos2d::Extras::addImageRaw(arg0, arg1, arg2);
		jsval jsret;
		do {
			if (ret) {
				js_proxy_t *proxy = js_get_or_create_proxy<cocos2d::Texture2D>(cx, ret);
				jsret = OBJECT_TO_JSVAL(proxy->obj);
			} else {
				jsret = JSVAL_NULL;
			}
		} while (0);
		JS_SET_RVAL(cx, vp, jsret);
		return JS_TRUE;
	}

	JS_ReportError(cx, "wrong number of arguments: %d, was expecting %d", argc, 2);
	return JS_FALSE;
}


JSClass  *jsb_cocos2d_CCExtras_class;
JSObject *jsb_cocos2d_CCExtras_prototype;
//extern JSObject *jsb_CCActionInstant_prototype;

void js_cocos2d_CCExtras_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (CCExtras)", obj);
}
static JSBool empty_constructor(JSContext *cx, uint32_t argc, jsval *vp) {
	return JS_FALSE;
}

void js_register_cocos2dx_CCExtras(JSContext *cx, JSObject *global) {
	jsb_cocos2d_CCExtras_class = (JSClass *)calloc(1, sizeof(JSClass));
	jsb_cocos2d_CCExtras_class->name = kJSNamespace;
	jsb_cocos2d_CCExtras_class->addProperty = JS_PropertyStub;
	jsb_cocos2d_CCExtras_class->delProperty = JS_DeletePropertyStub;
	jsb_cocos2d_CCExtras_class->getProperty = JS_PropertyStub;
	jsb_cocos2d_CCExtras_class->setProperty = JS_StrictPropertyStub;
	jsb_cocos2d_CCExtras_class->enumerate = JS_EnumerateStub;
	jsb_cocos2d_CCExtras_class->resolve = JS_ResolveStub;
	jsb_cocos2d_CCExtras_class->convert = JS_ConvertStub;
	jsb_cocos2d_CCExtras_class->finalize = js_cocos2d_CCExtras_finalize;
	jsb_cocos2d_CCExtras_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

	static JSPropertySpec properties[] = {
		//{"__nativeObj", 0, JSPROP_ENUMERATE | JSPROP_PERMANENT, JSOP_WRAPPER(js_is_native_obj), JSOP_NULLWRAPPER},
		{0, 0, 0, JSOP_NULLWRAPPER, JSOP_NULLWRAPPER}
	};

	static JSFunctionSpec funcs[] = {
        JS_FS_END
	};

	static JSFunctionSpec st_funcs[] = {
		JS_FN("addImageRaw", js_cocos2dx_CCExtras_addImageRaw, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FS_END
	};

	jsb_cocos2d_CCExtras_prototype = JS_InitClass(
		cx, global,
		jsb_cocos2d_ActionInstant_prototype,
		jsb_cocos2d_CCExtras_class,
		empty_constructor, 0, // no constructor
		properties,
		funcs,
		NULL, // no static properties
		st_funcs);
	// make the class enumerable in the registered namespace
//	JSBool found;
//	JS_SetPropertyAttributes(cx, global, kJSNamespace, JSPROP_ENUMERATE | JSPROP_READONLY, &found);

	// add the proto and JSClass to the type->js info hash table
	TypeTest<cocos2d::Extras> t;
	js_type_class_t *p;
	std::string typeName = t.s_name();
	if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
	{
		p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
		p->jsclass = jsb_cocos2d_CCExtras_class;
		p->proto = jsb_cocos2d_CCExtras_prototype;
		p->parentProto = NULL;
		_js_global_type_map.insert(std::make_pair(typeName, p));
	}

/*	JS::RootedValue nsval(cx);
	JS::RootedObject ns(cx);
	JS_GetProperty(cx, global, "plugin", &nsval);
	if (nsval == JSVAL_VOID) {
		ns = JS_NewObject(cx, NULL, NULL, NULL);
		nsval = OBJECT_TO_JSVAL(ns);
		JS_SetProperty(cx, global, "plugin", nsval);
	} else {
		JS_ValueToObject(cx, nsval, &ns);
	}
*/
//	global = ns;

/*	auto obj = global;
	JS::RootedValue nsval(cx);
	JS::RootedObject ns(cx);
	JS_GetProperty(cx, obj, "cc", &nsval);
	if (nsval == JSVAL_VOID) {
		ns = JS_NewObject(cx, NULL, NULL, NULL);
		nsval = OBJECT_TO_JSVAL(ns);
		JS_SetProperty(cx, obj, "cc", nsval);
	} else {
		JS_ValueToObject(cx, nsval, &ns);
	}
	obj = ns;
*/
}
