//
//  See the file 'LICENSE_iPhoneGameKit.txt' for the license governing this code.
//      The license can also be obtained online at:
//          http://iPhoneGameKit.com/license
//


//#import "AppDelegate.h"
#import "AppController.h"


@implementation AppController
/*
	static AppDelegate theApplication;

	@synthesize window, glView;

	-(void) applicationDidFinishLaunching:(NSNotification*)aNotification
	{
		// create the window
		// do not make it resizable as this changes the size of the window on os x >= 10.7
		// and therefore causes cocos2d-x to think it's not an ipad-sized display
		NSRect rect = NSMakeRect(200, 200, 1024, 768);
		window = [[Window alloc] initWithContentRect:rect
			styleMask:( NSClosableWindowMask | NSTitledWindowMask )
			backing:NSBackingStoreBuffered
			defer:YES];
		
		// allocate our GL view
		// (isn't there already a shared EAGLView?)
		glView = [[EAGLView alloc] initWithFrame:rect];
		[glView initWithFrame:rect];

		// note that the background is initially white because of the glView
		//[glView setBackgroundColor:NSColor.blackColor];
		//glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
        //glClear(GL_COLOR_BUFFER_BIT);

		// set window parameters
		[window becomeFirstResponder];
		[window setContentView:glView];
		[window setTitle:@"CashCow"];
		[window makeKeyAndOrderFront:self];
		[window setAcceptsMouseMovedEvents:NO];

		// set version
		//int version = [[[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"] intValue];
		//int buildVersion = [[[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleVersion"] intValue];
		//theApplication.setVersion(version);
		//theApplication.setBuildVersion(buildVersion);

		// set cocos2d-x's opengl view
		cocos2d::CCDirector::sharedDirector()->setOpenGLView(cocos2d::CCEGLView::sharedOpenGLView());
		cocos2d::CCApplication::sharedApplication()->run();
	}
	
	-(void) applicationWillTerminate:(NSNotification*)notification
	{
		cocos2d::CCApplication::sharedApplication()->applicationDidEnterBackground();
	}

	-(BOOL) applicationShouldTerminateAfterLastWindowClosed:(NSApplication*)theApplication
	{
		return YES;
	}

	-(void) dealloc
	{
		cocos2d::CCDirector::sharedDirector()->end();
		[super dealloc];
	}
*/
#pragma mark -
#pragma mark IB Actions

	-(IBAction) toggleFullScreen:(id)sender
	{
		//EAGLView* v = [EAGLView sharedEGLView];
		//[v setFullScreen:!v.isFullScreen];
	}

	-(IBAction) exitFullScreen:(id)sender
	{
		//[[EAGLView sharedEGLView] setFullScreen:NO];
	}

@end
