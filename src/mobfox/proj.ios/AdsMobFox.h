//
//  See the file 'LICENSE_RapidGame.txt' for the license governing this code.
//      The license can also be obtained online at:
//          http://WizardFu.com/licenses
//

#pragma once

#import "InterfaceAds.h"

typedef enum
{
	kTypeBanner = 0,
	kTypeFullScreen,
} MobFoxTypeEnum;

typedef enum
{
	kPosCenter = 0,
	kPosTop,
	kPosTopLeft,
	kPosTopRight,
	kPosBottom,
	kPosBottomLeft,
	kPosBottomRight,
} MobFoxPosEnum;

@interface AdsMobFox : NSObject <InterfaceAds>
	{
	}

	//
	// InterfaceAds protocol
	//
	-(void) configDeveloperInfo:(NSMutableDictionary*) devInfo;
	-(void) showAds:(NSMutableDictionary*)info position:(int)pos;
	-(void) hideAds:(NSMutableDictionary*)info;
	-(void) queryPoints;
	-(void) spendPoints:(int)points;
	-(void) setDebugMode:(BOOL)debug;
	-(NSString*) getSDKVersion;
	-(NSString*) getPluginVersion;
@end
