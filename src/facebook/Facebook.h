//
//  See the file 'LICENSE_RapidGame.txt' for the license governing this code.
//      The license can also be obtained online at:
//          http://WizardFu.com/licenses
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
		
		void init();
		bool isLoggedIn() const;
		bool isCanvasMode() const;
		void setDebugMode(bool enabled);
		void configDeveloperInfo(const map<string,string>& info);
		void login(const string& permissions);
		void logout();
		void requestPublishPermissions(const string& permissions);
		const string& getPlayerName(const string& id) const;
		const string& getPlayerFirstName(const string& id) const;
		const string& getPlayerImageUrl(const string& id) const;
		const string& getRandomFriendId() const;
		string getSDKVersion() const;
};
