//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

#include "AppBindings.h"
#include "jsb_app_bindings.h"
#include "cocos2d_specifics.hpp"

const char* const kJSNamespace = "App";

JSClass* jsb_app_bindings_class;
JSObject* jsb_app_bindings_prototype;

bool jsval_to_binary_data(JSContext *cx, jsval v, void** ret, uint32_t *byteLength)
{
	JSObject* obj = JSVAL_TO_OBJECT(v);
	JSB_PRECONDITION3(obj && JS_IsTypedArrayObject(obj), cx, false, "Not a TypedArray object");
	
	*ret = JS_GetUint8ClampedArrayData(obj) + JS_GetTypedArrayByteOffset(obj);
	*byteLength = JS_GetTypedArrayByteLength(obj);

	return true;
}

bool jsb_app_bindings_addImageRaw(JSContext *cx, uint32_t argc, jsval *vp)
{
	const int numArgs = 2;
	if (argc == numArgs)
	{
		bool ok = true;
		jsval* argv = JS_ARGV(cx, vp);
		//JSObject* obj = JS_THIS_OBJECT(cx, vp);
		string arg0;
		void* arg1;
		uint32_t arg2;
		ok &= jsval_to_std_string(cx, argv[0], &arg0);
		JSB_PRECONDITION2(ok && arg0.size(), cx, false, "Error processing arguments 1/2");
		ok &= jsval_to_binary_data(cx, argv[1], &arg1, &arg2);
		JSB_PRECONDITION2(ok && arg1 && arg2, cx, false, "Error processing arguments 2/2");
		
		cocos2d::Texture2D* ret = AppBindings::addImageData(arg0.c_str(), arg1, arg2);
		if (ret)
		{
			js_proxy_t *proxy = js_get_or_create_proxy<cocos2d::Texture2D>(cx, ret);
			JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(proxy->obj));
		}
		else
		{
			JS_SET_RVAL(cx, vp, JSVAL_NULL);
		}
		return true;
	}
	JS_ReportError(cx, "%s: wrong number of arguments: %d, was expecting %d", __func__, argc, numArgs);
	return false;
}

void jsb_app_bindings_finalize(JSFreeOp *fop, JSObject *obj)
{
    CCLOGINFO("jsbindings: finalizing JS object %p (app_bindings)", obj);
}

static bool empty_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
	return false;
}

void register_jsb_app_bindings(JSContext *cx, JSObject *global)
{
	cocos2d::log("SpiderMonkey version %s %s", JS_GetImplementationVersion(), JS_VersionToString(JS_GetVersion(cx)));

	jsb_app_bindings_class = (JSClass *)calloc(1, sizeof(JSClass));
	jsb_app_bindings_class->name = kJSNamespace;
	jsb_app_bindings_class->addProperty = JS_PropertyStub;
	jsb_app_bindings_class->delProperty = JS_DeletePropertyStub;
	jsb_app_bindings_class->getProperty = JS_PropertyStub;
	jsb_app_bindings_class->setProperty = JS_StrictPropertyStub;
	jsb_app_bindings_class->enumerate = JS_EnumerateStub;
	jsb_app_bindings_class->resolve = JS_ResolveStub;
	jsb_app_bindings_class->convert = JS_ConvertStub;
	jsb_app_bindings_class->finalize = jsb_app_bindings_finalize;
	jsb_app_bindings_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

	static JSPropertySpec properties[] =
	{
		{0, 0, 0, JSOP_NULLWRAPPER, JSOP_NULLWRAPPER}
	};

	static JSFunctionSpec funcs[] =
	{
        JS_FS_END
	};

	static JSFunctionSpec st_funcs[] =
	{
		JS_FN("addImageData", jsb_app_bindings_addImageRaw, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FS_END
	};

	jsb_app_bindings_prototype = JS_InitClass(
		cx, global,
		jsb_app_bindings_prototype,
		jsb_app_bindings_class,
		empty_constructor, 0, // no constructor
		properties,
		funcs,
		NULL, // no static properties
		st_funcs);

	// make the class enumerable in the registered namespace
	//bool found;
	//FIXME: Removed in Firefox v27	
	//JS_SetPropertyAttributes(cx, global, kJSNamespace, JSPROP_ENUMERATE | JSPROP_READONLY, &found);

	// add the proto and JSClass to the type->js info hash table
	TypeTest<AppBindings> t;
	js_type_class_t *p;
	std::string typeName = t.s_name();
	if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
	{
		p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
		p->jsclass = jsb_app_bindings_class;
		p->proto = jsb_app_bindings_prototype;
		p->parentProto = NULL;
		_js_global_type_map.insert(std::make_pair(typeName, p));
	}
}
