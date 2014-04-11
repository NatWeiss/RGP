//
//  See the file 'LICENSE_RapidGame.txt' for the license governing this code.
//      The license can also be obtained online at:
//          http://WizardFu.com/licenses
//
package org.cocos2dx.javascript;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;
import com.soomla.store.SoomlaApp;
import com.soomla.cocos2dx.store.StoreControllerBridge;

public class AppActivity extends Cocos2dxActivity {
	@Override
	public Cocos2dxGLSurfaceView onCreateView() {
		Cocos2dxGLSurfaceView glSurfaceView = super.onCreateView();

		// Setup pixel format. Params are bit sizes: r, g, b, a, depth, stencil.
		//glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);

		// Setup Soomla.
		StoreControllerBridge.setGLView(glSurfaceView);
		SoomlaApp.setExternalContext(getApplicationContext());

		return glSurfaceView;
    }
}
