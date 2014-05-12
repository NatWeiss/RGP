
var path = require("path-extra");
var fs = require("fs");
var util = require("util");
var commander = require("commander");
var replace = require("replace");
var download = require("download");
var glob = require("glob");
var wrench = require("wrench");
var child_process = require("child_process");
var version = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"))).version;
var engines = ["cocos2d-js"];//, "unity", "corona"];
var defaults = {
	engine: engines[0],
	package: "org.mycompany.mygame",
	dest: path.join(path.homedir(), "Desktop/"),
	prefix: path.join(path.homedir(), "Library/Developer/RapidGame")
};
var cocos2djsUrl = "http://cdn.cocos2d-x.org/cocos2d-js-v3.0-alpha2.zip";

//
// Main run method.
//
var run = function(args) {
	var cmd = commander;
	args = args || process.argv;
	cmd
		.version(version)
		.usage("<new-project-name> [options]")
		.option("-p, --prefix [name]", "library directory [" + defaults.prefix + "]", defaults.prefix)
		.option("-e, --engine", "engine to use (" + engines.join(", ") + ") [" + defaults.engine + "]", defaults.engine)
		.option("-o, --output [path]", "output folder [" + defaults.dest + "]", defaults.dest)
		.option("-n, --package [name]", "package name [" + defaults.package + "]", defaults.package)
		.option("-v, --verbose", "be verbose", false)
		.parse(args)
		.name = "rapidgamepro";

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

//
// Copy files recursively with a special exclude filter.
//
var copyRecursive = function(src, dest, verbose) {
	var count = 0,
		ignore = [
			"cocos2dx-prebuilt",
			"wsocket.c", "wsocket.h",
			"usocket.c", "usocket.h",
			"unix.c", "unix.h",
			"serial.c",
		];
	
	wrench.copyDirSyncRecursive(src, dest, {
		forceDelete: true, // Whether to overwrite existing directory or not
		excludeHiddenUnix: true, // Whether to copy hidden Unix files or not (preceding .)
		preserveFiles: true, // If we're overwriting something and the file already exists, keep the existing
		preserveTimestamps: true, // Preserve the mtime and atime when copying files
		inflateSymlinks: false, // Whether to follow symlinks or not when copying files
		exclude: function(filename, dir){
			// Shall this file/dir be exluded?
			var i, doExclude = false;
			if (dir.indexOf("proj.android") >= 0) {
				if (filename === "obj" || filename === "gen" || filename === "assets") {
					doExclude = true;
				} else if (dir.indexOf("libs") >= 0) {
					if (filename === "armeabi" || filename === "armeabi-v7a" || filename === "x86" || filename === "mips") {
						doExclude = true;
					}
				}
			} else if (dir.indexOf(".xcodeproj") >= 0) {
				if (filename === "project.xcworkspace" || filename === "xcuserdata") {
					doExclude = true;
				}
			} else {
				for (i = 0; i < ignore.length; i += 1) {
					if (filename === ignore[i]) {
						doExclude = true;
						break;
					}
				}
			}

			// Report and return
			if (doExclude && verbose) {
				console.log("Ignoring filename '" + filename + "' in " + dir);
			}
			if (!doExclude) {
				count += 1;
			}
			return doExclude;
		}
	});

	return count;
};

//
// Create project.
//
var createProject = function(cmd) {
	var name = cmd.args[0],
		package = cmd.package,
		dir = path.join(cmd.output, name),
		src,
		dest,
		fileCount,
		i;
	
	// Copy all template files to destination
	src = path.join(__dirname, "template");
	dest = dir;
	console.log("Copying project files from " + src + " to " + dest);
	fileCount = copyRecursive(src, dest, cmd.verbose);
	if (cmd.verbose) {
		console.log("Successfully copied " + fileCount + " files");
	}
	
	// Replace project name
	console.log("Replacing project name with '" + name + "'");
	replace({
		regex: "HelloJavascript",
		replacement: name,
		paths: [dest],
		include: "*.js,*.plist,*.cpp,*.html,*.json,*.xml,*.xib,*.pbxproj,*.sh,*.cmd,*.py,*.rc,*.sln,*.txt,.project,.cproject,makefile,*.vcxproj,*.user,*.filters",
		recursive: true,
		silent: !cmd.verbose
	});

	// Replace package name
	console.log("Replacing package name with '" + package + "'");
	replace({
		regex: "org.cocos2dx.hellojavascript",
		replacement: package,
		paths: [dest],
		include: "*.js,*.plist,*.xml,makefile",
		recursive: true,
		silent: !cmd.verbose
	});
	
	// Rename files & dirs
	from = dest + "/**/HelloJavascript.*";
	console.log("Renaming project files");
	files = glob.sync(from);
	for (i = 0; i < files.length; i++) {
		from = files[i];
		to = files[i].replace("HelloJavascript", name);
		if (cmd.verbose) {
			console.log("Moving " + from + " to " + to);
		}
		try {
			fs.renameSync(from, to);
		} catch(e) {
			console.log("Error moving file");
		}
	}
	
	// Symlink
	src = cmd.prefix;
	dest = path.join(dir, "lib/cocos2dx-prebuilt");
	console.log("Symlinking from " + src + " to " + dest);
	try {
		fs.symlinkSync(src, dest);
	} catch(e) {
		console.log("Error creating symlink: " + e);
	}

	console.log("Done creating project " + name);
};

//
//
//
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

//
//
//
var copySrcFiles = function(cmd, callback) {
	var dest,
		verbose = false,
		dir = path.join(defaults.prefix, "/");
/*
	console.log("Copying prebuild to " + dir);
	try {
		dest = path.join(dir, "prebuild.sh");
		fs.createReadStream("prebuild").pipe(fs.createWriteStream(dest));
		fs.chmodSync(dest, "755");
	} catch(e) {
		console.log(e);
	}
*/

	// Synchronously copy src directory to dest
	dest = path.join(dir, "/src");
	console.log("Copying src dir to " + dest);
	wrench.copyDirSyncRecursive("./src", dest, {
		forceDelete: true, // Whether to overwrite existing directory or not
		excludeHiddenUnix: true, // Whether to copy hidden Unix files or not (preceding .)
		preserveFiles: true, // If we're overwriting something and the file already exists, keep the existing
		preserveTimestamps: true, // Preserve the mtime and atime when copying files
		inflateSymlinks: false, // Whether to follow symlinks or not when copying files
		exclude: function(filename, dir){
			if (dir.indexOf("proj.android") >= 0) {
				if (filename === "libs" || filename === "obj" || filename === "gen" || filename === "assets") {
					if (verbose) {
						console.log("Ignoring filename " + filename + ", dir " + dir);
					}
					return true;
				}
			}
			return false;
		}
	});

	callback();
};

//
//
//
var downloadCocos = function(cmd, callback) {
	console.log("Done downloading Cocos");
	callback();
	return;
	
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

//
//
//
var runPrebuild = function(cmd, callback) {
	try {
		var file = path.join(defaults.prefix, "prebuild"),
			child;

		child = child_process.spawn("./prebuild.sh", {/*cwd: defaults.prefix,*/ env: process.env});
		child.stdout.on("data", function(chunk) {
			util.print(chunk.toString());
		});
		child.stderr.on("data", function(chunk) {
			console.log(chunk.toString());
		});
		child.on("error", function(e) {
			console.log("Error " + e);
		});
		child.on("exit", function(code, signal) {
			console.log("Exit " + code + " " + signal);
		});
		child.on("close", function(code) {
			console.log("Done running prebuild");
			callback();
		});
	} catch(e) {
		console.log(e);
	}
};

//
//
//
var prebuild = function(cmd) {
	copySrcFiles(cmd, function() {
		downloadCocos(cmd, function() {
			runPrebuild(cmd, function() {
				console.log("Done with prebuild");
			});
		});
	});
};

module.exports = {
	run: run,
	version: version
};


