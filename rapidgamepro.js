//
//  Part of the [RapidGame](http://wizardfu.com/rapidgame) project.
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

var http = require("http"),
	path = require("path-extra"),
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
	cocos2djsUrl = "http://cdn.cocos2d-x.org/cocos2d-js-v3.0-alpha2.zip",
	cocos2dDirGlob = "*ocos2d-js*",
	category,
	engines = [],
	templates = [],
	defaults = {
		engine: "cocos2d",
		template: "TwoScene",
		package: "org.mycompany.mygame",
		dest: process.cwd(),
		prefix: __dirname
	};

//
// list directories (path.join is called on all arguments)
//
var listDirectories = function() {
	var i, src, dirs;
	for (i = 0; i < arguments.length; i += 1) {
		src = (src ? path.join(src, arguments[i]) : arguments[i]);
	}
	dirs = glob.sync(src);
	for (i = 0; i < dirs.length; i++) {
		dirs[i] = path.basename(dirs[i]);
	}
	return dirs;
};

//
// get engines and templates
//
engines = listDirectories(__dirname, "templates", "*");
templates = listDirectories(__dirname, "templates", "cocos2d", "*");

//
// Main run method.
//
var run = function(args) {
	var i, commands = [], commandFound = false;
	checkUpdate();
	args = args || process.argv;
	cmd
		.version(version)
		.option("-t, --template <name>", "template (" + templates.join(", ") + ") [" + defaults.template + "]", defaults.template)
		.option("-p, --prefix <name>", "library directory [" + defaults.prefix + "]", defaults.prefix)
		.option("-o, --output <path>", "output folder [" + defaults.dest + "]", defaults.dest)
		.option("-v, --verbose", "be verbose", false);

	cmd
		.command("create <engine> <project-name> <package-name>")
		.description("     Create a new cross-platform game project [engines: " + engines.join(", ") + "]")
		.action(createProject);
	commands.push("create");

	cmd
		.command("prebuild")
		.description("                            Prebuild Cocos2D X static libraries")
		.action(prebuild);
	commands.push("prebuild");

	cmd
		.command("init <directory>")
		.description("                            Create a symlink in the given directory to the libraries")
		.action(init);
	commands.push("init");

	cmd.on("--help", usageExamples);

	cmd
		.parse(args)
		.name = cmdName;

	if (!cmd.args.length) {
		usage();
	} else {
		// Check if command exists
		for (i = 0; i < commands.length; i += 1) {
			if (args[2] === commands[i]) {
				commandFound = true;
				break;
			}
		}
		if (!commandFound) {
			console.log("Command '" + args[2] + "' not found");
			usage();
		}
	}
};

//
// Initialize the given directory.
//
var init = function(directory) {
	var src, dest;

	if (!checkPrefix()) {
		usage();
		return 1;
	}
	if (!dirExists(directory)) {
		console.log("Output directory must exist: " + directory);
		return 1;
	}

	// Create lib symlink
	src = cmd.prefix;
	dest = path.join(directory, "lib");
	console.log("Symlinking" + (cmd.verbose ? ": " + dest + " -> " + src : " lib folder"));
	try {
		fs.symlinkSync(src, dest);
	} catch(e) {
		logErr("Error creating symlink: " + e);
	}
};

