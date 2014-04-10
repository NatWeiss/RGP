//
// Created by Fedor Shubin on 5/21/13.
//


#include "CCSoomlaError.h"

USING_NS_CC;

namespace soomla {
    #define JSON_ERROR_CODE "errorCode"

    #define TAG "CCSoomlaError"

    CCSoomlaError *CCSoomlaError::createWithObject(cocos2d::Ref *obj) {
        __Dictionary *dict = dynamic_cast<__Dictionary *>(obj);
        if (dict != NULL && dict->objectForKey(JSON_ERROR_CODE) != NULL) {
            __Integer *errorCode = dynamic_cast<__Integer *>(dict->objectForKey(JSON_ERROR_CODE));
            CC_ASSERT(errorCode);

            CCSoomlaError *ret = new CCSoomlaError();
            ret->autorelease();
            ret->init(errorCode->getValue());
            return ret;
        } else {
            return NULL;
        }
    }

    CCSoomlaError *CCSoomlaError::createVirtualItemNotFoundException() {
        CCSoomlaError *ret = new CCSoomlaError();
        ret->autorelease();
        ret->init(SOOMLA_EXCEPTION_ITEM_NOT_FOUND);
        return ret;
    }

    CCSoomlaError *CCSoomlaError::createInsufficientFundsException() {
        CCSoomlaError *ret = new CCSoomlaError();
        ret->autorelease();
        ret->init(SOOMLA_EXCEPTION_INSUFFICIENT_FUNDS);
        return ret;
    }

    CCSoomlaError *CCSoomlaError::createNotEnoughGoodsException() {
        CCSoomlaError *ret = new CCSoomlaError();
        ret->autorelease();
        ret->init(SOOMLA_EXCEPTION_NOT_ENOUGH_GOODS);
        return ret;
    }

    bool CCSoomlaError::init(int code) {
        mCode = code;

        if (code == SOOMLA_EXCEPTION_ITEM_NOT_FOUND) {
            cocos2d::log("%s %s", TAG, "SOOMLA/COCOS2DX Got VirtualItemNotFoundException exception");
            mInfo = "VirtualItemNotFoundException()";
        }
        else if (code == SOOMLA_EXCEPTION_INSUFFICIENT_FUNDS) {
            cocos2d::log("%s %s", TAG, "SOOMLA/COCOS2DX Got InsufficientFundsException exception");
            mInfo = "InsufficientFundsException()";
        }
        else if (code == SOOMLA_EXCEPTION_NOT_ENOUGH_GOODS) {
            cocos2d::log("%s %s", TAG, "SOOMLA/COCOS2DX Got NotEnoughGoodsException exception");
            mInfo = "NotEnoughGoodsException()";
        }
        else if (code == SOOMLA_EXCEPTION_OTHER) {
            cocos2d::log("%s %s", TAG, "SOOMLA/COCOS2DX Got Unknown exception");
            mInfo = "unknown";
        } else {
            CC_ASSERT(false);
            return false;
        }

        return true;
    }
}
