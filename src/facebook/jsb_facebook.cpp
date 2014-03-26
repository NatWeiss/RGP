
#include "jsb_facebook.h"
#include "Facebook.h"
#include "cocos2d_specifics.hpp"

using namespace cocos2d;

JSClass* jsb_facebook_class;
JSObject* jsb_facebook_prototype;

template<class T> T* getNativeObj(JSContext* cx, jsval* vp)
{
	JSObject* obj = JS_THIS_OBJECT(cx, vp);
	js_proxy_t* proxy = jsb_get_js_proxy(obj);
	T* cobj = (T*)(proxy ? proxy->ptr : NULL);
	JSB_PRECONDITION2( cobj, cx, nullptr, "Invalid Native Object");
	return cobj;
}

void dictionaryToMap(__Dictionary* dict, map<string,string>& ret)
{
	DictElement* el = nullptr;
	CCDICT_FOREACH(dict, el)
	{
		auto str = dynamic_cast<__String*>(el->getObject());
		auto boolean = dynamic_cast<__Bool*>(el->getObject());
		auto number = dynamic_cast<__Double*>(el->getObject());
		stringstream ss;
		if (str)
			ss << str->getCString();
		else if (boolean)
			ss << (int)boolean->getValue();
		else if (number)
			ss << number->getValue();
		ret[el->getStrKey()] = ss.str();
	}
}

template<class T> static bool real_constructor(JSContext *cx, uint32_t argc, jsval *vp) {
	T* ret = new T();
	jsval jsret = JSVAL_NULL;
	do
	{
		if (ret)
		{
			js_proxy_t *jsProxy = js_get_or_create_proxy<T>(cx, (T*)ret);
			jsret = OBJECT_TO_JSVAL(jsProxy->obj);
		}
		else
		{
			jsret = JSVAL_NULL;
		}
	} while (0);

	JS_SET_RVAL(cx, vp, jsret);
	return true;
}

static bool js_is_native_obj(JSContext *cx, JS::HandleObject obj, JS::HandleId id, JS::MutableHandleValue vp)
{
	vp.set(BOOLEAN_TO_JSVAL(true));
	return true;	
}

bool js_facebook_init(JSContext* cx, uint32_t argc, jsval* vp)
{
	const int numArgs = 0;
	if (argc == numArgs)
	{
		getNativeObj<Facebook>(cx, vp)->init();
		JS_SET_RVAL(cx, vp, JSVAL_VOID);
		return true;
	}
	JS_ReportError(cx, "%s: Wrong number of arguments: %d, was expecting %d", __func__, argc, numArgs);
	return false;
}

bool js_facebook_isLoggedIn(JSContext* cx, uint32_t argc, jsval* vp)
{
	const int numArgs = 0;
	if (argc == numArgs)
	{
		bool ret = getNativeObj<Facebook>(cx, vp)->isLoggedIn();
		JS_SET_RVAL(cx, vp, BOOLEAN_TO_JSVAL(ret));
		return true;
	}
	JS_ReportError(cx, "%s: Wrong number of arguments: %d, was expecting %d", __func__, argc, numArgs);
	return false;
}

bool js_facebook_isCanvasMode(JSContext* cx, uint32_t argc, jsval* vp)
{
	const int numArgs = 0;
	if (argc == numArgs)
	{
		bool ret = getNativeObj<Facebook>(cx, vp)->isCanvasMode();
		JS_SET_RVAL(cx, vp, BOOLEAN_TO_JSVAL(ret));
		return true;
	}
	JS_ReportError(cx, "%s: Wrong number of arguments: %d, was expecting %d", __func__, argc, numArgs);
	return false;
}

bool js_facebook_setDebugMode(JSContext* cx, uint32_t argc, jsval* vp)
{
	const int numArgs = 1;
	if (argc == numArgs)
	{
		bool enabled = JSVAL_TO_BOOLEAN(JS_ARGV(cx, vp)[0]);
		getNativeObj<Facebook>(cx, vp)->setDebugMode(enabled);
		JS_SET_RVAL(cx, vp, JSVAL_VOID);
		return true;
	}
	JS_ReportError(cx, "%s: Wrong number of arguments: %d, was expecting %d", __func__, argc, numArgs);
	return false;
}

