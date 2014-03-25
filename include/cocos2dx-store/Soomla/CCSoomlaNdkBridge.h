//
// Created by Fedor Shubin on 5/20/13.
//

#ifndef __CCSoomlaNdkBridge_H_
#define __CCSoomlaNdkBridge_H_

#include "cocos2d.h"
#include "CCSoomlaError.h"

namespace soomla {
	/** \class CCSoomlaNdkBridge
		\brief The bridge between the application and the Cocos2d-x code.

		This class receives calls from the native application and sends them 
		over to the Cocos2d-x code, and vice versa.
	 */
    class CCSoomlaNdkBridge {
    public:
		/**
		   Call a native application function.
		   \param params A CCDictionary containing the name of the function to call and parameters to pass to it.
		   \param pError A CCSoomlaError that can be used to tell if there was an error.
		   \return The return value of the called function as a cocos2d::Ref.
		 */
        static cocos2d::Ref *callNative(cocos2d::CCDictionary *params, CCSoomlaError **pError);
    };
};


#endif //__CCSoomlaNdkBridge_H_
