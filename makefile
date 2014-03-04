
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

