
RapidGamePro
============

A Node-based templating system for rapidly creating cross-platform games for a variety of game engines, including Cocos2D-JS, Unity, Corona and Appcelerator Titanium.

What it does:

* Creates new cross-platform game projects from provided or custom templates, which include scenes, sprites, physics, IAP, ads, analytics, a server and more. 

* Prebuilds libraries for Cocos2D X that virtually eliminate build, compile and link time, saving in aggregate hours during development, and allowing for a more rapid development cycle without having to wait - hence the name RapidGame.


Setup
-----

Congratulations on purchasing a license to RapidGamePro. Here's some instructions to get started:

1. You'll need [Node.js](http://nodejs.org/download/) and [Git](http://git-scm.com/downloads).
2. Move this folder somewhere that it can stay (`~/Library/Developer/RapidGamePro` is recommended on Macs).
3. Install a link to the commandline app: `cd RapidGamePro && npm link .`
4. Create a new game project: `rapidgamepro create Cocos2d "Heck Yeah" com.mycompany.heckyeah`
5. Follow the outputted instructions on how to run your game.

> As of the current release, RapidGamePro is primarily geared for development on a Mac. Full support and documentation for Windows and Linux development is planned.


Folder Structure
----------------

	RapidGamePro/
		bin/ - Commandline app lives here and is symlinked to by `npm link`.
		CHANGELOG.txt - Project change log.
		cocos2d/ - Cocos2d includes, scripts, make files and prebuilt static libraries.
		docs/ - Documentation folder.
		docs.html - Documentation overview ready for browser.
		frameworks/ - Frameworks needed, such as the Facebook iOS framework.
		LemonadeExchange/ - A complete two-currency example game.
		LICENSE - The license file.
		package.json - A config file used by the commandline app.
		prebuild.sh - Executable script which prebuilds the static libraries.
		rapidgamepro.js - The commandline app's main file.
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

On HTML5, the engine starts by loading `proj.html5/index.html` which boots Cocos2d-HTML5 by loading `lib/cocos2d-html5/CCBoot.js` and then runs `js/App.js` which does the rest. The client's javascript files run in the browser.

On native platforms, the engine starts with `main.m` or `main.cpp`, depending on the platform. This loads `src/AppDelegate.cpp` which finishes booting Cocos2d-X and then runs `js/App.js`. The game's javascript files are pre-compiled to byte codes and executed using the SpiderMonkey JS Engine. Some of the files (for example, `js/lib/Facebook.js`) are superceded by custom bindings which expose exactly the same Javascript API but run C++ or other native code (see `RapidGamePro/src/facebook`).


Pre-building for Rapid Development
----------------------------------

At the heart of RapidGame Pro is the concept of rapid development.

The default way is to create each game project with all of the files necessary for building from scratch. On the first build one must wait while 300+ source files are compiled. The first time a different architecture is selected -- for example, by switching to run the device instead of the simulator -- the 300+ files are again compiled. Whenever you clean the product, the entire source must once again be compiled.

The problems are:

 1. **Compilation can be a source of distraction**
 2. Accumulated compilation time becomes significant
 3. Limited storage space is consumed by duplicate intermediate build files that can add up to tens of gigabytes.

RapidGame Pro's solution is to prebuild Cocos2d-X as static libraries for all architectures and platforms. This empowers a developer to rebuild a native game client from scratch in seconds, **eliminating the distraction factor**. It also means that Cocos2d-X has to be built only once and consume only 1X the storage space.

To prebuild Cocos2d-X and plugins:

    cd RapidGamePro
	./prebuild

When the `prebuild` command is finished, the static libraries will reside in `RapidGamePro/lib`. The library files are large because they incorporate object files for all architectures and platforms. When using the project creator, an absolute symlink is established to the `lib` folder so that:

1. The static libraries reside in one and only one place.
2. Each game project's folder can be copied or moved quickly and without disturbing the absolute symlink.


Project Creator
---------------

The project creator tool can be used to rapidly create a new project that uses the static libraries. Either the built-in GUI or the commandline version can be used.

To use the GUI version:

    cd RapidGamePro
    tools/create-project

To use the commandline version:

    cd RapidGamePro
    tools/create-project --help
    tools/create-project -n HelloWorld -k com.mycompany.helloworld -p ~/code


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

1. Open up a Terminal or Command prompt and switch to your project's `proj.android` directory.

2. Connect your Android device via USB and execute this command:
		make && make run

3. After the build finishes, the `make run` command will install the app on your device.

4. Tap to start the app on your device and watch your Terminal window for logcat output.

