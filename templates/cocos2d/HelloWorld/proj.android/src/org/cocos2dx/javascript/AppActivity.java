//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//
package org.cocos2dx.javascript;

import org.cocos2dx.lib.Cocos2dxActivity;
// begin pro
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;
import com.soomla.store.SoomlaApp;
import com.soomla.cocos2dx.store.StoreControllerBridge;
import com.facebook.*;
import com.facebook.model.*;
import android.content.Intent;
import android.content.Context;
import android.os.Bundle;
import org.cocos2dx.plugin.PluginWrapper;
// end pro

public class AppActivity extends Cocos2dxActivity {
// begin pro
	protected Facebook facebook = null;

	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		// Setup Facebook
		facebook = new Facebook(this, getApplicationContext());
		facebook.onCreate(savedInstanceState);

		// Setup plugins
		PluginWrapper.init(this);
	}

	@Override
	public Cocos2dxGLSurfaceView onCreateView() {
		Cocos2dxGLSurfaceView glSurfaceView = super.onCreateView();

		// Setup pixel format. Params are bit sizes: r, g, b, a, depth, stencil.
		glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);

		// Setup Soomla
		StoreControllerBridge.setGLView(glSurfaceView);
		SoomlaApp.setExternalContext(getApplicationContext());

		return glSurfaceView;
    }

	@Override
	public void onResume() {
		super.onResume();
		facebook.onResume();
	}

	@Override
	public void onActivityResult(int requestCode, int resultCode, Intent data) {
		super.onActivityResult(requestCode, resultCode, data);
		facebook.onActivityResult(requestCode, resultCode, data);
	}

	@Override
	public void onPause() {
		super.onPause();
		facebook.onPause();
	}

	@Override
	public void onDestroy() {
		super.onDestroy();
		facebook.onDestory();
	}

	@Override
	public void onSaveInstanceState(Bundle outState) {
		super.onSaveInstanceState(outState);
		facebook.onSaveInstanceState(outState);
	}
// end pro
}
