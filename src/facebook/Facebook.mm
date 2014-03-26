
#include "Facebook.h"
#include "cocos2d.h"
#import <FacebookSDK/FacebookSDK.h>

void something()
{
//	FBLoginView *loginView = [[FBLoginView alloc] init];
}

#define debugLog(...) {if(debug) cocos2d::log(__VA_ARGS__);}

static string blankString;
static string anonymousString("Anonymous");

Facebook::Facebook()
{
	clear();
}

Facebook::~Facebook()
{
}

void Facebook::clear()
{
	debug = false;
	loggedIn = false;
	canvasMode = false;
	devInfo.clear();
	playerNames.clear();
	playerNames["me"] = "Me";
	playerFirstNames.clear();
	playerFirstNames["me"] = "Me";
	playerImageUrls.clear();
	playerImageUrls["me"] = "";
	friendIds.clear();
}

void Facebook::init()
{
	debugLog("Facebook init");
}

bool Facebook::isLoggedIn() const
{
	return loggedIn;
}

bool Facebook::isCanvasMode() const
{
	return canvasMode;
}

void Facebook::setDebugMode(bool b)
{
	debug = b;
}

void Facebook::configDeveloperInfo(const map<string,string>& info)
{
	for (auto& pair : info)
	{
		debugLog("Developer info[%s] = %s", pair.first.c_str(), pair.second.c_str());
	}
}

void Facebook::login(const map<string,string>& info)
{
}

void Facebook::logout()
{
}

const string& Facebook::getPlayerName(const string& id) const
{
	return anonymousString;
}

const string& Facebook::getPlayerFirstName(const string& id) const
{
	return anonymousString;
}

const string& Facebook::getPlayerImageUrl(const string& id, int callback) const
{
	return blankString;
}

const string& Facebook::getRandomFriendId() const
{
	return blankString;
}

int Facebook::getSDKVersion() const
{
	return 0;
}
