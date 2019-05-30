define(function(require,exports,module){
	function Line(lid, lb, slb, uid, n, loop, lbx, lby, lbr, lc) {
	      this.lid = lid;
	      this.lb = lb;
	      this.slb = slb;
	      this.uid = uid;
	      this.n = n;
	      this.loop = loop;
	      this.lbx = lbx;
	      this.lby = lby;
	      this.lbr = lbr;
	      this.lc = lc;
	      this.stations = [];
  	}

  	module.exports = Line;
});