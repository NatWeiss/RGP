//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
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
static const string blankString;
static NSMutableArray* publishPermissions = nil;

const char* const kTag = "Facebook:";

#define debugLog(...) {if(debug) cocos2d::log(__VA_ARGS__);}

static void clear_module()
{
	//debug = false;
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
	
	srand((unsigned)time(nullptr));
}

inline const char* strVal(id obj)
{
	auto ret = [obj UTF8String];
	return ret ? ret : "";
}

// Split a string into an array by a delimiter
inline void split(const string& s, char delim, vector<string>& elems)
{
	stringstream ss(s);
	string item;
	while(std::getline(ss, item, delim))
		elems.push_back(item);
}

inline string quote(const string& s)
{
	if (s == "true" || s == "false" || s[0] == '{' || s[0] == '"')
		return s;
	
	stringstream ss;
	ss << '"' << s << '"';
	return ss.str();
}

static void callRunningLayer(const string& method, const string& param1, const string& param2 = "")
{
	jsval ret;
	stringstream ss;
	ss << "Game.callRunningLayer(\"" << method << "\", " << quote(param1);
	if (param2.size())
		ss << ", " << quote(param2);
	ss << ");";

	debugLog("%s Executing script: %s", kTag, ss.str().c_str());
	ScriptingCore::getInstance()->evalString(ss.str().c_str(), &ret);
}

static NSDictionary* parseURLParams(NSString* query)
{
	NSArray *pairs = [query componentsSeparatedByString:@"&"];
	NSMutableDictionary *params = [[NSMutableDictionary alloc] init];
	for (NSString *pair in pairs) {
		NSArray *kv = [pair componentsSeparatedByString:@"="];
		NSString *key = [kv[0] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
		NSString *val = [kv[1] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
		params[key] = val;
	}
	return params;
}

static void loadPlayerImageUrl(const string& playerId)
{
	jsval ret;
	ScriptingCore::getInstance()->evalString("Game.scale(Game.config[\"social-plugin-profile-image-width\"]);", &ret);
	int dim = ret.toInt32();//JSVAL_TO_INT(ret);
	if (dim < 10)
		dim = 120;

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
				debugLog("%s Got image url %s for %s", kTag, url.c_str(), userIdForImage.c_str());

				// load image
				jsval ret;
				stringstream ss;
				ss << "Game.loadImage(\"" << url << "\", function(){"
					<< "Game.callRunningLayer(\"onPlayerImageLoaded\", \"" << userIdForImage << "\", \"" << url << "\");"
					<< "}); ";
				//debugLog("%s Executing script: %s", kTag, ss.str().c_str());
				ScriptingCore::getInstance()->evalString(ss.str().c_str(), &ret);
			}
		}
	];
	
	[idStr release];
	[uriStr release];
}

void (^sessionStateHandler)(FBSession*, FBSessionState, NSError*) =
^(FBSession* session, FBSessionState state, NSError* error)
{
	bool isOpenState = (state == FBSessionStateOpen || state == FBSessionStateOpenTokenExtended);
	if (!error && isOpenState)
	{
		loggedIn = true;
		string token = strVal([[session accessTokenData] accessToken]);
		debugLog("%s User is authorized, token: %s...", kTag, token.substr(0,4).c_str());

		// get player's details
		[FBRequestConnection startWithGraphPath:@"me"
			completionHandler:^(FBRequestConnection* connection, id result, NSError* error)
			{
				if (!error)
				{
					//NSLog(@"Me result %@", result);

					playerNames["me"] = strVal([result objectForKey:@"name"]);
					playerFirstNames["me"] = strVal([result objectForKey:@"first_name"]);
					userId = strVal([result objectForKey:@"id"]);
					//deleteRequests();
					callRunningLayer("onGetMyPlayerName", playerFirstNames["me"].c_str());
					
					//debugLog("%s Name: %s, First name: %s, User id: %s", kTag, playerNames["me"].c_str(), playerFirstNames["me"].c_str(), userId.c_str());
				}
			}
		];
		
		// load player's image
		loadPlayerImageUrl("me");

		// get friends list
		[FBRequestConnection startWithGraphPath:@"/me/friends?fields=id,name,first_name"
			completionHandler:^(FBRequestConnection* connection, id result, NSError* error)
			{
				if (!error)
				{
					id friends = [result objectForKey:@"data"];
					long count = [friends count],
						actualCount = 0;
					if (count < 0)
						count = 0;
					//NSLog(@"Friends (%ld): %@", count, friends);
					
					for (int i = 0; i < count; i++)
					{
						id f = [friends objectAtIndex:i];
						string id = strVal([f objectForKey:@"id"]);
						if (id.size())
						{
							actualCount++;
							friendIds.push_back(id);

							string name = strVal([f objectForKey:@"name"]);
							if (name.size())
								playerNames[id] = name;

							string firstName = strVal([f objectForKey:@"first_name"]);
							if (firstName.size())
								playerFirstNames[id] = firstName;
						}
					}
					
					debugLog("%s Parsed %ld friends", kTag, actualCount);
				}
			}
		];
	}
	else
	{
		loggedIn = false;
		clear_module();
		debugLog("%s Player is not logged in, state %d: '%s'", kTag, (int)state, [[error localizedDescription] UTF8String]);
	}
	callRunningLayer("onGetLoginStatus", loggedIn ? "true" : "false");
};

