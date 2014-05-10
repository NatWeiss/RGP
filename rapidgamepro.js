
var path = require('path-extra');
var fs = require('fs');
var util = require('util');
var commander = require('commander');
var cpr = require('cpr');
var replace = require('replace');
var download = require('download');
var glob = require('glob');
var version = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'))).version;
var engines = ['cocos2d-js', 'unity', 'corona'];
var defaults = {
	engine: engines[0],
	package: 'org.mycompany.mygame',
	dest: path.join(path.homedir(), 'Desktop/')
};
var cocos2djsUrl = "http://cdn.cocos2d-x.org/cocos2d-js-v3.0-alpha2.zip";

var run = function(args) {
	var cmd = commander;
	args = args || process.argv;
	cmd
		.version(version)
		.usage('<new-project-name> [options]')
		.option('-e, --engine', 'engine to use (' + engines.join(', ') + ') [' + defaults.engine + ']', defaults.engine)
		.option('-o, --output [path]', 'output folder [' + defaults.dest + ']', defaults.dest)
		.option('-p, --package [name]', 'package name [' + defaults.package + ']', defaults.package)
		//.option('-d, --delete', 'delete the destination if it exists')
		.parse(args)
		.name = 'rapidgame';

	if (cmd.args.length) {
		if(cmd.args[0] === "prebuild") {
			return prebuild(cmd);
		} else {
			return createProject(cmd);
		}
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
		var i, dir, dirs, files, from, to;
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
		
		// Rename files & dirs
		from = dest + "/**/HelloJavascript.*";
		console.log("Globbing " + from);
		files = glob.sync(from);
		for (i = 0; i < files.length; i++) {
			from = files[i];
			to = files[i].replace("HelloJavascript", name);
			console.log("Moving " + from + " to " + to);
			try {
				fs.renameSync(from, to);
			} catch(e) {
				console.log("Error moving file");
			}
		}
		
		// Symlinks
		try {
			dir = path.join(dest, "lib/cocos2dx-prebuilt");
			console.log("Making directory " + dir);
			fs.mkdirSync(dir);
		} catch(e) {
			console.log("Error creating directory: " + e);
		}
		dirs = ["lib", "include", "java", "jsb"];
		for (i = 0; i < dirs.length; i += 1) {
			try {
				from = fs.realpathSync("./" + dirs[i]);
				to = path.join(dir, "/" + dirs[i]);
				console.log("Symlinking from " + from + " to " + to);
				fs.symlinkSync(from, to);
			} catch(e) {
				console.log("Error creating symlink: " + e);
			}
		}
		
		// Chmod
		files = ["run-server", "minify", "upload", "proj.android/build_native.py"];
		for (i = 0; i < files.length; i += 1) {
			try {
				to = path.join(dest, files[i]);
				console.log("Making " + to + " executable");
				fs.chmodSync(to, "755");
			} catch(e) {
				console.log("Error creating symlink: " + e);
			}
		}
		
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

var downloadUrl = function(url, dest, cb) {
	var done = false,
		total = 1,
		cur = 0,
		emitter = download(url, dest, {extract: true});

	// Get total length
	emitter.on("response", function(response) {
		total = parseInt(response.headers["content-length"], 10)
	});
	
	// Update percentage
	emitter.on("data", function(chunk) {
		if (!done) {
			cur += chunk.length;
			done = (cur >= total);
			util.print("Downloading " + url + " "
				+ (100.0 * cur / total).toFixed(2) + "%..."
				+ (done ? "\n" : "\r"));
		}
	});
	
	// Error
	emitter.on("error", function(status) {
		console.log("Download error " + status);
		cb();
	});
	
	// Done
	emitter.on("close", function() {
		console.log("Download finished");
		cb(true);
	});
};

var prebuild = function(cmd) {
	var dir = "cocos2d-js",
		cd = dir + "/cocos2d-js-v3.0-alpha2",
		dest = path.join(__dirname, dir),
		stat,
		onDownloadFinished = function(success) {
			try {
				var from = path.join(cd, "/frameworks/js-bindings/cocos2d-x"),
					to = path.normalize("./src/cocos2d-x");
				console.log("Moving " + from + " to " + to);
				fs.renameSync(from, to);
			} catch(e) {
				console.log("Couldn't move cocos2d-x");
			}
			
			try {
				var spawn = require('child_process').spawn;
				var child = spawn("./prebuild");//, ['-v', 'builds/pdf/book.html', '-o', 'builds/pdf/book.pdf']);
				child.stdout.on("data", function(chunk) {
					util.print(chunk.toString());
				});
			} catch(e) {
				console.log(e);
			}
		};
	
	// Does Cocos2d-JS folder exist?
	try {
		stat = fs.lstatSync(dest);
	} catch(e) {}
	if (typeof stat === "undefined" || !stat.isDirectory()) {
		downloadUrl(cocos2djsUrl, dest, onDownloadFinished);
	} else {
		console.log(dest + " already exists");
		onDownloadFinished(true);
	}

};
