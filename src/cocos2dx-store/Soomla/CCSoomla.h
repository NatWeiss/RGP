#ifndef __CCSoomla_H_
#define __CCSoomla_H_

#include "cocos2d.h"
#include "CCEventHandler.h"

#define DEPRECATED(func) func __attribute__ ((deprecated("CCSoomla attributes have been removed, see README. Linking will fail.")))
#define CC_SYNTH_DEPRECATED(type, name, func) DEPRECATED(type get##func(void)); \
    DEPRECATED(void set##func(type name))

namespace soomla {

    #define SOOMLA_AND_PUB_KEY_DEFAULT "YOUR GOOGLE PLAY PUBLIC KEY"
    #define SOOMLA_ONLY_ONCE_DEFAULT "SET ONLY ONCE"

	/** \class CCSoomla
		\brief Calls event handler functions when events are fired, also contains settings for StoreController.

		This class calls event handler functions when events are fired, to tie
		it to your event handler call addEventHandler(). You also set parameters
		for StoreController through this class.
	 */
    class CCSoomla: public cocos2d::Ref {
	private:
        cocos2d::__Set mEventHandlers;

    public:
		/**
		   This class is singleton, access it with this function.
		 */
        static CCSoomla* sharedSoomla();

        virtual ~CCSoomla(void);
        virtual bool init(void);

		/**
		   Call an NDK function by name and parameters.
		   \param parameters A dictionary containing the function to call and parameters to pass to it.
		 */
        void easyNDKCallBack(cocos2d::__Dictionary *parameters);

		/**
		   Add an event handler. This retains the event handler.
		   \param eventHandler A pointer to the event handler you'd like to add.
		 */
		void addEventHandler(CCEventHandler *eventHandler);

		/**
		   Remove an event handler. This releases the event handler.
		   \param eventHandler A pointer to the event handler you'd like to remove.
		*/
		void removeEventHandler(CCEventHandler *eventHandler);

        /**
           CCSoomla attributes have been removed. Attributes were accessed by 
           CCStoreController on initialization, and are now passed to it through
           a __Dictionary. See CCStoreController::createShared() for more information.
         */
        CC_SYNTH_DEPRECATED(std::string, mCustomSecret, CustomSecret);
        CC_SYNTH_DEPRECATED(std::string, mAndroidPublicKey, AndroidPublicKey);
        CC_SYNTH_DEPRECATED(bool, mAndroidTestMode, AndroidTestMode);
        CC_SYNTH_DEPRECATED(std::string, mSoomSec, SoomSec);
        CC_SYNTH_DEPRECATED(bool, mSSV, SSV);
    };
};

#undef DEPRECATED
#undef CC_SYNTH_DEPRECATED

#endif //__CCSoomla_H_
