//
//  See the file 'LICENSE_RapidGame.txt' for the license governing this code.
//      The license can also be obtained online at:
//          http://WizardFu.com/licenses
//

#import "AdsMobFox.h"
#import "MobFox/MobFox.h"
#import "ProtocolAds.h"
#import <UIKit/UIKit.h>
#include "jsapi.h"
#include "jsfriendapi.h"
#include "ScriptingCore.h"

using namespace std;
using namespace cocos2d::plugin;

static BOOL _debug = NO;
static NSString* _apiKey = nil;
static NSString* _mode = nil;

#define OUTPUT_LOG(...) if (_debug) NSLog(__VA_ARGS__);

static void callRunningLayer(const string& method, const string& param1)
{
	bool addParam1Quotes = !(param1 == "true" || param1 == "false");
	jsval ret;
	stringstream ss;
	ss << "App.callRunningLayer(\"" << method
		<< "\", " << (addParam1Quotes ? "\"" : "") << param1 << (addParam1Quotes ? "\"" : "") << ");";

	//debugLog("%s Executing script: %s", kTag, ss.str().c_str());
	ScriptingCore::getInstance()->evalString(ss.str().c_str(), &ret);
}

void forcePortrait(BOOL enabled)
{
	UIWindow* window = [UIApplication sharedApplication].keyWindow;
	UIViewController* rootViewController = window.rootViewController;
	if ([rootViewController respondsToSelector:NSSelectorFromString(@"forcePortrait:")])
	{
		[rootViewController forcePortrait:enabled];
	}
	else
	{
		NSLog(@"Cannot find method forcePortrait: in RootViewController");
	}
}

//
// ParentViewController
//

@interface ParentViewController : UIViewController
	-(BOOL) prefersStatusBarHidden;
	-(void) dismiss:(BOOL)success;
	-(void) requestAd:(int)typeEnum size:(int)sizeEnum position:(int)posEnum;
@end

@implementation ParentViewController

	-(NSUInteger) supportedInterfaceOrientations
	{
		#ifdef __IPHONE_6_0
			return UIInterfaceOrientationMaskPortrait;
		#endif
	}

	-(UIInterfaceOrientation) preferredInterfaceOrientationForPresentation
	{
		return UIInterfaceOrientationPortrait;
	}

	-(BOOL) prefersStatusBarHidden
	{
		return YES;
	}

	-(void) dismiss:(BOOL)success
	{
		forcePortrait(NO);
		[self dismissViewControllerAnimated:NO completion:nil];
		callRunningLayer("onAdDismissed", success ? "true" : "false");
	}

	-(void) requestAd:(int)typeEnum size:(int)sizeEnum position:(int)posEnum
	{
		OUTPUT_LOG(@"MobFox: ParentViewController requestAd::: is not meant to be called")
	}

@end

//
// BannerViewController
//

@interface BannerViewController : ParentViewController <MobFoxBannerViewDelegate>
	@property (strong, nonatomic) MobFoxBannerView* bannerView;
@end

