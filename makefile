.PHONY: docs

release: dest=../releases/RapidGamePro/
release:
	find . -name .DS_Store -delete
	if [ -d ${dest} ]; then rm -r ${dest}; fi
	mkdir ${dest}
	cp -a bin ${dest}
	cp CHANGELOG.txt ${dest}
	mkdir -p ${dest}cocos2d/x
	cp -r cocos2d/html ${dest}cocos2d/
	cp -r cocos2d/x/include cocos2d/x/java cocos2d/x/jsb ${dest}cocos2d/x/
	cp -r cocos2d/x/lib-small ${dest}cocos2d/x/lib
	cp -a docs ${dest}
	cp docs.html ${dest}
	cp -r frameworks ${dest}
	cd LemonadeExchange/proj.android && make clean
	cp -a LemonadeExchange ${dest}
	cp LICENSE-pro ${dest}LICENSE
	cp package.json ${dest}
	cp prebuild.sh ${dest}
	cp rapidgamepro.js ${dest}
	cp README-pro.md ${dest}README.md
	mv src/proj.android/obj src/proj.android/libs /tmp
	cp -a src ${dest}
	rm ${dest}src/cocos2d.patch
	mv /tmp/obj /tmp/libs src/proj.android/
	cd ${dest}src/proj.android && make clean
	cd templates/cocos2d/TwoScene && make clean
	cd templates/unity/TwoScene && make clean
	cd templates/titanium/TwoScene && make clean
	cp -a templates ${dest}
	rm -rf ${dest}templates/cocos2d/HelloWorld/server/node_modules
	rm -rf ${dest}cocos2d/x/java/*/bin #*/
	rm -rf ${dest}cocos2d/x/java/*/gen #*/
	find ${dest} -name xcuserdata -delete
	find ${dest} -name project.xcworkspace -delete
	@rez/delete-text "# begin pro" ${dest}prebuild.sh --newlines
	@rez/delete-text "# end pro" ${dest}prebuild.sh --newlines
	@rez/delete-text "# begin pro" ${dest}CHANGELOG.txt --newlines
	@rez/delete-text "# end pro" ${dest}CHANGELOG.txt --newlines
	@rez/delete-text "# begin pro" ${dest}src/proj.android/build.sh --newlines
	@rez/delete-text "# end pro" ${dest}src/proj.android/build.sh --newlines
	@rez/delete-text "# begin pro" ${dest}src/proj.android/jni/Android.mk --newlines
	@rez/delete-text "# end pro" ${dest}src/proj.android/jni/Android.mk --newlines
	@rez/delete-text "// begin pro" ${dest}templates/cocos2d/HelloWorld/js/Config.js --newlines
	@rez/delete-text "// end pro" ${dest}templates/cocos2d/HelloWorld/js/Config.js --newlines
	@rez/delete-text "// begin pro" ${dest}templates/cocos2d/HelloWorld/js/lib/App.js --newlines
	@rez/delete-text "// end pro" ${dest}templates/cocos2d/HelloWorld/js/lib/App.js --newlines
	@rez/delete-text "// begin pro" ${dest}templates/cocos2d/HelloWorld/src/AppDelegate.cpp --newlines
	@rez/delete-text "// end pro" ${dest}templates/cocos2d/HelloWorld/src/AppDelegate.cpp --newlines
	@rez/delete-text "// begin pro" ${dest}LemonadeExchange/src/AppDelegate.cpp --newlines
	@rez/delete-text "// end pro" ${dest}LemonadeExchange/src/AppDelegate.cpp --newlines
	@rez/delete-text "// begin pro" ${dest}templates/cocos2d/HelloWorld/proj.ios_mac/ios/AppController.mm --newlines
	@rez/delete-text "// end pro" ${dest}templates/cocos2d/HelloWorld/proj.ios_mac/ios/AppController.mm --newlines
	@rez/delete-text "// begin pro" ${dest}templates/cocos2d/HelloWorld/proj.android/src/org/cocos2dx/javascript/AppActivity.java --newlines
	@rez/delete-text "// end pro" ${dest}templates/cocos2d/HelloWorld/proj.android/src/org/cocos2dx/javascript/AppActivity.java --newlines
	@rez/delete-text "// begin pro" ${dest}LemonadeExchange/proj.android/src/org/cocos2dx/javascript/AppActivity.java --newlines
	@rez/delete-text "// end pro" ${dest}LemonadeExchange/proj.android/src/org/cocos2dx/javascript/AppActivity.java --newlines
	@rez/delete-text "<!-- begin pro -->" ${dest}templates/cocos2d/HelloWorld/proj.android/AndroidManifest.xml --newlines
	@rez/delete-text "<!-- end pro -->" ${dest}templates/cocos2d/HelloWorld/proj.android/AndroidManifest.xml --newlines
	@rez/delete-text "<!-- begin pro -->" ${dest}LemonadeExchange/proj.android/AndroidManifest.xml --newlines
	@rez/delete-text "<!-- end pro -->" ${dest}LemonadeExchange/proj.android/AndroidManifest.xml --newlines
	@rez/delete-text "# begin pro" ${dest}templates/cocos2d/HelloWorld/proj.android/jni/Android.mk --newlines
	@rez/delete-text "# end pro" ${dest}templates/cocos2d/HelloWorld/proj.android/jni/Android.mk --newlines
	@rez/delete-text "# begin pro" ${dest}LemonadeExchange/proj.android/jni/Android.mk --newlines
	@rez/delete-text "# end pro" ${dest}LemonadeExchange/proj.android/jni/Android.mk --newlines
	@rez/delete-text "# begin pro" ${dest}templates/cocos2d/HelloWorld/proj.android/project.properties --newlines
	@rez/delete-text "# end pro" ${dest}templates/cocos2d/HelloWorld/proj.android/project.properties --newlines
	@rez/delete-text "# begin pro" ${dest}LemonadeExchange/proj.android/project.properties --newlines
	@rez/delete-text "# end pro" ${dest}LemonadeExchange/proj.android/project.properties --newlines
	@rez/delete-text "<!-- begin pro -->" ${dest}templates/cocos2d/HelloWorld/proj.html5/index.html --newlines
	@rez/delete-text "<!-- end pro -->" ${dest}templates/cocos2d/HelloWorld/proj.html5/index.html --newlines
	@rez/delete-text "<!-- begin pro -->" ${dest}LemonadeExchange/proj.html5/index.html --newlines
	@rez/delete-text "<!-- end pro -->" ${dest}LemonadeExchange/proj.html5/index.html --newlines
	open ../releases
	open -a /Applications/YemuZip.app/

