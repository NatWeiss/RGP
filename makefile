.PHONY: docs

release: dest=../releases/RapidGamePro/
release:
	find . -name .DS_Store -delete
	mkdir ${dest}
	cp -a docs ${dest}
	cp docs.html ${dest}
	cp -a include ${dest}
	cp -a LemonadeExchange ${dest}
	cp -a README.md ${dest}
	cp -a src ${dest}
	cp -a template ${dest}
	cp -a tools ${dest}
	#rm -r ${dest}.git
	rm -rf ${dest}src/soomla/cocos2dx-store/.git
	rm -rf ${dest}template/proj.android/assets
	rm -rf ${dest}template/proj.android/bin
	rm -rf ${dest}template/proj.android/gen
	rm -rf ${dest}template/proj.android/libs
	rm -rf ${dest}template/proj.android/obj
	rm -rf ${dest}template/proj.android/*.a
	rm -rf ${dest}LemonadeExchange/proj.android/assets
	rm -rf ${dest}LemonadeExchange/proj.android/bin
	rm -rf ${dest}LemonadeExchange/proj.android/gen
	rm -rf ${dest}LemonadeExchange/proj.android/libs
	rm -rf ${dest}LemonadeExchange/proj.android/obj
	open ../releases
	open -a /Applications/YemuZip.app/

docco:
	if [ -d docs ]; then rm -r docs; fi
	cp README.md README.litcoffee
	docco -l linear README.litcoffee template/server/Server.js template/js/*.js template/js/lib/AdsMobFox.js template/js/lib/Facebook.js
	sed -i "" 's/README.litcoffee/README.md/g' docs/*.html
	rm README.litcoffee

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
	rm -rf ${dest}/${name}
	tools/create-project -n ${name} -k ${key} -p ${dest}
	cp -r rez/${name}/res ${dest}/${name}/
	cp rez/${name}/js/*.js ${dest}/${name}/js/
	cp rez/${name}/server/Server.js ${dest}/${name}/server/
	rm -rf ${dest}/${name}/art
	rm -f ${dest}/${name}/proj.html5/*-min.js
	rm ${dest}/${name}/js/SceneHello.js
	sed -i "" 's/SceneHello/SceneMain/g' ${dest}/${name}/js/App.js
	sed -i "" 's/SceneHello/SceneMain/g' ${dest}/${name}/proj.html5/project.json
	sed -i "" 's/SceneHello/SceneMain/g' ${dest}/${name}/proj.html5/build.xml
	sed -i "" 's/SceneHello/SceneMain/g' ${dest}/${name}/proj.html5/minified.js
	sed -i "" 's/Loader\.js/Loader\.js", "js\/LayerGame\.js", "js\/LayerMenu\.js", "js\/ActionDrink\.js/g' ${dest}/${name}/proj.html5/project.json
	sed -i "" 's/MyFacebookAppID/641151319281152/g' ${dest}/${name}/proj.ios_mac/ios/Info.plist

save-lemonadex:
	cp LemonadeExchange/js/ActionDrink.js rez/LemonadeExchange/js/
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
