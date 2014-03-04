/**
 * <p>
 *     Uses cc.Sprite.setTextureRect() to make it look like a sprite is "draining."
 * </p>
 * @class
 * @extends cc.ActionInterval
 */
//if (typeof cc.ActionInterval === 'undefined') {
//	cc.ActionInterval = {};
//}
if (typeof cc.ActionInterval.extend === 'undefined') {
	cc.ActionInterval.extend = cc.Class.extend;
}
cc.ActionDrink = cc.ActionInterval.extend(/** @lends cc.ActionDrink# */{
//cc.ActionDrink = cc.Class.extend(/** @lends cc.ActionDrink# */{
    _originalRect:null,
    _originalPosition:null,

    ctor:function () {
        cc.ActionInterval.prototype.ctor.call(this);

        this._originalRect = cc.RectZero();
        this._originalPosition = cc.PointZero();
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
        var action = new cc.ActionDrink();
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
		this._originalRect = new cc.Rect(target.getTextureRect());
    },

    /**
     * @param {Number} time time as a percentage complete
	 */
    update:function (time) {
        if (this._target) {
			var rect = new cc.Rect(this._originalRect),
				y,
				offset = cc.PointZero();

			rect._size.height *= (1.0 - time);
			y = this._originalRect.getHeight() - rect.getHeight();
			rect._origin.y += y;
			offset.y = -y * .5;
			
			if (!cc.rectEqualToRect(rect, this._target.getTextureRect())) {
				this._target.setTextureRect(rect);
				this._target.setPositionX(this._originalPosition.x + offset.x);
				this._target.setPositionY(this._originalPosition.y + offset.y);
			}
	    }
    },

    /**
     * reverse the action
     */
    reverse:function () {
        return cc.ActionDrink.create(this._duration, cc.p(-this._positionDelta.x, -this._positionDelta.y));
    }
});

/**
 * @param {Number} duration duration in seconds
 * @return {cc.ActionDrink}
 * @example
 * // example
 * var actionTo = cc.ActionDrink.create(2);
 */
cc.ActionDrink.create = function (duration) {
    var drink = new cc.ActionDrink();
    drink.initWithDuration(duration);
    return drink;
};
