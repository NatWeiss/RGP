//
//  See the file 'LICENSE_RapidGame.txt' for the license governing this code.
//      The license can also be obtained online at:
//          http://WizardFu.com/licenses
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