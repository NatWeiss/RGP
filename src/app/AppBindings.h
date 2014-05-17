//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

#pragma once

#include "cocos2d.h"

using namespace std;
using namespace cocos2d;

class AppBindings : public Ref
{
	public:
		static Texture2D* addImageData(const char* name, void* data, int dataLength);
};