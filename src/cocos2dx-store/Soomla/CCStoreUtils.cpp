//
// Created by Fedor Shubin on 5/20/13.
//


#include "CCStoreUtils.h"
#include "cocos2d.h"

namespace soomla {
    void CCStoreUtils::logDebug(const char *tag, const char *message) {
        if (SOOMLA_DEBUG) {
            cocos2d::log("%s %s", tag, message);
        }
    }
    void CCStoreUtils::logError(const char *tag, const char *message) {
        CCLOGERROR("%s %s", tag, message);
    }

    void CCStoreUtils::logException(char const *tag, CCSoomlaError *error) {
        CC_ASSERT(error);
        cocos2d::log("%s Soomla error: error code: %d, with information %s", tag, error->getCode(), error->getInfo());
    }

};
