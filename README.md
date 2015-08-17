RapidGamePro Setup
==================

Here's some instructions to get RapidGamePro setup:

1. You'll need [Node.js](http://nodejs.org/download/) and [Git](http://git-scm.com/downloads).
2. Move this folder somewhere that it can stay (`~/Library/Developer/RapidGamePro` is recommended on Macs).
3. Install a link to the commandline app: `cd RapidGamePro && npm link . && cd ..`
4. Change directories to where you want your new game project: `cd ~/MyGames`
5. Create a new game project: `rapidgamepro create cocos2d AwesomeGame com.mycompany.awesomegame`
6. This will create your game's project files, then prebuild the static libraries.
7. In the meantime, you can follow the outputted instructions on how to run your game in a browser.
8. Once the libraries have been prebuilt, you can run the iOS, Mac and Android versions.

Playing the example game:

1. Run the server: `cd LemonadeExchange/Server && node server.js`
2. Browse to: [http://localhost:8000](http://localhost:8000).

On Windows, you'll need to create symlinks to the lib folders:

	cd RapidGamePro\templates\cocos2d\TwoScene
	del lib
	mklink /j lib ..\..\..\latest

	cd RapidGamePro\LemonadeExchange
	del lib
	mklink /j lib ..\latest



Folder Structure
----------------

	RapidGamePro/
		{current-version}/ - Prebuilt libraries, headers, java files and make files.
		bin/ - Commandline app lives here and is symlinked to by `npm link`.
		CHANGELOG.txt - Project change log.
		cocos2d/ - Cocos2d includes, scripts, make files and prebuilt static libraries.
		docs/ - Documentation folder.
		docs.html - Documentation overview ready for browser.
		latest/ - Symlink to the latest prebuild libraries folder.
		LemonadeExchange/ - A complete two-currency example game.
		LICENSE - The license file.
		node_modules/ - Directory containing supporting scripts used by the commandline app.
		package.json - A config file used by the commandline app.
		prebuild.sh - Executable script which prebuilds the static libraries.
		rapidgamepro.js - Main file for the commandline app.
		README.md - Documentation overview in markdown format.
		src/ - Contains source files for the plugins and static libraries.
		templates/ - Game templates (do not modify, just use the `rapidgamepro create` command).

Client-Server Model
-------------------

RapidGame Pro is built on the client-server model. For each game, there is one server and one or more clients depending on the platforms to be supported. For example, the game might have Android, iOS and HTML5 clients, all of which communicate with the server.

The server is written in Javascript using Node.js and provides an API. For example, `http://localhost:8000/api/counter` will show the current visitor number. For HTML5 clients, the server provides HTML, javascript, sprite sheets, sound effects and other assets as requested via HTTP.


Client Overview
---------------

The client uses the Cocos2d JS game engine which is a combination of Cocos2d-X and Cocos2d-HTML5.

On HTML5, the engine starts by loading `Projects/html/index.html` which boots Cocos2d-HTML5 by loading `lib/cocos2d/html/CCBoot.js` and then runs `Assets/lib/Game.js` which does the rest. The client's javascript files run in the browser.

On native platforms, the engine starts with `main.m` or `main.cpp`, depending on the platform. This loads `Projects/AppDelegate.cpp` which finishes booting Cocos2d-X and then runs `Assets/lib/Game.js`. The game's javascript files are pre-compiled to byte codes and executed using the SpiderMonkey JS Engine. Some of the files (for example, `Assets/lib/Facebook.js`) are superceded by custom bindings which expose exactly the same Javascript API but run C++ or other native code (see `RapidGamePro/src/facebook`).


Pre-building for Rapid Development
----------------------------------

At the heart of RapidGame Pro is the concept of rapid development.

The default way is to create each game project with all of the files necessary for building from scratch. On the first build one must wait while 300+ source files are compiled. The first time a different architecture is selected -- for example, by switching to run the device instead of the simulator -- the 300+ files are again compiled. Whenever you clean the product, the entire source must once again be compiled.

The problems are:

 1. Compilation can be a source of distraction.
 2. Accumulated compilation time becomes significant.
 3. Limited storage space is consumed by duplicate intermediate build files that can add up to tens of gigabytes.

RapidGame Pro's solution is to prebuild Cocos2d-X as static libraries for all architectures and platforms. This empowers a developer to rebuild a native game client from scratch in seconds, eliminating the distraction factor. It also means that Cocos2d-X has to be built only once and consume only 1X the storage space.

To prebuild Cocos2d-X and plugins:

	cd RapidGamePro
	node rapidgamepro.js prebuild # or `rapidgamepro prebuild` if you followed the setup instructions

When the `prebuild` command is finished, the static libraries will reside in `RapidGamePro/latest`. The library files are large because they incorporate object files for all architectures and platforms. When using the project creator, an absolute symlink is established to the `latest` folder so that:

1. The static libraries reside in one and only one place.
2. Each game project's folder can be copied or moved quickly and without disturbing the absolute symlink.


What's the difference between a RapidGamePro project and a "normal" Cocos2d-JS project?
---------------------------------------------------------------------------------------

A project created by RapidGamePro uses exactly the same underlying API as Cocos2d-JS/X. One can still get the running scene, for example, like this `cc.director.getRunningScene()` (Javascript) or this `cocos2d::Director::getInstance()->getRunningScene()` (C++).

RapidGamePro extends upon the Cocos2d-JS API with the [Game](Game.html) object. This object provides methods which are commonly used in game development, but were missing from Cocos2d-JS at the time of writing. `Game.rand(5)`, for example, returns a random integer between 0 and 5.

While the underlying API stays the same, the file / folder structure of a project created by RapidGamePro is different than that of a "normal" Cocos2d-JS project. A normal project is created with the `cocos` command:

	cocos new -p com.mycompany.mygame -l js -d MyGame

This results in a project folder approximately 500 MB which contains all the files necessary to build Cocos2d-X from scratch. Subfolders include:

	frameworks/ - All Cocos2d-html5 and Cocos2d-x source files, as well as project files for the game
	res/ - Game assets
	runtime/ - An executable which can run the iOS Simulator from the commandline
	src/ - The Javascript files
	tools/ - Miscellaneous tools

By contrast, a RapidGamePro project is only 2 MB (because it symlinks to Cocos2d-html5 and the prebuilt Cocos2d-X libraries) and has a more organized folder structure:

	Assets/ - The game assets and Javascript files
	lib/ - A symlink to the prebuilt Cocos2d-X libraries and Cocos2d-html5
	Projects/ - The project files for the game
	Server/ - The server which provides an API and serves files for the HTML5 version of the game

Inside the project files there are other differences. Take the Xcode project as an example. The normal Cocos2d-JS project is setup to build all of Cocos2d-X, depends on several sub-projects (Targets > Build Phases > Target Dependencies) and references several **User Header Search Paths** (example: `$(SRCROOT)/../../js-bindings/cocos2d-x`) within the `frameworks` folder.

The RapidGamePro project is more efficient, relying on the symlinked `lib` folder. Instead of depending on sub-projects and rebuilding all of Cocos2d-X, it uses two **Other Linker Flags** to include the prebuilt Cocos2d-X libraries (`-lcocos2dx-prebuilt` and `-lcocos2dx-plugins`) and specifies an additional **Library Search Path** in which to find them: `$(SRCROOT)/../lib/cocos2d/x/lib/$(CONFIGURATION)-iOS/$(PLATFORM_NAME)`. **User Header Search Paths** also use the symlink, `$(SRCROOT)/../lib/cocos2d/x/include/cocos`, so that by simply swapping the `lib` folder one can upgrade to a newer prebuilt version of Cocos2d-JS/X.

Another key difference between the projects is that with a normal Cocos2d-JS project, one must manually add plugins to the project. For example, if Facebook support is desired, one must add the sub-project file `PluginFacebook.xcodeproj` (found in `frameworks/js-bindings/cocos2d-x/plugin/plugins/facebook/proj.ios/`), add it as a target dependency and link the binary with the library. A similar process must be taken to integrate the Android plugin. And if there is a plugin written for HTML5 (at the time of this writing there is finally one written for Facebook only) then it must be incorporated by loading the Javascript files at runtime.

By contrast, the RapidGamePro project already has plugin support because all the plugins are part of the prebuilt `libcocos2dx-plugins.a` in the case of the native project and Javascript files have been included in the case of the HTML5 project. Everything is already hooked up. The native project is ready to use the plugins and the HTML5 project has already loaded the plugin Javascript files. Nothing must be done to get the plugins working in a RapidGamePro project. It's all ready to go from the moment it is created.

Those are the main differences between the two types of projects.



iOS Notes
---------

If your game uses In-App Purchases, they will need to be configured with iTunes Connect. If they are not, a console error message similar to **SOOMLA StoreController: Expecting 2 products but only fetched 0 from iTunes Store** may be displayed.

1. Login to iTunes Connect.
2. Setup your app including metadata.
3. Manage In-App Purchases.
4. Create new purchases.
5. Ensure the product IDs are the same as those listed in Config.js.
6. Ensure the purchases are cleared for sale, have a description in at least one language and have a screenshot uploaded.
7. The status for the purchases will now say **Ready to Submit**.
8. View the app details and click the **Edit** button next to In-App Purchases. Select the purchases and click **Save.**

These steps ought to be enough to get the purchases working with your game. There should be no need to click **Ready to Upload Binary**.

If prebuilding fails with the error *The following build commands failed: Write auxiliary files*, then please [upgrade Xcode](http://stackoverflow.com/questions/23016840/xcodebuild-fails-on-the-write-auxiliary-files-step).


Android Notes
-------------

1. Make sure the Android [SDK](http://developer.android.com/sdk/index.html) and [NDK](http://developer.android.com/tools/sdk/ndk/index.html
) have been installed.

2. Open Eclipse, go Window > Android SDK Manager and install the following:
	* Android SDK Tools
	* Android SDK Platform-tools
	* Android SDK Build-tools
	* Android 4.3 ([API 18](http://simonvt.net/2012/02/07/what-api-level-should-i-target/))

3. Edit your .profile (or .bash_profile) in your home directory. Make sure it has defined ANDROID_HOME, NDK_ROOT and setup your path:
		export ANDROID_HOME=~/path/to/your/android/sdk/
		export NDK_ROOT=~/path/to/your/android/ndk/
		PATH=~/path/to/your/android/sdk/tools:~/path/to/your/android/sdk/platform-tools:~/path/to/your/android/ndk:"${PATH}"

4. On Linux, make sure you've installed ANT:
		sudo apt-get install ant

To build via the commandline:

1. Open up a Terminal or Command prompt and switch to your project's `Projects/android` directory.

2. Connect your Android device via USB and execute this command:
		make && make run

3. After the build finishes, the `make run` command will install the app on your device.

4. Tap to start the app on your device and watch your Terminal window for logcat output.



How to Upgrade
--------------

Here are the steps a developer takes to upgrade RapidGamePro:

* Move old `src/cocos2d-js` folder elsewhere
* Copy latest `cocos2d-js` folder to `src`
* Remove `samples`, `docs`, `templates` and `tools` folders
* Execute: `find src/cocos2d-js -name ".gitmodules" -delete`
* Execute: `git add --all && git commit -a && git push`
* Open `src/cocos2d.patch` and manually apply the diff to the new cocos2d-js folder as needed
* Execute: `git commit -a && git push`
* Upgrade `package.json` version
* Browse `cocos2d-x.org` for the latest cocos2d-js download URL
* Upgrade `cocos2djsUrlMac` and `cocos2djsUrlWin` in `rapidgamepro.js`
* Upgrade `src/downloaded.txt`
* Execute: `git commit -a && git push`
* Verify `rapidgamepro prebuild` succeeds for all platforms and fix any bugs or other code issues that have cropped up since cocos2d-js has been upgraded
* Execute: `git commit -a && git push`
* (Optional) Upgrade to the latest [Soomla cocos2dx-store](https://github.com/soomla/cocos2dx-store/), [Soomla cocos2dx-core](https://github.com/soomla/soomla-cocos2dx-core/), [Facebook SDK](https://github.com/facebook/facebook-ios-sdk), [Flurry SDK](https://github.com/flurry) and [Mobfox SDK](https://github.com/mobfox), then fix any new bugs or issues that have cropped up and `git commit -a && git push`
* Create a new `src/cocos2d.patch` file:
	* cd /tmp
	* cp -r ~/path/to/cocos2d-js-latest .
	* cd cocos2d-js-latest
	* find . -name .gitignore -delete
	* git init .
	* git add *
	* git commit -a
	* cp -r ~/path/to/cocos2d-js-patched/* .
	* git diff > patch
	* git diff --staged --binary >> patch
	* cp patch ~/path/to/rapidgamepro/src/cocos2d.patch
* Execute: `git commit -a && git push`
* Verify cocos2d-x and cocos2d-js TwoScene projects run and operate successfully on iOS, Mac, Android and Windows, fixing any bugs or other issues that have cropped up since the latest cocos2d-js upgrade
* Execute: `git commit -a && git push`
* Verify LemonadeExchange project runs and operates successfully on iOS, Mac, Android and Windows, fixing any bugs or other issues that have cropped up since the latest cocos2d-js upgrade
* Execute: `git commit -a && git push`
* Update Changelog
* Execute: `git commit -a && git push`
* Update documentation as needed
* Execute: `git commit -a && git push`