//
// Create project.
//
var createProject = function(engine, name, package) {
	var dir = path.join(cmd.output, name),
		src,
		dest,
		fileCount,
		i,
		onFinished,
		files,
		isCocos2d = false,
		packageSrc = "com.wizardfu." + cmd.template.toLowerCase();
	engine = engine.toString().toLowerCase();
	
	category = "createProject";
	
	if (!checkPrefix()) {
		usage();
		return 1;
	}
	
	// Check engine and name
	if (!engine || !name || !package) {
		console.log("Engine, project name and package name are required, for example: " + cmdName + " cocos2d \"Heck Yeah\" com.mycompany.heckyeah");
		usage();
		return 1;
	}

	// Check if dirs exist
	if (dirExists(dir) || fileExists(dir)) {
		console.log("Output directory already exists: " + dir);
		return 1;
	}

	// Check engine
	if (engines.indexOf(engine) < 0) {
		console.log("Engine '" + engine + "' not found");
		console.log("Available engines are: " + engines.join(", "));
		usage();
		return 1;
	}
	
	// Check template
	src = path.join(__dirname, "templates", engine, cmd.template);
	if (!dirExists(src)) {
		console.log("Missing template directory: " + src);
		files = listDirectories(__dirname, "templates", engine, "*");
		if (files.length > 0) {
			console.log("Available templates for " + engine + " are: " + files.join(", ") + ".");
		}
		usage();
		return 1;
	}
	
	// Start
	report("start", engine + "/" + cmd.template);
	console.log("Rapidly creating a game");
	console.log("Engine: " + engine.charAt(0).toUpperCase() + engine.slice(1));
	console.log("Template: " + cmd.template + (cmd.verbose ? " " + packageSrc : ""));
	isCocos2d = (engine.indexOf("cocos") >= 0);
	
	// Copy all template files to destination
	dest = dir;
	console.log("Copying project files" + (cmd.verbose ? " from " + src + " to " + dest : ""));
	fileCount = copyRecursive(src, dest, cmd.verbose);
	if (cmd.verbose) {
		console.log("Successfully copied " + fileCount + " files");
	}
	
	// Replace project name
	console.log("Setting project name: " + name);
	replace({
		regex: cmd.template,
		replacement: name,
		paths: [dest],
		include: "*.js,*.plist,*.cpp,*.md,*.lua,*.html,*.json,*.xml,*.xib,*.pbxproj,*.xcscheme,*.xcworkspacedata,*.xccheckout,*.sh,*.cmd,*.py,*.rc,*.sln,*.txt,.project,.cproject,makefile,manifest,*.vcxproj,*.user,*.filters",
		recursive: true,
		silent: !cmd.verbose
	});

	// Replace package name
	console.log("Setting package name: " + package);
	replace({
		regex: packageSrc,
		replacement: package,
		paths: [dest],
		include: "*.js,*.plist,*.xml,makefile,manifest,*.settings,*.lua,.project",
		recursive: true,
		silent: !cmd.verbose
	});
	
	// Rename files & dirs
	from = path.join(dest, "**", cmd.template + ".*");
	if (cmd.verbose) {
		console.log("Renaming all " + from + " files");
	}
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
			logErr("Error moving file " + e);
		}
	}
	
	// Symlink
	if (isCocos2d) {
		init(dir);
	}
	
	// Npm install
	i = null;
	dest = path.join(dir, "server");
	onFinished = function(){
		// Show readme
		console.log("Done");
		try {
			var text = fs.readFileSync(path.join(dir, "README.md")).toString();
			console.log("");
			console.log(text);
			console.log("");
		} catch(e) {
		}
		report("done");
		
		// Auto prebuild
		if (isCocos2d && !dirExists(path.join(cmd.prefix, "cocos2d"))) {
			console.log("");
			console.log("Automatically prebuilding Cocos2D libraries");
			prebuild();
		}
	};
	if (dirExists(dest) && !dirExists(path.join(dest, "node_modules"))) {
		console.log("Installing node modules");
		try {
			child_process.exec("npm install", {cwd: dest, env: process.env}, function(a, b, c){
				execCallback(a, b, c);
				onFinished();
			});
		} catch(e) {
			logErr("Error installing node modules: " + e);
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
			//"wsocket.c", "wsocket.h",
			//"usocket.c", "usocket.h",
			//"unix.c", "unix.h",
			//"serial.c",
		];
	
	wrench.copyDirSyncRecursive(src, dest, {
		forceDelete: false, // Whether to overwrite existing directory or not
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
			} else if (dir.indexOf(path.join("build", "build")) >= 0) {
				doExclude = true;
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
// check that prefix directory is writeable
//
var checkPrefix = function() {
	// Test prefix dir
	if (!isWriteableDir(cmd.prefix)) {
		if (cmd.prefix !== defaults.prefix) {
			logErr("Cannot write files to prefix directory: " + cmd.prefix);
			return false;
		}

		// Try users's home dir if they didn't override the prefix setting
		var newPrefix = path.join(path.homedir(), "Library", "Developer", "RapidGame");
		wrench.mkdirSyncRecursive(newPrefix);
		if (!isWriteableDir(newPrefix)) {
			logErr("Cannot write files to alternate prefix directory: " + newPrefix);
			return false;
		}
		cmd.prefix = newPrefix;
	}
	//console.log("Can successfully write files to prefix directory: " + cmd.prefix);
	return true;
};

//
// run the prebuild command
//
var prebuild = function(platform, config, arch) {
	category = "prebuild";
	platform = platform || "";
	config = config || "";
	arch = arch || "";

	if (!checkPrefix()) {
		usage();
		return 1;
	}

	report("start");
	copySrcFiles(function() {
		downloadCocos(function() {
			runPrebuild(platform, config, arch, function() {
				report("done");
			});
		});
	});
};

//
// copy src directory to prefix
//
var copySrcFiles = function(callback) {
	var src,
		dest,
		verbose = false;

	// Synchronously copy src directory to dest
	src = path.join(__dirname, "src");
	dest = path.join(cmd.prefix, "src");
	console.log("Copying " + src + " to " + dest);
	copyRecursive(src, dest);

	callback();
};

//
// download cocos2d js source
//
var downloadCocos = function(callback) {
	var dir = path.join(cmd.prefix, "src"),
		src, dest = path.join(dir, "cocos2d-js");
	if (dirExists(dest)) {
		callback();
	} else {
		downloadUrl(cocos2djsUrl, dir, function(success) {
			if (success) {
				var globPath = path.join(dir, cocos2dDirGlob),
					files = glob.sync(globPath);
				if (files && files.length === 1) {
					// Rename extract dir
					try {
						console.log("Moving " + files[0] + " to " + dest);
						fs.renameSync(files[0], dest);

						// Apply latest patch
						src = path.join(dir, "cocos2d.patch");
						try {
							console.log("Applying patch file: " + src);
							child_process.exec("git apply --whitespace=nowarn " + src, {cwd: dest, env: process.env}, function(a, b, c){
								execCallback(a, b, c);
								
								// Delete patch
								fs.unlinkSync(src);
								
								callback();
							});
						} catch(e) {
							logErr("Couldn't apply patch file: " + src);
						}
					} catch(e) {
						logErr("Couldn't move " + files[0] + " to " + dest)
					}
				} else {
					logErr("Couldn't glob " + globPath);
				}
			}
		});
	}
};

//
// run the prebuild command
//
var runPrebuild = function(platform, config, arch, callback) {
	try {
		var child = child_process.spawn(
			"./prebuild.sh",
			[
				cmd.prefix,
				"all"
				//platform,
				//config,
				//arch
			],
			{cwd: __dirname, env: process.env}
		);
		child.stdout.on("data", function(chunk) {
			util.print(chunk.toString());
		});
		child.stderr.on("data", function(chunk) {
			util.print(chunk.toString());
		});
		child.on("error", function(e) {
			logErr("Error running prebuild " + e);
		});
		child.on("exit", function(code, signal) {
		});
		child.on("close", function(code) {
			callback();
		});
	} catch(e) {
		logErr("Error calling prebuild " + e);
	}
};


//
// download and extract a url to the given destination
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
		logErr("Download error " + status);
		cb(false);
	});
	
	// Done
	emitter.on("close", function() {
		console.log("Download + extract finished");
		cb(true);
	});
};

