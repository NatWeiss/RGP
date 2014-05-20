#!/bin/bash

root=$(dirname "$0")
root=$(cd ${root}; pwd)
cd ${root}

dest="$1"
if [ ! -d $dest ]; then
	if [ -d current ]; then
		dest=${root}
	else
		dest="/usr/local/rapidgame"
	fi
fi
if [ -d "${root}/src/cocos2d-js" ] && [ "${root}" != "${dest}" ]; then
	echo "Touching .pch files..."
	find "${dest}/src" -name *.pch -exec touch {} \;
fi

# Get which command.
cmd="$2"
if [ -z "$cmd" ]; then
	cmd="all"
fi

echo "Prebuilding to directory: ${dest}"

# Extra Xcode build settings.
# GCC_SYMBOLS_PRIVATE_EXTERN=NO prevents a linker warning about visibility.
xcodeSettings="GCC_SYMBOLS_PRIVATE_EXTERN=NO"

# These settings strip the static libraries of unneeded local symbols
xcodeSettings="${xcodeSettings} GCC_SYMBOLS_PRIVATE_EXTERN=NO DEPLOYMENT_POSTPROCESSING=YES STRIP_INSTALLED_PRODUCT=YES STRIP_STYLE=non-global"

# Prefer a smaller set of architectures?
small=0

# Check for Xcode
if [ "$cmd" == "ios" ] || [ "$cmd" == "mac" ] || [ "$cmd" == "all" ]; then
	if hash xcodebuild 2>/dev/null; then
		xcodebuild -checkFirstLaunchStatus
		res="$?"
		if [ "$res" != "0" ]; then
			echo "Please launch Xcode once before prebuilding."
			exit 1
		fi
	else
		echo "Please install Xcode and launch it at least once."
		exit 1
	fi
fi

# Check for Android NDK
if [ "$cmd" == "android" ] || [ "$cmd" == "all" ]; then
	if [ ! -d "${NDK_ROOT}" ]; then
		echo "NDK_ROOT=${NDK_ROOT}"
		echo "Please set the NDK_ROOT environment variable to the path where the Android NDK is located."
		exit 1
	fi
fi

# Get which projects.
projs="cocos2dx-prebuilt"
# begin pro
projs="${projs} cocos2dx-plugins"
# end pro

# Start build log file.
logFile="${dest}/build.log"
echo "Log file: ${logFile}"
echo "" > $logFile

# Switch to destination
cd "${dest}"

# Build headers
if [ "$cmd" == "headers" ] || [ "$cmd" == "all" ]; then
	echo "Building headers..."

#
# html5
#
	dir="${dest}/cocos2d/html"
	if [ -d "${dir}" ]; then
		rm -r ${dir}
	fi
	mkdir -p ${dir}
	cp -r src/cocos2d-js/frameworks/cocos2d-html5/* ${dir} # */

#
# include
#
	dir="${dest}/cocos2d/x/include"
	if [ -d "${dir}" ]; then
		rm -r ${dir}
	fi
	mkdir -p ${dir}
	mkdir -p ${dir}/bindings
	mkdir -p ${dir}/external
# begin pro
	mkdir -p ${dir}/facebook
	mkdir -p ${dir}/app
	mkdir -p ${dir}/soomla
# end pro
	# except if dir is cocos2d-x/plugin (or don't copy plugin/jsbindings and reference the one in include/plugin/jsbindings)
	(cd src/cocos2d-js/frameworks/js-bindings/cocos2d-x && find . -name '*.h' -print | tar --create --files-from -) | (cd $dir && tar xvfp - >> ${logFile} 2>&1)
	(cd src/cocos2d-js/frameworks/js-bindings/cocos2d-x && find . -name '*.hpp' -print | tar --create --files-from -) | (cd $dir && tar xvfp - >> ${logFile} 2>&1)
	(cd src/cocos2d-js/frameworks/js-bindings/cocos2d-x && find . -name '*.msg' -print | tar --create --files-from -) | (cd $dir && tar xvfp - >> ${logFile} 2>&1)
	(cd src/cocos2d-js/frameworks/js-bindings/bindings && find . -name '*.h' -print | tar --create --files-from -) | (cd $dir/bindings && tar xvfp - >> ${logFile} 2>&1)
 	(cd src/cocos2d-js/frameworks/js-bindings/bindings && find . -name '*.hpp' -print | tar --create --files-from -) | (cd $dir/bindings && tar xvfp - >> ${logFile} 2>&1)
	(cd src/cocos2d-js/frameworks/js-bindings/external && find . -name '*.h' -print | tar --create --files-from -) | (cd $dir/external && tar xvfp - >> ${logFile} 2>&1)
	(cd src/cocos2d-js/frameworks/js-bindings/external && find . -name '*.msg' -print | tar --create --files-from -) | (cd $dir/external && tar xvfp - >> ${logFile} 2>&1)
