//
//  See the file 'LICENSE_RapidGame.txt' for the license governing this code.
//      The license can also be obtained online at:
//          http://WizardFu.com/licenses
//

#include "Facebook.h"
#import <FacebookSDK/FacebookSDK.h>
#include "cocos2d.h"
#include "jsapi.h"
#include "jsfriendapi.h"
#include "ScriptingCore.h"

static bool debug = false;
static bool loggedIn = false;
static bool canvasMode = false;
static string userId;
static map<string, string> devInfo;
static map<string, string> playerNames;
static map<string, string> playerFirstNames;
static map<string, string> playerImageUrls;
static vector<string> friendIds;
static string userIdForImage;

static string blankString;
static string anonymousString("Anonymous");

#define debugLog(...) {if(debug) cocos2d::log(__VA_ARGS__);}

const char* strVal(id obj)
{
	auto ret = [obj UTF8String];
	return ret ? ret : "";
}

void callRunningLayer(const string& method, const string& param1)
{
	bool addParam1Quotes = !(param1 == "true" || param1 == "false");
	jsval ret;
	stringstream ss;
	ss << "App.callRunningLayer(\"" << method
		<< "\", " << (addParam1Quotes ? "\"" : "") << param1 << (addParam1Quotes ? "\"" : "") << ");";

	debugLog("Executing script: %s", ss.str().c_str());
	ScriptingCore::getInstance()->evalString(ss.str().c_str(), &ret);
}

void loadPlayerImageUrl(const string& playerId, int callback = 0)
{
	int dim = 100;
	//var dim = App.scale(App.getConfig("social-plugin-profile-image-width") || 100);
	NSString* idStr = [[NSString alloc] initWithUTF8String:playerId.c_str()];
	NSString* uriStr = [[NSString alloc] initWithFormat:@"/%@/picture?redirect=0&width=%d&height=%d", idStr, dim, dim];
	userIdForImage = playerId;
	//NSLog(@"Loading player[%@] image path: %@", idStr, uriStr);

	[FBRequestConnection startWithGraphPath:uriStr
		parameters:nil
		HTTPMethod:@"GET"
		completionHandler:^(FBRequestConnection *connection, id result, NSError *error)
		{
			if (!error)
			{
				string url = strVal([[result objectForKey:@"data"] objectForKey:@"url"]);
				playerImageUrls[userIdForImage] = url;
				debugLog("Got image url %s for %s", url.c_str(), userIdForImage.c_str());

				// load image
				jsval ret;
				stringstream ss;
				ss << "App.loadImage(\"" << url << "\");";
				debugLog("Executing script: %s", ss.str().c_str());
				ScriptingCore::getInstance()->evalString(ss.str().c_str(), &ret);
				
				//if (callback)...
			}
		}
	];
	
	[idStr release];
	[uriStr release];
}

void (^sessionStateHandler)(FBSession*, FBSessionState, NSError*) =
^(FBSession* session, FBSessionState state, NSError* error)
{
	if (!error && state == FBSessionStateOpen)
	{
		loggedIn = true;

		// get player's details
		[FBRequestConnection startWithGraphPath:@"me"
			completionHandler:^(FBRequestConnection *connection, id result, NSError *error)
			{
				if (!error)
				{
					//NSLog(@"Me result %@", result);

					playerNames["me"] = strVal([result objectForKey:@"name"]);
					playerFirstNames["me"] = strVal([result objectForKey:@"first_name"]);
					userId = strVal([result objectForKey:@"id"]);
					//deleteRequests();
					callRunningLayer("onGetPlayerName", playerNames["me"].c_str());
					
					debugLog("Name: %s, First name: %s, User id: %s", playerNames["me"].c_str(), playerFirstNames["me"].c_str(), userId.c_str());
				}
			}
		];
		
		// load player's image
		loadPlayerImageUrl("me");

		// get friends list
		[FBRequestConnection startWithGraphPath:@"/me/friends?fields=id,name,first_name"
			completionHandler:^(FBRequestConnection *connection, id result, NSError *error)
			{
				if (!error)
				{
					id friends = [result objectForKey:@"data"];
					long count = [friends count];
					if (count < 0)
						count = 0;
					//NSLog(@"Friends (%ld): %@", count, friends);
					
					for (int i = 0; i < count; i++)
					{
						id f = [friends objectAtIndex:i];
						string id = strVal([f objectForKey:@"id"]);
						if (id.size())
						{
							friendIds.push_back(id);

							string name = strVal([f objectForKey:@"name"]);
							if (name.size())
								playerNames[id] = name;

							string firstName = strVal([f objectForKey:@"first_name"]);
							if (firstName.size())
								playerFirstNames[id] = firstName;
						}
					}
				}
			}
		];
	}
	else
	{
		loggedIn = false;
	}
	callRunningLayer("onGetLoginStatus", loggedIn ? "true" : "false");
	debugLog("State is now %d, logged in %d", (int)state, (int)loggedIn);
};

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

	if (FBSession.activeSession.state == FBSessionStateCreatedTokenLoaded)
	{
		// If there's one, just open the session silently, without showing the user the login UI
		[FBSession openActiveSessionWithReadPermissions:@[@"basic_info"]
			allowLoginUI:NO
			completionHandler:sessionStateHandler];
	}
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
	for (auto& pair : info)
	{
		debugLog("Login info[%s] = %s", pair.first.c_str(), pair.second.c_str());
	}

	[FBSession openActiveSessionWithReadPermissions:@[@"basic_info"]
		allowLoginUI:YES
		completionHandler: sessionStateHandler ];
}

void Facebook::logout()
{
	// Close the session and remove the access token from the cache
	// The session state handler (in the app delegate) will be called automatically
	[FBSession.activeSession closeAndClearTokenInformation];
}

const string& Facebook::getPlayerName(const string& id) const
{
	return playerNames[id.size() ? id : "me"];
}

const string& Facebook::getPlayerFirstName(const string& id) const
{
	return playerFirstNames[id.size() ? id : "me"];
}

const string& Facebook::getPlayerImageUrl(const string& id, int callback) const
{
	return playerImageUrls[id.size() ? id : "me"];
}

const string& Facebook::getRandomFriendId() const
{
	int index = (rand() % friendIds.size());
	return friendIds[index];
}

int Facebook::getSDKVersion() const
{
	return 0;
}