@implementation BannerViewController

	@synthesize bannerView;

	-(NSString*) publisherIdForMobFoxBannerView:(MobFoxBannerView*)banner
	{
		return _apiKey;
	}

	-(void) requestAd:(int)typeEnum size:(int)sizeEnum position:(int)posEnum
	{
		@try
		{
			CGSize winSize = [[UIScreen mainScreen] bounds].size;
			CGFloat screenScale = [[UIScreen mainScreen] scale];
			winSize.width *= screenScale;
			winSize.height *= screenScale;
			if (winSize.width < winSize.height)
				std::swap(winSize.width, winSize.height);
			OUTPUT_LOG(@"MobFox: Doing %d/%d/%d banner ad %.0fx%.0f", typeEnum, sizeEnum, posEnum, winSize.width, winSize.height);
			CGRect frame;
			frame.origin.x = 0;
			frame.origin.y = 0;
			
			// create banner view
			self.bannerView = [[MobFoxBannerView alloc] initWithFrame:frame];
			self.bannerView.allowDelegateAssigmentToRequestAd = NO;
			self.bannerView.delegate = self;
			self.bannerView.backgroundColor = [UIColor clearColor];
			[self.view addSubview:self.bannerView];

			// request ad
			self.bannerView.requestURL = @"http://my.mobfox.com/request.php"; // Do Not Change this

			if ([[UIDevice currentDevice] userInterfaceIdiom] != UIUserInterfaceIdiomPad)
			{
				self.bannerView.adspaceWidth = 320; //optional, used to set the custom size of banner placement. Without setting it, the SDK will use default sizes (320x50 for iPhone, 728x90 for iPad).
				self.bannerView.adspaceHeight = 50;

				self.bannerView.adspaceStrict = NO; //optional, tells the server to only supply Adverts that are exactly of desired size. Without setting it, the server could also supply smaller Ads when no ad of desired size is available.
			}
			else
			{
				self.bannerView.adspaceWidth = 728;
				self.bannerView.adspaceHeight = 90;

				self.bannerView.adspaceStrict = YES;
			}

			self.bannerView.locationAwareAdverts = YES;
			[self.bannerView setLocationWithLatitude:235 longitude:178];

			[self.bannerView requestAd]; // Request a Banner Ad manually
		}
		@catch (NSException* exception)
		{
			OUTPUT_LOG(@"Exception requesting ad: %@", exception);
		}
	}

	-(void) mobfoxBannerViewDidLoadMobFoxAd:(MobFoxBannerView*)banner
	{
		OUTPUT_LOG(@"MobFox: Loaded banner %@", banner);
	}

	-(void) mobfoxBannerViewDidLoadRefreshedAd:(MobFoxBannerView*)banner
	{
		OUTPUT_LOG(@"MobFox: Refreshed banner %@", banner);
	}

	-(void) mobfoxBannerView:(MobFoxBannerView*)banner didFailToReceiveAdWithError:(NSError*)error
	{
		OUTPUT_LOG(@"MobFox: Failed to receive ad banner %@, error %@", banner, error);
		[self dismiss:NO];
	}

	-(BOOL) mobfoxBannerViewActionShouldBegin:(MobFoxBannerView*)banner willLeaveApplication:(BOOL)willLeave
	{
		OUTPUT_LOG(@"MobFox: Action should begin banner %@, will leave %@", banner, willLeave ? @"YES" : @"NO");
		return YES;
	}

	-(void) mobfoxBannerViewActionWillPresent:(MobFoxBannerView*)banner
	{
		OUTPUT_LOG(@"MobFox: View action will present %@", banner);
	}

	-(void) mobfoxBannerViewActionWillFinish:(MobFoxBannerView*)banner
	{
		OUTPUT_LOG(@"MobFox: View action will finish %@", banner);
	}

	-(void) mobfoxBannerViewActionDidFinish:(MobFoxBannerView*)banner
	{
		OUTPUT_LOG(@"MobFox: View action did finish %@", banner);
	}

	-(void) mobfoxBannerViewActionWillLeaveApplication:(MobFoxBannerView*)banner
	{
		OUTPUT_LOG(@"MobFox: View action will leave app %@", banner);
	}

@end

//
// VideoViewController
//

@interface VideoViewController : ParentViewController <MobFoxVideoInterstitialViewControllerDelegate>
	@property (nonatomic, strong) MobFoxVideoInterstitialViewController* videoView;
@end

