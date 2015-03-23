///
/// > Created using [RapidGame](https://github.com/natweiss/rapidgame). See the `LICENSE` file for the license governing this code.
///

#import <UIKit/UIKit.h>
#import "cocos2d.h"
#import "AppController.h"
#import "AppDelegate.h"
#import "RootViewController.h"
#import "CCEAGLView-ios.h"
// begin pro
#import <FacebookSDK/FacebookSDK.h>
// end pro

using namespace cocos2d;

void __openURL(const char* urlCstr)
{
	NSString* str = [[NSString alloc] initWithUTF8String:urlCstr];
	NSURL* url = [[NSURL alloc] initWithString:str];
	[[UIApplication sharedApplication] openURL:url];
	[url release];
	[str release];
}

@implementation AppController

	static AppDelegate s_sharedApplication;

	-(BOOL) application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
	{
		// create window
		window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
		CCEAGLView* eaglView = [CCEAGLView viewWithFrame: [window bounds]
			pixelFormat: kEAGLColorFormatRGBA8
			depthFormat: GL_DEPTH24_STENCIL8_OES
			preserveBackbuffer: NO
			sharegroup: nil
			multiSampling: NO
			numberOfSamples: 0];

		[eaglView setMultipleTouchEnabled:YES];

		// use root view controller manage gl view
		viewController = [[RootViewController alloc] initWithNibName:nil bundle:nil];
		viewController.wantsFullScreenLayout = YES;
		viewController.view = eaglView;

		// add root view controller to window
		if( [[UIDevice currentDevice].systemVersion floatValue] < 6.0 )
			[window addSubview:viewController.view];
		else
			[window setRootViewController:viewController];
		[window makeKeyAndVisible];

		[[UIApplication sharedApplication] setStatusBarHidden:YES];

		// setting the GLView should be done after creating the RootViewController
		GLView* glview = GLViewImpl::createWithEAGLView(eaglView);
		Director::getInstance()->setOpenGLView(glview);

		Application::getInstance()->run();
		return YES;
	}

	-(void) applicationWillResignActive:(UIApplication*)application
	{
		Director::getInstance()->pause();
	}

	-(void) applicationDidBecomeActive:(UIApplication*)application
	{
		Director::getInstance()->resume();
// begin pro
		// Handle the user leaving the app while the Facebook login dialog is being shown
		// For example: when the user presses the iOS "home" button while the login dialog is active
		[FBAppCall handleDidBecomeActive];
// end pro
	}

	-(void) applicationDidEnterBackground:(UIApplication*)application
	{
		Application::getInstance()->applicationDidEnterBackground();
	}

	-(void) applicationWillEnterForeground:(UIApplication*)application
	{
		Application::getInstance()->applicationWillEnterForeground();
	}

	-(void) applicationWillTerminate:(UIApplication*)application
	{
	}

	-(void) applicationDidReceiveMemoryWarning:(UIApplication*)application
	{
		Director::getInstance()->purgeCachedData();
	}
// begin pro
	// During the Facebook login flow, your app passes control to the Facebook iOS app or Facebook in a mobile browser.
	// After authentication, your app will be called back with the session information.
	-(BOOL) application:(UIApplication*)application
		openURL:(NSURL*)url
		sourceApplication:(NSString*)sourceApplication
		annotation:(id)annotation
	{
		return [FBAppCall handleOpenURL:url sourceApplication:sourceApplication];
	}
// end pro

@end
