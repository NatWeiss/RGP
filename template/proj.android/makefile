SHELL=/bin/bash
NAME=HelloJavascript
PACKAGE_NAME=org.cocos2dx.hellojavascript

all:
	@echo "ANDROID_HOME=${ANDROID_HOME}"
	@if [ ! -d ${ANDROID_HOME} ]; then echo "WARNING: The ANDROID_HOME environment variable does not point to a directory. See the Readme.txt and set ANDROID_HOME in your .profile."; exit; fi
	./build_native.py
	find . -name .DS_Store -delete
	ant -Dsdk.dir=${ANDROID_HOME} debug
release:
	./build_native.py
	ant -Dsdk.dir=${ANDROID_HOME} release
	zipalign -f 4 bin/${NAME}-release.apk bin/${NAME}-release-aligned.apk
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
	adb -d install bin/${NAME}-release-aligned.apk
	adb -d logcat | grep cocos2d
clean:
	rm -rf libs/
	rm -rf obj/
	rm -rf bin/*
	rm -rf gen/
	rm -rf assets/*
