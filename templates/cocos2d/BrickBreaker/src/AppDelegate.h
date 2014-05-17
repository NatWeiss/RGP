//
//  This source code is part of the RapidGame project.
//      http://wizardfu.com/rapidgame
//
//  See the file 'LICENSE' for the license governing this code.
//  Copyright (c) 2014 Wizard Fu, Inc.
//  Created by Nat Weiss.
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