//
// auto bug reporting and insights
//
var report = (function() {
	var ua = require("universal-analytics"),
		visitor;
	
	// Get visitor
	var getVisitor = function() {
		var uuid,
			filename = path.join(cmd.prefix, ".id");

		// Read UUID
		try {
			uuid = fs.readFileSync(filename).toString();
		} catch(e) {
		}
		if (uuid && uuid.indexOf("false") >= 0) {
			console.log("Opted out of automatic bug reporting");
			return null;
		}
	
		// Generate UUID
		if (!uuid || uuid.length < 32 || uuid.indexOf("-") < 0) {
			console.log("");
			console.log("  This tool automatically reports bugs & anonymous usage statistics.");
			console.log("  You may opt-out of this feature by setting contents of the file '" + filename + "' to 'false'.");
			console.log("");
			uuid = require("node-uuid").v4();
			try {
				fs.writeFileSync(filename, uuid);
			} catch(e) {
			}
		}
		//console.log("UUID: " + uuid);
		return ua("UA-597335-12", uuid);
	};

	return function(action, label, value, path) {
		if (typeof visitor === "undefined") {
			visitor = getVisitor();
		}
		if (visitor === null) {
			return;
		}

		category = category || "unknownCategory";
		action = action || "unknownAction";
		label = label || "";
		value = value || 0;
		path = path || (category + "/" + action);
		label.trim();
		
		//console.log("Report " + path + (label ? ": " + label : ""));
		visitor.event(category, action, label, value, {p: path}, function (err) {
		});
	}
}());

