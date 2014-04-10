APP_STL := gnustl_static
APP_CPPFLAGS := -frtti -DCC_ENABLE_CHIPMUNK_INTEGRATION=1 -std=c++11 -fsigned-char -DCOCOS2D_JAVASCRIPT

ifeq ($(strip $(PLATFORM)),)
	APP_PLATFORM := android-10
else
	APP_PLATFORM := $(PLATFORM)
endif

ifeq ($(strip $(ARCH)),)
	APP_ABI := armeabi
else
	APP_ABI := $(ARCH)
endif

ifeq ($(CONFIG),Debug)
	APP_OPTIM := debug
	APP_CPPFLAGS += -DCOCOS2D_DEBUG=1
else
	APP_OPTIM := release
	APP_CPPFLAGS += -DCOCOS2D_DEBUG=0
endif


