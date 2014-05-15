//
//  See the file 'LICENSE_RapidGame.txt' for the license governing this code.
//      The license can also be obtained online at:
//          http://WizardFu.com/licenses
//

#pragma once

#include "CCApplication.h"

class AppDelegate : private cocos2d::Application
{
	public:
		AppDelegate();
		virtual ~AppDelegate();

		virtual bool applicationDidFinishLaunching();
		virtual void applicationDidEnterBackground();
		virtual void applicationWillEnterForeground();
};