rg: dest=../releases/RapidGame/
rg:
	#if [ -d ${dest} ]; then rm -r ${dest}; fi
	mkdir -p ${dest}src
	cp README.md ${dest}
	cp CHANGELOG.txt ${dest}
	@rez/delete-between "# begin pro" "# end pro" ${dest}CHANGELOG.txt --newlines
	cp LICENSE ${dest}
	cp docs.html ${dest}
	cp src/cocos2d.patch ${dest}src
	cp package.json ${dest}
	cp prebuild.sh ${dest}
	@rez/delete-between "# begin pro" "# end pro" ${dest}prebuild.sh --newlines
	cp rapidgamepro.js ${dest}rapidgame.js
	sed -i "" 's/rapidgamepro/rapidgame/g' ${dest}package.json
	cp -r bin ${dest}
	mv ${dest}bin/rapidgamepro ${dest}bin/rapidgame
	sed -i "" 's/pro//g' ${dest}bin/rapidgame
	cp -r src/proj.ios_mac ${dest}src/
	rm -r ${dest}src/proj.ios_mac/cocos2dx-plugins.xcodeproj
	rm -r ${dest}src/proj.ios_mac/PluginJSBindings.xcodeproj
	rm -r ${dest}src/proj.ios_mac/cocos2dx-prebuilt.xcodeproj/xcuserdata
	rm -r ${dest}src/proj.ios_mac/cocos2dx-prebuilt.xcodeproj/project.xcworkspace
	mv src/proj.android/obj src/proj.android/libs /tmp
	cp -r src/proj.android ${dest}src/
	mv /tmp/obj /tmp/libs src/proj.android/
	cd ${dest}src/proj.android && make clean
	@rez/delete-between "# begin pro" "# end pro" ${dest}src/proj.android/build.sh --newlines
	@rez/delete-between "# begin pro" "# end pro" ${dest}src/proj.android/jni/Android.mk --newlines
	rm -f ${dest}templates/cocos2d/TwoScene/lib
	rm -f ${dest}templates/cocos2d/HelloWorld/lib
	rm -f ${dest}templates/cocos2d/BrickBreaker/lib
	cp -R -P templates ${dest}
	rm -r ${dest}templates/cocos2d/HelloWorld
	rm -r ${dest}templates/cocos2d/*/Server/node_modules #*/
	cd ${dest}templates/cocos2d/TwoScene/Projects/android && make clean
	rm -r ${dest}templates/unity/*/Library #*/
	rm -rf ${dest}templates/unity/*/Temp #*/
	rm -r ${dest}templates/unity/*/*.unityproj #*/
	rm -r ${dest}templates/unity/*/*.sln #*/
	rm -r ${dest}templates/unity/*/*.userprefs #*/
	rm -rf ${dest}templates/titanium/TwoScene/build
	#@rez/delete-between "// begin pro" "// end pro" ${dest}templates/cocos2d/HelloWorld/js/Config.js --newlines
	#@rez/delete-between "// begin pro" "// end pro" ${dest}templates/cocos2d/HelloWorld/js/lib/App.js --newlines
	#@rez/delete-between "// begin pro" "// end pro" ${dest}templates/cocos2d/HelloWorld/src/AppDelegate.cpp --newlines
	#@rez/delete-between "// begin pro" "// end pro" ${dest}templates/cocos2d/HelloWorld/proj.ios_mac/ios/AppController.mm --newlines
	#@rez/delete-between "// begin pro" "// end pro" ${dest}templates/cocos2d/HelloWorld/proj.android/src/org/cocos2dx/javascript/AppActivity.java --newlines
	#@rez/delete-between "<!-- begin pro -->" "<!-- end pro -->" ${dest}templates/cocos2d/HelloWorld/proj.android/AndroidManifest.xml --newlines
	#@rez/delete-text 'android:name="com.soomla.store.SoomlaApp"' ${dest}templates/cocos2d/HelloWorld/proj.android/AndroidManifest.xml
	#@rez/delete-between "# begin pro" "# end pro" ${dest}templates/cocos2d/HelloWorld/proj.android/jni/Android.mk --newlines
	#@rez/delete-between "# begin pro" "# end pro" ${dest}templates/cocos2d/HelloWorld/proj.android/project.properties --newlines
	#@rez/delete-between "<!-- begin pro -->" "<!-- end pro -->" ${dest}templates/cocos2d/HelloWorld/proj.html5/index.html --newlines
	#@rez/delete-text '		"pluginx",' ${dest}templates/cocos2d/HelloWorld/proj.html5/project.json --newlines
	#@rez/delete-text '		"js/lib/aes.js",' ${dest}templates/cocos2d/HelloWorld/proj.html5/project.json --newlines
	#@rez/delete-text '		"js/lib/underscore.js",' ${dest}templates/cocos2d/HelloWorld/proj.html5/project.json --newlines
	#@rez/delete-text '		"js/lib/soomla.js",' ${dest}templates/cocos2d/HelloWorld/proj.html5/project.json --newlines
	#@rez/delete-text '		"js/lib/SoomlaNdk.js",' ${dest}templates/cocos2d/HelloWorld/proj.html5/project.json --newlines
	#@rez/delete-text '		"js/lib/AdsMobFox.js",' ${dest}templates/cocos2d/HelloWorld/proj.html5/project.json --newlines
	#@rez/delete-text '		"js/lib/Facebook.js",' ${dest}templates/cocos2d/HelloWorld/proj.html5/project.json --newlines
	#@rez/delete-text '					"-lcocos2dx-plugins",' ${dest}templates/cocos2d/HelloWorld/proj.ios_mac/HelloWorld.xcodeproj/project.pbxproj --newlines
	find ${dest} -name *.xccheckout -delete
	find ${dest} -name .DS_Store -delete
	#rm ${dest}templates/cocos2d/HelloWorld/js/lib/AdsMobFox.js
	#rm ${dest}templates/cocos2d/HelloWorld/js/lib/aes.js
	#rm ${dest}templates/cocos2d/HelloWorld/js/lib/Facebook.js
	#rm ${dest}templates/cocos2d/HelloWorld/js/lib/screenfull.js
	#rm ${dest}templates/cocos2d/HelloWorld/js/lib/soomla.js
	#rm ${dest}templates/cocos2d/HelloWorld/js/lib/SoomlaNdk.js
	#rm ${dest}templates/cocos2d/HelloWorld/js/lib/underscore.js
	#rm ${dest}templates/cocos2d/HelloWorld/proj.android/src/org/cocos2dx/javascript/AdsMobFox.java
	#rm ${dest}templates/cocos2d/HelloWorld/proj.android/src/org/cocos2dx/javascript/Facebook.java
	docco -o ${dest}docs -l linear ${dest}README.md ${dest}templates/cocos2d/TwoScene/Assets/lib/Game.js ${dest}templates/cocos2d/TwoScene/Assets/*.js ${dest}templates/cocos2d/TwoScene/Server/server.js #*/
	@rez/delete-between "<p> Created using" "Nat Weiss.</p>" ${dest}docs/Game.html
	#@rez/delete-between "<p> Created using" "Nat Weiss.</p>" ${dest}docs/Config.html
	#@rez/delete-between "<p> Created using" "Nat Weiss.</p>" ${dest}docs/ConfigServer.html
	#@rez/delete-between "<p> Created using" "Nat Weiss.</p>" ${dest}docs/HelloWorld.html
	@rez/delete-between "<p> Created using" "Nat Weiss.</p>" ${dest}docs/GameScene.html
	@rez/delete-between "<p> Created using" "Nat Weiss.</p>" ${dest}docs/MenuScene.html
	@rez/delete-between "<p> Created using" "Nat Weiss.</p>" ${dest}docs/Server.html
	echo ".DS_Store" > ${dest}.gitignore
	echo "xcuserdata" >> ${dest}.gitignore
	echo "project.xcworkspace" >> ${dest}.gitignore