bool js_facebook_configDeveloperInfo(JSContext* cx, uint32_t argc, jsval* vp)
{
	const int numArgs = 1;
	if (argc == numArgs)
	{
		bool ok = true;
		__Dictionary* devInfoDict = nullptr;
		ok &= jsval_to_ccdictionary(cx, JS_ARGV(cx, vp)[0], &devInfoDict);
		JSB_PRECONDITION2(ok && devInfoDict, cx, false, "Error processing arguments");
		
		map<string,string> devInfo;
		dictionaryToMap(devInfoDict, devInfo);
		getNativeObj<Facebook>(cx, vp)->configDeveloperInfo(devInfo);
		JS_SET_RVAL(cx, vp, JSVAL_VOID);
		return true;
	}
	JS_ReportError(cx, "%s: Wrong number of arguments: %d, was expecting %d", __func__, argc, numArgs);
	return false;
}

bool js_facebook_login(JSContext* cx, uint32_t argc, jsval* vp)
{
	const int numArgs = 1;
	if (argc == numArgs)
	{
		bool ok = true;
		__Dictionary* dict = nullptr;
		ok &= jsval_to_ccdictionary(cx, JS_ARGV(cx, vp)[0], &dict);
		JSB_PRECONDITION2(ok && dict, cx, false, "Error processing arguments");
		
		map<string,string> m;
		dictionaryToMap(dict, m);
		getNativeObj<Facebook>(cx, vp)->login(m);
		JS_SET_RVAL(cx, vp, JSVAL_VOID);
		return true;
	}
	JS_ReportError(cx, "%s: Wrong number of arguments: %d, was expecting %d", __func__, argc, numArgs);
	return false;
}

bool js_facebook_logout(JSContext* cx, uint32_t argc, jsval* vp)
{
	const int numArgs = 0;
	if (argc == numArgs)
	{
		getNativeObj<Facebook>(cx, vp)->logout();
		JS_SET_RVAL(cx, vp, JSVAL_VOID);
		return true;
	}
	JS_ReportError(cx, "%s: Wrong number of arguments: %d, was expecting %d", __func__, argc, numArgs);
	return false;
}

bool js_facebook_getPlayerName(JSContext* cx, uint32_t argc, jsval* vp)
{
	const int numArgs = 1;
	if (argc <= numArgs)
	{
		string str;
		if (argc > 0)
			jsval_to_std_string(cx, JS_ARGV(cx, vp)[0], &str);
		auto& ret = getNativeObj<Facebook>(cx, vp)->getPlayerName(str);
		JS_SET_RVAL(cx, vp, std_string_to_jsval(cx, ret));
		return true;
	}
	JS_ReportError(cx, "%s: Wrong number of arguments: %d, was expecting %d", __func__, argc, numArgs);
	return false;
}

bool js_facebook_getPlayerFirstName(JSContext* cx, uint32_t argc, jsval* vp)
{
	const int numArgs = 1;
	if (argc <= numArgs)
	{
		string str;
		if (argc > 0)
			jsval_to_std_string(cx, JS_ARGV(cx, vp)[0], &str);
		auto& ret = getNativeObj<Facebook>(cx, vp)->getPlayerFirstName(str);
		JS_SET_RVAL(cx, vp, std_string_to_jsval(cx, ret));
		return true;
	}
	JS_ReportError(cx, "%s: Wrong number of arguments: %d, was expecting %d", __func__, argc, numArgs);
	return false;
}

bool js_facebook_getPlayerImageUrl(JSContext* cx, uint32_t argc, jsval* vp)
{
	const int numArgs = 2;
	if (argc <= numArgs)
	{
		string str;
		int callback;
		if (argc > 0)
			jsval_to_std_string(cx, JS_ARGV(cx, vp)[0], &str);
		auto& ret = getNativeObj<Facebook>(cx, vp)->getPlayerImageUrl(str, callback);
		JS_SET_RVAL(cx, vp, std_string_to_jsval(cx, ret));
		return true;
	}
	JS_ReportError(cx, "%s: Wrong number of arguments: %d, was expecting 0-%d", __func__, argc, numArgs);
	return false;
}

bool js_facebook_getRandomFriendId(JSContext* cx, uint32_t argc, jsval* vp)
{
	const int numArgs = 0;
	if (argc == numArgs)
	{
		auto& ret = getNativeObj<Facebook>(cx, vp)->getRandomFriendId();
		JS_SET_RVAL(cx, vp, std_string_to_jsval(cx, ret));
		return true;
	}
	JS_ReportError(cx, "%s: Wrong number of arguments: %d, was expecting %d", __func__, argc, numArgs);
	return false;
}

