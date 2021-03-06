//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

#pragma once

#include <map>
#include <vector>

using namespace std;

class Facebook
{
	public:
		Facebook();
		~Facebook();
		
		void init(const map<string,string>& info);
		bool isLoggedIn() const;
		bool isCanvasMode() const;
		void setDebugMode(bool enabled);
		void login(const string& permissions);
		void logout();
		void requestPublishPermissions(const string& permissions);
		const string& getPlayerName(const string& id) const;
		const string& getPlayerFirstName(const string& id) const;
		const string& getPlayerImageUrl(const string& id) const;
		const string& getRandomFriendId() const;
		void showUI(const map<string,string>& info);
		string getSDKVersion() const;
};
