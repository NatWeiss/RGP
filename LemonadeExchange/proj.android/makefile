SHELL=/bin/bash
NAME=LemonadeExchange
PACKAGE_NAME=com.wizardfu.lemonadex
PLUGIN_DIR=$$(cd ../../src/cocos2d-x/plugin && pwd)

all:
	@echo "ANDROID_HOME=${ANDROID_HOME}"
	@if [ ! -d ${ANDROID_HOME} ]; then echo "WARNING: The ANDROID_HOME environment variable does not point to a directory. See the Readme.txt and set ANDROID_HOME in your .profile."; exit; fi
	export CONFIG="debug" && ./build_native.py
	find . -name .DS_Store -delete
	ant -Dsdk.dir=${ANDROID_HOME} -Dplugin.dir=${PLUGIN_DIR} debug
release:
	export CONFIG="release" && ./build_native.py
	ant -Dsdk.dir=${ANDROID_HOME} -Dplugin.dir=${PLUGIN_DIR} debug
distribution:
	export CONFIG="release" && ./build_native.py
	ant -Dsdk.dir=${ANDROID_HOME} -Dplugin.dir=${PLUGIN_DIR} release
	zipalign -f 4 bin/${NAME}-release-unsigned.apk bin/${NAME}-release-aligned.apk
start-emulator:
	android avd
run-emulator:
	adb -e install bin/${NAME}-debug.apk
	adb -e logcat | grep cocos2d
run:
	adb -d uninstall ${PACKAGE_NAME}
	adb -d install bin/${NAME}-debug.apk
	adb -d logcat | grep cocos2d
run-release:
	adb -d uninstall ${PACKAGE_NAME}
	adb -d install bin/${NAME}-debug.apk
	adb -d logcat | grep cocos2d
run-distribution:
	adb -d uninstall ${PACKAGE_NAME}
	adb -d install bin/${NAME}-release-aligned.apk
	adb -d logcat | grep cocos2d
clean:
	rm -rf libs/
	rm -rf obj/
	rm -rf bin/*
	rm -rf gen/
	rm -rf assets/*
