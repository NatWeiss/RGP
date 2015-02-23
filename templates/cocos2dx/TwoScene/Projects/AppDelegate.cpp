///
/// > Created using [RapidGame](http://wizardfu.com/rapidgame). See the `LICENSE` file for the license governing this code.
///

#include "AppDelegate.h"
#include "MenuScene.h"
#include "Game.h"
#include "external/json/document.h"

AppDelegate::AppDelegate()
{
}

AppDelegate::~AppDelegate()
{
	ScriptEngineManager::destroyInstance();
}

void AppDelegate::initGLContextAttrs()
{
    GLContextAttrs glContextAttrs = {8, 8, 8, 8, 24, 8};
    GLView::setGLContextAttrs(glContextAttrs);
}

bool AppDelegate::applicationDidFinishLaunching()
{
	auto director = Director::getInstance();
	auto fileUtils = FileUtils::getInstance();

	// load project.json
	auto json = fileUtils->getStringFromFile("project.json");
	rapidjson::Document doc;
	doc.Parse<0>(json.c_str());
	Size designRes(2048, 1536);
	if (doc["designWidth"].IsInt())
		designRes.width = doc["designWidth"].GetInt();
	if (doc["designHeight"].IsInt())
		designRes.height = doc["designHeight"].GetInt();

	// initialize director
	director->setDisplayStats(true);
	director->setAnimationInterval(1.0 / 60);
	director->getOpenGLView()->setDesignResolutionSize(designRes.width, designRes.height, ResolutionPolicy::SHOW_ALL);

	// set search paths
	const char* paths[] =
	{
		"script",
		"Assets",
	};
	for(auto& path : paths)
		fileUtils->addSearchPath(path);

	// create initial scene
	auto scene = new MenuScene;
	scene->init();
	director->runWithScene(scene);
	scene->release();

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


