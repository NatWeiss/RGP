//
// Created by Fedor Shubin on 5/19/13.
//


#include "CCEquippableVG.h"

USING_NS_CC;

#define EQUIPPING_MODEL_LOCAL "local"
#define EQUIPPING_MODEL_CATEGORY "category"
#define EQUIPPING_MODEL_GLOBAL "global"

namespace soomla {

    CCEquippableVG *CCEquippableVG::create(__Integer *equippingModel, __String *name, __String *description, __String *itemId, CCPurchaseType *purchaseType) {
        CCEquippableVG *ret = new CCEquippableVG();
        ret->autorelease();
        ret->init(equippingModel, name, description, itemId, purchaseType);
        return ret;
    }

    CCEquippableVG *CCEquippableVG::createWithDictionary(__Dictionary *dict) {
        CCEquippableVG *ret = new CCEquippableVG();
        ret->autorelease();
        ret->initWithDictionary(dict);
        return ret;
    }

    bool CCEquippableVG::init(__Integer *equippingModel, __String *name, __String *description, __String *itemId, CCPurchaseType *purchaseType) {
        bool res = CCPurchasableVirtualItem::init(name, description, itemId, purchaseType);
        if (res) {
            setEquippingModel(equippingModel);
            return true;
        } else {
            return false;
        }
    }

    bool CCEquippableVG::initWithDictionary(__Dictionary *dict) {
        bool res = CCPurchasableVirtualItem::initWithDictionary(dict);
        if (res) {
            fillEquippingModelFromDict(dict);

            return true;
        } else {
            return false;
        }
    }

    __Dictionary *CCEquippableVG::toDictionary() {
        __Dictionary *dict = CCPurchasableVirtualItem::toDictionary();

        putEquippingModelToDict(dict);

        return dict;
    }

    void CCEquippableVG::fillEquippingModelFromDict(__Dictionary *dict) {
        __String*equippingModelStr = dynamic_cast<__String *>(dict->objectForKey(JSON_EQUIPPABLE_EQUIPPING));
        CCAssert(equippingModelStr != NULL, "invalid object type in dictionary");
        if (equippingModelStr->compare(EQUIPPING_MODEL_LOCAL) == 0) {
            setEquippingModel(__Integer::create(kLocal));
        }
        else if (equippingModelStr->compare(EQUIPPING_MODEL_CATEGORY) == 0) {
            setEquippingModel(__Integer::create(kCategory));
        }
        else if (equippingModelStr->compare(EQUIPPING_MODEL_GLOBAL) == 0) {
            setEquippingModel(__Integer::create(kGlobal));
        } else {
            CC_ASSERT(false);
        }
    }

    void CCEquippableVG::putEquippingModelToDict(__Dictionary *dict) {
        EquippingModel equippingModel = (EquippingModel) getEquippingModel()->getValue();
        __String *strEquippingModel;
        switch (equippingModel) {
            case kLocal: {
                strEquippingModel = __String::create(EQUIPPING_MODEL_LOCAL);
                break;
            }
            case kCategory: {
                strEquippingModel = __String::create(EQUIPPING_MODEL_CATEGORY);
                break;
            }
            case kGlobal: {
                strEquippingModel = __String::create(EQUIPPING_MODEL_GLOBAL);
                break;
            }
            default: {
                CC_ASSERT(false);
                strEquippingModel = __String::create("ERROR");
            }
        }
        dict->setObject(strEquippingModel, JSON_EQUIPPABLE_EQUIPPING);
    }

    CCEquippableVG::~CCEquippableVG() {
        CC_SAFE_RELEASE(mEquippingModel);
    }
}