# begin pro
	(cd src/cocos2dx-store && find . -name '*.h' -print | tar --create --files-from -) | (cd $dir/soomla && tar xvfp - >> ${logFile} 2>&1)
	(cd src/external && find . -name '*.h' -print | tar --create --files-from -) | (cd $dir/external && tar xvfp - >> ${logFile} 2>&1)
	(cd src/cocos2d-js/frameworks/js-bindings/cocos2d-x/plugin/jsbindings && find . -name '*.hpp' -print | tar --create --files-from -) | (cd $dir/bindings && tar xvfp - >> ${logFile} 2>&1)
	(cd src/cocos2d-js/frameworks/js-bindings/cocos2d-x/plugin/jsbindings && find . -name '*.h' -print | tar --create --files-from -) | (cd $dir/bindings && tar xvfp - >> ${logFile} 2>&1)
	cp src/facebook/jsb*.h $dir/facebook
	cp src/app/jsb*.h $dir/app
# end pro
	if [ -d ${dir}/docs ]; then rm -r ${dir}/docs; fi
	if [ -d ${dir}/build ]; then rm -r ${dir}/build; fi
	if [ -d ${dir}/tests ]; then rm -r ${dir}/tests; fi
	if [ -d ${dir}/samples ]; then rm -r ${dir}/samples; fi
	if [ -d ${dir}/templates ]; then rm -r ${dir}/templates; fi
	if [ -d ${dir}/tools ]; then rm -r ${dir}/tools; fi
	if [ -d ${dir}/plugin/samples ]; then rm -r ${dir}/plugin/samples; fi
	if [ -d ${dir}/plugin/plugins ]; then rm -r ${dir}/plugin/plugins; fi
	if [ -d ${dir}/extensions/proj.win32 ]; then rm -r ${dir}/extensions/proj.*; fi
	find ${dir} | xargs xattr -c >> ${logFile} 2>&1

#
# jsb
#
	dir="${dest}/cocos2d/x/jsb"
	if [ -d $dir ]; then
		rm -r ${dir}
	fi
	mkdir -p "${dir}"
	cp src/cocos2d-js/frameworks/js-bindings/bindings/script/*.js $dir #*/
	cp -r src/cocos2d-js/frameworks/js-bindings/bindings/script/debugger $dir
	cp src/cocos2d-js/frameworks/js-bindings/bindings/auto/api/*.js $dir #*/
# begin pro
	#find src/cocos2dx-store -name *.js -exec cp {} $dir \;
	find src/mobfox/proj.ios/MRAID.bundle -name *.js -exec cp {} $dir \;
	cp src/cocos2d-js/frameworks/js-bindings/cocos2d-x/plugin/jsbindings/script/*.js $dir #*/
# end pro
	find ${dir} | xargs xattr -c >> ${logFile} 2>&1

#
# java
#
	dir="${dest}/cocos2d/x/java"
	if [ -d $dir ]; then
		rm -r ${dir}
	fi
	mkdir -p "${dir}"
	mkdir -p "${dir}/mk"
	mkdir -p "${dir}/cocos2d-x"
	cp -r src/cocos2d-js/frameworks/js-bindings/cocos2d-x/cocos/2d/platform/android/java/* ${dir}/cocos2d-x/ #*/
	# .mk and .a
	(cd src && find . -name '*.mk' -print | tar --create --files-from -) | (cd $dir/mk && tar xvfp - >> ${logFile} 2>&1)
	(cd src/cocos2d-js/frameworks/js-bindings && find . -name '*.mk' -print | tar --create --files-from -) | (cd $dir/mk && tar xvfp - >> ${logFile} 2>&1)
	(cd src && find . -name '*.a' -print | grep android | tar --create --files-from -) | (cd $dir/mk && tar xvfp - >> ${logFile} 2>&1)
	(cd src/cocos2d-js/frameworks/js-bindings && find . -name '*.a' -print | grep android | tar --create --files-from -) | (cd $dir/mk && tar xvfp - >> ${logFile} 2>&1)
	# bonus: call android/strip on mk/*.a #*/
	if [ -d ${dir}/mk/proj.android ]; then rm -r ${dir}/mk/proj.android; fi
	if [ -d ${dir}/mk/cocos2d-js ]; then rm -r ${dir}/mk/cocos2d-js; fi
