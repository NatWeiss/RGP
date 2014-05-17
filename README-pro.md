
RapidGame Pro
=============


Quick Start
-----------

1. Run the game server: `cd RapidGamePro/LemonadeExchange && ./run-server`
2. Browse to [localhost:8000](http://localhost:8000/).
3. Begin prebuilding the static libraries: `cd RapidGamePro && ./prebuild`


Overview
--------

RapidGame Pro is a multi-platform game template which empowers developers to write games in **100% Javascript** while running native C++ code behind the scenes when possible. Knowledge of C++ is recommended, but not required.

> As of the current release, RapidGame Pro is primarily geared for development on a Mac. Developing on Windows or Linux is a beta feature. Full support and documentation for Windows and Linux development is planned.


Folder Structure
----------------

    RapidGamePro/
        README.md - Documentation overview in markdown format.
        docs.html - Documentation overview ready for browser.
        CHANGELOG.txt - Project change log.
        prebuild - Executable script which prebuilds the static libraries.
        docs/ - Documentation folder.
        include/ - All the header files necessary to compile a native game client.
        java/ - The java source files necessary to compile Android native game clients.
# begin pro
        LemonadeExchange/ - A complete example game.
# end pro
        lib/ - Contains the static libraries after they have been prebuilt.
        src/ - Contains source files for the static libraries.
        template/ - Game template (do not modify, just use tools/create-project).
            art/ - Contains the sprites and sprite sheet.
            js/ - Javascript code which controls the game client.
            lib/ - Libraries.
                cocos2d-html5/ - Cocos2d-HTML5.
                cocos2dx-prebuilt/ - Cocos2d-X prebuilt (light-weight and copyable).
                    include/ - Absolute symlink to RapidGamePro/include.
                    java/ - Absolute symlink to RapidGamePro/java.
                    jsb/ - Javascript bindings.
                    lib/ - Absolute symlink to RapidGamePro/lib.
            proj.android/ - Android project files.
            proj.html5/ - HTML5 project files.
            proj.ios_mac/ - iOS and Mac project files.
            proj.linux/ - Linux project files.
            proj.win32/ - Windows project files.
            res/ - Resources and assets.
            run-server - Executable script which launches the server.
            server/ - Contains the server javascript code.
            src/ - Shared native source code.
            upload - Executable script which uploads the HTML5 project to a server.
        tools/ - Contains the project creator.


Client-Server Model
-------------------

RapidGame Pro is built on the client-server model. For each game, there is one server and one or more clients depending on the platforms to be supported. For example, the game might have Android, iOS and HTML5 clients, all of which communicate with the server.

The server is written in Javascript using Node.js and provides an API. For example, `http://localhost:8000/api/counter` will show the current visitor number. For HTML5 clients, the server provides HTML, javascript, sprite sheets, sound effects and other assets as requested via HTTP.


Client Overview
---------------

The client uses the Cocos2d JS game engine which is a combination of Cocos2d-X and Cocos2d-HTML5.

On HTML5, the engine starts by loading `proj.html5/index.html` which boots Cocos2d-HTML5 by loading `lib/cocos2d-html5/CCBoot.js` and then runs `js/App.js` which does the rest. The client's javascript files run in the browser.

On native platforms, the engine starts with `main.m` or `main.cpp`, depending on the platform. This loads `src/AppDelegate.cpp` which finishes booting Cocos2d-X and then runs `js/App.js`. The game's javascript files are pre-compiled to byte codes and executed using the SpiderMonkey JS Engine. Some of the files /* begin pro */(for example, `js/lib/Facebook.js`) /* end pro */are superceded by custom bindings which expose exactly the same Javascript API but run C++ or other native code/* begin pro */ (see `RapidGamePro/src/facebook`)/* end pro */.


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

# begin pro
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
# end pro

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

