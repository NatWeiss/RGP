SHELL=/bin/bash
NAME=HelloJavascript
PACKAGE_NAME=org.cocos2dx.hellojavascript
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
	adb -e logcat -s
	adb -e logcat -v raw
run:
	#adb -d uninstall ${PACKAGE_NAME}
	adb -d install -r bin/${NAME}-debug.apk
	#adb -d logcat -s
	echo
	adb -d logcat -v raw *:d
run-release:
	#adb -d uninstall ${PACKAGE_NAME}
	adb -d install bin/${NAME}-debug.apk
	#adb -d logcat -s
	adb -d logcat -v raw *:d
run-distribution:
	#adb -d uninstall ${PACKAGE_NAME}
	adb -d install bin/${NAME}-release-aligned.apk
	#adb -d logcat -s
	adb -d logcat -v raw *:d
clean:
	rm -rf libs/
	rm -rf obj/
	rm -rf bin/*
	rm -rf gen/
	rm -rf assets/*
