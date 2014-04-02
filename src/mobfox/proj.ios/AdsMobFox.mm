//
//  See the file 'LICENSE_RapidGame.txt' for the license governing this code.
//      The license can also be obtained online at:
//          http://WizardFu.com/licenses
//

#import "AdsMobFox.h"
#import "MobFox/MobFox.h"
#import "ProtocolAds.h"
#import <UIKit/UIKit.h>

using namespace cocos2d::plugin;

#define OUTPUT_LOG(...) if (self.debug) NSLog(__VA_ARGS__);

static NSString* s_apiKey = nil;

@interface AdViewController : UIViewController <MobFoxBannerViewDelegate, MobFoxVideoInterstitialViewControllerDelegate>
	@property (strong, nonatomic) MobFoxBannerView *bannerView;
	@property (nonatomic, strong) MobFoxVideoInterstitialViewController *videoView;
@end

@implementation AdViewController

	@synthesize bannerView, videoView;

	-(NSString*) publisherIdForMobFoxBannerView:(MobFoxBannerView*)banner
	{
		return s_apiKey;
	}

	-(NSString*) publisherIdForMobFoxVideoInterstitialView:(MobFoxVideoInterstitialViewController*)videoInterstitial {
		return s_apiKey;
	}

	-(void) requestAd:(int)typeEnum size:(int)sizeEnum position:(int)posEnum
	{
		UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
		BOOL isPortrait = UIInterfaceOrientationIsPortrait(orientation);
		NSLog(@"isPortrait: %d, orientation %d", isPortrait, (int)orientation);
		if (typeEnum == kTypeFullScreen && isPortrait)
		{
			@try
			{
				NSLog(@"MobFox: doing video ad");
				if(self.videoView) {
					self.videoView.requestURL = @"http://my.mobfox.com/vrequest.php";
					[self.videoView requestAd];
				}
			}
			@catch (NSException *exception)
			{
				NSLog(@"Exception requesting ad: %@", exception);
			}
		}
		else
		{
			CGSize winSize = [[UIScreen mainScreen] bounds].size;
			CGFloat screenScale = [[UIScreen mainScreen] scale];
			winSize.width *= screenScale;
			winSize.height *= screenScale;
			if( !isPortrait && winSize.width < winSize.height )
				std::swap(winSize.width, winSize.height);
			NSLog(@"MobFox: doing %d/%d/%d banner ad %.0fx%.0f", typeEnum, sizeEnum, posEnum, winSize.width, winSize.height);
			CGRect frame;
	//		frame.origin.x = 100;
	//		frame.origin.y = 100;
			
			// create banner view
			self.bannerView = [[MobFoxBannerView alloc] initWithFrame:frame];
			self.bannerView.allowDelegateAssigmentToRequestAd = NO;
			self.bannerView.delegate = self;
			[self.view addSubview:self.bannerView];

			// request ad
			self.bannerView.requestURL = @"http://my.mobfox.com/request.php"; // Do Not Change this

			if (typeEnum == kTypeFullScreen)
			{
				self.bannerView.adspaceWidth = winSize.width; // Optional, used to set the custom size of the banner placement. Without setting it, the Server will revert to default sizes (320x50 for iPhone, 728x90 for iPad).
				self.bannerView.adspaceHeight = winSize.height;
			}
			else
			{
				self.bannerView.adspaceWidth = 320;//winSize.width;
				self.bannerView.adspaceHeight = 50;//(winSize.width >= 1024 ? 90 : 50) * screenScale;
			}

			self.bannerView.adspaceStrict = NO; // Optional, tells the server to only supply ads that are exactly of the desired size. Without setting it, the server could also supply smaller Ads when no ad of desired size is available.

			//self.bannerView.locationAwareAdverts = YES;
			//[self.bannerView setLocationWithLatitude:x longitude:y];

			[self.bannerView requestAd]; // Request a Banner Ad manually
		}
	}

	-(void) mobfoxVideoInterstitialViewDidLoadMobFoxAd:(MobFoxVideoInterstitialViewController*)videoInterstitial advertTypeLoaded:(MobFoxAdType)advertType
	{
		@try
		{
			NSLog(@"MobFox Interstitial: did load ad");

			// Means an advert has been retrieved and configured.
			// Display the ad using the presentAd method and ensure you pass back the advertType

			[videoInterstitial presentAd:advertType];
		}
		@catch (NSException *exception)
		{
			NSLog(@"Exception presenting ad: %@", exception);
		}
		
	}

	-(void) mobfoxVideoInterstitialView:(MobFoxVideoInterstitialViewController*)banner didFailToReceiveAdWithError:(NSError*)error
	{
		 NSLog(@"MobFox Interstitial: did fail to load ad: %@", [error localizedDescription]);
	}

	-(void) viewDidLoad
	{
		[super viewDidLoad];
		//NSLog(@"MobFox view did load");

		// Create, add Interstitial/Video Ad View Controller and add view to view hierarchy
		self.videoView = [[MobFoxVideoInterstitialViewController alloc] init];

		// Assign delegate
		self.videoView.delegate = self;

		// Add view. Note when it is created is transparent, with alpha = 0.0 and hidden
		// Only when an ad is being presented it become visible
		[self.view addSubview:self.videoView.view];
	}

@end


@implementation AdsMobFox

	@synthesize debug = __debug;

	-(void) configDeveloperInfo:(NSMutableDictionary*)devInfo
	{
		s_apiKey = [[devInfo objectForKey:@"apiKey"] copy];
		OUTPUT_LOG(@"MobFox API key: %@", s_apiKey);
	}

	-(void) showAds:(NSMutableDictionary*)info position:(int)pos
	{
		int typeEnum = [[info objectForKey:@"type"] intValue],
			sizeEnum = [[info objectForKey:@"size"] intValue],
			posEnum = [[info objectForKey:@"position"] intValue];
		UIWindow* window = [UIApplication sharedApplication].keyWindow;
		UIViewController* rootViewController = window.rootViewController;
		
		AdViewController* controller = [[AdViewController alloc] init];
		[rootViewController.view addSubview:controller.view];
		[controller requestAd:typeEnum size:sizeEnum position:posEnum];
		[controller release];
	}

	-(void) hideAds:(NSMutableDictionary*)info
	{
	}

	-(void) queryPoints
	{
	}

	-(void) spendPoints:(int)points
	{
	}

	-(void) setDebugMode:(BOOL)enabled
	{
		OUTPUT_LOG(@"MobFox setDebugMode invoked(%d)", enabled);
		self.debug = enabled;
	}

	-(NSString*) getSDKVersion
	{
		return @"unknown";
	}

	-(NSString*) getPluginVersion
	{
		return @"0.2.0";
	}

@end
