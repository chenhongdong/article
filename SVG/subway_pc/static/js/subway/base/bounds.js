define(function(require,exports,module){
	var Position = require('js/subway/base/position');
	
	function Bounds (x1, y1, x2, y2) {
		this.left = x1;
		this.right = x2;
		this.bottom = y1;
		this.top = y2;
	}
	var p = Bounds.prototype;

	p.getCenter=function () {
		var w = this.right - this.left;
		var h = this.top - this.bottom;
		return new Position(this.left + w/2, this.bottom + h/2);
	}

	p.intersect = function (bounds) {
		var inBottom = (
			((bounds.bottom >= this.bottom) && (bounds.bottom <= this.top)) ||
			((this.bottom >= bounds.bottom) && (this.bottom <= bounds.top))
		);
		var inTop = (
			((bounds.top >= this.bottom) && (bounds.top <= this.top)) ||
			((this.top > bounds.bottom) && (this.top < bounds.top))
		);
		var inLeft = (
			((bounds.left >= this.left) && (bounds.left <= this.right)) ||
			((this.left >= bounds.left) && (this.left <= bounds.right))
		);
		var inRight = (
			((bounds.right >= this.left) && (bounds.right <= this.right)) ||
			((this.right >= bounds.left) && (this.right <= bounds.right))
		);
		intersects = ((inBottom || inTop) && (inLeft || inRight));
		return intersects;
	}

	p.extend = function (bounds) {
		if(this.left > bounds.left) {
			this.left = bounds.left;
		}
		if(this.bottom > bounds.bottom) {
			this.bottom = bounds.bottom;
		}
		if(this.right < bounds.right) {
			this.right = bounds.right;
		}
		if(this.top < bounds.top) {
			this.top = bounds.top;
		}
	}

	module.exports = Bounds;
});
