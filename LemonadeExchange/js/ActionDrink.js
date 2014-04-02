/**
 * <p>
 *     Uses cc.Sprite.setTextureRect() to make it look like a sprite is "draining."
 * </p>
 * @class
 * @extends cc.ActionInterval
 */

// temporary workaround for not being able to extend an action when running on device
if (!cc.sys.isNative) {

//if (typeof cc.ActionInterval === 'undefined') {
//	cc.ActionInterval = {};
//}
//if (typeof cc.ActionInterval.extend === 'undefined') {
//	cc.ActionInterval.extend = cc.Class.extend;
//}
var ActionDrink = cc.ActionInterval.extend(/** @lends cc.ActionDrink# */{
//cc.ActionDrink = cc.Class.extend(/** @lends cc.ActionDrink# */{
    _originalRect:null,
    _originalPosition:null,

    ctor:function () {
        cc.ActionInterval.prototype.ctor.call(this);

        this._originalRect = cc.rect();
        this._originalPosition = cc.p();
    },

    /**
     * @param {Number} duration duration in seconds
     * @return {Boolean}
     */
    initWithDuration:function (duration) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.ActionDrink}
     */
    clone:function () {
        var action = new ActionDrink();
        action.initWithDuration(this._duration)
        return action;
    },

    /**
     * @param {sprite} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
		this._originalPosition.x = target.getPositionX();
		this._originalPosition.y = target.getPositionY();
		this._originalRect = cc.rect(target.getTextureRect());
    },

    /**
     * @param {Number} time time as a percentage complete
	 */
    update:function (time) {
        if (this.target) {
			var rect = cc.rect(this._originalRect),
				y,
				offset = cc.p();

			rect.height *= (1.0 - time);
			y = this._originalRect.height - rect.height;
			rect.y += y;
			offset.y = -y * .5;
			
			if (!cc.rectEqualToRect(rect, this.target.getTextureRect())) {
				this.target.setTextureRect(rect);
				this.target.setPositionX(this._originalPosition.x + offset.x);
				this.target.setPositionY(this._originalPosition.y + offset.y);
			}
	    }
    },

    /**
     * reverse the action
     */
    reverse:function () {
        return ActionDrink.create(this._duration, cc.p(-this._positionDelta.x, -this._positionDelta.y));
    }
});

/**
 * @param {Number} duration duration in seconds
 * @return {cc.ActionDrink}
 * @example
 * // example
 * var actionTo = cc.ActionDrink.create(2);
 */
ActionDrink.create = function(duration) {
    var drink = new ActionDrink();
    drink.initWithDuration(duration);
    return drink;
};

} // end if not native