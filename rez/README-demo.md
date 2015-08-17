# RapidGamePro Demo

Welcome to the binary demo of [RapidGame Pro](http://wizardfu.com/rgp).

This is a quasi-binary version of the virtual currency example game *Lemonade Exchange*.
It includes the Javascript and other source files to run the game, but it does not include all the source files to rebuild Cocos2D X or the plugins.
Cocos2D X and the plugins have been prebuilt as static libraries and are included in `lib/cocos2dx-prebuilt/lib`.

You'll be able to test out the *Lemonade Exchange* on iOS, Android and HTML5.

## HTML5

First, run the included server.
Open up a terminal, change to the directory where you unzipped this demo and `./run-server`.
Now you can view the demo in your browser.
Just visit `localhost:8000`.

## iOS

Open `proj.ios_mac/LemonadeExchange.xcodeproj` and run in the simulator.
Static libraries have also been included for `iphoneos` so you can run on the device.
Only debug mode libraries have been included, so if you try to build in release mode, you will get a linker error.

## Android

Open up a terminal, change to the `proj.android` directory, connect your device via USB and then `make && make run`.

## Table of Contents

1. [App.js](App.html)
2. [Config.js](Config.html)
3. [ConfigServer.js](ConfigServer.html)
4. [LayerGame.js](LayerGame.html)
5. [LayerMenu.js](LayerMenu.html)
6. [LemonadeExchange.js](LemonadeExchange.html)
7. [Loader.js](Loader.html)
8. [SceneMain.js](SceneMain.html)
9. [Server.js](Server.html)
