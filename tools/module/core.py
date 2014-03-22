#!/usr/bin/python
#coding=utf-8
"""****************************************************************************
Copyright (c) 2013 cocos2d-x.org

http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************"""

import sys
import os, os.path
import json
import shutil

def replaceString(filepath, src_string, dst_string):
    """ From file's content replace specified string
    Arg:
        filepath: Specify a file contains the path
        src_string: old string
        dst_string: new string
    """
    content = ""
    f1 = open(filepath, "rb")
    for line in f1:
        strline = line.decode('utf8')
        if src_string in strline:
            content += strline.replace(src_string, dst_string)
        else:
            content += strline
    f1.close()
    f2 = open(filepath, "wb")
    f2.write(content.encode('utf8'))
    f2.close()
#end of replaceString

class CocosProject:

    def __init__(self):
        """
        """
        self.platforms= {
            "javascript" : ["ios_mac", "android", "win32", "linux", "html5"]
        }
        self.context = {
            "src_project_name": None,
            "src_package_name": None,
            "dst_project_name": None,
            "dst_package_name": None,
            "src_project_path": None,
            "dst_project_path": None,
            "script_dir": None
        }
        self.platforms_list = []
        self.src_root =os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        self.callbackfun = None
        self.totalStep =1
        self.step=0

    def checkParams(self):
        """Custom and check param list.
        """
        from optparse import OptionParser
        # set the parser to parse input params
        # the correspond variable name of "-x, --xxx" is parser.xxx
        parser = OptionParser(
            usage="Usage: %prog -n <PROJECT_NAME> -k <PACKAGE_NAME> -p <PROJECT_PATH>\nSample: %prog -n MyGame -k com.MyCompany.AwesomeGame -p ~/code"
        )
        parser.add_option("-n", "--name", metavar="PROJECT_NAME",help="Set a project name")
        parser.add_option("-k", "--package", metavar="PACKAGE_NAME",help="Set a package name for project")
        parser.add_option("-p", "--path", metavar="PROJECT_PATH",help="Set generate project path for project")

        # parse the params
        (opts, args) = parser.parse_args()
        if not opts.name:
            parser.error("-n or --name is not specified")

        if not opts.package:
            parser.error("-k or --package is not specified")

        if not opts.path:
            parser.error("-p or --path is not specified")

        return opts.name, opts.package, opts.path

    def createPlatformProjects(self, projectName, packageName, projectPath, callbackfun = None):
        """ Create a platform project.
        Arg:
            projectName: Project name, like this: "helloworld".
            packageName: It's used for android platform,like this:"com.cocos2dx.helloworld".
            projectPath: The path of generate project.
            callbackfun: It's new project callback function.There have four Params.
                        As follow:
                        def newProjectCallBack(step, totalStep, showMsg):
                            #step:  processing step,at present
                            #totalStep: all the steps
                            #showMsg: message about the progress
                            pass

        """
        self.callbackfun = callbackfun

        # init our internal params
        self.context["dst_project_name"] = projectName
        self.context["dst_package_name"] = packageName
        self.context["dst_project_path"] = os.path.join(projectPath,projectName)
        self.context["script_dir"] = os.path.abspath(os.path.dirname(__file__))

        # fill in src_project_name and src_package_name according to "language"
        template_dir = os.path.abspath(os.path.join(self.src_root, "template"))
        self.context["src_project_name"] = "HelloJavascript"
        self.context["src_package_name"] = "org.cocos2dx.hellojavascript"
        self.context["src_project_path"] = template_dir

        # copy platform.proj into dest folder
        if os.path.exists(self.context["dst_project_path"]):
            print ("Error:" + self.context["dst_project_path"] + " folder is already existing")
            print ("Please remove the old project or choose a new PROJECT_NAME in -project parameter")
            return False
        else:
            shutil.copytree(self.context["src_project_path"], self.context["dst_project_path"], True)

        self.platforms_list = self.platforms.get("javascript", [])
        self.totalStep = len(self.platforms_list)
        self.step = 0

        # call process_proj from each platform's script folder
        for platform in self.platforms_list:
            self.__processPlatformProjects(platform)

        print ("\nNew project has been created in this path: ")
        print (self.context["dst_project_path"].replace("\\", "/"))
        print ("Have Fun!")
        return True

    def __processPlatformProjects(self, platform):
        """ Process each platform project.
        Arg:
            platform: "ios_mac", "android", "win32", "linux", "html5"
        """

        # determine proj_path
        proj_path = os.path.join(self.context["dst_project_path"], "proj." + platform)
        java_package_path = ""

        # read json config file for the current platform
        conf_path = os.path.join(self.context["script_dir"], "%s.json" % platform)
        f = open(conf_path)
        data = json.load(f)

        # rename package path, like "org.cocos2dx.hello" to "com.company.game". This is a special process for android
        if platform == "android":
            src_pkg = self.context["src_package_name"].split('.')
            dst_pkg = self.context["dst_package_name"].split('.')

            java_package_path = os.path.join(*dst_pkg)

        # rename files and folders
        for item in data["rename"]:
            tmp = item.replace("PACKAGE_PATH", java_package_path)
            src = tmp.replace("PROJECT_NAME", self.context["src_project_name"])
            dst = tmp.replace("PROJECT_NAME", self.context["dst_project_name"])
            if os.path.exists(os.path.join(proj_path, src)):
                os.rename(os.path.join(proj_path, src), os.path.join(proj_path, dst))

        # remove useless files and folders
        for item in data["remove"]:
            dst = item.replace("PROJECT_NAME", self.context["dst_project_name"])
            if os.path.exists(os.path.join(proj_path, dst)):
                shutil.rmtree(os.path.join(proj_path, dst))

        # rename package_name. This should be replaced at first. Don't change this sequence
        for item in data["replace_package_name"]:
            tmp = item.replace("PACKAGE_PATH", java_package_path)
            dst = tmp.replace("PROJECT_NAME", self.context["dst_project_name"])
            if os.path.exists(os.path.join(proj_path, dst)):
                replaceString(os.path.join(proj_path, dst), self.context["src_package_name"], self.context["dst_package_name"])

        # rename project_name
        for item in data["replace_project_name"]:
            tmp = item.replace("PACKAGE_PATH", java_package_path)
            dst = tmp.replace("PROJECT_NAME", self.context["dst_project_name"])
            if os.path.exists(os.path.join(proj_path, dst)):
                replaceString(os.path.join(proj_path, dst), self.context["src_project_name"], self.context["dst_project_name"])

        # done!
        showMsg = "proj.%s\t\t: Done!" % platform
        self.step += 1
        if self.callbackfun:
            self.callbackfun(self.step,self.totalStep,showMsg)
        print (showMsg)
    # end of processPlatformProjects

# -------------- main --------------
# dump argvs
# print sys.argv
if __name__ == '__main__':
    project = CocosProject()
    name, package, path = project.checkParams()
    project.createPlatformProjects(name, package, path)

