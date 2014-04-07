//
//  See the file 'LICENSE_RapidGame.txt' for the license governing this code.
//      The license can also be obtained online at:
//          http://WizardFu.com/licenses
//

#import "RootViewController.h"
#import "cocos2d.h"
#import "CCEAGLView.h"

using namespace cocos2d;

@implementation RootViewController

	// iOS 5 and older uses this method
	-(BOOL) shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
	{
		return UIInterfaceOrientationIsLandscape(interfaceOrientation);
	}

	// iOS 6 and newer uses supportedInterfaceOrientations & shouldAutorotate
	-(NSUInteger) supportedInterfaceOrientations
	{
		#ifdef __IPHONE_6_0
			return UIInterfaceOrientationMaskLandscape;
		#endif
	}

	-(BOOL) shouldAutorotate
	{
		return YES;
	}

	-(void) didRotateFromInterfaceOrientation:(UIInterfaceOrientation)fromInterfaceOrientation
	{
		[super didRotateFromInterfaceOrientation:fromInterfaceOrientation];

		CCEAGLView* view = (CCEAGLView*)self.view;
		CGSize s = CGSizeMake([view getWidth], [view getHeight]);

		Application::getInstance()->applicationScreenSizeChanged((int)s.width, (int)s.height);
	}

	-(BOOL) prefersStatusBarHidden
	{
		return YES;
	}

	-(void) didReceiveMemoryWarning
	{
		// releases the view if it doesn't have a superview
		[super didReceiveMemoryWarning];
		
		// release any cached data, images, etc that aren't in use
	}

	- (void)viewDidUnload
	{
		[super viewDidUnload];
		
		// release any retained subviews of the main view
		// e.g. self.myOutlet = nil;
	}

	-(void) dealloc
	{
		[super dealloc];
	}

@end
