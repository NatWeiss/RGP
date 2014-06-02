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
	Winreg = require("winreg"),
	packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"))),
	cmdName = packageJson.name,
	version = packageJson.version,
	cocos2djsUrl = "http://cdn.cocos2d-x.org/cocos2d-js-v3.0-alpha2.zip",
	cocos2dDirGlob = "*ocos2d-js*",
	category,
	engines = [],
	templates = [],
	orientations = ["landscape", "portrait"],
	copyCount = 0,
	defaults = {
		engine: "cocos2d",
		template: "TwoScene",
		package: "org.mycompany.mygame",
		dest: process.cwd(),
		prefix: __dirname,
		orientation: orientations[0]
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
		.option("-f, --folder <path>", "output folder [" + defaults.dest + "]", defaults.dest)
		.option("-o, --orientation <orientation>", "orientation (" + orientations.join(", ") + ") [" + defaults.orientation + "]", defaults.orientation)
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
	var dir = path.join(cmd.folder, name),
		src,
		dest,
		fileCount,
		i,
		onFinished,
		files,
		isCocos2d = false,
		packageSrc = "com.wizardfu." + cmd.template.toLowerCase();
	cmd.engine = engine.toString().toLowerCase();
	
	category = "createProject";
	
	if (!checkPrefix()) {
		usage();
		return 1;
	}
	
	// Check engine and name
	if (!cmd.engine || !name || !package) {
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
	if (engines.indexOf(cmd.engine) < 0) {
		console.log("Engine '" + cmd.engine + "' not found");
		console.log("Available engines are: " + engines.join(", "));
		usage();
		return 1;
	}
	
	// Check template
	src = path.join(__dirname, "templates", cmd.engine, cmd.template);
	if (!dirExists(src)) {
		console.log("Missing template directory: " + src);
		files = listDirectories(__dirname, "templates", cmd.engine, "*");
		if (files.length > 0) {
			console.log("Available templates for " + cmd.engine + " are: " + files.join(", ") + ".");
		}
		usage();
		return 1;
	}
	
	// Start
	report("start", cmd.engine + "/" + cmd.template);
	console.log("Rapidly creating a game");
	console.log("Engine: " + cmd.engine.charAt(0).toUpperCase() + cmd.engine.slice(1));
	console.log("Template: " + cmd.template + (cmd.verbose ? " " + packageSrc : ""));
	isCocos2d = (cmd.engine.indexOf("cocos") >= 0);
	
	// Copy all template files to destination
	dest = dir;
	console.log("Copying project files" + (cmd.verbose ? " from " + src + " to " + dest : ""));
	fileCount = copyRecursive(src, dest, true);
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
// filters files for exclusion
//
var excludeFilter = function(filename, dir){
	// Shall this file/dir be excluded?
	var i, ignore, doExclude = false;
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

/*

need to remove templates/cocos2d/star/lib
because it's a regular file on windows (not a symlink)

*/

			if (i.isSymbolicLink()) {
				doExclude = true;
			}
		} catch(e) {
			console.log(e);
		}
	} else if (dir.indexOf(path.join("build", "build")) >= 0) {
		doExclude = true;
	} else if (cmd.engine === "titanium" && filename === "build") {
		doExclude = true;
	} else if (cmd.engine === "unity" && (filename === "Library" || filename === "Temp" || filename.indexOf(".sln") >= 0 || filename.indexOf(".unityproj") >= 0 || filename.indexOf(".userprefs") >= 0)) {
		doExclude = true;
	} else if (filename.substr(0,2) === "._") {
		doExclude = true;
	} else {
		ignore = [
			".DS_Store",
			//"node_modules",
			//"wsocket.c", "wsocket.h",
			//"usocket.c", "usocket.h",
			//"unix.c", "unix.h",
			//"serial.c",
		];
		for (i = 0; i < ignore.length; i += 1) {
			if (filename === ignore[i]) {
				doExclude = true;
				break;
			}
		}
	}

	// Report and return
	if (doExclude && cmd.verbose) {
		console.log("Ignoring filename '" + filename + "' in " + dir);
	}
	if (!doExclude) {
		copyCount += 1;
	}
	return doExclude;
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
//			setupPrebuild(function() {
				runPrebuild(platform, config, arch, function() {
					report("done");
				});
//			});
		});
	});
};

