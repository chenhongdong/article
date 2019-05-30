define(function(require,exports,module){	
	function Station(sid, lb, uid, px, py, x, y, rx, ry, st, ex, iu, rc, slb, ln, color, icon, dx, dy, trs_x, trs_y) {	
	     this.sid = sid;
	     this.lb = lb;
	     this.uid = uid;
	     this.px = px;
	     this.py = py;
	     this.x = x;
	     this.y = y;
	     this.rx = rx;
	     this.ry = ry;
	     this.st = st;
	     this.ex = ex;
	     this.iu = iu;
	     this.rc = rc;
	     this.slb = slb;
	     this.ln = ln;
	     this.color = color;
	     this.icon = icon;
	     this.dx = dx;
	     this.dy = dy;
	     this.trs_x = trs_x;
	     this.trs_y = trs_y;
  	}

  	module.exports = Station;
});