
#import <UIKit/UIKit.h>
#import "AppController.h"
#import "cocos2d.h"
#import "EAGLView.h"
#import "AppDelegate.h"

#import "RootViewController.h"

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
		CCEAGLView* glView = [CCEAGLView viewWithFrame: [window bounds]
			pixelFormat: kEAGLColorFormatRGBA8
			depthFormat: GL_DEPTH_COMPONENT16
			preserveBackbuffer: NO
			sharegroup: nil
			multiSampling: NO
			numberOfSamples: 0];

		[glView setMultipleTouchEnabled:YES];

		// use root view controller manage gl view
		viewController = [[RootViewController alloc] initWithNibName:nil bundle:nil];
		viewController.wantsFullScreenLayout = YES;
		viewController.view = glView;

		// add root view controller to window
		if( [[UIDevice currentDevice].systemVersion floatValue] < 6.0 )
			[window addSubview: viewController.view];
		else
			[window setRootViewController:viewController];
		[window makeKeyAndVisible];

		[[UIApplication sharedApplication] setStatusBarHidden:YES];

		Application::getInstance()->run();
		return YES;
	}


	-(void) applicationWillResignActive:(UIApplication*)application
	{
		CCDirector::getInstance()->pause();
	}

	-(void) applicationDidBecomeActive:(UIApplication*)application
	{
		CCDirector::getInstance()->resume();
	}

	-(void) applicationDidEnterBackground:(UIApplication*)application
	{
		CCApplication::getInstance()->applicationDidEnterBackground();
	}

	-(void) applicationWillEnterForeground:(UIApplication*)application
	{
		CCApplication::getInstance()->applicationWillEnterForeground();
	}

	-(void) applicationWillTerminate:(UIApplication*)application
	{
	}

	-(void) applicationDidReceiveMemoryWarning:(UIApplication*)application
	{
		CCDirector::getInstance()->purgeCachedData();
	}

@end

