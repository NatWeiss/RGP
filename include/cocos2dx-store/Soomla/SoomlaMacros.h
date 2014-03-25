//
//  SoomlaMacros.h
//  cocos2dx-store
//
//  Created by Igor Yegoroff on 5/17/13.
//
//

#ifndef cocos2dx_store_SoomlaMacros_h
#define cocos2dx_store_SoomlaMacros_h

#include "cocos2d.h"

#define SL_SYNTHESIZE_RETAIN_WITH_DICT(varType, varName, funName, jsonKey)    \
CC_SYNTHESIZE_RETAIN(varType, varName, funName); \
protected: inline void fill##funName##FromDict(cocos2d::CCDictionary* dict) \
{ \
    cocos2d::Ref* obj = dict->objectForKey(jsonKey); \
    CCAssert(obj == NULL || dynamic_cast<varType>(obj), "invalid object type in dictionary"); \
    if (varName != obj) \
    { \
        set##funName((varType)obj); \
    } \
} \
protected: inline void put##funName##ToDict(cocos2d::CCDictionary* dict) { \
    dict->setObject(varName, jsonKey); \
}

#define SL_SYNTHESIZE_RETAIN_WITH_DICT_DCL(varType, varName, funName)    \
CC_SYNTHESIZE_RETAIN(varType, varName, funName); \
protected: inline void fill##funName##FromDict(cocos2d::CCDictionary* dict); \
protected: inline void put##funName##ToDict(cocos2d::CCDictionary* dict); \

#endif
