define(function(require,exports,module){
   var Subway = require('js/subway/entity/subway');
   var Line = require('js/subway/entity/line');
   var Station = require('js/subway/entity/station');

   function XmlParser(xmldoc,transformScale){
   	   this.xmldoc = xmldoc;
   	   this.transformScale = transformScale || 1.3;
   	   this.marginRatio = 1.1
   }
   var p = XmlParser.prototype;

   p.parse = function(){
		if (!this.xmldoc) return null;
		var sw = this.xmldoc.getElementsByTagName("sw")[0];
		var bounds = {
			left: Number.POSITIVE_INFINITY,
			right: Number.NEGATIVE_INFINITY,
			top: Number.POSITIVE_INFINITY,
			bottom: Number.NEGATIVE_INFINITY
		}
		var subway = this.parseSubway(sw);
		var ls = this.xmldoc.getElementsByTagName("l");
		var lines = [];
		var t,e,r,a;
		for( var i = 0; i < ls.length; i++){
			var l = ls[i];
			var line = this.parseLine(l);
			var ps = l.getElementsByTagName("p");
			var stations = [];
			for(var j = 0; j < ps.length; j++){
				var station = this.parseStation(ps[j]);
				station	.lid = line.lid,
				station.x < bounds.left && (bounds.left = station.x, t = station.sid);
				station.x > bounds.right && (bounds.right = station.x, e = station.sid);
				station.y < bounds.top && (bounds.top = station.y, r = station.sid);
				station.y > bounds.bottom && (bounds.bottom = station.y, a = station.sid);
				stations.push(station);
			}
			line.stations = stations;
			lines.push(line);
		}
		for (var offset_left = bounds.left * this.marginRatio >> 0, offset_top = bounds.top * this.marginRatio >> 0, i = 0; i < lines.length; i++) {
			var line = lines[i];
			line.lbx -= offset_left, line.lby -= offset_top;
			for (var j = 0; j < line.stations.length; j++) {
			    var station = line.stations[j];
			    station.x -= offset_left;
			    station.y -= offset_top;
			    station.lc = line.lc;
			}
		}

		subway.bounds = bounds;
		subway.lines = lines;
		subway.width = Math.abs(bounds.left - bounds.right) * this.marginRatio >> 0;
		subway.height = Math.abs(bounds.bottom - bounds.top) * this.marginRatio >> 0;

		return subway;
   }

   p.parseSubway = function(xmldoc){
   		var c = xmldoc.getAttribute("c"),
            cid = xmldoc.getAttribute("cid"),
            n = xmldoc.getAttribute("n");
        return new Subway(c, cid, n);
   }

   p.parseLine = function(xmldoc){
   		 var lid = xmldoc.getAttribute("lid"),
            lb = xmldoc.getAttribute("lb"),
            slb = xmldoc.getAttribute("slb"),
            uid = xmldoc.getAttribute("uid"),
            n = parseInt(xmldoc.getAttribute("n"), 10),
            loop = "true" == xmldoc.getAttribute("loop"),
            lbx = parseFloat(xmldoc.getAttribute("lbx")) * this.transformScale,
            lby = parseFloat(xmldoc.getAttribute("lby")) * this.transformScale + 15 * this.transformScale,
            lbr = parseFloat(xmldoc.getAttribute("lbr")),
            lc = "#" + xmldoc.getAttribute("lc").slice(2);
        return new Line(lid, lb, slb, uid, n, loop, lbx, lby, lbr, lc)
   }

   p.parseStation = function(xmldoc){
   		var sid = xmldoc.getAttribute("sid"),
            lb = xmldoc.getAttribute("lb"),
            uid = xmldoc.getAttribute("uid"),
            px = parseFloat(xmldoc.getAttribute("px")),
            py = parseFloat(xmldoc.getAttribute("py")),
            x = parseFloat(xmldoc.getAttribute("x")) * this.transformScale,
            y = parseFloat(xmldoc.getAttribute("y")) * this.transformScale,
            rx = parseFloat(xmldoc.getAttribute("rx")) * this.transformScale + 2 * this.transformScale,
            ry = parseFloat(xmldoc.getAttribute("ry")) * this.transformScale + 12 * this.transformScale,
            st = "true" == xmldoc.getAttribute("st"),
            ex = "true" == xmldoc.getAttribute("ex"),
            iu = "true" == xmldoc.getAttribute("iu"),
            rc = "true" == xmldoc.getAttribute("rc"),
            slb = "true" == xmldoc.getAttribute("slb"),
            ln = xmldoc.getAttribute("ln"),
            icon = xmldoc.getAttribute("icon") || "",
            dx = parseFloat(xmldoc.getAttribute("dx")) * this.transformScale,
            dy = parseFloat(xmldoc.getAttribute("dy")) * this.transformScale,
            trs_x = 0,
            trs_y = 0;
        try {
            trs_x = parseFloat(xmldoc.getAttribute("trs_x")) * this.transformScale || 0,
            trs_y = parseFloat(xmldoc.getAttribute("trs_y")) * this.transformScale || 0
        } catch (I) {}
        trs_x -= 8 * this.transformScale, 
        trs_y -= 8 * this.transformScale;
        var color;
        return new Station(sid, lb, uid, px, py, x, y, rx, ry, st, ex, iu, rc, slb, ln, color, icon, dx, dy, trs_x, trs_y)
   }

   module.exports = XmlParser;


});