//
// check for upgrade
//
var checkUpdate = function() {
	var req = http.get("http://registry.npmjs.org/rapidgame");
	req.on("response", function(response) {
		var oldVersion = packageJson.version.toString(),
			newVersion = "";
		response.on("data", function(chunk) {
			newVersion += chunk;
		});
		response.on("end", function() {
			try {
				newVersion = JSON.parse(newVersion);
				if (typeof newVersion === "object"
				&& typeof newVersion["dist-tags"] === "object") {
					newVersion = newVersion["dist-tags"]["latest"].toString().trim();
					var n1 = oldVersion.substring(oldVersion.lastIndexOf(".")+1),
						n2 = newVersion.substring(newVersion.lastIndexOf(".")+1);
					if (newVersion !== oldVersion && n1 < n2) {
						console.log("\nAn update is available.");
						console.log("\t" + oldVersion + " -> " + newVersion);
						console.log("Upgrade instructions:");
						if (cmdName.indexOf("pro") >= 0) {
							console.log("\tcd " + __dirname + " && npm update");
						} else {
							console.log("\tsudo npm update " + cmdName + " -g");
						}
						console.log(" ");
					}
				}
			} catch(e) {
			}
		});
	});
	req.on("error", function(){});
}

//
// show usage instructions
//
var usage = function() {
	cmd.help();
	usageExamples();
};
var usageExamples = function() {
	console.log("  Examples:");
	console.log("");
	console.log("    $ " + cmdName + " create unity \"Zombie Matrix\" com.mycompany.zombiematrix");
	console.log("    $ " + cmdName + " create cocos2d \"Heck Yeah\" com.mycompany.heckyeah");
	console.log("    $ " + cmdName + " prebuild");
	console.log("");
};

//
// log an error
//
var logErr = function(str) {
	console.log(str);
	report("error", str);
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
// Test if a file exists
//
var fileExists = function(path) {
	var stat;
	try {
		stat = fs.statSync(path);
	} catch(e) {
	}
	return (stat && stat.isFile());
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
		logErr("exec error: " + error);
	}
};

//
// tests if a directory is writeable
//
var isWriteableDir = function(dir) {
	try {
		dir = path.join(dir, ".testfile");
		fs.writeFileSync(dir, "test");
		fs.unlinkSync(dir);
		return true;
	} catch(e) {
	}
	return false;
};

module.exports = {
	run: run,
	version: version
};


