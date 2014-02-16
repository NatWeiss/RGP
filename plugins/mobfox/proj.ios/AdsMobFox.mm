/****************************************************************************
Copyright (c) 2012-2013 cocos2d-x.org

http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
#import "AdsMobFox.h"
#import "MobFox/MobFox.h"
#import "ProtocolAds.h"
#import <UIKit/UIKit.h>

enum
{
	kBannerAd = 0,
	kFullScreenAd,
};

using namespace cocos2d::plugin;

#define OUTPUT_LOG(...)     if (self.debug) NSLog(__VA_ARGS__);

static NSString* s_apiKey = nil;


@interface AdViewController : UIViewController <MobFoxBannerViewDelegate, MobFoxVideoInterstitialViewControllerDelegate>
	@property (strong, nonatomic) MobFoxBannerView *bannerView;
	@property (nonatomic, strong) MobFoxVideoInterstitialViewController *videoView;
@end


@implementation AdViewController

@synthesize bannerView, videoView;

- (NSString *)publisherIdForMobFoxBannerView:(MobFoxBannerView *)banner
{
    return s_apiKey;
}

- (NSString *)publisherIdForMobFoxVideoInterstitialView:(MobFoxVideoInterstitialViewController *)videoInterstitial {
    return s_apiKey;
}

-(void) requestAd: (int) typeEnum size:(int) sizeEnum position:(int) posEnum
{
	UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
	BOOL isPortrait = UIInterfaceOrientationIsPortrait(orientation);
	NSLog(@"isPortrait: %d, orientation %d", isPortrait, orientation);
	if( typeEnum == kFullScreenAd && isPortrait )
	{
		@try
		{
			NSLog(@"MobFox: doing video ad");
			if(self.videoView) {
				self.videoView.requestURL = @"http://my.mobfox.com/vrequest.php";
				[self.videoView requestAd];
			}
		}
		@catch (NSException *exception) {
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

		if( typeEnum == kFullScreenAd )
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

- (void)mobfoxVideoInterstitialViewDidLoadMobFoxAd:(MobFoxVideoInterstitialViewController *)videoInterstitial advertTypeLoaded:(MobFoxAdType)advertType {

	@try
	{
		NSLog(@"MobFox Interstitial: did load ad");

		// Means an advert has been retrieved and configured.
		// Display the ad using the presentAd method and ensure you pass back the advertType

		[videoInterstitial presentAd:advertType];
	}
	@catch (NSException *exception) {
		NSLog(@"Exception presenting ad: %@", exception);
	}
	
}

- (void)mobfoxVideoInterstitialView:(MobFoxVideoInterstitialViewController *)banner didFailToReceiveAdWithError:(NSError *)error {
     NSLog(@"MobFox Interstitial: did fail to load ad: %@", [error localizedDescription]);
}

- (void)viewDidLoad {

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

- (void) configDeveloperInfo: (NSMutableDictionary*) devInfo
{
	s_apiKey = [[devInfo objectForKey:@"apiKey"] copy];
	OUTPUT_LOG(@"MobFox API key: %@", s_apiKey);
}

- (void) setAdsListener: (id) listener
{
}

- (void) showAds: (int) typeEnum size:(int) sizeEnum position:(int) posEnum
{
	UIWindow *window = [UIApplication sharedApplication].keyWindow;
	UIViewController *rootViewController = window.rootViewController;
	
	AdViewController* controller = [[AdViewController alloc] init];
	[rootViewController.view addSubview:controller.view];
	[controller requestAd: typeEnum size:sizeEnum position:posEnum];
	[controller release];
}

- (void) hideAds: (int) type
{
}

- (void) spendPoints: (int) points
{
}

- (void) setDebugMode: (BOOL) isDebugMode
{
    OUTPUT_LOG(@"MobFox setDebugMode invoked(%d)", isDebugMode);
    self.debug = isDebugMode;
}

- (NSString*) getSDKVersion
{
    return @"?";
}

- (NSString*) getPluginVersion
{
    return @"0.2.0";
}

/*
- (void) startSession: (NSString*) appKey
{
    [Flurry startSession:appKey];
}

- (void) stopSession
{
    OUTPUT_LOG(@"Flurry stopSession in flurry not available on iOS");
}

- (void) setSessionContinueMillis: (long) millis
{
    OUTPUT_LOG(@"Flurry setSessionContinueMillis invoked(%ld)", millis);
    int seconds = (int)(millis / 1000);
    [Flurry setSessionContinueSeconds:seconds];
}

- (void) setCaptureUncaughtException: (BOOL) isEnabled
{
    OUTPUT_LOG(@"Flurry setCaptureUncaughtException in flurry not available on iOS");
}

- (void) setDebugMode: (BOOL) isDebugMode
{
    OUTPUT_LOG(@"Flurry setDebugMode invoked(%d)", isDebugMode);
    self.debug = isDebugMode;
    [Flurry setDebugLogEnabled:isDebugMode];
}

- (void) logError: (NSString*) errorId withMsg:(NSString*) message
{
    OUTPUT_LOG(@"Flurry logError invoked(%@, %@)", errorId, message);
    NSString* msg = nil;
    if (nil == message) {
        msg = @"";
    } else {
        msg = message;
    }
    [Flurry logError:errorId message:msg exception:nil];
}

- (void) logEvent: (NSString*) eventId
{
    OUTPUT_LOG(@"Flurry logEvent invoked(%@)", eventId);
    [Flurry logEvent:eventId];
}

- (void) logEvent: (NSString*) eventId withParam:(NSMutableDictionary*) paramMap
{
    OUTPUT_LOG(@"Flurry logEventWithParams invoked (%@, %@)", eventId, [paramMap debugDescription]);
    [Flurry logEvent:eventId withParameters:paramMap];
}

- (void) logTimedEventBegin: (NSString*) eventId
{
    OUTPUT_LOG(@"Flurry logTimedEventBegin invoked (%@)", eventId);
    [Flurry logEvent:eventId timed:YES];
}

- (void) logTimedEventEnd: (NSString*) eventId
{
    OUTPUT_LOG(@"Flurry logTimedEventEnd invoked (%@)", eventId);
    [Flurry endTimedEvent:eventId withParameters:nil];
}

- (NSString*) getSDKVersion
{
    return @"4.2.1";
}

- (NSString*) getPluginVersion
{
    return @"0.2.0";
}

- (void) setAge: (NSNumber*) age
{
    int nAge = [age integerValue];
    OUTPUT_LOG(@"Flurry setAge invoked (%d)", nAge);
    [Flurry setAge:nAge];
}

- (void) setGender: (NSNumber*) gender
{
    OUTPUT_LOG(@"Flurry setGender invoked (%@)", gender);
    int nValue = [gender intValue];
    NSString* strGender;
    if (nValue == 1) {
        strGender = @"m";
    } else {
        strGender = @"f";
    }
    [Flurry setGender:strGender];
}

- (void) setUserId: (NSString*) userId
{
    OUTPUT_LOG(@"Flurry setUserId invoked (%@)", userId);
    [Flurry setUserID:userId];
}

- (void) setUseHttps: (NSNumber*) enabled
{
    BOOL bEnabled = [enabled boolValue];
    OUTPUT_LOG(@"Flurry setUseHttps invoked (%@)", enabled);
    [Flurry setSecureTransportEnabled:bEnabled];
}

- (void) logPageView
{
    OUTPUT_LOG(@"Flurry logPageView invoked");
    [Flurry logPageView];
}

- (void) setVersionName: (NSString*) versionName
{
    OUTPUT_LOG(@"Flurry setVersionName invoked (%@)", versionName);
    [Flurry setAppVersion:versionName];
}

- (void) logTimedEventBeginWithParams: (NSMutableDictionary*) paramMap
{
    OUTPUT_LOG(@"Flurry logTimedEventBeginWithParams invoked (%@)", [paramMap debugDescription]);
    NSString* eventId = (NSString*) [paramMap objectForKey:@"Param1"];
    NSMutableDictionary* params = (NSMutableDictionary*) [paramMap objectForKey:@"Param2"];
    if (params) {
        [Flurry logEvent:eventId withParameters:paramMap timed:YES];
    } else {
        [Flurry logEvent:eventId timed:YES];
    }
}

- (void) logTimedEventEndWithParams: (NSMutableDictionary*) paramMap
{
    OUTPUT_LOG(@"Flurry logTimedEventEndWithParams invoked (%@)", [paramMap debugDescription]);
    NSString* eventId = (NSString*) [paramMap objectForKey:@"Param1"];
    NSMutableDictionary* params = (NSMutableDictionary*) [paramMap objectForKey:@"Param2"];
    [Flurry endTimedEvent:eventId withParameters:params];
}
*/
@end