static void permissionsStringToArray(const string& str, NSMutableArray* array)
{
	if (!str.size())
		return;

	vector<string> permissions;
	split(str, ',', permissions);
	for (auto& permission : permissions)
	{
		if (permission.size() <= 0 || permission == "undefined")
			continue;
		
		NSString* s = [[NSString alloc] initWithUTF8String:permission.c_str()];
		[array addObject:s];
		[s release];
	}
}

Facebook::Facebook()
{
	clear_module();
}

Facebook::~Facebook()
{
}

void Facebook::init(const map<string,string>& info)
{
	debugLog("%s Init SDK v%s, App ID %s", kTag, this->getSDKVersion().c_str(), [FBSession.activeSession.appID UTF8String]);

	// If there's one, just open the session silently, without showing the user the login UI
	if (FBSession.activeSession.state == FBSessionStateCreatedTokenLoaded)
	{
		[FBSession openActiveSessionWithReadPermissions:@[@"basic_info"]
			allowLoginUI:NO
			completionHandler:sessionStateHandler];
	}

	// Developer info not used because the Info.plist already contains appId, etc.
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

void Facebook::login(const string& permissions)
{
	NSMutableArray* perms = [[NSMutableArray alloc] init];
	[perms addObject:@"basic_info"];
	permissionsStringToArray(permissions, perms);
	debugLog("%s Logging in with permissions: %s", kTag, [[perms description] UTF8String]);

	[FBSession openActiveSessionWithReadPermissions:perms
		allowLoginUI:YES
		completionHandler:sessionStateHandler];
	
	[perms release];
}

void Facebook::logout()
{
	// Close the session and remove the access token from the cache
	// The session state handler (in the app delegate) will be called automatically
	[FBSession.activeSession closeAndClearTokenInformation];
}

void requestPublishPermissions()
{
	debugLog("%s Requesting additional permissions: %s", kTag, [[publishPermissions description] UTF8String]);

	[[FBSession activeSession] requestNewPublishPermissions:publishPermissions
		defaultAudience:FBSessionDefaultAudienceFriends
		completionHandler:^(FBSession* session, NSError* error)
		{
			if (error)
			{
				debugLog("%s Error granting publish permissions: %s", kTag, [[error localizedDescription] UTF8String]);
			}
		}
	 ];
}

void Facebook::requestPublishPermissions(const string& permissions)
{
	[publishPermissions release];
	publishPermissions = [[NSMutableArray alloc] init];
	permissionsStringToArray(permissions, publishPermissions);

	// Check for publish permissions
	[FBRequestConnection startWithGraphPath:@"/me/permissions"
		completionHandler:^(FBRequestConnection* connection, id result, NSError* error)
		{
			if (!error)
			{
				NSDictionary* perms = [(NSArray*)[result data] objectAtIndex:0];
				//debugLog("%s Current permissions: %s", kTag, [[perms description] UTF8String]);

				bool hasAllPermissions = true;
				for (NSString* perm in publishPermissions)
				{
					if ([perms objectForKey:perm] == nil)
					{
						hasAllPermissions = false;
					}
				}
				
				if (!hasAllPermissions)
				{
					::requestPublishPermissions();
				}
				else
				{
					debugLog("%s Already has permissions: %s", kTag, [[publishPermissions description] UTF8String]);
				}
			}
			else
			{
				debugLog("%s Error getting permissions: %s", kTag, [[error localizedDescription] UTF8String]);
			}
		}
	];
}

const string& Facebook::getPlayerName(const string& id) const
{
	return playerNames[id.size() ? id : "me"];
}

const string& Facebook::getPlayerFirstName(const string& id) const
{
	return playerFirstNames[id.size() ? id : "me"];
}

const string& Facebook::getPlayerImageUrl(const string& id) const
{
	auto& ret = playerImageUrls[id.size() ? id : "me"];
	if (ret.size())
		return ret;

	loadPlayerImageUrl(id);
	return blankString;
}

const string& Facebook::getRandomFriendId() const
{
	auto size = friendIds.size();
	if (size)
		return friendIds[rand() % size];
	return blankString;
}

void Facebook::showUI(const map<string, string>& infoMap)
{
	//
	// https://developers.facebook.com/docs/ios/ui-controls#friendpicker
	// https://developers.facebook.com/docs/sharing/reference/feed-dialog
	//
	map<string,string> info = infoMap;

	// requests
	if (info["method"] == "apprequests" || info["method"] == "apprequest")
	{
		// setup extra parameters
		NSMutableDictionary* params = [[NSMutableDictionary alloc] init];
		if (info["max_recipients"].size())
		{
			[params setObject:[NSString stringWithUTF8String:info["max_recipients"].c_str()] forKey:@"max_recipients"];
		}
		
		// present the dialog
		[FBWebDialogs presentRequestsDialogModallyWithSession:nil
			message:info["message"].size() ? [NSString stringWithUTF8String:info["message"].c_str()] : @"You are awesome!"
			title:info["title"].size() ? [NSString stringWithUTF8String:info["title"].c_str()] : nil
			parameters:params
			handler:^(FBWebDialogResult result, NSURL *resultURL, NSError *error)
			{
				if (error)
				{
					debugLog("%s Error sending request: %s", kTag, [[error localizedDescription] UTF8String]);
					callRunningLayer("onSocialUIResponse", "");
				}
				else
				{
					NSDictionary* urlParams = parseURLParams([resultURL query]);
					if (result == FBWebDialogResultDialogNotCompleted || ![urlParams valueForKey:@"request"])
					{
						debugLog("%s User canceled request", kTag);
						callRunningLayer("onSocialUIResponse", "");
					}
					else
					{
						// success
						stringstream ss;
						ss << "{request: \"" << strVal([urlParams valueForKey:@"request"]) << "\", to: [";
						int count = 0;
						for (NSString* key in urlParams)
						{
							if ([key rangeOfString:@"to"].location != NSNotFound)
							{
								ss << (count > 0 ? ", " : "")
									<< "\"" << strVal([urlParams objectForKey:key]) << "\"";
								count++;
							}
						}
						ss << "]}";
						callRunningLayer("onSocialUIResponse", ss.str());
					}
					[urlParams release];
				}
			}
		];
		[params release];
	}
	else
	{
		UIWindow* window = [UIApplication sharedApplication].keyWindow;
		UIViewController* rootViewController = window.rootViewController;

		// create the picker
		FBFriendPickerViewController* controller = [[FBFriendPickerViewController alloc] init];
		controller.title = [NSString stringWithUTF8String:info["title"].c_str()];
		if (info["max_recipients"] == "1")
			controller.allowsMultipleSelection = NO;
		[controller loadData];

		// show the picker modally
		[controller presentModallyFromViewController:rootViewController
			animated:YES
			handler:^(FBViewController *sender, BOOL donePressed)
			{
				if (donePressed)
				{
					//NSLog(@"Selected friends: %@", controller.selection);

					int count = 0;
					stringstream ss;
					ss << "{request: \"picker\", to: [";
					for (NSDictionary* dict in controller.selection)
					{
						NSString* idStr = [dict objectForKey:@"id"];
						if (idStr)
						{
							ss << (count > 0 ? ", " : "")
								<< "\"" << [idStr UTF8String] << "\"";
							count++;
						}
					}
					ss << "]}";
					
					callRunningLayer("onSocialUIResponse", ss.str());
				}
				else
				{
					callRunningLayer("onSocialUIResponse", "");
				}
			}
		];
	}
}

string Facebook::getSDKVersion() const
{
	auto cstr = [[FBSettings sdkVersion] UTF8String];
	return cstr ? cstr : "";
}
