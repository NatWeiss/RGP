//
// Created by Fedor Shubin on 6/23/13.
//

#ifndef __CCSoomlaNdkBridgeIos_H_
#define __CCSoomlaNdkBridgeIos_H_

#include <string>
#include "jansson.h"

namespace soomla {
    class CCSoomlaNdkBridgeIos {
    public:
        static json_t *receiveCppMessage(json_t *jsonParams);
        static void ndkCallback(json_t *jsonParams);
    };
};

#endif //__CCSoomlaNdkBridgeIos_H_
