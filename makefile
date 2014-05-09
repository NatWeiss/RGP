.PHONY: docs

release: dest=../releases/RapidGamePro/
release:
	find . -name .DS_Store -delete
	if [ -d ${dest} ]; then rm -r ${dest}; fi
	mkdir ${dest}
	cp README.md ${dest}
	cp CHANGELOG.txt ${dest}
	cp LICENSE_RapidGame.txt ${dest}
	cp prebuild ${dest}
	cp docs.html ${dest}
	cp -a docs ${dest}
	cp -a include ${dest}
	cp -a java ${dest}
	cp -a LemonadeExchange ${dest}
	cp -a src ${dest}
	cp -a template ${dest}
	cp -a tools ${dest}
	cd ${dest}src/proj.android && make clean
	cd ${dest}template/proj.android && make clean
	cd ${dest}LemonadeExchange/proj.android && make clean
	rm -rf ${dest}src/soomla/cocos2dx-store/.git
	rm ${dest}/*/lib/cocos2dx-prebuilt/include
	rm ${dest}/*/lib/cocos2dx-prebuilt/java
	rm -r ${dest}/*/lib/cocos2dx-prebuilt/jsb
	rm ${dest}/*/lib/cocos2dx-prebuilt/lib
	rm -rf ${dest}/java/*/bin
	rm -rf ${dest}/java/*/gen
	@rez/delete-text "# begin pro" ${dest}/prebuild --newlines
	@rez/delete-text "# end pro" ${dest}/prebuild --newlines
	@rez/delete-text "# begin pro" ${dest}/README.md --newlines
	@rez/delete-text "# end pro" ${dest}/README.md --newlines
	@rez/delete-text "/* begin pro */" ${dest}/README.md
	@rez/delete-text "/* end pro */" ${dest}/README.md
	@rez/delete-text "# begin pro" ${dest}/CHANGELOG.txt --newlines
	@rez/delete-text "# end pro" ${dest}/CHANGELOG.txt --newlines
	@rez/delete-text "# begin pro" ${dest}/src/proj.android/build --newlines
	@rez/delete-text "# end pro" ${dest}/src/proj.android/build --newlines
	@rez/delete-text "# begin pro" ${dest}/src/proj.android/jni/Android.mk --newlines
	@rez/delete-text "# end pro" ${dest}/src/proj.android/jni/Android.mk --newlines
	@rez/delete-text "// begin pro" ${dest}/template/js/Config.js --newlines
	@rez/delete-text "// end pro" ${dest}/template/js/Config.js --newlines
	@rez/delete-text "// begin pro" ${dest}/template/js/App.js --newlines
	@rez/delete-text "// end pro" ${dest}/template/js/App.js --newlines
	@rez/delete-text "// begin pro" ${dest}/template/src/AppDelegate.cpp --newlines
	@rez/delete-text "// end pro" ${dest}/template/src/AppDelegate.cpp --newlines
	@rez/delete-text "// begin pro" ${dest}/LemonadeExchange/src/AppDelegate.cpp --newlines
	@rez/delete-text "// end pro" ${dest}/LemonadeExchange/src/AppDelegate.cpp --newlines
	@rez/delete-text "// begin pro" ${dest}/template/proj.android/src/org/cocos2dx/javascript/AppActivity.java --newlines
	@rez/delete-text "// end pro" ${dest}/template/proj.android/src/org/cocos2dx/javascript/AppActivity.java --newlines
	@rez/delete-text "// begin pro" ${dest}/LemonadeExchange/proj.android/src/org/cocos2dx/javascript/AppActivity.java --newlines
	@rez/delete-text "// end pro" ${dest}/LemonadeExchange/proj.android/src/org/cocos2dx/javascript/AppActivity.java --newlines
	@rez/delete-text "<!-- begin pro -->" ${dest}/template/proj.android/AndroidManifest.xml --newlines
	@rez/delete-text "<!-- end pro -->" ${dest}/template/proj.android/AndroidManifest.xml --newlines
	@rez/delete-text "<!-- begin pro -->" ${dest}/LemonadeExchange/proj.android/AndroidManifest.xml --newlines
	@rez/delete-text "<!-- end pro -->" ${dest}/LemonadeExchange/proj.android/AndroidManifest.xml --newlines
	@rez/delete-text "# begin pro" ${dest}/template/proj.android/jni/Android.mk --newlines
	@rez/delete-text "# end pro" ${dest}/template/proj.android/jni/Android.mk --newlines
	@rez/delete-text "# begin pro" ${dest}/LemonadeExchange/proj.android/jni/Android.mk --newlines
	@rez/delete-text "# end pro" ${dest}/LemonadeExchange/proj.android/jni/Android.mk --newlines
	@rez/delete-text "# begin pro" ${dest}/template/proj.android/project.properties --newlines
	@rez/delete-text "# end pro" ${dest}/template/proj.android/project.properties --newlines
	@rez/delete-text "# begin pro" ${dest}/LemonadeExchange/proj.android/project.properties --newlines
	@rez/delete-text "# end pro" ${dest}/LemonadeExchange/proj.android/project.properties --newlines
	@rez/delete-text "<!-- begin pro -->" ${dest}/template/proj.html5/index.html --newlines
	@rez/delete-text "<!-- end pro -->" ${dest}/template/proj.html5/index.html --newlines
	@rez/delete-text "<!-- begin pro -->" ${dest}/LemonadeExchange/proj.html5/index.html --newlines
	@rez/delete-text "<!-- end pro -->" ${dest}/LemonadeExchange/proj.html5/index.html --newlines
	open ../releases
	open -a /Applications/YemuZip.app/

