//
//  See the file 'LICENSE_RapidGame.txt' for the license governing this code.
//      The license can also be obtained online at:
//          http://WizardFu.com/licenses
//

#include "AppDelegate.h"
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
#include "bindings/manual/network/XMLHTTPRequest.h"
#include "network/jsb_websocket.h"
#include "jsb_cocos2dx_spine_auto.hpp"
// begin pro
#include "bindings/auto/jsb_cocos2dx_pluginx_auto.hpp"
#include "soomla/Soomla/jsb/jsb_soomla.h"
#include "facebook/jsb_facebook.h"
#include "app/jsb_app_bindings.h"
// end pro

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
		glview = GLView::createWithRect("HelloWorld", r);
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
	sc->addRegisterCallback(register_all_cocos2dx);
	sc->addRegisterCallback(register_all_cocos2dx_extension);
	sc->addRegisterCallback(register_cocos2dx_js_extensions);
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
	sc->addRegisterCallback(MinXmlHttpRequest::_js_register);
	sc->addRegisterCallback(register_jsb_websocket);
	sc->addRegisterCallback(register_all_cocos2dx_spine);

// begin pro
	#if( CC_TARGET_PLATFORM == CC_PLATFORM_IOS || CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID )
		sc->addRegisterCallback(register_all_pluginx_protocols);
		sc->addRegisterCallback(register_jsb_soomla);
		sc->addRegisterCallback(register_jsb_facebook);
		sc->addRegisterCallback(register_jsb_app_bindings);
	#endif
// end pro

	sc->start();

	#if defined(COCOS2D_DEBUG) && (COCOS2D_DEBUG > 0)
		sc->enableDebugger();
	#endif

	ScriptEngineManager::getInstance()->setScriptEngine(sc);
	sc->runScript("js/App.js");

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
