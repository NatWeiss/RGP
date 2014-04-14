.PHONY: docs

release: dest=../releases/RapidGamePro/
release:
	find . -name .DS_Store -delete
	if [ -d ${dest} ]; then rm -r ${dest}; fi
	mkdir ${dest}
	cp README.md ${dest}
	cp CHANGELOG.txt ${dest}
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
	#rm -r ${dest}/src/cocos2d-x/cocos/2d/platform/android/java/bin
	#rm -r ${dest}/src/cocos2d-x/cocos/2d/platform/android/java/gen
	#rm -r ${dest}/src/cocos2dx-store/submodules/android-store/SoomlaAndroidStore/bin
	#rm -r ${dest}/src/cocos2dx-store/submodules/android-store/SoomlaAndroidStore/gen
	#rm -r ${dest}/src/cocos2dx-store/android/bin
	#rm -r ${dest}/src/cocos2dx-store/android/gen
	#rm -r ${dest}/src/cocos2d-x/plugin/plugins/flurry/proj.android/bin
	#rm -r ${dest}/src/cocos2d-x/plugin/plugins/flurry/proj.android/gen
	#rm -r ${dest}/src/facebook/proj.android/facebook-android-sdk/bin
	#rm -r ${dest}/src/facebook/proj.android/facebook-android-sdk/gen
	echo This will be a git pull
	echo Cocos2d-html5 only once
	echo Facebook SDK framework, Flurry SDK, MobFox FlurryAgent.jar only once
	open ../releases
	open -a /Applications/YemuZip.app/

docco:
	if [ -d docs ]; then rm -r docs; fi
	cp README.md README.litcoffee
	docco -l linear README.litcoffee template/server/Server.js template/js/*.js template/js/lib/AdsMobFox.js template/js/lib/Facebook.js
	sed -i "" 's/README.litcoffee/README.md/g' docs/*.html
	rm README.litcoffee
	#
	if [ -d LemonadeExchange/docs ]; then rm -r LemonadeExchange/docs; fi
	docco -o LemonadeExchange/docs -l linear LemonadeExchange/server/Server.js LemonadeExchange/js/*.js LemonadeExchange/js/lib/AdsMobFox.js LemonadeExchange/js/lib/Facebook.js

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
	template/minify

upload:
	rsync ../releases/RapidGamePro "natweiss.com:." --stats -avzPe ssh

