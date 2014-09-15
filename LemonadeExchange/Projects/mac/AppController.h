//
//  See the file 'LICENSE_RapidGame.txt' for the license governing this code.
//      The license can also be obtained online at:
//          http://WizardFu.com/licenses
//

#pragma once

//#import "cocos2d.h"
//#import "EAGLView.h"
//#import "Window.h"

@interface AppController : NSObject //<NSApplicationDelegate>

//	@property (nonatomic, assign) IBOutlet Window* window;
//	@property (nonatomic, assign) IBOutlet EAGLView* glView;

	-(IBAction) toggleFullScreen:(id)sender;
	-(IBAction) exitFullScreen:(id)sender;

@end
