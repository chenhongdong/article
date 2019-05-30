define(function(require,exports,module){
	function Subway(fullName, shortName, lines_number) {
	     this.fullName = fullName;
	     this.shortName = shortName;
	     this.lines_number = lines_number;
	     this.lines = [];
	     this.width = null;
	     this.height = null
  	}

  	var p = Subway.prototype;

	p.findBy = function (func) {
        var res = [];
        if ("function" == typeof func)
            for (var line, i = this.lines.length - 1; i >= 0; i--) {
                line = this.lines[i], func.apply(line) && res.push(line);
                for (var j = line.stations.length - 1; j >= 0; j--) {
                    var station = line.stations[j];
                    func.apply(station) && res.push(station)
                }
            }
        return res
    }

  	p.findNearestStation = function (point, tolerance) {
            var maxDist = Number.POSITIVE_INFINITY,
                dist = 0,
                res = null;
            if (point && point.x && point.y)
                for (var lines = this.lines, i = 0; i < lines.length; i++)
                    for (var line = lines[i], j = 0; j < line.stations.length; j++) {
                        var station = line.stations[j];
                        if(station.iu){
                        	dist = Math.pow(station["x"] - point.x, 2) + Math.pow(station["y"] - point.y, 2);
                        	maxDist > dist && (maxDist = dist, res = station);
                        }
                    }
            if (!(tolerance > 0 && maxDist > tolerance * tolerance)) return res
    }
	

  	module.exports = Subway;
});