bool js_facebook_getSDKVersion(JSContext* cx, uint32_t argc, jsval* vp)
{
	const int numArgs = 0;
	if (argc == numArgs)
	{
		int ret = getNativeObj<Facebook>(cx, vp)->getSDKVersion();
		JS_SET_RVAL(cx, vp, INT_TO_JSVAL(ret));
		return true;
	}
	JS_ReportError(cx, "%s: Wrong number of arguments: %d, was expecting %d", __func__, argc, numArgs);
	return false;
}

void js_facebook_finalize(JSFreeOp* fop, JSObject* obj)
{
    CCLOGINFO("JSBindings: finalizing JS object %p JSB", obj);
}

void js_facebook_register(JSContext* cx, JSObject* global)
{
	jsb_facebook_class = (JSClass *)calloc(1, sizeof(JSClass));
	jsb_facebook_class->name = "Facebook";
	jsb_facebook_class->addProperty = JS_PropertyStub;
	jsb_facebook_class->delProperty = JS_DeletePropertyStub;
	jsb_facebook_class->getProperty = JS_PropertyStub;
	jsb_facebook_class->setProperty = JS_StrictPropertyStub;
	jsb_facebook_class->enumerate = JS_EnumerateStub;
	jsb_facebook_class->resolve = JS_ResolveStub;
	jsb_facebook_class->convert = JS_ConvertStub;
	jsb_facebook_class->finalize = js_facebook_finalize;
	jsb_facebook_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

	static JSPropertySpec properties[] =
	{
		{"__nativeObj", 0, JSPROP_ENUMERATE | JSPROP_PERMANENT, JSOP_WRAPPER(js_is_native_obj), JSOP_NULLWRAPPER},
		{0, 0, 0, JSOP_NULLWRAPPER, JSOP_NULLWRAPPER}
	};

	static JSFunctionSpec funcs[] =
	{
		JS_FN("init", js_facebook_init, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("isLoggedIn", js_facebook_isLoggedIn, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("isCanvasMode", js_facebook_isCanvasMode, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("setDebugMode", js_facebook_setDebugMode, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("configDeveloperInfo", js_facebook_configDeveloperInfo, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("login", js_facebook_login, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("logout", js_facebook_logout, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("getPlayerName", js_facebook_getPlayerName, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("getPlayerFirstName", js_facebook_getPlayerFirstName, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("getPlayerImageUrl", js_facebook_getPlayerImageUrl, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("getRandomFriendId", js_facebook_getRandomFriendId, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("getSDKVersion", js_facebook_getSDKVersion, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FS_END
	};

	static JSFunctionSpec st_funcs[] =
	{
		JS_FS_END
	};

	// Binding constructor function and prototype
	jsb_facebook_prototype = JS_InitClass(
		cx, global,
		NULL,
		jsb_facebook_class,
		real_constructor<Facebook>, 0,
		properties,
		funcs,
		NULL,
		st_funcs);

	//bool found;
	//FIXME: Removed in Firefox v27	
	//JS_SetPropertyAttributes(cx, global, "JSB", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

	// add the proto and JSClass to the type->js info hash table
	TypeTest<Facebook> t;
	js_type_class_t* p;
	std::string typeName = t.s_name();
	if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
	{
		p = (js_type_class_t*)malloc(sizeof(js_type_class_t));
		p->jsclass = jsb_facebook_class;
		p->proto = jsb_facebook_prototype;
		p->parentProto = NULL;
		_js_global_type_map.insert(std::make_pair(typeName, p));
	}
}

void register_jsb_facebook(JSContext* cx, JSObject* global)
{
	JS::RootedValue nsval(cx);
	JSObject* ns;
	JS_GetProperty(cx, global, "plugin", &nsval);

	if (nsval == JSVAL_VOID) {
		ns = JS_NewObject(cx, NULL, NULL, NULL);
		nsval = OBJECT_TO_JSVAL(ns);
		JS_SetProperty(cx, global, "plugin", nsval);
	}
	else
	{
		ns = JSVAL_TO_OBJECT(nsval);
	}
	global = ns;

	js_facebook_register(cx, global);
}
