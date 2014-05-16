
//
// RapidGamePro
// ------------
//
// A cross-platform game project creator which can create Cocos2D JS, Unity, Corona and Appcelerator Titanium games.
//
// See:
// 1. [Selecting a Cross-platform Game Engine](http://www.binpress.com/blog/2014/05/14/selecting-cross-platform-game-engine/).
//

var path = require("path-extra"),
	fs = require("fs"),
	util = require("util"),
	cmd = require("commander"),
	replace = require("replace"),
	download = require("download"),
	glob = require("glob"),
	wrench = require("wrench"),
	child_process = require("child_process"),
	packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"))),
	cmdName = packageJson.name,
	version = packageJson.version,
	templates = ["HelloWorld", "BrickBreaker"],
	engines = ["cocos2d", "unity", "corona", "titanium"],
	defaults = {
		engine: engines[0],
		package: "org.mycompany.mygame",
		template: templates[0],
		dest: process.cwd(),
		prefix: __dirname // or, path.join(path.homedir(), "Library/Developer/RapidGame")?
	},
	cocos2djsUrl = "http://cdn.cocos2d-x.org/cocos2d-js-v3.0-alpha2.zip",
	notes = "";

//
// Main run method.
//
var run = function(args) {
	args = args || process.argv;
	cmd
		.version(version)
		.option("-t, --template [name]", "template (" + templates.join(", ") + ") [" + defaults.template + "]", defaults.template)
		.option("-e, --engine [name]", "engine to use (" + engines.join(", ") + ") [" + defaults.engine + "]", defaults.engine)
		.option("-p, --prefix [name]", "library directory [" + defaults.prefix + "]", defaults.prefix)
		.option("-o, --output [path]", "output folder [" + defaults.dest + "]", defaults.dest)
		.option("-k, --package [name]", "package name [" + defaults.package + "]", defaults.package)
		.option("-v, --verbose", "be verbose", false);
	
	cmd
		.command("*")
		.description("Create a new project using one of the templates, for example: " + cmdName + " Foo")
		.action(createProject);

	cmd
		.command("prebuild")
		.description("Prebuild Cocos2D JS static libraries for all platforms and architectures")
		.action(prebuild);
	
	cmd
		.parse(args)
		.name = cmdName;

	if (!cmd.args.length) {
		return console.log(cmd.helpInformation());
	}
};

//
// Create project.
//
var createProject = function(name) {
	var dir = path.join(cmd.output, name),
		src,
		dest,
		fileCount,
		i,
		onFinished;
	
	// Check if dirs exist
	if (dirExists(dir)) {
		console.log("Output directory already exists: " + dir);
		process.exit(1);
	}

	// Check engine and template
	if (engines.indexOf(cmd.engine) < 0) {
		console.log("Engine '" + cmd.engine + "' not found, defaulting to " + defaults.engine);
		cmd.engine = defaults.engine;
	}
	if (templates.indexOf(cmd.template) < 0) {
		console.log("Template '" + cmd.template + "' not found, defaulting to " + defaults.template);
		cmd.template = defaults.template;
	}
	report("createProject", "start", cmd.engine + "/" + cmd.template);
	src = path.join(__dirname, "templates", cmd.engine, cmd.template);
	if (!dirExists(src)) {
		console.log("Missing template directory: " + src);
		process.exit(1);
	}
	console.log("Rapidly creating a game named '" + name + "' with engine " +
		cmd.engine.charAt(0).toUpperCase() + cmd.engine.slice(1) + " and template " + cmd.template);
	
	// Copy all template files to destination
	dest = dir;
	console.log("Copying project files from " + src + " to " + dest);
	fileCount = copyRecursive(src, dest, cmd.verbose);
	if (cmd.verbose) {
		console.log("Successfully copied " + fileCount + " files");
	}
	
	// Replace project name
	console.log("Replacing all '" + cmd.template + "' with '" + name + "'");
	replace({
		regex: cmd.template,
		replacement: name,
		paths: [dest],
		include: "*.js,*.plist,*.cpp,*.html,*.json,*.xml,*.xib,*.pbxproj,*.xcscheme,*.xcworkspacedata,*.xccheckout,*.sh,*.cmd,*.py,*.rc,*.sln,*.txt,.project,.cproject,makefile,manifest,*.vcxproj,*.user,*.filters",
		recursive: true,
		silent: !cmd.verbose
	});

	// Replace package name
	src = "com.wizardfu." + cmd.template.toLowerCase();
	console.log("Replacing all '" + src + "' with '" + cmd.package + "'");
	replace({
		regex: src,
		replacement: cmd.package,
		paths: [dest],
		include: "*.js,*.plist,*.xml,makefile,manifest",
		recursive: true,
		silent: !cmd.verbose
	});
	
	// Rename files & dirs
	from = path.join(dest, "**", cmd.template + ".*");
	console.log("Renaming all " + from + " files");
	files = glob.sync(from);
	for (i = 0; i < files.length; i++) {
		from = files[i];
		to = path.join(path.dirname(from), path.basename(from).replace(cmd.template, name));
		if (cmd.verbose) {
			console.log("Moving " + from + " to " + to);
		}
		try {
			fs.renameSync(from, to);
		} catch(e) {
			note("Error moving file " + e);
		}
	}
	
	// Symlink
	if (cmd.engine.indexOf("cocos") >= 0) {
		src = cmd.prefix;
		dest = path.join(dir, "lib");
		console.log("Symlinking from " + src + " to " + dest);
		try {
			fs.symlinkSync(src, dest);
		} catch(e) {
			note("Error creating symlink: " + e);
		}
	}
	
	// Npm install
	i = null;
	dest = path.join(dir, "server");
	onFinished = function(){
		console.log("Done creating project " + name);
		report("createProject", "done", notes);
	};
	if (dirExists(dest) && !dirExists(path.join(dest, "node_modules"))) {
		console.log("Installing node modules");
		try {
			child_process.exec("npm install", {cwd: dest, env: process.env}, function(a, b, c){
				execCallback(a, b, c);
				onFinished();
			});
		} catch(e) {
			note("Error installing node modules: " + e);
		}
	} else {
		onFinished();
	}
};