# begin pro
	mkdir -p "${dir}/cocos2dx-store"
	cp -r src/cocos2dx-store/android/* ${dir}/cocos2dx-store/ #*/
	mkdir -p "${dir}/android-store"
	cp -r src/cocos2dx-store/submodules/android-store/SoomlaAndroidStore/* ${dir}/android-store/ #*/
	d=src/cocos2dx-store/submodules/android-store/submodules/android-store-google-play
	if [ -d ${d} ]; then
		cp -r ${d}/src/* ${dir}/android-store/src/ #*/
	fi
	mkdir -p "${dir}/facebook-sdk"
	cp -r src/facebook/proj.android/facebook-android-sdk/* ${dir}/facebook-sdk/ #*/
	mkdir -p "${dir}/plugin-protocols"
	cp -r src/cocos2d-js/frameworks/js-bindings/cocos2d-x/plugin/protocols/proj.android/* ${dir}/plugin-protocols/ #*/
	mkdir -p "${dir}/flurry"
	mkdir -p "${dir}/flurry/libs"
	cp -r src/cocos2d-js/frameworks/js-bindings/cocos2d-x/plugin/plugins/flurry/proj.android/* ${dir}/flurry/ #*/
	if [ -d "${dir}/flurry/sdk" ]; then rm -r ${dir}/flurry/sdk; fi
	cp src/flurry/proj.android/libs/*.jar ${dir}/flurry/libs/ #*/
	if [ -f "${dir}/flurry/src/org/cocos2dx/plugin/AdsFlurry.java" ]; then rm ${dir}/flurry/src/org/cocos2dx/plugin/AdsFlurry.java; fi
	mkdir -p "${dir}/tools/android/"
	cp -r src/cocos2d-js/frameworks/js-bindings/cocos2d-x/plugin/tools/android/* ${dir}/tools/android/ #*/

	sed -i "" 's/..\/..\/..\/protocols\/proj.android/..\/plugin-protocols/g' ${dir}/flurry/project.properties
	sed -i "" 's/..\/..\/cocos2d-js\/frameworks\/js-bindings\/cocos2d-x\/cocos\/2d\/platform\/android/..\/cocos2d-x/g' ${dir}/cocos2dx-store/project.properties
	sed -i "" 's/..\/submodules\/android-store\/SoomlaAndroidStore/..\/android-store/g' ${dir}/cocos2dx-store/project.properties
# end pro
	rm -rf ${dir}/*/bin #*/
	rm -rf ${dir}/*/gen #*/

#
# frameworks
#
	dir="${dest}/frameworks"
	if [ -d $dir ]; then
		rm -r ${dir}
	fi
	mkdir -p "${dir}"
# begin pro
	cp -r src/facebook/proj.ios/FacebookSDK.framework $dir
# end pro

	echo "Done."
fi

# Build iOS
if [ "$cmd" == "ios" ] || [ "$cmd" == "all" ]; then
	if [ "${small}" == "1" ]; then
		configs="Debug"
		sdks="iphoneos iphonesimulator"
	else
		configs="Debug Release"
		sdks="iphoneos iphonesimulator"
	fi
	for config in ${configs}; do
		for sdk in ${sdks}; do
			for proj in ${projs}; do
				echo "Building ${proj} iOS ${config} ${sdk}..."
				if [ "${small}" == "1" ]; then
					if [ "${sdk}" == "iphoneos" ]; then
						archSetting="-arch armv7"
					else
						archSetting="-arch i386"
					fi
				fi
				xcodebuild -project src/proj.ios_mac/${proj}.xcodeproj -scheme "iOS" -configuration ${config} -sdk ${sdk} ${archSetting} ${xcodeSettings} >> ${logFile} 2>&1
				res="$?"
				if [ "$res" == "0" ]; then
					echo "Succeeded."
				else
					echo "Build failed. Please check the file '${logFile}' for errors."
					exit 1
				fi
			done
		done
	done
fi

# Build Mac
if [ "$cmd" == "mac" ] || [ "$cmd" == "all" ]; then
	if [ "${small}" == "1" ]; then
		configs="Debug"
		sdks="macosx"
	else
		configs="Debug Release"
		sdks="macosx"
	fi
	for config in ${configs}; do
		for sdk in ${sdks}; do
			for proj in ${projs}; do
				echo "Building ${proj} Mac ${config} ${sdk}..."
				if [ "${small}" == "1" ]; then
					archSetting="-arch i386"
				fi
				xcodebuild -project src/proj.ios_mac/${proj}.xcodeproj -scheme "Mac" -configuration ${config} -sdk ${sdk} ${archSetting} ${xcodeSettings} >> ${logFile} 2>&1
				res="$?"
				if [ "$res" == "0" ]; then
					echo "Succeeded."
				else
					echo "Build failed. Please check the file '${logFile}' for errors."
					exit 1
				fi
			done
		done
	done
fi

# Build Android
if [ "$cmd" == "android" ] || [ "$cmd" == "all" ]; then
	if [ "${small}" == "1" ]; then
		configs="debug"
		archs="armeabi"
	else
		configs="debug release"
		archs="armeabi armeabi-v7a x86"
	fi
	for config in ${configs}; do
		for arch in ${archs}; do
			echo "Building Android ${config} ${arch}..."
			src/proj.android/build.sh ${arch} ${config} >> ${logFile} 2>&1
			res="$?"
			if [ "$res" == "0" ]; then
				echo "Succeeded."
			else
				echo "Build failed. Please check the file '${logFile}' for errors."
				exit 1
			fi
		done
	done
fi

# Stripping
#find . -name *.a -exec strip -x {} \;
