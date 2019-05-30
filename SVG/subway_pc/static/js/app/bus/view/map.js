define(function(require){
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').route.bus;
    var command = require('../bus-command');
    var a = {
        _visible: false,
        _init: false,
        tpl:{
            map_top: require('../../../templates/bus/map_top.html'),
            map_bottom: require('../../../templates/bus/map_bottom.html'),
            info_detail: require('../../../templates/bus/info_detail.html')
        },
        name: "bus_map",
        logname: "busmappage",
        containMap: true,
        _overlays: [],
        routeColorBus: "#8c87f7",
        routeColorWalk: "#67b718",
        routeColorDrive: "#41b51b",
        routeColorHightlight: "#f74536",
        routeWidth: 6,
        routeOpacity: 0.9,
        routeOpacityHighlight: 0.85,
        _startId: "busmk_start",
        command: command,
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                data = me.view_data.data,
                params = me.view_data.params;

            //默认数据填充;
            params.index = Number(params.index) || 0;
            params.step = params.step != "" && Number(params.step) > -1 ? Number(params.step) : -1;

            this.transit = data.route.transits[params.index];
            this.steps = this.transit.steps;
            this._lastIndex = -1;
            try {
                a.drawLine()
            } catch (c) {}

            //
            var html = So.View.template(this.tpl.map_top, {
                index:-1,
                info: this.transit.info,
                start:params.start.name,
                end:params.end.name
            });
            $("#CTextDiv").html(html);

            a.update()
        },
        update: function() {
            a.updateInfo();
            try {
                a.updateLine()
            } catch (c) {}
        },
        getLngLat: function(c, d) {
            c = parseFloat(c);
            d = parseFloat(d);
            return new so.maps.LatLng(d, c)
        },
        getId: function(c, d) {
            if (c == "poly") {
                return "buspoly_" + d
            } else {
                if (c == "marker") {
                    if (d == 0) {
                        return this._startId
                    } else {
                        return "busmk_" + d
                    }
                } else {
                    return d
                }
            }
        },
        drawLine: function() {
            var me = this,
                view_data = me.view_data,
                data = view_data.data,
                params = view_data.params;

            So.UIMap.clearMap();
            var that = this,
                startPoint = new so.maps.LatLng(params.start.y, params.start.x),
                endPoint = new so.maps.LatLng(params.end.y, params.end.x),
                segments = data.route.transits[params.index].segments,
                overlays = [],
                lineIndex = 0,
                markIndex = 1,
                startMark,//起点mark
                endMark;//终点mark

            //创建起点mark;
            startMark = So.Util.createMarker("startend", {
                id: this._startId,
                position: startPoint,
                flag: "start"
            });

            overlays.push(startMark);
            var firstStepIsDrive=-1; //起点就是驾车
            for (var i=0,l=segments.length; i < l; i++) {
                var segment = segments[i],
                    walk = segment && segment.walking || {},
                    driver = segment && segment.driver || {},
                    walkPoints = [],
                    driverPoints = [],
                    walkStartPoint,
                    walkEndPoint,
                    walkLine,
                    driverLine,
                    pre_segment = segments[i - 1] || {},
                    bus = segment && segment.bus && segment.bus.buslines[0] || {},
                    pre_bus = pre_segment.bus && pre_segment.bus.buslines[0] || {},
                    busLineStr = bus.polyline && bus.polyline.split(";") || [],
                    busLineStrLen = busLineStr.length,
                    busLinePoints = [],
                    busLine,
                    busStartPoint,//公交线路起点
                    busEndPoint,//公交线路终点
                    pre_l = pre_bus.polyline && pre_bus.polyline.split(";") || [],
                    temp,
                    exit,
                    busType;

                    if(bus.type){
                        switch(bus.type){
                            case '地铁':
                                busType = 'metro';
                            break;
                            case '火车':
                               busType = 'train';
                            break;
                            case '飞机':
                               busType = 'plane';
                            break;
                            default:
                                busType = 'bus';
                        }
                    }else if(driver){
                        busType = 'drive'
                    }

                driver.steps = driver.steps || [];

                 if(segment){
                    entrance = segment.entrance+'' ? segment.entrance : '';
                    exit = segment.exit + '' ? segment.exit :'';
                }

                pre_l = pre_l.slice(-1);

                //如果终点没有步行信息，segments长度+1，增加终点步行信息;
                if(i == l-1 && busLineStrLen){
                    l++;
                }

                if(busType == 'drive'){
                     //没有公交时，有驾车的导航点;
                    if(driver.steps.length){
                        i == 0 && (firstStepIsDrive = i);
                        (function(){
                            var point1,point2;
                            for(var j=0,k=driver.steps.length;j<k;j++){
                                point1 = driver.steps[j].polyline;
                                point1 = point1.split(';');
                                if(point1.length > 0){
                                    for(var m=0,n=point1.length;m<n;m++){
                                        point2 = point1[m].split(',');
                                        if(parseFloat(point2[0]) && parseFloat(point2[1])){
                                            driverPoints.push(that.getLngLat(point2[0], point2[1]));
                                        }
                                    }
                                }
                            }
                        })();
                         //生成驾车线路
                        driverLine = this.getPoly(this.getId("poly", lineIndex), !1, 'drive', driverPoints);
                        //this.bindPolyEvent(driverLine);
                        overlays.push(driverLine);

                        lineIndex++;

                        //驾车起点
                        temp = {
                            id: this.getId("marker", markIndex),
                            position: driverPoints[0],
                            flag:'drive'
                        };
                        drivePoint = So.Util.createMarker("busmarker", temp);

                        if (drivePoint) {
                            overlays.push(drivePoint);
                            //this.bindMarkerEvent(drivePoint);
                        }
                        markIndex++;
                    }
                }

                //起点、终点必须有步行信息；中间的换成有步行则添加步行
                if (i == 0 || (!_.isNaN(parseInt(walk.distance)) && 0 != parseInt(walk.distance)) || i == l-1) {

                    //步行起点
                    if(0 == i){
                          //起点不是步行是驾车路线的时候
                        /*driver.steps.length ? walkPoints.push(driverPoints[0]) : */walkPoints.push(startPoint);
                    }else{
                        walkStartPoint = pre_l[pre_l.length - 1].split(",");
                        walkPoints.push(this.getLngLat(walkStartPoint[0], walkStartPoint[1]));
                    }

                    //步行导航点;
                    walk.steps = walk.steps || [];
                    (function(){
                        var point1,
                            point2;
                        for(var j=0,k=walk.steps.length;j<k;j++){
                            point1 = walk.steps[j].polyline;
                            point1 = point1.split(';');
                            if(point1.length > 0){
                                for(var m=0,n=point1.length;m<n;m++){
                                    point2 = point1[m].split(',');
                                    if(parseFloat(point2[0]) && parseFloat(point2[1])){
                                    walkPoints.push(that.getLngLat(point2[0], point2[1]));
                                    }
                                }
                            }
                        }
                    })();

                    //步行终点
                    if(i == l-1){
                        if(!busLineStrLen){
                            //达到终点的步行路线
                            if(exit){
                                var entrancePoint = exit.location.split(',');
                                walkPoints.push(this.getLngLat(entrancePoint[0], entrancePoint[1]));
                            }
                            //最后不是步行是驾车路线的时候
                            driver.steps.length ? walkPoints.push(driverPoints[0]) : walkPoints.push(endPoint);

                        }else{
                            //终点没有步行线路;
                            markIndex--;
                        }
                    }else{
                        walkEndPoint = busLineStr[0] && busLineStr[0].split(",");
                        if(entrance){
                            var entrancePoint = entrance.location.split(',');
                            walkPoints.push(this.getLngLat(entrancePoint[0], entrancePoint[1]));
                        }
                       //walkEndPoint && walkPoints.push(this.getLngLat(walkEndPoint[0], walkEndPoint[1]));
                       driver.steps.length ? walkPoints.push(driverPoints[0]) : walkEndPoint && walkPoints.push(this.getLngLat(walkEndPoint[0], walkEndPoint[1]));
                    }

                    walkLine = this.getPoly(this.getId("poly", lineIndex), !1, 'walk', walkPoints,!1);
                    overlays.push(walkLine);
                    //this.bindPolyEvent(walkLine);
                    lineIndex++;

                } else {
                    markIndex--;
                }
                if(busType!='drive'){
                if(busLineStrLen < 1){
                    continue;
                }

                //生成公交线路points
                for (var j=0; j<busLineStrLen; j++) {
                    temp = busLineStr[j].split(",");
                    busLinePoints.push(this.getLngLat(temp[0], temp[1]));
                }

                //生成公交线路
                var lineDash = (busType == 'plane' || busType=='train') ? true :false;
                busLine = this.getPoly(this.getId("poly", lineIndex), !1, 'bus', busLinePoints,lineDash);
                //this.bindPolyEvent(busLine);
                overlays.push(busLine);

                lineIndex++;

                busStartPoint = busLineStr[0].split(",");
                busStartPoint = this.getLngLat(busStartPoint[0], busStartPoint[1]);

                busEndPoint = busLineStr[busLineStrLen - 1].split(",");
                busEndPoint = this.getLngLat(busEndPoint[0], busEndPoint[1]);



                    if ((busType !='bus' && busType !='metro') || false == _.contains(_.pluck(overlays, "id"), this.getId("marker", markIndex))) {

                    //公交线路起点坐标信息
                       if(busType !='bus' && busType !='metro' && firstStepIsDrive > -1){ //如果起步是驾车添加
                            markIndex++;
                       }
                    temp = {
                        id: this.getId("marker", markIndex),
                        position: busStartPoint,
                        flag: busType
                    };

                    //创建公交线路起点mark
                    busStartPoint = So.Util.createMarker("busmarker", temp);

                    if (busStartPoint) {
                        overlays.push(busStartPoint);
                        //this.bindMarkerEvent(busStartPoint);
                    }
                }

                markIndex++;



                //公交线路终点坐标信息
                temp = {
                    id: this.getId("marker", markIndex),
                    position: busEndPoint,
                    flag: busType
                };
                //创建公交线路终点mark
                busEndPoint = So.Util.createMarker("busmarker", temp);

                if (busEndPoint) {
                    overlays.push(busEndPoint);
                    //this.bindMarkerEvent(busEndPoint);
                }

                markIndex++;
                }

            }

            this._endIndex = markIndex;
            this._endId = this.getId("marker", markIndex);

            //创建终点mark
            endMark = So.Util.createMarker("startend", {
                id: this._endId,
                position: endPoint,
                flag: "end"
            });

            //endMark.setDraggable(true);
            //this.bindMarkerEvent(endMark);
            overlays.push(endMark);

            a._overlays = overlays;
            var map = So.UIMap.getObj();
            map.addOverlays(a._overlays);

            So.UIMap.setFitView(overlays);
            this._fitViewOverlays = overlays;

            return overlays
        },
        updateCenter: function(overlays) {
            overlays = _.isArray(overlays) ? overlays : [overlays];
            So.UIMap.setFitView(overlays, {'left':50, 'right': 50, 'bottom': $('#CTextDiv1').height() + 10 });
        },
        updateLine: function() {
            var me = this,
                view_data = me.view_data,
                params = view_data.params;

            var d = me.getOverlay(me.getId("poly", me._lastIndex));
            if (d) {
                if (d.strokeStyle == "solid") {
                    d.setStrokeColor(me.routeColorBus);
                } else {
                    d.setStrokeColor(me.routeColorWalk);
                }
                d.setStrokeOpacity(me.routeOpacity);

            }
            this._lastIndex = params.step;
            d = me.getOverlay(me.getId("poly", me._lastIndex));
            if (d) {
                d.setStrokeColor(me.routeColorHightlight);
                d.setStrokeOpacity(me.routeOpacityHighlight);
            }
            d = d || me._overlays;

            this.updateCenter(d);
            d && (this._fitViewOverlays = d);
        },
        getOverlay: function(id){
            var me = this;
            return _.find(me._overlays,function(item){
                return item.id == id;
            });
        },

        getPoly: function(id, isHightLight, routeType, path,lineDash) {
            var color = this.routeColorBus;
            switch(routeType){
                case 'bus':
                    color = this.routeColorBus;
                break;
                case 'drive':
                     color = this.routeColorDrive;
                break;
                case 'walk':
                     color = this.routeColorWalk;
                break;
            }
            color = !0 == isHightLight ? this.routeColorHightlight : color;
            return new so.maps.Polyline({
                id: id,
                path: path,
                strokeColor: color,
                strokeOpacity: isHightLight ? this.routeOpacityHighlight : this.routeOpacity,
                strokeWeight: this.routeWidth,
                strokeDashStyle: !lineDash ? "solid" : "dash",
                strokeDasharray: [5, 15]
            })
        },
        updateInfo: function() {
            var me = this,
                view_data = me.view_data,
                params = view_data.params,
                step = params.step;

            if (step < -1 || step >= this.steps.length) {
                return
            }
            var d = this.steps[step] || {
                'text' : So.View.template(this.tpl.info_detail,{
                    info: this.transit.info,
                    walking_distance: this.transit.walking_distance,
                    all_distance: this.transit.all_distance,
                    duration: this.transit.duration
                })
            };
            var g = {
                info: this.transit.info,
                step: d.text,
                index: step + 1,
                pre_class: step < 0 ? "new_step_noclick" : '',
                next_class: step == this.steps.length - 1 ? "new_step_noclick" : ''
            };
            $("#CTextDiv1").html(So.View.template(this.tpl.map_bottom, g));
            // setTimeout(function(){
            //      $(".new_step_con .new_step_text").width($(window).width()-$('.new_step_con span').width()*2-22);
            // },0)

        },
        onPreBtn: function() {
            var me = this,
                view_data = me.view_data,
                params = view_data.params,
                index = params.index,
                step = params.step;

            if (index < 0 || (step <= -1)) {
                return
            }
            params.step--;
            a.update();
            So.Gcmd.changeHash("bus/map", _.extend(view_data,{
                onlySetParams: true
            }));
        },
        onNextBtn: function() {
            var me = this,
                view_data = me.view_data,
                params = view_data.params,
                index = params.index,
                step = params.step;

            if (index < 0 || (step >= this.steps.length - 1)) {
                return
            }
            params.step++;
            a.update();
            So.Gcmd.changeHash("bus/map", _.extend(view_data,{
                onlySetParams: true
            }));
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var _display = c ? "block" : "none";
            $("#CTextDiv").css("display", _display);
            $("#CTextDiv1").css("display", _display);
            So.UIMap.visible(c);
            if (c) {
                So.UIMap.hideUserLocation()
            } else {
                if (c == false && this._overlays.length > 0) {
                    a.clearMap();
                    config.MAP_CTRL_V = "1,1,1,1,1"
                }
            }
            //
            monitor.disp.sub()
        },
        cmd: function(c) {
            var me = this,
                view_data = me.view_data;

            switch (c.id) {
                case 0:
                    monitor.click.sub()
                    a.onPreBtn();
                    break;
                case 1:
                    monitor.click.sub()
                    a.onNextBtn();
                    break;
                case 2:
                    window.history.back();
                    break
            }
        },
        clearMap: function() {
            So.UIMap.clearMap();
            this._overlays = []
        },
        mapheight: function(d) {
        },
        fitMapView: function(){
            var me = this;
            setTimeout(function(){
                me._fitViewOverlays && me.updateCenter(me._fitViewOverlays);
            },300)
        },
        resize:function(d){
        }
    };

    return a;
});