rapidgame: pro=../releases/RapidGamePro/
rapidgame: dest=../releases/RapidGame/
rapidgame:
	if [ ! -d "${pro}" ]; then echo "Missing ${pro}"; exit 1; fi
	if [ -d ${dest} ]; then rm -r ${dest}; fi
	cp -r ${pro} ${dest}
	rm -r ${dest}LemonadeExchange
	rm -r ${dest}src/app
	rm -r ${dest}src/bindings-pluginx
	rm -r ${dest}src/cocos2d-x/plugin/*
	rm -r ${dest}src/cocos2dx-store
	rm -r ${dest}src/external/jansson
	rm -r ${dest}src/facebook
	rm -r ${dest}src/mobfox
	rm -r ${dest}src/proj.ios_mac/cocos2dx-plugins.xcodeproj
	rm ${dest}template/js/lib/AdsMobFox.js
	rm ${dest}template/js/lib/Facebook.js
	rm ${dest}template/js/lib/aes.js
	rm ${dest}template/js/lib/soomla.js
	rm ${dest}template/js/lib/SoomlaNdk.js
	rm ${dest}template/js/lib/underscore.js
	rm ${dest}template/proj.android/src/org/cocos2dx/javascript/AdsMobFox.java
	rm ${dest}template/proj.android/src/org/cocos2dx/javascript/Facebook.java
	cp prebuild ${dest}/prebuild
	@rez/delete-between "# begin pro" "# end pro" ${dest}prebuild --newlines
	cp README.md ${dest}/
	@rez/delete-between "# begin pro" "# end pro" ${dest}README.md --newlines
	@rez/delete-between "/* begin pro */" "/* end pro */" ${dest}README.md
	sed -i "" 's/RapidGamePro/RapidGame/g' ${dest}README.md
	sed -i "" 's/RapidGame Pro/RapidGame/g' ${dest}README.md
	sed -i "" 's/=============/=========/g' ${dest}README.md
	sed -i "" 's/LemonadeExchange/template/g' ${dest}README.md
	cp CHANGELOG.txt ${dest}/
	@rez/delete-between "# begin pro" "# end pro" ${dest}CHANGELOG.txt --newlines
	cp src/proj.android/build ${dest}src/proj.android
	@rez/delete-between "# begin pro" "# end pro" ${dest}src/proj.android/build --newlines
	cp src/proj.android/jni/Android.mk ${dest}src/proj.android/jni
	@rez/delete-between "# begin pro" "# end pro" ${dest}src/proj.android/jni/Android.mk --newlines
	cp template/js/Config.js ${dest}template/js/Config.js
	@rez/delete-between "// begin pro" "// end pro" ${dest}template/js/Config.js --newlines
	cp template/js/App.js ${dest}template/js/App.js
	@rez/delete-between "// begin pro" "// end pro" ${dest}template/js/App.js --newlines
	cp template/src/AppDelegate.cpp ${dest}template/src/
	@rez/delete-between "// begin pro" "// end pro" ${dest}template/src/AppDelegate.cpp --newlines
	cp template/proj.android/src/org/cocos2dx/javascript/AppActivity.java ${dest}template/proj.android/src/org/cocos2dx/javascript/
	@rez/delete-between "// begin pro" "// end pro" ${dest}template/proj.android/src/org/cocos2dx/javascript/AppActivity.java --newlines
	cp template/proj.android/AndroidManifest.xml ${dest}template/proj.android/
	@rez/delete-between "<!-- begin pro -->" "<!-- end pro -->" ${dest}template/proj.android/AndroidManifest.xml --newlines
	@rez/delete-text 'android:name="com.soomla.store.SoomlaApp"' ${dest}/template/proj.android/AndroidManifest.xml
	cp template/proj.android/jni/Android.mk ${dest}template/proj.android/jni/
	@rez/delete-between "# begin pro" "# end pro" ${dest}template/proj.android/jni/Android.mk --newlines
	cp template/proj.android/project.properties ${dest}template/proj.android/
	@rez/delete-between "# begin pro" "# end pro" ${dest}template/proj.android/project.properties --newlines
	cp template/proj.html5/index.html ${dest}template/proj.html5/
	@rez/delete-between "<!-- begin pro -->" "<!-- end pro -->" ${dest}template/proj.html5/index.html --newlines
	@rez/delete-text '		"pluginx",' ${dest}/template/proj.html5/project.json --newlines
	@rez/delete-text '		"js/lib/aes.js",' ${dest}/template/proj.html5/project.json --newlines
	@rez/delete-text '		"js/lib/underscore.js",' ${dest}/template/proj.html5/project.json --newlines
	@rez/delete-text '		"js/lib/soomla.js",' ${dest}/template/proj.html5/project.json --newlines
	@rez/delete-text '		"js/lib/SoomlaNdk.js",' ${dest}/template/proj.html5/project.json --newlines
	@rez/delete-text '		"js/lib/AdsMobFox.js",' ${dest}/template/proj.html5/project.json --newlines
	@rez/delete-text '		"js/lib/Facebook.js",' ${dest}/template/proj.html5/project.json --newlines
	@rez/delete-text '					"-lcocos2dx-plugins",' ${dest}/template/proj.ios_mac/HelloJavascript.xcodeproj/project.pbxproj --newlines
	${dest}/prebuild headers
	rm ${dest}/build.log
	rm -r ${dest}/docs
	cp ${dest}/README.md ${dest}/README.litcoffee
	docco -o ${dest}/docs -l linear ${dest}/README.litcoffee ${dest}/template/server/Server.js ${dest}/template/js/*.js
	sed -i "" 's/README.litcoffee/README.md/g' ${dest}/docs/*.html
	rm ${dest}/README.litcoffee

docco:
	if [ -d docs ]; then rm -r docs; fi
	cp README.md README.litcoffee
	cp template/js/App.js template/js/App.js.bak
	cp template/js/Config.js template/js/Config.js.bak
	@rez/delete-text "# begin pro" README.litcoffee --newlines
	@rez/delete-text "# end pro" README.litcoffee --newlines
	@rez/delete-text "/* begin pro */" README.litcoffee
	@rez/delete-text "/* end pro */" README.litcoffee
	@rez/delete-text "// begin pro" template/js/Config.js --newlines
	@rez/delete-text "// end pro" template/js/Config.js --newlines
	@rez/delete-text "// begin pro" template/js/App.js --newlines
	@rez/delete-text "// end pro" template/js/App.js --newlines
	docco -l linear README.litcoffee template/server/Server.js template/js/*.js template/js/lib/AdsMobFox.js template/js/lib/Facebook.js
	sed -i "" 's/README.litcoffee/README.md/g' docs/*.html
	rm README.litcoffee
	mv template/js/App.js.bak template/js/App.js
	mv template/js/Config.js.bak template/js/Config.js
	if [ -d LemonadeExchange/docs ]; then rm -r LemonadeExchange/docs; fi
	# todo: remove begin/end pro from App.js
	docco -o LemonadeExchange/docs -l linear LemonadeExchange/server/Server.js LemonadeExchange/js/*.js LemonadeExchange/js/lib/AdsMobFox.js LemonadeExchange/js/lib/Facebook.js
	docco -o rez/docs -l linear rez/README-demo.md
	mv rez/docs/README-demo.html rez/
	rm -r rez/docs

docker:
	if [ -d docs ]; then rm -r docs; fi
	docker -o docs -i template -c manni -s yes -I --extras fileSearch -x lib/*

icons:
	cp rez/KandleIcon-iOS/Icon*.png template/proj.ios_mac/ios
	cp rez/KandleIcon-Android/36.png template/proj.android/res/drawable-ldpi/icon.png
	cp rez/KandleIcon-Android/48.png template/proj.android/res/drawable-mdpi/icon.png
	cp rez/KandleIcon-Android/72.png template/proj.android/res/drawable-hdpi/icon.png
	cp rez/KandleIcon-Android/96.png template/proj.android/res/drawable-xhdpi/icon.png
	cp rez/KandleIcon-misc/KandleIcon-round.icns template/proj.ios_mac/mac/Icon.icns
	cp rez/KandleIcon-misc/KandleIcon-round.ico template/proj.win32/res/game.ico
	cp rez/KandleIcon-misc/favicon_32x32.ico template/proj.html5/favicon.ico
	cp rez/KandleIcon-misc/KandleIcon-round_512x512x32.png template/proj.linux/Icon-512.png
	cp rez/LE-Icon-iOS/Icon*.png LemonadeExchange/proj.ios_mac/ios
	cp rez/LE-Icon-Android/36.png LemonadeExchange/proj.android/res/drawable-ldpi/icon.png
	cp rez/LE-Icon-Android/48.png LemonadeExchange/proj.android/res/drawable-mdpi/icon.png
	cp rez/LE-Icon-Android/72.png LemonadeExchange/proj.android/res/drawable-hdpi/icon.png
	cp rez/LE-Icon-Android/96.png LemonadeExchange/proj.android/res/drawable-xhdpi/icon.png
	cp rez/LE-Icon-misc/LE-Icon-Rounded.icns LemonadeExchange/proj.ios_mac/mac/Icon.icns
	cp rez/LE-Icon-misc/LE-Icon-Rounded.ico LemonadeExchange/proj.win32/res/game.ico
	cp rez/LE-Icon-misc/favicon-32.ico LemonadeExchange/proj.html5/favicon.ico
	cp rez/LE-Icon-misc/LE-Icon-Rounded_512x512x32.png LemonadeExchange/proj.linux/Icon-512.png

lemonadex: dest=.
lemonadex: name=LemonadeExchange
lemonadex: key=com.wizardfu.lemonadex
lemonadex:
	mv ${dest}/${name} ${dest}/${name}.old
	rm -rf ${dest}/${name}
	tools/create-project -n ${name} -k ${key} -p ${dest}
	cp -r ${dest}/${name}.old/res ${dest}/${name}/
	cp -r ${dest}/${name}.old/docs ${dest}/${name}/
	cp -r ${dest}/${name}.old/proj.android/res ${dest}/${name}/proj.android/
	cp ${dest}/${name}.old/docs.html ${dest}/${name}/
	cp ${dest}/${name}.old/js/*.js ${dest}/${name}/js/
	cp ${dest}/${name}.old/server/Server.js ${dest}/${name}/server/
	cp ${dest}/${name}.old/proj.html5/build.xml ${dest}/${name}/proj.html5/
	cp ${dest}/${name}.old/proj.html5/minified.js ${dest}/${name}/proj.html5/
	cp -r ${dest}/${name}.old/lib/cocos2dx-prebuilt/* ${dest}/${name}/lib/cocos2dx-prebuilt/
	#cp ${dest}/${name}.old/proj.android/AndroidManifest.xml ${dest}/${name}/proj.android/
	rm -rf ${dest}/${name}/art
	rm -f ${dest}/${name}/proj.html5/*-min.js
	rm ${dest}/${name}/js/SceneHello.js
	sed -i "" 's/SceneHello/SceneMain/g' ${dest}/${name}/js/App.js
	sed -i "" 's/SceneHello/SceneMain/g' ${dest}/${name}/proj.html5/project.json
	sed -i "" 's/SceneHello/SceneMain/g' ${dest}/${name}/proj.html5/build.xml
	sed -i "" 's/SceneHello/SceneMain/g' ${dest}/${name}/proj.html5/minified.js
	sed -i "" 's/Loader\.js/Loader\.js", "js\/LayerGame\.js", "js\/LayerMenu\.js/g' ${dest}/${name}/proj.html5/project.json
	sed -i "" 's/MyFacebookAppID/641151319281152/g' ${dest}/${name}/proj.ios_mac/ios/Info.plist
	rm -rf ${dest}/${name}.old

save-lemonadex:
	cp LemonadeExchange/js/Config.js rez/LemonadeExchange/js/
	cp LemonadeExchange/js/Layer*.js rez/LemonadeExchange/js/
	cp LemonadeExchange/js/LemonadeExchange.js rez/LemonadeExchange/js/
	cp LemonadeExchange/js/SceneMain.js rez/LemonadeExchange/js/
	cp -r LemonadeExchange/res/* rez/LemonadeExchange/res/
	cp LemonadeExchange/server/Server.js rez/LemonadeExchange/server/
	cp LemonadeExchange/upload rez/LemonadeExchange/
	echo "Note: doesn't save App.js!"

minify:
	if [ -f template/proj.html5/*-min.js ]; then rm template/proj.html5/*-min.js; fi
	#template/minify
	if [ -f LemonadeExchange/proj.html5/*-min.js ]; then rm LemonadeExchange/proj.html5/*-min.js; fi
	LemonadeExchange/minify
	LemonadeExchange/upload natweiss.com:le

upload:
	rsync ../releases/RapidGamePro "natweiss.com:." --stats -avzPe ssh

binary: dest=../releases/RapidGameProDemo/
binary: src=../releases/RapidGamePro/
binary: libdir=lib-small
binary:
	if [ -d ${dest} ]; then rm -r ${dest}; fi
	if [ ! -d ${src} ]; then echo "Please make release first"; exit 1; fi
	cp -R -P ${src}/LemonadeExchange/ ${dest}
	cp LICENSE_RapidGame.txt ${dest}
	cp rez/README-demo.md ${dest}/README.md
	cp rez/README-demo.html ${dest}/docs/README.html
	sed -i "" 's/SceneMain/README/g' ${dest}/docs.html
	cp rez/Facebook-stripped.js ${dest}/js/lib/Facebook.js
	cp rez/AdsMobFox-stripped.js ${dest}/js/lib/AdsMobFox.js
	cp rez/Facebook-stripped.html ${dest}/docs/Facebook.html
	cp rez/AdsMobFox-stripped.html ${dest}/docs/AdsMobFox.html
	rm -rf ${dest}/proj.linux
	rm -rf ${dest}/proj.win32
	rm -f ${dest}/lib/cocos2dx-prebuilt/include
	rm -f ${dest}/lib/cocos2dx-prebuilt/lib
	rm -f ${dest}/lib/cocos2dx-prebuilt/jsb
	rm -f ${dest}/lib/cocos2dx-prebuilt/java
	cp -r include ${dest}/lib/cocos2dx-prebuilt/
	cp -r java ${dest}/lib/cocos2dx-prebuilt/
	cp -r template/lib/cocos2dx-prebuilt/jsb ${dest}/lib/cocos2dx-prebuilt/
	mkdir -p ${dest}/lib/cocos2dx-prebuilt/lib/Debug-iOS/iphonesimulator
	mkdir -p ${dest}/lib/cocos2dx-prebuilt/lib/Debug-iOS/iphoneos
	mkdir -p ${dest}/lib/cocos2dx-prebuilt/lib/Debug-Android/armeabi
	mkdir -p ${dest}/lib/cocos2dx-prebuilt/lib/Debug-Mac/macosx
	cp -r ${libdir}/Debug-iOS/iphonesimulator/* ${dest}/lib/cocos2dx-prebuilt/lib/Debug-iOS/iphonesimulator/
	cp -r ${libdir}/Debug-iOS/iphoneos/* ${dest}/lib/cocos2dx-prebuilt/lib/Debug-iOS/iphoneos/
	cp -r ${libdir}/Debug-Android/armeabi/* ${dest}/lib/cocos2dx-prebuilt/lib/Debug-Android/armeabi/
	cp -r ${libdir}/Debug-Mac/macosx/* ${dest}/lib/cocos2dx-prebuilt/lib/Debug-Mac/macosx/
