//
//  See the file 'LICENSE_RapidGame.txt' for the license governing this code.
//      The license can also be obtained online at:
//          http://WizardFu.com/licenses
//

@class RootViewController;

@interface AppController : NSObject <UIAccelerometerDelegate, UIAlertViewDelegate, UITextFieldDelegate, UIApplicationDelegate>
	{
		UIWindow* window;
		RootViewController* viewController;
	}
@end