//
// copy src directory to prefix
//
var copySrcFiles = function(callback) {
	var src, dest;

	// Synchronously copy src directory to dest
	src = path.join(__dirname, "src");
	dest = path.join(cmd.prefix, "src");
	if (src !== dest) {
		console.log("Copying " + src + " to " + dest);
		copyRecursive(src, dest, true);
	}

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
		src = path.join(cmd.prefix, ".git");
		if (dirExists(src)) {
			console.log("WARNING: Directory " + src + " may prevent cocos2d-js from being patched with git apply");
		}
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
								if (!a) {
									fs.unlinkSync(src);
								}
								
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
// Copy files recursively with a special exclude filter.
//
var copyRecursive = function(src, dest, filter) {
	var isIncludeFilter = (typeof filter === "string"),
		pattern = (isIncludeFilter ? path.join("**", filter) : "");
	if (cmd.verbose) {
		console.log("Recursively copying " + path.relative(cmd.prefix, path.join(src, pattern)) +
			" to " + path.relative(cmd.prefix, dest));
	}
	
	// copy using glob
	if (isIncludeFilter) {
		return copyGlobbed(src, pattern, dest);
	}

	// copy using wrench
	var overwrite = false,
		options = {
			forceDelete: overwrite, // false Whether to overwrite existing directory or not
			excludeHiddenUnix: false, // Whether to copy hidden Unix files or not (preceding .)
			preserveFiles: !overwrite, // true If we're overwriting something and the file already exists, keep the existing
			preserveTimestamps: true, // Preserve the mtime and atime when copying files
			inflateSymlinks: false // Whether to follow symlinks or not when copying files
		};
	if (filter === true) {
		options.exclude = excludeFilter;
	}
	copyCount = 0;
	wrench.copyDirSyncRecursive(src, dest, options);
	return copyCount;
};

//
// copy files using glob
//
var copyGlobbed = function(src, pattern, dest) {
	var i, file, files = glob.sync(path.join(src, pattern));
	for (i = 0; i < files.length; i += 1) {
		file = path.join(dest, path.relative(src, files[i]));
		//console.log(/*path.relative(cmd.prefix, files[i]) + " -> " + */path.relative(cmd.prefix, file));
		wrench.mkdirSyncRecursive(path.dirname(file));
		try{
			fs.writeFileSync(file, fs.readFileSync(files[i]));
		} catch(e) {
			console.log(e);
		}
	}
	return files.length;
};

//
// prebuild setup (copies headers, java files, etc.)
//
var setupPrebuild = function(callback) {
	var dir, src, dest, i, files,
		frameworks = path.join(cmd.prefix, "src", "cocos2d-js", "frameworks");

	console.log("Copying header files...");

	// reset cocos2d dir
	dest = path.join(cmd.prefix, "cocos2d");
	files = ["html", path.join("x", "include"), path.join("x", "java"), path.join("x", "jsb")];
	try {
		for (i = 0; i < files.length; i += 1) {
			src = path.join(dest, files[i]);
			if (cmd.verbose) {
				console.log("rm -r " + src);
			}
			wrench.rmdirSyncRecursive(src, true);
			if (cmd.verbose) {
				console.log("mkdir " + src);
			}
			wrench.mkdirSyncRecursive(src);
		}
	} catch(e) {
		console.log("Error cleaning destination: " + dest);
	}

	// copy cocos2d-html5
	dest = path.join(cmd.prefix, "cocos2d", "html");
	src = path.join(frameworks, "cocos2d-html5");
	copyRecursive(src, dest);

	// copy headers
	dir = dest = path.join(cmd.prefix, "cocos2d", "x", "include");
	src = path.join(frameworks, "js-bindings", "cocos2d-x");
	// # except if dir is cocos2d-x/plugin (or don't copy plugin/jsbindings and reference the one in include/plugin/jsbindings)
	copyRecursive(src, dest, '*.h');
	copyRecursive(src, dest, '*.hpp');
	copyRecursive(src, dest, '*.msg');

	dest = path.join(dir, "bindings");
	src = path.join(frameworks, "js-bindings", "bindings");
	copyRecursive(src, dest, '*.h');
	copyRecursive(src, dest, '*.hpp');

	dest = path.join(dir, "external");
	src = path.join(frameworks, "js-bindings", "external");
	copyRecursive(src, dest, '*.h');
	copyRecursive(src, dest, '*.msg');

	// remove unneeded
	files = ["docs", "build", "tests", "samples", "templates", "tools",
		path.join("plugin", "samples"), path.join("plugin", "plugins"), path.join("extensions", "proj.win32")];
	for (i = 0; i < files.length; i += 1) {
		wrench.rmdirSyncRecursive(path.join(dir, files[i]), true);
	}

	// jsb
	dest = path.join(cmd.prefix, "cocos2d", "x", "jsb");
	src = path.join(frameworks, "js-bindings", "bindings", "script");
	copyRecursive(src, dest, '*.js');
	src = path.join(frameworks, "js-bindings", "bindings", "auto", "api");
	copyRecursive(src, dest, '*.js');

	// java
	dir = path.join(cmd.prefix, "cocos2d", "x", "java");
	dest = path.join(dir, "cocos2d-x");
	src = path.join(frameworks, "js-bindings", "cocos2d-x", "cocos", "2d", "platform", "android", "java");
	copyRecursive(src, dest);
	// .mk and .a
	dest = path.join(dir, "mk");
	src = path.join(cmd.prefix, "src");
	copyRecursive(src, dest, "*.mk");
	copyRecursive(src, dest, "*.a");
	src = path.join(frameworks, "js-bindings");
	copyRecursive(src, dest, "*.mk");
	copyRecursive(src, dest, "*.a");
	// # bonus: call android/strip on mk/*.a
	files = ["proj.android", "cocos2d-js"];
	for (i = 0; i < files.length; i += 1) {
		wrench.rmdirSyncRecursive(path.join(dest, files[i]), true);
	}
	files = glob.sync(path.join(dir, "*", "bin"));
	for (i = 0; i < files.length; i += 1) {
		wrench.rmdirSyncRecursive(files[i], true);
	}
	files = glob.sync(path.join(dir, "*", "gen"));
	for (i = 0; i < files.length; i += 1) {
		wrench.rmdirSyncRecursive(files[i], true);
	}

	// find ${dir} | xargs xattr -c >> ${logFile} 2>&1

	callback();
};

//
// run the prebuild command
//
var runPrebuild = function(platform, config, arch, callback) {
	if (process.platform === "win32") {
		console.log("Prebuilding win32 libraries");
		prebuildWin(config, arch, callback);
	}
};

/*var fixMSBuild = function(callback) {
	var root = '\\Software\\Microsoft\\MSBuild\\ToolsVersions\\4.0',
		regKey = new Winreg({key: root}),
		key = "VCTargetsPath",
		value = "$(MSBuildExtensionsPath32)\\Microsoft.Cpp\\v4.0\\";
	regKey.get(key, function(err, val){
		if (err || !val) {
			console.log("Fixing " + root + "\\" + key);
			regKey.set(key, Winreg.REG_SZ, value, function(err){
				if (err) {
					console.log(err);
				} else {
					console.log("Fixed");
				}
				callback();
			});
		} else {
			console.log("VCTargetsPath = ");
			console.log(val.value);
			callback();
		}
	});
};*/

var getMSBuildPath = function(callback) {
	var root = '\\Software\\Microsoft\\MSBuild\\ToolsVersions',
		regKey = new Winreg({key: root});
	regKey.keys(function (err, items) {
		var i, key;
		if (err) {
			console.log(err);
			return;
		}
		for (i = 0; i < items.length; i += 1) {
			key = path.basename(items[i].key);
			if (parseFloat(key) >= 11.0) {
				regKey = new Winreg({key: root + '\\' + key});
				regKey.get("MSBuildToolsPath", function(err, item) {
					if (err) {
						console.log(err);
						return;
					}
					if (cmd.verbose) {
						console.log("Got build tools path: " + item.value);
					}
					callback(item.value);
				});
				return;
			}
	  	}
	  	console.log("Unable to find MSBuild path");
	});

};

var prebuildWin = function(config, arch, callback) {
	config = config || "Debug";
	config = (config.toLowerCase() === "release" ? "Release" : "Debug");

	//fixMSBuild(function(){
		getMSBuildPath(function(msBuildPath) {
			var dir = path.join(cmd.prefix, "src", "cocos2d-js", "frameworks", "js-bindings", "cocos2d-x", "build"),
				src = path.join(dir, "cocos2d-win32.vc2012.sln"),
				dest,
				targets = ["libcocos2d", "libAudio", "libBox2D", "libchipmunk", "libCocosBuilder", "libCocosStudio",
					"libExtensions", "libGUI", "libLocalStorage", "liblua", "libNetwork", "libSpine"],
				options = {cwd: dir, env: process.env},
				args = [
					'"' + src + '"',
					"/nologo",
		            "/maxcpucount:4",
	    	        "/t:" + targets.join(";"),
					//"/p:VisualStudioVersion=12.0",
	            	//"/p:PlatformTarget=x86",
					//"/verbosity:diag",
	            	"/p:configuration=" + config
				],
				command = '"' + path.join(msBuildPath, "MSBuild.exe") + '" ' + args.join(" ");
			
			// set VCTargetsPath
			src = "\\MSBuild\\Microsoft.Cpp\\v4.0\\V120\\";
			dest = "\\Program Files (x86)" + src;
			if (!dirExists(dest)) {
				options.env["VCTargetsPath"] = dest;
			} else {
				dest = "C:" + dest;
				if (dirExists(dest)) {
					options.env["VCTargetsPath"] = dest;
				}
			}
			console.log(options.env["VCTargetsPath"]);
			//options.env["VCTargetsPath"] = "$(MSBuildExtensionsPath32)\\Microsoft.Cpp\\v4.0\\";
			//options.env["VCTargetsPath"] = "\\Program Files (x86)" + dest;

			if (cmd.verbose) {
				console.log(command);
			}
			try {
				child_process.exec(command, options, function(a, b, c){
					execCallback(a, b, c);

					if (!a) {
						console.log("Done");
						console.log("Merging libraries");

						// copy dlls
						src = path.join(dir, config + ".win32");
						dest = path.join(cmd.prefix, "cocos2d", "x", "lib", config + "-win32", "x86");
						wrench.mkdirSyncRecursive(dest);
						copyGlobbed(src, "*.dll", dest);

						// link
						dest = path.join(dest, "libcocos2dx-prebuilt.lib");
						options.cwd = path.join(dir, config + ".win32");
						command = '"\\Program Files (x86)\\Microsoft Visual Studio 12.0\\VC\\bin\\lib.exe" ' +
							'"/OUT:' + dest + '" ' +
							'*.lib'
	//						'libcocos2d.lib libAudio.lib freetype250.lib glew32.lib glfw3.lib libchipmunk.lib ' +
	//						'libcurl_imp.lib libiconv.lib libjpeg.lib libpng.lib libtiff.lib libwebp.lib libzlib.lib ' +
	//						'websockets.lib' +
							'';


	// libcocos2dx-prebuilt.lib;opengl32.lib;ws2_32.lib;winmm.lib;%(AdditionalDependencies)
	// set Debugging > Working Directory to $(ProjectDir) // ? outputdir??
	// copy .dll files to output dir

						if (cmd.verbose) {
							console.log("cwd = " + options.cwd);
							console.log(command);
						}
						try {
							child_process.exec(command, options, function(a, b, c){
								execCallback(a, b, c);
								if (!a) {
									console.log("Done");
								}
								callback();
							});
						} catch(e) {
							console.log(e);
						}
					}
				});
			} catch(e) {
				console.log(e);
			}
	// C:\Program Files (x86)\MSBuild\12.0\bin\amd64\MSBuild.exe C:\Users\nat\Desktop\RapidGame\src\cocos2d-js\frameworks\js-bindings\cocos2d-x\build\cocos2d-win32.vc2012.sln /maxcpucount:4 /t:libcocos2d /p:configuration=Debug



	// error MSB4019: The imported project "C:\Microsoft.Cpp.Default.props" was not found. Confirm that the path in the <Import> declaration is correct, and that the file exists on disk.
	// http://stackoverflow.com/questions/16092169/why-does-msbuild-look-in-c-for-microsoft-cpp-default-props-instead-of-c-progr
	// http://msdn.microsoft.com/en-us/library/ms164309(VS.100).aspx

// $([MSBuild]::ValueOrDefault('$(VCTargetsPath)','$(MSBuildExtensionsPath32)\Microsoft.Cpp\v4.0\V120\'))
		});
	//});
};


/*var runPrebuild = function(platform, config, arch, callback) {
	try {
		var command = "./prebuild.sh",
			args = [
				cmd.prefix,
				"all"
				//platform,
				//config,
				//arch
			],
			options = {cwd: __dirname, env: process.env};

		var child = child_process.spawn(command, args, options);
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
};*/

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
	if (process.platform == "win32") {
		console.log("Downloading " + url + "...");
	} else {
		emitter.on("data", function(chunk) {
			if (!done) {
				cur += chunk.length;
				done = (cur >= total);
				util.print("Downloading " + url + " "
					+ (100.0 * cur / total).toFixed(2) + "%..."
					+ (done ? "\n" : "\r"));
			}
		});
	}
	
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
	if (error !== null) {
		logErr("exec error: " + error);
	}
	if (cmd.verbose || error) {
		console.log(stdout);
		console.log(stderr);
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


