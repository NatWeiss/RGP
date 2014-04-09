SHELL=/bin/bash

all:
	@echo "ANDROID_HOME=${ANDROID_HOME}"
	@if [ ! -d ${ANDROID_HOME} ]; then echo "WARNING: The ANDROID_HOME environment variable does not point to a directory. See the Readme.txt and set ANDROID_HOME in your .profile."; exit; fi
	./build_native.py
	./link debug armeabi
clean:
	rm -rf libs/
	rm -rf obj/
	rm -rf bin/*
	rm -rf gen/
	rm -rf assets/*
