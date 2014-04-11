//
// Created by Fedor Shubin on 1/22/14.
//

#ifdef COCOS2D_JAVASCRIPT

#include "JSBinding.h"
#include "CCSoomlaError.h"
#include "jansson.h"
#include "CCSoomlaJsonHelper.h"
#include "CCSoomlaNdkBridge.h"

using namespace cocos2d;

void Soomla::JSBinding::callNative(const char *params, std::string &result) {
    result.assign(params);

    //cocos2d::log("callNative: in >> %s", params);

    json_error_t error;
    json_t *root;
    root = json_loads(params, 0, &error);

    if (!root) {
        cocos2d::log("error: at line #%d: %s", error.line, error.text);
        return;
    }

    cocos2d::Ref *dataToPass = CCSoomlaJsonHelper::getCCObjectFromJson(root);
    __Dictionary *dictToPass = dynamic_cast<__Dictionary *>(dataToPass);
    CC_ASSERT(dictToPass);

    soomla::CCSoomlaError *soomlaError = NULL;
    __Dictionary *retParams = (__Dictionary *) soomla::CCSoomlaNdkBridge::callNative(dictToPass, &soomlaError);

    __Dictionary *resultParams = __Dictionary::create();
    if (soomlaError != NULL) {
        retParams = __Dictionary::create();
        retParams->setObject(__Integer::create(soomlaError->getCode()), "code");
        retParams->setObject(__String::create(soomlaError->getInfo()), "info");

        resultParams->setObject(__Bool::create(false), "success");
    } else {
        resultParams->setObject(__Bool::create(true), "success");
    }
    resultParams->setObject(retParams, "result");

    root = CCSoomlaJsonHelper::getJsonFromCCObject(resultParams);
    char *dump = json_dumps(root, JSON_COMPACT | JSON_ENSURE_ASCII);
    //cocos2d::log("callNative: out >> %s", dump);
    result = dump;
    free(dump);
}

void Soomla::JSBinding::callCallback(__Dictionary *params) {
    json_t *root = CCSoomlaJsonHelper::getJsonFromCCObject(params);
    char *dump = json_dumps(root, JSON_COMPACT | JSON_ENSURE_ASCII);
    //cocos2d::log("callCallback: in >> %s", dump);

	std::stringstream ss;
	ss << "easyNDKCallBack('" << dump << "');";
    free(dump);
	//json_delete(root);

	//cocos2d::log("Executing: %s", ss.str().c_str());
	jsval retval;
	ScriptingCore::getInstance()->evalString(ss.str().c_str(), &retval);
}

#endif // COCOS2D_JAVASCRIPT