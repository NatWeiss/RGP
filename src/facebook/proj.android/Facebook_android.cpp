//
//  See the file 'LICENSE_RapidGame.txt' for the license governing this code.
//      The license can also be obtained online at:
//          http://WizardFu.com/licenses
//

#include "Facebook.h"
#include "cocos2d.h"
#include "jsapi.h"
#include "jsfriendapi.h"
#include "ScriptingCore.h"
#include "platform/android/jni/JniHelper.h"
#include <jni.h>

using namespace cocos2d;

static bool debug = false;
static string tempString;

const char* const kTag = "Facebook:";
const char* const kJavaClassName = "org/cocos2dx/javascript/Facebook";

//#define debugLog(...) {if(debug) cocos2d::log(__VA_ARGS__);}
#define debugLog(...) {cocos2d::log(__VA_ARGS__);}

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
	ss << "App.callRunningLayer(\"" << method << "\", " << quote(param1);
	if (param2.size())
		ss << ", " << quote(param2);
	ss << ");";

	debugLog("%s Executing script: %s", kTag, ss.str().c_str());
	ScriptingCore::getInstance()->evalString(ss.str().c_str(), &ret);
}

static string strVal(JNIEnv* env, jstring jstr)
{
	if (jstr == nullptr || env == nullptr)
		return "";

	const char* cstr = env->GetStringUTFChars(jstr, nullptr);
	string ret = (cstr ? cstr : "");
	env->ReleaseStringUTFChars(jstr, cstr);

	return ret;
}

extern "C"
{
    void Java_org_cocos2dx_javascript_Facebook_nativeCallRunningLayer(JNIEnv* env, jobject thiz, jstring jmethod, jstring jparam1)
    {
		string method = strVal(env, jmethod);
		string param1 = strVal(env, jparam1);

		callRunningLayer(method, param1);

		debugLog("%s nativeCallRunningLayer(%s, %s)", kTag, method.c_str(), param1.c_str());
    }
	
    void Java_org_cocos2dx_javascript_Facebook_nativeOnGetImageUrl(JNIEnv* env, jobject thiz, jstring jid, jstring jurl)
    {
		string id = strVal(env, jid);
		string url = strVal(env, jurl);
		
		jsval ret;
		stringstream ss;
		ss << "App.loadImage(\"" << url << "\", function(){"
			<< "App.callRunningLayer(\"onPlayerImageLoaded\", \"" << id << "\", \"" << url << "\");"
			<< "}); ";
		debugLog("%s Executing script: %s", kTag, ss.str().c_str());
		ScriptingCore::getInstance()->evalString(ss.str().c_str(), &ret);

		debugLog("%s nativeOnGetImageUrl(%s, %s)", kTag, id.c_str(), url.c_str());
    }
};

static void callJava(const char* method)
{
	JniMethodInfo t;
	if (JniHelper::getStaticMethodInfo(t, kJavaClassName, method, "()V"))
	{
		t.env->CallStaticVoidMethod(t.classID, t.methodID);
		t.env->DeleteLocalRef(t.classID);
	}
}

static void callJava(const char* method, const string& param1)
{
	JniMethodInfo t;
	if (JniHelper::getStaticMethodInfo(t, kJavaClassName, method, "(Ljava/lang/String;)V"))
	{
		jstring jeventId = t.env->NewStringUTF(param1.c_str());
		t.env->CallStaticVoidMethod(t.classID, t.methodID, jeventId);
		t.env->DeleteLocalRef(jeventId);
		t.env->DeleteLocalRef(t.classID);
	}
}

static bool callJavaB(const char* method)
{
	bool ret = false;
	JniMethodInfo t;
	if (JniHelper::getStaticMethodInfo(t, kJavaClassName, method, "()Z"))
	{
		ret = (bool)t.env->CallStaticBooleanMethod(t.classID, t.methodID);
		t.env->DeleteLocalRef(t.classID);
	}
	return ret;
}

static string callJavaS(const char* method, const string& param1)
{
	string ret;
	JniMethodInfo t;
	if (JniHelper::getStaticMethodInfo(t, kJavaClassName, method, "(Ljava/lang/String;)Ljava/lang/String;"))
	{
		jstring jeventId = t.env->NewStringUTF(param1.c_str());
		jstring retString = (jstring)t.env->CallStaticObjectMethod(t.classID, t.methodID, jeventId);

		const char* nativeString = (retString ? t.env->GetStringUTFChars(retString, 0) : nullptr);
		if (nativeString)
		{
			ret = nativeString;
		}
		if (retString)
			t.env->ReleaseStringUTFChars(retString, nativeString);
		//t.env->DeleteLocalRef(retString);
		t.env->DeleteLocalRef(jeventId);
		t.env->DeleteLocalRef(t.classID);
	}
	return ret;
}

// Split a string into an array by a delimiter
inline void split(const string& s, char delim, vector<string>& elems)
{
	stringstream ss(s);
	string item;
	while(std::getline(ss, item, delim))
		elems.push_back(item);
}

Facebook::Facebook()
{
}

Facebook::~Facebook()
{
}

void Facebook::init(const map<string,string>& info)
{
	callJava("init");
	
	// Developer info not used because the AndroidManifest already contains app_id, etc.
}

bool Facebook::isLoggedIn() const
{
	return callJavaB("isLoggedIn");
}

bool Facebook::isCanvasMode() const
{
	return false;
}

void Facebook::setDebugMode(bool b)
{
	debug = b;
	callJava("setDebugMode", b ? "true" : "false");
}

void Facebook::login(const string& permissions)
{
	callJava("login", permissions);
}

void Facebook::logout()
{
	callJava("logout");
}

void Facebook::requestPublishPermissions(const string& permissions)
{
	callJava("requestPublishPermissions", permissions);
}

const string& Facebook::getPlayerName(const string& id) const
{
	tempString = callJavaS("getPlayerName", id.size() ? id : "me");
	return tempString;
}

const string& Facebook::getPlayerFirstName(const string& id) const
{
	tempString = callJavaS("getPlayerFirstName", id.size() ? id : "me");
	return tempString;
}

const string& Facebook::getPlayerImageUrl(const string& id) const
{
	tempString = callJavaS("getPlayerImageUrl", id.size() ? id : "me");
	return tempString;
}

const string& Facebook::getRandomFriendId() const
{
	tempString = callJavaS("getRandomFriendId", "");
	return tempString;
}

void Facebook::showUI(const map<string, string>& infoMap)
{
	callJava("showUI", "");
}

string Facebook::getSDKVersion() const
{
	tempString = callJavaS("getSDKVersion", "");
	return tempString;
}