//
// Copy files recursively with a special exclude filter.
//
var copyRecursive = function(src, dest, verbose) {
	var count = 0,
		ignore = [
			//"node_modules",
			".DS_Store",
			"wsocket.c", "wsocket.h",
			"usocket.c", "usocket.h",
			"unix.c", "unix.h",
			"serial.c",
		];
	
	wrench.copyDirSyncRecursive(src, dest, {
		forceDelete: true, // Whether to overwrite existing directory or not
		excludeHiddenUnix: false, // Whether to copy hidden Unix files or not (preceding .)
		preserveFiles: true, // If we're overwriting something and the file already exists, keep the existing
		preserveTimestamps: true, // Preserve the mtime and atime when copying files
		inflateSymlinks: false, // Whether to follow symlinks or not when copying files
		exclude: function(filename, dir){
			// Shall this file/dir be exluded?
			var i, doExclude = false;
			if (dir.indexOf("proj.android") >= 0) {
				if (filename === "obj" || filename === "gen" || filename === "assets" || filename === "bin") {
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
			} else if (filename === "lib") {
				try {
					i = fs.lstatSync(path.join(dir, filename));
					if (i.isSymbolicLink()) {
						doExclude = true;
					}
				} catch(e) {
					console.log(e);
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
// Test if a directory exists
//
var dirExists = function(path) {
	var stat;
	try {
		stat = fs.statSync(path);
	} catch(e) {
	}
	return (stat && stat.isDirectory());
};

//
// child_process.exec callback
//
var execCallback = function(error, stdout, stderr) {
	if (cmd.verbose) {
		console.log(stdout);
		console.log(stderr);
	}
	if (error !== null) {
		note("exec error: " + error);
	}
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
var copySrcFiles = function(callback) {
	var dest,
		verbose = false,
		dir = path.join(defaults.prefix, "/");

console.log("Prebuild command is under construction");
process.exit(1);

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
var downloadCocos = function( callback) {
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
var runPrebuild = function(callback) {
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
var prebuild = function() {
	copySrcFiles(function() {
		downloadCocos(function() {
			runPrebuild(function() {
				console.log("Done with prebuild");
			});
		});
	});
};

//
// auto bug reporting and insights
//
var report = (function() {
	var ua = require("universal-analytics"),
		filename = path.join(__dirname, ".id"),
		uuid,
		visitor;
	
	try {
		uuid = fs.readFileSync(filename).toString();
	} catch(e) {
	}
	if (uuid && uuid.indexOf("false") >= 0) {
		console.log("Opted out of automatic bug reporting");
		return function(){};
	}
	if (!uuid || uuid.length < 32 || uuid.indexOf("-") < 0) {
		console.log("This tool automatically reports bugs & anonymous usage statistics.");
		console.log("You may opt-out of this feature by setting contents of the file '" + filename + "' to 'false'.");
		uuid = require("node-uuid").v4();
		try {
			fs.writeFileSync(filename, uuid);
		} catch(e) {
		}
	}
	//console.log("UUID: " + uuid);
	visitor = ua("UA-597335-12", uuid);

	return function(category, action, label, value, path) {
		category = category || "unknownCategory";
		action = action || "unknownAction";
		label = label || "";
		value = value || 0;
		path = path || (category + "/" + action);
		
		console.log("Report category '" + category + "' action '" + action + "' label '" + label + "' value '" + value + "' path '" + path + "'");
		visitor.event(category, action, label, value, {p: path}, function (err) {
		});
	}
}());

//
// add a note
//
var note = function(str) {
	console.log(str);
	notes = notes || "";
	notes += (notes.length ? ". " : "");
	notes += str.toString().trim();
};

module.exports = {
	run: run,
	version: version
};