@implementation VideoViewController

	@synthesize videoView;

	-(NSString*) publisherIdForMobFoxVideoInterstitialView:(MobFoxVideoInterstitialViewController*)videoInterstitial
	{
		return _apiKey;
	}

	-(void) requestAd:(int)typeEnum size:(int)sizeEnum position:(int)posEnum
	{
		@try
		{
			OUTPUT_LOG(@"MobFox: Doing video ad");
			if (self.videoView)
			{
				self.videoView.requestURL = @"http://my.mobfox.com/vrequest.php";
				[self.videoView requestAd];
			}
		}
		@catch (NSException* exception)
		{
			OUTPUT_LOG(@"MobFox: Exception requesting ad: %@", exception);
		}
	}

	-(void) mobfoxVideoInterstitialViewDidLoadMobFoxAd:(MobFoxVideoInterstitialViewController*)videoInterstitial advertTypeLoaded:(MobFoxAdType)advertType
	{
		@try
		{
			OUTPUT_LOG(@"MobFox: Loaded video ad type %d", advertType);

			// Means an advert has been retrieved and configured.
			// Display the ad using the presentAd method and ensure you pass back the advertType

			[videoInterstitial presentAd:advertType];
		}
		@catch (NSException* exception)
		{
			OUTPUT_LOG(@"MobFox: Exception presenting ad: %@", exception);
		}
	}

	-(void) viewDidLoad
	{
		[super viewDidLoad];
		OUTPUT_LOG(@"MobFox: View did load, creating video view");

		// Create, add Interstitial/Video Ad View Controller and add view to view hierarchy
		self.videoView = [[MobFoxVideoInterstitialViewController alloc] init];

		// Assign delegate
		self.videoView.delegate = self;

		// Add view. Note when it is created is transparent, with alpha = 0.0 and hidden
		// Only when an ad is being presented it become visible
		[self.view addSubview:self.videoView.view];
	}

	-(void) mobfoxVideoInterstitialViewActionWillPresentScreen:(MobFoxVideoInterstitialViewController*)videoInterstitial
	{
		OUTPUT_LOG(@"MobFox: Video will present screen %@", videoInterstitial);
	}

	-(void) mobfoxVideoInterstitialViewWillDismissScreen:(MobFoxVideoInterstitialViewController*)videoInterstitial
	{
		OUTPUT_LOG(@"MobFox: Video will dismiss screen %@", videoInterstitial);
	}

	-(void) mobfoxVideoInterstitialViewDidDismissScreen:(MobFoxVideoInterstitialViewController*)videoInterstitial
	{
		OUTPUT_LOG(@"MobFox: Video did dismiss screen %@", videoInterstitial);
		[self dismiss:YES];
	}

	-(void) mobfoxVideoInterstitialViewActionWillLeaveApplication:(MobFoxVideoInterstitialViewController*)videoInterstitial
	{
		OUTPUT_LOG(@"MobFox: Video action will leave app %@", videoInterstitial);
		//[self dismiss:YES];
	}

	-(void) mobfoxVideoInterstitialView:(MobFoxVideoInterstitialViewController*)banner didFailToReceiveAdWithError:(NSError*)error
	{
		 OUTPUT_LOG(@"MobFox: Did fail to load ad: %@", [error localizedDescription]);
		 [self dismiss:NO];
	}

@end


@implementation AdsMobFox

	-(void) configDeveloperInfo:(NSMutableDictionary*)devInfo
	{
		_apiKey = [[devInfo objectForKey:@"apiKey"] copy];
		_mode = [[devInfo objectForKey:@"mode"] copy];
		OUTPUT_LOG(@"MobFox: API key %@", _apiKey);
	}

	-(void) showAds:(NSMutableDictionary*)info position:(int)pos
	{
		//OUTPUT_LOG(@"Showing ad, info object: %@", info);
		int typeEnum = [[info objectForKey:@"type"] intValue],
			sizeEnum = [[info objectForKey:@"size"] intValue],
			posEnum = [[info objectForKey:@"position"] intValue];
		
		// force potrait orientation
		forcePortrait(YES);

		// get root view controller
		UIWindow* window = [UIApplication sharedApplication].keyWindow;
		UIViewController* rootViewController = window.rootViewController;
		
		// present our ad view controller
		// (only support fullscreen ads for now)
		ParentViewController* controller = (typeEnum == kTypeFullScreen ?
			[[VideoViewController alloc] init] :
			[[VideoViewController alloc] init]);
		[rootViewController presentViewController:controller animated:NO completion:^{
			[controller release];
			[controller requestAd:typeEnum size:sizeEnum position:posEnum];
		}];
	}

	-(void) hideAds:(NSMutableDictionary*)info
	{
	}

	-(void) queryPoints
	{
		OUTPUT_LOG(@"MobFox no points API");
	}

	-(void) spendPoints:(int)points
	{
		OUTPUT_LOG(@"MobFox no points API");
	}

	-(void) setDebugMode:(BOOL)enabled
	{
		_debug = enabled;
		OUTPUT_LOG(@"MobFox setDebugMode %@", _debug ? @"YES" : @"NO");
	}

	-(NSString*) getSDKVersion
	{
		return @"unknown";
	}

	-(NSString*) getPluginVersion
	{
		return @"unknown";
	}

@end
