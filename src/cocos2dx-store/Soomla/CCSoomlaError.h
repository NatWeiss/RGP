//
// Created by Fedor Shubin on 5/21/13.
//

#ifndef __CCSoomlaError_H_
#define __CCSoomlaError_H_

#include "cocos2d.h"

#define SOOMLA_NO_ERROR 0
#define SOOMLA_EXCEPTION_ITEM_NOT_FOUND -1
#define SOOMLA_EXCEPTION_INSUFFICIENT_FUNDS -2
#define SOOMLA_EXCEPTION_NOT_ENOUGH_GOODS -3
#define SOOMLA_EXCEPTION_OTHER -4

namespace soomla {
	/** \class CCSoomlaError
		\brief An interface to error handling, analogous exception handling in the Java SDK.

		Pass this as a pointer to this class to functions requiring it and
		examine the result. If its value is not null then something went wrong.
	 */
    class CCSoomlaError: public cocos2d::Ref {
		/**
		   The error code.
		   Can be one of SOOMLA_EXCEPTION_ITEM_NOT_FOUND, 
		   SOOMLA_EXCEPTION_NOT_ENOUGH_GOODS, or 
		   SOOMLA_EXCEPTION_INSUFFICIENT_FUNDS.
		 */
        CC_SYNTHESIZE_READONLY(int, mCode, Code);
    public:
        static CCSoomlaError *createWithObject(cocos2d::Ref *obj);

        static CCSoomlaError *createVirtualItemNotFoundException();
        static CCSoomlaError *createInsufficientFundsException();
        static CCSoomlaError *createNotEnoughGoodsException();

        const char *getInfo() {return mInfo.c_str();};
    private:
		/**
		   Extra information about what went wrong
		 */
        std::string mInfo;

        CCSoomlaError():
            mCode(0),
            mInfo("") {}

        bool init(int code);
    };
};


#endif //__CCSoomlaError_H_
