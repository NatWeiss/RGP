
var path = require('path-extra');
var fs = require('fs');
var commander = require('commander');
var cpr = require('cpr');
var replace = require('replace');
var version = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'))).version;
var engines = ['cocos2d-js', 'unity', 'corona'];
var defaults = {
	engine: engines[0],
	package: 'org.mycompany.mygame',
	dest: path.join(path.homedir(), 'Desktop/')
};

var run = function(args) {
	var cmd = commander;
	args = args || process.argv;
	cmd
		.version(version)
		.usage('<new-project-name> [options]')
		.option('-e, --engine', 'engine to use (' + engines.join(', ') + ') [' + defaults.engine + ']', defaults.engine)
		.option('-o, --output [path]', 'output folder [' + defaults.dest + ']', defaults.dest)
		.option('-p, --package [name]', 'package name [' + defaults.package + ']', defaults.package)
//		.option('-d, --delete', 'delete the destination if it exists')
		.parse(args)
		.name = 'rapidgame';

	if (cmd.args.length) {
		return createProject(cmd);
	} else {
		return console.log(cmd.helpInformation());
	}
};

var createProject = function(cmd) {
	var name = cmd.args[0],
		package = cmd.package,
		src = path.join(__dirname, 'template'),
		dest = path.join(cmd.output, name),
		ignore = [
			"lib/cocos2dx-prebuilt/",
			"proj.android/obj/",
			"proj.android/bin/",
			"proj.android/gen/",
			"proj.android/assets/",
			"proj.android/libs/armeabi/",
			"proj.android/libs/armeabi-v7a/",
			"proj.android/libs/x86",
			"proj.android/libs/mips",
			".xcodeproj/project.xcworkspace",
			".xcodeproj/xcuserdata",
		],
		ignored = {};
	
	// Copy all template files to destination
	console.log("Source: " + src);
	console.log("Destination: " + dest);

	cpr(src, dest, {
		deleteFirst: true, //cmd.delete,
		overwrite: true,
		confirm: false, // true will try to confirm the filtered out files as well
		filter: function(filename, index, array){
			for (var i = 0; i < ignore.length; i += 1) {
				if (filename.indexOf(ignore[i]) >= 0) {
					ignored[ignore[i]] = ignored[ignore[i]] || 0;
					ignored[ignore[i]]++;
					return false;
				}
			}
			return true;
		}
	}, function(errs, files) {
		// Show results
		var i;
		if (errs) {
			console.log("Errors:");
			console.log(errs);
			return;
		}
		for (i in ignored) {
			if (ignored.hasOwnProperty(i)) {
				console.log("Ignored " + ignored[i] + " files from " + i);
			}
		}
		console.log("Successfully copied " + files.length + " files");
		
		// Replace project name
		console.log("Replacing project name...");
		replace({
			regex: "HelloJavascript",
			replacement: name,
			paths: [dest],
			include: "*.js,*.plist,*.cpp,*.html,*.json,*.xml,*.xib,*.pbxproj,*.sh,*.rc,*.sln,*.txt,.project,.cproject,makefile",
			recursive: true,
			silent: false
		});

		// Replace package name
		console.log("Replacing package name with " + package + "...");
		replace({
			regex: "org.cocos2dx.hellojavascript",
			replacement: package,
			paths: [dest],
			include: "*.js,*.plist,*.xml,makefile",
			recursive: true,
			silent: false
		});
	});
	
	
};

module.exports = {
	run: run,
	version: version
};

/*

ios_mac:
{
    "rename":               ["PROJECT_NAME.xcodeproj",
	                         "../js/PROJECT_NAME.js"],
    "remove":               ["PROJECT_NAME.xcodeproj/project.xcworkspace",
                             "PROJECT_NAME.xcodeproj/xcuserdata"],
    "replace_package_name": ["ios/Info.plist",
	                         "mac/Info.plist",
							 "../js/Config.js"],
    "replace_project_name": ["ios/Info.plist",
                             "../src/AppDelegate.cpp",
                             "../proj.html5/index.html",
                             "../proj.html5/project.json",
							 "../js/App.js",
							 "../proj.html5/build.xml",
							 "../proj.html5/minified.js",
							 "mac/en.lproj/MainMenu.xib",
                             "mac/Info.plist",
                             "PROJECT_NAME.xcodeproj/project.pbxproj"]
}

android:
{
    "rename":               [],
    "remove":               ["assets",
                             "bin",
                             "libs",
                             "gen",
                             "obj",
                             "wsocket.c",
                             "wsocket.h"],
    "replace_package_name": ["AndroidManifest.xml",
	                         "makefile"],
    "replace_project_name": [".project",
                             ".cproject",
                             "AndroidManifest.xml",
							 "makefile",
                             "build.xml",
                             "build_native.sh",
                             "build_native.cmd",
                             "res/values/strings.xml"]
}

html5:
{
    "rename":               [],
    "remove":               [],
    "replace_package_name": [],
    "replace_project_name": []
}


win32:
{
    "rename":               ["PROJECT_NAME.vcxproj",
                             "PROJECT_NAME.vcxproj.filters",
                             "PROJECT_NAME.vcxproj.user",
                             "PROJECT_NAME.sln"],
    "remove":               ["usocket.c",
                             "usocket.h",
                             "unix.c",
                             "unix.h",
                             "serial.c"],
    "replace_package_name": [],
    "replace_project_name": ["PROJECT_NAME.vcxproj",
                             "PROJECT_NAME.vcxproj.filters",
                             "PROJECT_NAME.vcxproj.user",
                             "PROJECT_NAME.sln",
                             "game.rc",
                             "main.cpp"]
}

linux:
{
    "rename":               [],
    "remove":               ["wsocket.c",
                             "wsocket.h"],
    "replace_package_name": [],
    "replace_project_name": ["../CMakeLists.txt"]
}



*/

