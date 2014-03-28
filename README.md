
RapidGame Pro
=============

*To reveal the Table of Contents, hover over the filigree directly above this sentence.*


Quick Start
-----------

1. Run the game server: `cd RapidGamePro/LemonadeExchange && ./run-server`
2. Browse to [localhost:8000](http://localhost:8000/).
3. Begin prebuilding the static libraries: `cd RapidGamePro && ./prebuild`


Overview
--------

RapidGame Pro is a multi-platform game template which empowers developers to write games in **100% Javascript** while running native C++ code behind the scenes when possible. Knowledge of C++ is recommended, but not required.

> As of the current release, RapidGame Pro is primarily geared for development on a Mac. If you know what you're doing, developing on Windows or Linux is possible. All the files are in place, though some customization may be necessary. Full support and documentation for Windows and Linux development is coming soon.


Folder Structure
----------------

    RapidGamePro/
        docs/ - Documentation folder.
        docs.html - Documentation overview.
        include/ - All the header files necessary to compile a native game client.
        LemonadeExchange/ - A complete example game.
        lib/ - Contains the static libraries after they have been prebuilt.
        prebuild - Executable script which prebuils the static libraries.
        README.md - Documentation overview in markdown format.
        src/ - Contains source files for the static libraries.
        template/ - Game template (do not modify, just use tools/create-project).
            art/ - Contains the sprites and sprite sheet.
            js/ - Javascript code which controls the game client.
            lib/ - Libraries.
                cocos2d-html5/ - Cocos2d-HTML5.
                cocos2dx-prebuilt/ - Cocos2d-X prebuilt (light-weight and copyable).
                    include/ - Absolute symlink to RapidGamePro/include.
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

On native platforms, the engine starts with `main.m` or `main.cpp`, depending on the platform. This loads `src/AppDelegate.cpp` which finishes booting Cocos2d-X and then runs `js/App.js`. The game's javascript files are pre-compiled to byte codes and executed using the SpiderMonkey JS Engine. Some of the files (for example, `js/lib/Facebook.js`) are superceded by custom bindings which expose exactly the same Javascript API but run C++ or other native code (see `RapidGamePro/src/facebook`).


Pre-building for Rapid Development
----------------------------------

At the heart of RapidGame Pro is the concept of rapid development.

The default Cocos2d-X way is to create each game project with all of the files necessary for building from scratch. On the first build one must wait while 300+ source files are compiled. The first time a different architecture is selected (like switching from the simulator to the device) the 300+ files are again compiled. Whenever you clean the product, the entire source must once again be compiled.

The problems are:

 1. **Compilation can be a source of distraction**
 2. Accumulated compilation time becomes significant
 3. Limited storage space is consumed by duplicate intermediate build files that can add up to tens of gigabytes.

RapidGame Pro's solution is to prebuild Cocos2d-X as static libraries for all architectures and platforms. This empowers a developer to rebuild a native game client from scratch in seconds, **eliminating the distraction factor**. It also means that Cocos2d-X has to be built only once and consume only 1X the storage space.

To prebuild Cocos2d-X and plugins:

    cd RapidGamePro
	./prebuild

