//
// Created by Fedor Shubin on 1/22/14.
//

#ifdef COCOS2D_JAVASCRIPT

#include "jsb_soomla.h"
#include "cocos2d.h"
#include "cocos2d_specifics.hpp"

#ifndef JSBool
#define JSBool bool
#define JS_TRUE (bool)1
#define JS_FALSE (bool)0
#endif

// Binding specific object by defining JSClass
JSClass*        jsb_class;
JSObject*       jsb_prototype;

// This function is mapping the function “callNative” in “JSBinding.cpp”
JSBool js_callNative(JSContext* cx, uint32_t argc, jsval* vp){
    jsval *argv = JS_ARGV(cx, vp);

    JSBool ok = JS_TRUE;

    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, argv[0], &arg0_tmp); arg0 = arg0_tmp.c_str();
//    JSObject* obj = NULL;
//    JSB::JSBinding* cobj = NULL;
//    obj = JS_THIS_OBJECT(cx, vp);
//    js_proxy_t* proxy = jsb_get_js_proxy(obj);
//    cobj = (JSB::JSBinding* )(proxy ? proxy->ptr : NULL);
//    JSB_PRECONDITION2(cobj, cx, JS_FALSE, "Invalid Native Object");
        std::string result;
        Soomla::JSBinding::callNative(arg0, result);
        jsval ret_jsval = std_string_to_jsval(cx, result);
        JS_SET_RVAL(cx, vp, ret_jsval);
        return ok;
    }
    JS_ReportError(cx, "Wrong number of arguments");
    return JS_FALSE;
}

JSBool js_constructor(JSContext* cx, uint32_t argc, jsval* vp){
    cocos2d::log("JS Constructor...");
    if (argc == 0) {
        Soomla::JSBinding* cobj = new Soomla::JSBinding();
        cocos2d::Ref* ccobj = dynamic_cast<cocos2d::Ref*>(cobj);
        if (ccobj) {
            ccobj->autorelease();
        }
        TypeTest<Soomla::JSBinding> t;
        js_type_class_t* typeClass = nullptr;
		std::string typeName = t.s_name();
		auto typeMapIter = _js_global_type_map.find(typeName);
		CCASSERT(typeMapIter != _js_global_type_map.end(), "Can't find the class type!");
		typeClass = typeMapIter->second;
		CCASSERT(typeClass, "The value is null.");
        JSObject* obj = JS_NewObject(cx, typeClass->jsclass, typeClass->proto, typeClass->parentProto);
        JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(obj));

        js_proxy_t* p = jsb_new_proxy(cobj, obj);
        JS_AddNamedObjectRoot(cx, &p->obj, "JSB::JSBinding");

        return JS_TRUE;
    }

    JS_ReportError(cx, "Wrong number of arguments: %d, was expecting: %d", argc, 0);

    return JS_FALSE;
}


void js_finalize(JSFreeOp* fop, JSObject* obj){
    CCLOGINFO("JSBindings: finallizing JS object %p JSB", obj);
}

// Binding JSB type
void js_register(JSContext* cx, JSObject* global){
    jsb_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_class->name = "CCSoomlaNdkBridge";
    jsb_class->addProperty = JS_PropertyStub;
    jsb_class->delProperty = JS_DeletePropertyStub;
    jsb_class->getProperty = JS_PropertyStub;
    jsb_class->setProperty = JS_StrictPropertyStub;
    jsb_class->enumerate = JS_EnumerateStub;
    jsb_class->resolve = JS_ResolveStub;
    jsb_class->convert = JS_ConvertStub;
    jsb_class->finalize = js_finalize;
    jsb_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);


    static JSPropertySpec properties[] = {
            {0, 0, 0, JSOP_NULLWRAPPER, JSOP_NULLWRAPPER}
    };

    // Binding callNative function

    static JSFunctionSpec funcs[] = {
            JS_FS_END
    };

    // Binding create() function

    static JSFunctionSpec st_funcs[] = {
            JS_FN("callNative", js_callNative, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
            JS_FS_END
    };

    // Binding constructor function and prototype
    jsb_prototype = JS_InitClass(
            cx, global,
            NULL,
            jsb_class,
            js_constructor, 0,
            properties,
            funcs,
            NULL,
            st_funcs);
//    JSBool found;
//FIXME: Removed in Firefox v27	
//    JS_SetPropertyAttributes(cx, global, "JSB", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

/*
	// other bindings use something like the following:
	
	// add the proto and JSClass to the type->js info hash table
	TypeTest<cocos2d::Touch> t;
	js_type_class_t *p;
	std::string typeName = t.s_name();
	if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
	{
		p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
		p->jsclass = jsb_cocos2d_Touch_class;
		p->proto = jsb_cocos2d_Touch_prototype;
		p->parentProto = NULL;
		_js_global_type_map.insert(std::make_pair(typeName, p));
	}
*/
}

// Binding JSB namespace so in JavaScript code JSB namespce can be recognized
void register_jsb_soomla(JSContext *cx, JSObject *global){
	JS::RootedValue nsval(cx);
    JSObject* ns;
    JS_GetProperty(cx, global, "Soomla", &nsval);

    if (nsval == JSVAL_VOID) {
        ns = JS_NewObject(cx, NULL, NULL, NULL);
        nsval = OBJECT_TO_JSVAL(ns);
        JS_SetProperty(cx, global, "Soomla", nsval);
    }
    else{
		ns = JSVAL_TO_OBJECT(nsval);
    }
    global = ns;
    js_register(cx, global);

}

#endif // COCOS2D_JAVASCRIPT