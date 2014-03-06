.PHONY: docs

docs:
	rm -r docs
	cp README.md index.litcoffee
	docco -l linear index.litcoffee LemonadeExchange/js/*.js
	rm index.litcoffee

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

lemonadex: dest=~/Desktop
lemonadex: name=LemonadeExchange
lemonadex: key=com.wizardfu.lemonadex
lemonadex:
	rm -rf ${dest}/${name}
	tools/create_project.py -n ${name} -k ${key} -p ${dest}
	cp -r rez/${name}/res ${dest}/${name}/
	cp rez/${name}/js/*.js ${dest}/${name}/js/
	cp rez/${name}/server/server.js ${dest}/${name}/server/
	rm -rf ${dest}/${name}/art
	rm ${dest}/${name}/js/SceneHello.js
	sed -i "" 's/SceneHello/SceneMain/g' ${dest}/${name}/js/App.js
	sed -i "" 's/Loader\.js/Loader\.js", "js\/LayerGame\.js", "js\/LayerMenu\.js", "js\/ActionDrink\.js/g' ${dest}/${name}/js/App.js

