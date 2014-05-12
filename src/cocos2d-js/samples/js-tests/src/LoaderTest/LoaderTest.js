/****************************************************************************

 http://www.cocos2d-html5.org
 http://www.cocos2d-iphone.org
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
 ****************************************************************************/

//------------------------------------------------------------------
//
// LoaderTestLayer
//
//------------------------------------------------------------------
var LoaderTestLayer = BaseTestLayer.extend({
    _title:"Loader Test",
    _subtitle:"",

    ctor:function() {
        var self = this;
        self._super(cc.color(0,0,0,255), cc.color(98,99,117,255));

        var winSize = cc.winSize;
        cc.loader.load(s_helloWorld, function(results){
            cc.log(s_helloWorld + "--->", results[0]);
            var bg = cc.Sprite.create(s_helloWorld);
            self.addChild(bg);
            bg.x = winSize.width/2;
            bg.y = winSize.height/2;
        });

        cc.loader.load([s_Cowboy_plist, s_Cowboy_png], function(results){
            cc.log(s_Cowboy_plist + "--->", results[0]);
            cc.log(s_Cowboy_png + "--->", results[1]);
            cc.spriteFrameCache.addSpriteFrames(s_Cowboy_plist);
            var frame = cc.Sprite.create("#testAnimationResource/1.png")
            self.addChild(frame);
            frame.x = winSize.width/4;
            frame.y = winSize.height/4;
        });


        var str;
        if(cc.sys.isNative)  {
            str = s_lookup_desktop_plist;
        } else if(cc.sys.isMobile) {
            str = s_lookup_mobile_plist;
        } else {
            str = s_lookup_html5_plist;
        }

        cc.loader.loadAliases(str, function(){
            var sprite = cc.Sprite.create("grossini.bmp");
            self.addChild( sprite );
            sprite.x = winSize.width/2;
            sprite.y = winSize.height/2;
        });

    }
});

var LoaderTestScene = TestScene.extend({
    runThisTest:function () {
        this.addChild(new LoaderTestLayer());
        director.runScene(this);
    }
});