define(function(require, exports, module) {
    var util = require('js/subway/common/util');
    var Position = require('js/subway/base/position');

    function CanvasRenderer(div) {
        this.canvas = null;
        this.devicePixelRatio = util.getDevicePixelRatio();
        this.marginRatio = 0;
        this.div = div;
        this.deviceWidth = div.offsetWidth;
        this.deviceHeight = div.offsetHeight;
        this.canvasWidth = this.deviceWidth * this.devicePixelRatio * (1 + 2 * this.marginRatio);
        this.canvasHeight = this.deviceHeight * this.devicePixelRatio * (1 + 2 * this.marginRatio);
        this.maxScaleRatio = 2.4;
        this.minScaleRatio = .2 * this.devicePixelRatio;
        this.scaleRate = 1.25;
        this.zoomInRate = this.scaleRate,
        this.zoomOutRate = 1 / this.scaleRate,
        this.tolerance = 20;
        this.scaleRatio = 1;
        this.orig_x = null;
        this.orig_y = null;
        this.createElement();
    }
    var p = CanvasRenderer.prototype;

    p.createElement = function() {
        var canvas = document.createElement("canvas");
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;
        var left = Math.floor(-this.deviceWidth * this.marginRatio) + "px";
        var top = Math.floor(-this.deviceHeight * this.marginRatio) + "px";
        var width = Math.floor(this.deviceWidth * (1 + 2 * this.marginRatio)) + "px";
        var height = Math.floor(this.deviceHeight * (1 + 2 * this.marginRatio)) + "px";
        var cssText = [];
        cssText.push('left:' + left);
        cssText.push('top:' + top);
        cssText.push('width:' + width);
        cssText.push('heigth:' + height);
        canvas.style.cssText = cssText.join(';');

        var container = document.createElement('div');
        container.style.cssText = 'position:relative;width:100%;height:100%;';
        container.setAttribute('id', 'subway_renderer');
        this.container = container;
        container.appendChild(canvas);
        this.div.appendChild(container);
        this.context = canvas.getContext("2d");
        this.canvas = canvas;
    };

    p.setSize = function(size) {
        var canvas = this.canvas;
        this.mapWidth = size.width;
        this.mapHeight = size.height;
    }

    p.addEntity = function(entity) {
        this.entity = entity
    }

    p.clear = function() {
        var canvas = this.canvas;
        var context = this.context;
        context.save();
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();
    }

    p.draw = function() {
        this.initCanvas();
        this.drawCanvas()
    }

    p.initCanvas = function() {
        var mapWH, deviceWH, ratio = this.deviceWidth > this.deviceHeight;
        if (ratio) {
            mapWH = this.mapHeight;
            deviceWH = this.deviceHeight
        } else {
            mapWH = this.mapWidth;
            deviceWH = this.deviceWidth
        }
        var tempScaleRatio, tempWH;
        for (scaleRatio = this.scaleRatio; mapWH > deviceWH && (tempScaleRatio = scaleRatio * this.zoomOutRate, tempWH = mapWH * this.zoomOutRate, !(tempScaleRatio < this.minScaleRatio));) {
            scaleRatio = tempScaleRatio;
            mapWH = tempWH;
        }
        this.scaleRatio = scaleRatio;
    }

    p.drawCanvas = function(orig_x, orig_y, scaleRatio) {
        var center = this.entity.center || [];
        var center_x = center[0] || this.mapWidth / 2;
        var center_y = center[1] || this.mapHeight / 2;
        this.orig_x = (void 0 == orig_x) ? -center_x : orig_x;
        this.orig_y = (void 0 == orig_y) ? -center_y : orig_y;
        
        this.scaleRatio  = scaleRatio || this.scaleRatio;
        this.redraw();
    }

    p.redraw = function() {
        this.clear();
        var ctx = this.context;
        ctx.save();
        ctx.translate(0, 0);
        ctx.scale(this.scaleRatio, this.scaleRatio);
        ctx.translate(this.orig_x + this.toUnit(this.canvasWidth / 2), this.orig_y + this.toUnit(this.canvasHeight / 2));
        var entity = this.entity;
        var lines = entity.lines;
        for (var i = 0; i < lines.length; i++) {
            this.drawLine(lines[i]);
        }
        for (var i = 0; i < lines.length; i++) {
            var stations = lines[i].stations;
            for (var j = 0; j < stations.length; j++) {
                var station = stations[j];
                this.drawStation(station)
            }
        }
        ctx.restore();
    };

    p.drawLine = function(line) {
        var context = this.context;
        context.beginPath();
        context.fillStyle = line.lc;
        context.font = "bold 14px 微软雅黑";
        context.fillText(line.lb, line.lbx, line.lby);
        for (var i = 0; i < line.stations.length; i++) {
            var station = line.stations[i],
                mid_x = station.x,
                mid_y = station.y,
                rc = station.rc;
            context.lineWidth = 8;
            context.strokeStyle = line.lc;
            if (rc) {
                var last = line.stations[i - 1],
                    next = line.stations[i + 1],
                    last_x = last.x,
                    next_x = next.x,
                    last_y = last.y,
                    next_y = next.y,
                    cpX = 2 * mid_x - (last_x + next_x) / 2,
                    cpY = 2 * mid_y - (last_y + next_y) / 2;
                context.quadraticCurveTo(cpX, cpY, next_x, next_y)
            } else context.lineTo(mid_x, mid_y);
            if (line.loop && i == line.stations.length - 1) {
                var first_x = line.stations[0].x,
                    first_y = line.stations[0].y;
                context.lineTo(first_x, first_y)
            }
        }
        context.stroke()
    }

    p.drawStation = function(station) {
        var context = this.context;
        var entity = this.entity;
        if (station.iu) {
            if (station.icon) {
                var e = station.icon.split(",");
                context.drawImage(entity.imageIcon.airport, station.x + Math.floor(e[1]), station.y + Math.floor(e[2]), 32, 32);
            }
            if (station.ex) {
                context.drawImage(entity.imageIcon.transfer, station.x + station.trs_x, station.y + station.trs_y, 20, 20);
            } else {
                context.beginPath();
                context.arc(station.x, station.y, 6.5, 0, 2 * Math.PI, !1);
                context.strokeStyle = station.lc;
                context.lineWidth = 2.5;
                context.fillStyle = "white";
                context.fill();
                context.stroke();
            }
            context.fillStyle = "black";
            context.font = "normal 14px 微软雅黑";

            if(station.slb){
                context.fillText(station.lb, station.x + station.rx, station.y + station.ry);
            }            
        }
    }

    p.clearCSSTransform = function() {
        this.setCSSTransform(0, 0, 1);
    }

    p.setCSSTransform = function(orig_x, orig_y, scale) {
        (void 0 == orig_x || void 0 == orig_y) && (orig_x = this.orig_x || 0, orig_y = this.orig_y || 0), void 0 == scale && (scale = 1);
        var s = this.getTransformMatrix(orig_x, orig_y, scale);
        $(this.container).css({
            transform: s,
            "-webkit-transform": s
        })
    }

    p.getTransformMatrix = function(orig_x, orig_y, scale) {
        var arr = [scale, 0, 0, scale, orig_x, orig_y];
        return "matrix(" + arr.join(",") + ")"
    }


    p.getPointFromPixel = function(point) {
        var x = point.x * this.devicePixelRatio,
            y = point.y * this.devicePixelRatio;
        if (!(0 > x || 0 > y || x > this.mapWidth || y > this.mapHeight)) {
            var px = Math.floor(this.toUnit(x - this.canvasWidth / 2) - this.orig_x),
                py = Math.floor(this.toUnit(y - this.canvasHeight / 2) - this.orig_y);
            return new Position(px, py)
        }
    }

    p.getPixelFromPoint = function(point) {
        var orig_x = point.x + this.orig_x,
            orig_y = point.y + this.orig_y,
            newX = (this.toPixel(orig_x) + this.canvasWidth / 2 / (1 + 2 * this.marginRatio)) / this.devicePixelRatio,
            newY = (this.toPixel(orig_y) + this.canvasHeight / 2 / (1 + 2 * this.marginRatio)) / this.devicePixelRatio;
        return new Position(newX, newY)
    }

    p.zoom = function(orig_x, orig_y, scaleRatio) {
        scaleRatio = Math.max(Math.min(scaleRatio, this.maxScaleRatio), this.minScaleRatio);
        this.scaleRatio = scaleRatio;
        this.drawCanvas(this.orig_x, this.orig_y)
    }

    p.zoomIn = function() {
        this.scaleRatio *= this.zoomInRate;
        this.drawCanvas(this.orig_x, this.orig_y)
    };

    p.zoomOut = function() {
        this.scaleRatio *= this.zoomOutRate;
        this.drawCanvas(this.orig_x, this.orig_y)
    };

    p.zoomMax = function() {
        this.scaleRatio = this.maxScaleRatio;
        this.drawCanvas(this.orig_x, this.orig_y);
    }

    p.toPixel = function(n) {
        return n * this.scaleRatio
    }


    p.moveTo = function(orig_x, orig_y) {
        this.clearCSSTransform();
        this.drawCanvas(orig_x, orig_y, this.scaleRatio)
    }

    p.move = function(orig_x, orig_y) {
        this.setCSSTransform(orig_x, orig_y)
    }

    p.getOriginPoint = function() {
        return new Position(this.orig_x, this.orig_y)
    }

    p.getPointUnitFromPixelValue = function(t) {
        return this.toUnit(t * this.devicePixelRatio)
    }

    p.getPixelValueFromPointUnit = function(t) {
        return this.toPixel(t) / this.devicePixelRatio
    }

    p.toUnit = function(t) {
        return t / this.scaleRatio
    }

    p.isOutOfBounds = function(origin_x, origin_y, offset_x, offset_y) {
        var tempWidth = origin_x + this.getPointUnitFromPixelValue(offset_x),
            tempHeight = origin_y + this.getPointUnitFromPixelValue(offset_y);
        return tempWidth > 0 || tempWidth < -this.mapWidth || tempHeight > 0 || tempHeight < -this.mapHeight ? {
            delta_x: this.getPixelValueFromPointUnit((tempWidth > 0 ? 0 : tempWidth < -this.mapWidth ? -this.mapWidth : tempWidth) - origin_x),
            delta_y: this.getPixelValueFromPointUnit((tempHeight > 0 ? 0 : tempHeight < -this.mapHeight ? -this.mapHeight : tempHeight) - origin_y)
        } : !1
    }

    p.isMaxScale = function() {
        return this.scaleRatio * this.zoomInRate > this.maxScaleRatio
    }

    p.isMinScale = function() {
        return this.scaleRatio * this.zoomOutRate < this.minScaleRatio
    }

    p.resize = function(width, height) {
        if (height && height != this.deviceHeight) {
            var point = this.getPointFromPixel(new Position(this.deviceWidth / 2, this.deviceHeight / 2)),
                scaleRatio = this.scaleRatio;
            this.deviceWidth = $(this.div).width();
            this.deviceHeight = $(this.div).height();
            this.canvas.width = this.canvasWidth = this.deviceWidth * this.devicePixelRatio * (1 + 2 * this.marginRatio);
            this.canvas.height = this.canvasHeight = this.deviceHeight * this.devicePixelRatio * (1 + 2 * this.marginRatio);
            this.canvas.style.width =  Math.floor(this.deviceWidth * (1 + 2 * this.marginRatio)) + "px";
            this.canvas.style.height = Math.floor(this.deviceHeight * (1 + 2 * this.marginRatio)) + "px";
            this.zoom(point.x, point.y, scaleRatio)
        }
    }


   /* p.getLocalXY = function(point) {
        var resolution = this.layer.getResolution();
        var extent = this.layer.bounds;
        var x = (point.x / resolution + (-extent.left / resolution));
        var y = ((extent.top / resolution) - point.y / resolution);
        return {x: x, y: y};
    }*/

    module.exports = CanvasRenderer;

});
