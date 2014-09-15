//
//  See the file 'LICENSE_RapidGame.txt' for the license governing this code.
//      The license can also be obtained online at:
//          http://WizardFu.com/licenses
//

#import <UIKit/UIKit.h>

@interface RootViewController : UIViewController
	{
		BOOL forcePortrait;
	}

	-(BOOL) prefersStatusBarHidden;
	-(void) forcePortrait:(BOOL)enabled;
@end
