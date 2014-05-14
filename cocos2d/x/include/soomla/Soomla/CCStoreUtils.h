//
// Created by Fedor Shubin on 5/20/13.
//

#ifndef __CCStoreUtils_H_
#define __CCStoreUtils_H_

#include "CCSoomlaError.h"

#ifndef SOOMLA_DEBUG
# define SOOMLA_DEBUG false
#endif

namespace soomla {
	/** \class CCStoreUtils
		\brief This class handles printing of error and debug messages.

		This class handles printing of error and debug messages. Debug messages
		are only printed it SOOMLA_DEBUG is set to 'true'.
	 */
    class CCStoreUtils {
    public:
		/**
		   Print a debug message.
		   \param tag the message tag.
		   \param message the message.
		 */
        static void logDebug(const char *tag, const char *message);

		/**
		   Print an error message.
		   \param tag the message tag.
		   \param message the message.
		*/
        static void logError(const char *tag, const char *message);

		/**
		   Print an exception message.
		   \param tag the message tag.
		   \param error A CCSoomlaError from which to extract the message.
		*/
        static void logException(const char *tag, CCSoomlaError *error);
    };
};

#endif //__CCStoreUtils_H_
