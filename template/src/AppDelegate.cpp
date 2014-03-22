
#include "AppDelegate.h"

/*#include "cocos2d.h"
#include "SimpleAudioEngine.h"
#include "ScriptingCore.h"
#include "jsb_cocos2dx_auto.hpp"
#include "jsb_cocos2dx_extension_auto.hpp"
#include "jsb_cocos2dx_builder_auto.hpp"
#include "jsb_cocos2dx_studio_auto.hpp"
#include "jsb_cocos2dx_gui_auto.hpp"
#include "jsb_cocos2dx_spine_auto.hpp"
#include "extension/jsb_cocos2dx_extension_manual.h"
#include "cocostudio/jsb_cocos2dx_studio_manual.h"
#include "gui/jsb_cocos2dx_gui_manual.h"
//#include "cocos2d_specifics.hpp"
#include "cocosbuilder/cocosbuilder_specifics.hpp"
#include "chipmunk/js_bindings_chipmunk_registration.h"
#include "localstorage/js_bindings_system_registration.h"
#include "jsb_opengl_registration.h"
#include "network/XMLHTTPRequest.h"
#include "network/jsb_websocket.h"
#include "cocosbuilder/js_bindings_ccbreader.h"
*/

#include "cocosbuilder/js_bindings_ccbreader.h"
#include "SimpleAudioEngine.h"
#include "jsb_cocos2dx_auto.hpp"
#include "jsb_cocos2dx_ui_auto.hpp"
#include "jsb_cocos2dx_studio_auto.hpp"
#include "jsb_cocos2dx_extension_auto.hpp"
#include "jsb_cocos2dx_builder_auto.hpp"
#include "ui/jsb_cocos2dx_ui_manual.h"
#include "extension/jsb_cocos2dx_extension_manual.h"
#include "cocostudio/jsb_cocos2dx_studio_manual.h"
#include "localstorage/js_bindings_system_registration.h"
#include "chipmunk/js_bindings_chipmunk_registration.h"
#include "jsb_opengl_registration.h"

//#include "plugin/jsbindings/auto/jsb_pluginx_protocols_auto.hpp"
#include "cocos2dx-store/Soomla/jsb/jsb_soomla.h"
#include "Extras.h"

using namespace cocos2d;
using namespace CocosDenshion;
using cocos2d::Rect;

AppDelegate::AppDelegate()
{
}

AppDelegate::~AppDelegate()
{
	ScriptEngineManager::destroyInstance();
}

bool AppDelegate::applicationDidFinishLaunching()
{
	// initialize director
	auto director = Director::getInstance();
	auto glview = director->getOpenGLView();
	if( !glview )
	{
		cocos2d::Rect r(0,0,900,640);
		glview = GLView::createWithRect("HelloJavascript", r);
		director->setOpenGLView(glview);
	}

	director->setDisplayStats(true);
	director->setAnimationInterval(1.0 / 60);

	// set search paths
	auto fileUtils = FileUtils::getInstance();
	std::vector<std::string> searchPaths;
	const char* paths[] =
	{
		"jsb",
	};
	for(auto& path : paths)
		searchPaths.push_back(path);
	fileUtils->setSearchPaths(searchPaths);

	// setup jsb
	auto sc = ScriptingCore::getInstance();
	sc->addRegisterCallback(register_all_cocos2dx); // this defines Scheduler by calling js_register_cocos2dx_Scheduler()
	sc->addRegisterCallback(register_all_cocos2dx_extension);
	sc->addRegisterCallback(register_cocos2dx_js_extensions); // this should be registering scheduleCallbackForTarget... ??
	sc->addRegisterCallback(register_all_cocos2dx_extension_manual);
	sc->addRegisterCallback(register_all_cocos2dx_builder);
	sc->addRegisterCallback(register_CCBuilderReader);
	sc->addRegisterCallback(register_all_cocos2dx_ui);
	sc->addRegisterCallback(register_all_cocos2dx_ui_manual);
	sc->addRegisterCallback(register_all_cocos2dx_studio);
	sc->addRegisterCallback(register_all_cocos2dx_studio_manual);
	sc->addRegisterCallback(jsb_register_system);
	sc->addRegisterCallback(JSB_register_opengl);
	sc->addRegisterCallback(jsb_register_chipmunk);

//	sc->addRegisterCallback(MinXmlHttpRequest::_js_register);
//	sc->addRegisterCallback(register_jsb_websocket);
//	sc->addRegisterCallback(register_all_cocos2dx_spine);

	//sc->addRegisterCallback(js_register_cocos2dx_CCExtras);

	#if( CC_TARGET_PLATFORM == CC_PLATFORM_IOS )
//		sc->addRegisterCallback(register_all_pluginx_protocols);
//		sc->addRegisterCallback(register_jsb_soomla);
	#elif( CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID )
//		sc->addRegisterCallback(register_all_pluginx_protocols);
//		sc->addRegisterCallback(register_jsb_soomla);
	#endif

	sc->start();

	#if defined(COCOS2D_DEBUG) && (COCOS2D_DEBUG > 0)
		sc->enableDebugger();
	#endif

//    ScriptEngineProtocol *engine = ScriptingCore::getInstance();
//	ScriptEngineManager::getInstance()->setScriptEngine(engine);
//	ScriptingCore::getInstance()->runScript("main.js");

	ScriptEngineManager::getInstance()->setScriptEngine(sc);
	sc->runScript("js/App.js");

	#if( CC_TARGET_PLATFORM == CC_PLATFORM_IOS )
		if( NSClassFromString(@"AdsMobFox") == nil )
		{
//			sc->runScript("js/lib/AdsMobFox.js");
		}
	#endif

	return true;
}

void AppDelegate::applicationDidEnterBackground()
{
	Director::getInstance()->stopAnimation();
	SimpleAudioEngine::getInstance()->pauseBackgroundMusic();
	SimpleAudioEngine::getInstance()->pauseAllEffects();
}

void AppDelegate::applicationWillEnterForeground()
{
	Director::getInstance()->startAnimation();
	SimpleAudioEngine::getInstance()->resumeBackgroundMusic();
	SimpleAudioEngine::getInstance()->resumeAllEffects();
}
