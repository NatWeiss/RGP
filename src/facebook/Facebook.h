
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
		void login(const map<string,string>& info);
		void logout();
		const string& getPlayerName(const string& id) const;
		const string& getPlayerFirstName(const string& id) const;
		const string& getPlayerImageUrl(const string& id, int callback) const;
		const string& getRandomFriendId() const;
		int getSDKVersion() const;
	
	private:
		void clear();
};
