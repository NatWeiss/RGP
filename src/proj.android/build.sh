#!/bin/bash

# Directory of script
PWD=$(dirname "$0")
cd $PWD

# Build settings
APP_PLATFORM="android-18"
if [ "$1" == "armeabi" ] || [ "$1" == "armeabi-v7a" ] || [ "$1" == "x86" ]; then
	arch="$1"
else
	arch="armeabi"
fi
if [ "$2" == "release" ] || [ "$2" == "Release" ]; then
	config="Release"
else
	config="Debug"
fi
echo "PLATFORM=${APP_PLATFORM}"
echo "ARCH=${arch}"
echo "CONFIG=${config}"

# Get number of CPU cores
CORES=${NUMBER_OF_PROCESSORS}
if [ -z "$CORES" ]; then
	CORES=$(grep -c ^processor /proc/cpuinfo 2>/dev/null || sysctl -n hw.ncpu)
fi
if [ -z "$CORES" ]; then
	CORES=1
fi
echo "CORES=$CORES"

# Check for NDK_ROOT
if [ ! -d "${NDK_ROOT}" ]; then
	echo "Please set the NDK_ROOT environment variable."
	exit 1
fi

# Check for ANDROID_SDK_ROOT
#if [ ! -d "${ANDROID_SDK_ROOT}" ]; then
#	echo "Please set the ANDROID_SDK_ROOT environment variable."
#	exit 1
#fi

# Set module path
CC_ROOT=$(cd ../cocos2d-js/frameworks/js-bindings && pwd)
SRC_ROOT=$(cd .. && pwd)
UNAME=$(uname -s)
if [ "${UNAME:0:6}" == "CYGWIN" ]; then
	NDK_MODULE_PATH="${CC_ROOT}/cocos2d-x;${CC_ROOT}/cocos2d-x/external;${CC_ROOT}/cocos2d-x/cocos;${CC_ROOT};${SRC_ROOT}"
else
	NDK_MODULE_PATH="${CC_ROOT}/cocos2d-x:${CC_ROOT}/cocos2d-x/external:${CC_ROOT}/cocos2d-x/cocos:${CC_ROOT}:${SRC_ROOT}"
fi
echo "CC_ROOT=${CC_ROOT}"
echo "NDK_MODULE_PATH=${NDK_MODULE_PATH}"

# Set NDK_TOOLCHAIN_VERSION
if [ -d "${NDK_ROOT}/toolchains/arm-linux-androideabi-4.8" ]; then
	export NDK_TOOLCHAIN_VERSION="4.8"
elif [ -d "${NDK_ROOT}/toolchains/arm-linux-androideabi-4.7" ]; then
	export NDK_TOOLCHAIN_VERSION="4.7"
else
	echo "NDK toolchain version 4.8 or 4.7 is required."
	exit 1
fi
echo "NDK_TOOLCHAIN_VERSION=${NDK_TOOLCHAIN_VERSION}"

# Get which ar
ar=$(${NDK_ROOT}/ndk-which ar)
if [ ! -f "$ar" ]; then
	echo "Missing the 'ar' NDK build tool. Please install the Android NDK and toolchains."
	exit 1
fi
echo "AR=${ar}"

# Get which strip
strip=$(${NDK_ROOT}/ndk-which strip)
if [ ! -f "$strip" ]; then
	echo "Missing the 'strip' NDK build tool. Please install the Android NDK and toolchains."
	exit 1
fi
echo "STRIP=${strip}"

# Create build command
CMD="${NDK_ROOT}/ndk-build --jobs=${CORES} -C ${PWD} NDK_MODULE_PATH=${NDK_MODULE_PATH} APP_PLATFORM=${APP_PLATFORM} APP_ABI=${arch}"
echo "CMD=${CMD}"
echo

# NDK build
export CONFIG="${config}"
echo "Building ${APP_PLATFORM} ${arch} ${config}..."
$CMD
res="$?"
if [ "$res" != "0" ]; then
	echo 'ndk-build failed.'
	exit 1
fi

# Link libraries
if [ "${config}" == "Debug" ]; then
	src="obj/local/${arch}/objs-debug"
else
	src="obj/local/${arch}/objs"
fi
src=$(cd ${src}; pwd)
echo "SRC=${src}"

dest=../../lib/${config}-Android/${arch}
mkdir -p ${dest}
dest=$(cd ${dest}; pwd)
echo "DEST=${dest}"

lib="libcocos2dx-prebuilt.a"
rm -f ${dest}/${lib}
for dir in cocos2dxandroid_static cocos2dx_static cocosdenshion_static chipmunk_static jsb_chipmunk_static box2d_static cocos_jsb_static \
	cocos_localstorage_static cocosbuilder_static cocostudio_static cocos_extension_static cocos_network_static spine_static cocos_ui_static \
	jsb_localstorage_static jsb_builder_static jsb_studio_static jsb_extension_static jsb_network_static jsb_spine_static jsb_ui_static \

do
	${ar} rs ${dest}/${lib} $(find ${src}/${dir} -name *.o)
	${strip} -x ${dest}/${lib}
done

# begin pro
lib="libcocos2dx-plugins.a"
rm -f ${dest}/${lib}
for dir in PluginProtocolStatic cocos2dx_store_static jansson_static jsb_pluginx_static jsb_facebook_static jsb_appbindings_static
do
	${ar} rs ${dest}/${lib} $(find ${src}/${dir} -name *.o)
	${strip} -x ${dest}/${lib}
done
# end pro