docco:
	if [ -d docs ]; then rm -r docs; fi
	cp README.md README.litcoffee
	cp templates/cocos2d/HelloWorld/js/App.js templates/cocos2d/HelloWorld/js/App.js.bak
	cp templates/cocos2d/HelloWorld/js/Config.js templates/cocos2d/HelloWorld/js/Config.js.bak
	@rez/delete-text "# begin pro" README.litcoffee --newlines
	@rez/delete-text "# end pro" README.litcoffee --newlines
	@rez/delete-text "/* begin pro */" README.litcoffee
	@rez/delete-text "/* end pro */" README.litcoffee
	@rez/delete-text "// begin pro" templates/cocos2d/HelloWorld/js/Config.js --newlines
	@rez/delete-text "// end pro" templates/cocos2d/HelloWorld/js/Config.js --newlines
	@rez/delete-text "// begin pro" templates/cocos2d/HelloWorld/js/App.js --newlines
	@rez/delete-text "// end pro" templates/cocos2d/HelloWorld/js/App.js --newlines
	docco -l linear README.litcoffee templates/cocos2d/HelloWorld/server/Server.js templates/cocos2d/HelloWorld/js/*.js templates/cocos2d/HelloWorld/js/lib/AdsMobFox.js templates/cocos2d/HelloWorld/js/lib/Facebook.js
	sed -i "" 's/README.litcoffee/README.md/g' docs/*.html
	rm README.litcoffee
	mv templates/cocos2d/HelloWorld/js/App.js.bak templates/cocos2d/HelloWorld/js/App.js
	mv templates/cocos2d/HelloWorld/js/Config.js.bak templates/cocos2d/HelloWorld/js/Config.js
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
	cp rez/KandleIcon-iOS/Icon*.png templates/cocos2d/HelloWorld/proj.ios_mac/ios
	cp rez/KandleIcon-Android/36.png templates/cocos2d/HelloWorld/proj.android/res/drawable-ldpi/icon.png
	cp rez/KandleIcon-Android/48.png templates/cocos2d/HelloWorld/proj.android/res/drawable-mdpi/icon.png
	cp rez/KandleIcon-Android/72.png templates/cocos2d/HelloWorld/proj.android/res/drawable-hdpi/icon.png
	cp rez/KandleIcon-Android/96.png templates/cocos2d/HelloWorld/proj.android/res/drawable-xhdpi/icon.png
	cp rez/KandleIcon-misc/KandleIcon-round.icns templates/cocos2d/HelloWorld/proj.ios_mac/mac/Icon.icns
	cp rez/KandleIcon-misc/KandleIcon-round.ico templates/cocos2d/HelloWorld/proj.win32/res/game.ico
	cp rez/KandleIcon-misc/favicon_32x32.ico templates/cocos2d/HelloWorld/proj.html5/favicon.ico
	cp rez/KandleIcon-misc/KandleIcon-round_512x512x32.png templates/cocos2d/HelloWorld/proj.linux/Icon-512.png
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
	rapidgamepro ${name} -p $(pwd) -o . -k ${key} -v
	cp -r ${dest}/${name}.old/res ${dest}/${name}/
	cp ${dest}/${name}.old/docs.html ${dest}/${name}/
	cp -r ${dest}/${name}.old/docs ${dest}/${name}/
	cp ${dest}/${name}.old/js/*.js ${dest}/${name}/js/
	cp ${dest}/${name}.old/server/Server.js ${dest}/${name}/server/
	cp -r ${dest}/${name}.old/proj.android/res ${dest}/${name}/proj.android/
	#cp ${dest}/${name}.old/proj.android/AndroidManifest.xml ${dest}/${name}/proj.android/
	rm -rf ${dest}/${name}/art
	rm -f ${dest}/${name}/proj.html5/*-min.js
	rm ${dest}/${name}/js/SceneHello.js
	sed -i "" 's/SceneHello/SceneMain/g' ${dest}/${name}/js/App.js
	sed -i "" 's/SceneHello/SceneMain/g' ${dest}/${name}/proj.html5/project.json
	sed -i "" 's/SceneHello/SceneMain/g' ${dest}/${name}/proj.html5/minified.js
	sed -i "" 's/Loader\.js/Loader\.js", "js\/LayerGame\.js", "js\/LayerMenu\.js/g' ${dest}/${name}/proj.html5/project.json
	sed -i "" 's/SceneHello\.js/SceneMain\.js"\/><file name="LayerGame\.js"\/><file name="LayerMenu\.js/g' LemonadeExchange/proj.html5/build.xml
	sed -i "" 's/MyFacebookAppID/641151319281152/g' ${dest}/${name}/proj.ios_mac/ios/Info.plist
	rm -rf ${dest}/${name}.old

minify:
	#templates/cocos2d/HelloWorld/minify
	LemonadeExchange/minify
	LemonadeExchange/upload natweiss.com:le

upload:
	rsync ../releases/RapidGamePro "natweiss.com:." --stats -avzPe ssh

binary: dest=../releases/RapidGameProDemo/
binary: src=../releases/RapidGamePro/
binary: libdir=cocos2d/x/lib-small
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
	rm -f ${dest}/lib
	mkdir -p ${dest}/lib/cocos2d/x/lib
	mkdir -p ${dest}/lib/cocos2d/html
	cp -r cocos2d/x/include cocos2d/x/java cocos2d/x/jsb ${dest}/lib/cocos2d/x/
	cp -r cocos2d/x/lib-small ${dest}/lib/cocos2d/x/lib
	#mkdir -p ${dest}/lib/cocos2dx-prebuilt/lib/Debug-iOS/iphonesimulator
	#mkdir -p ${dest}/lib/cocos2dx-prebuilt/lib/Debug-iOS/iphoneos
	#mkdir -p ${dest}/lib/cocos2dx-prebuilt/lib/Debug-Android/armeabi
	#mkdir -p ${dest}/lib/cocos2dx-prebuilt/lib/Debug-Mac/macosx
	#cp -r ${libdir}/Debug-iOS/iphonesimulator/* ${dest}/lib/cocos2dx-prebuilt/lib/Debug-iOS/iphonesimulator/
	#cp -r ${libdir}/Debug-iOS/iphoneos/* ${dest}/lib/cocos2dx-prebuilt/lib/Debug-iOS/iphoneos/
	#cp -r ${libdir}/Debug-Android/armeabi/* ${dest}/lib/cocos2dx-prebuilt/lib/Debug-Android/armeabi/
	#cp -r ${libdir}/Debug-Mac/macosx/* ${dest}/lib/cocos2dx-prebuilt/lib/Debug-Mac/macosx/

install: dest=/usr/local/lib/node_modules/rapidgamepro
install: lib=/Users/nat/Library/Developer/RapidGame
install:
	cd templates/cocos2d/HelloWorld/proj.android; make clean
	mkdir -p /tmp/proj.android
	if [ -d /tmp/proj.android/obj ]; then mv /tmp/proj.android/* src/proj.android; fi
	cd src/proj.android; mv obj libs /tmp/proj.android
	sudo npm uninstall rapidgamepro -g
	sudo npm install . -g
	mv /tmp/proj.android/obj /tmp/proj.android/libs src/proj.android
	rmdir /tmp/proj.android
	#sudo rm ${dest}/rapidgamepro.js
	#sudo ln -s /Users/nat/code/RapidGamePro/rapidgamepro.js ${dest}/rapidgamepro.js
	mkdir -p ${lib}/src
	sudo cp -r src/bindings src/bindings-pluginx src/cocos2d-x src/external ${lib}/src/
