//
//  See the file 'LICENSE_RapidGame.txt' for the license governing this code.
//      The license can also be obtained online at:
//          http://WizardFu.com/licenses
//

#include "AppBindings.h"

Texture2D* AppBindings::addImageData(const char* name, void* data, int dataLength)
{
	if (strlen(name) <= 0 || dataLength <= 0)
		return nullptr;
	
	auto cacher = Director::getInstance()->getTextureCache();
	auto texture = cacher->getTextureForKey(name);
	if( texture == nullptr )
	{
		try
		{
			auto image = new Image();
			image->initWithImageData((unsigned char*)data, dataLength);
			if( image )
			{
				texture = cacher->addImage(image, name);
				log("Added texture %x, image %x", (uint32_t)(uint64_t)texture, (uint32_t)(uint64_t)image);
			}
		}
		catch (exception& e)
		{
			log("Exception adding image: %s", e.what());
		}
	}
	return texture;
}
