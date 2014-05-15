
var GameScene = cc.Scene.extend({
	layer: null,
	
	onEnter: function() {
		this._super();
		this.layer = new GameLayer();
		this.layer.init();
		this.addChild(this.layer);
	}
});

var GameLayer = cc.Layer.extend({
	bg: null,

	init: function() {
		var self = this,
			font = App.config["font"];
		this._super();


		return true;
	}

});

