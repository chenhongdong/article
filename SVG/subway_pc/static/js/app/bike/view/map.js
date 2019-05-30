define(function(require) {
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').route;
    var bmonitor = monitor.bike;
    var command = require('../bike-command');

    var a = {
        _visible: false,
        _init: false,
        tpl:{
            map_top: require('../../../templates/bike/map_top.html'),
            map_bottom: require('../../../templates/bike/map_bottom.html'),
            map_bottom_step: require('../../../templates/bike/map_bottom_step.html')
        },
        name: "bike_map",
        logname: "bikemappage",
        containMap: true,
        _overlays: [],
        routeColor: "#9933ff",
        routeColorHightlight: "#EE0000",
        routeWidth: 6,
        routeOpacity: 0.8,
        _startId: "bikemk_start",
        _endId: "bikemk_end",
        _lastcoor: "",
        command: command,
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                data = me.view_data.data,
                params = me.view_data.params;

            //默认数据填充;
            params.step = Number(_.isNumber(params.step) ? params.step : -1);

            try {
                this.list = data.route.paths[0];
                this.steps = this.list.steps;
                this._lastIndex = -1;
                this._lastcoor = "";
                a.drawLine();
                var step = params.step;

                var html = So.View.template(this.tpl.map_top, {
                    start:params.start.name,
                    end:params.end.name,
                    step:step
                });
                $("#CTextDiv").html(html);

                a.update()
            } catch (c) {

                params.type = 'bike';
                So.Gcmd.changeHash('search/error', {
                    noChangeHash: true,
                    data: {
                        start: params.start.name,
                        end: params.end.name,
                        type: 'bike'
                    },
                    params:params
                });
                return false;
            }


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
                return "bikepoly_" + d
            } else {
                if (c == "marker") {
                    return "bikemk_" + d
                } else {
                    return d
                }
            }
        },
        updateInfo: function() {
            var me = this,
                view_data = me.view_data,
                data = view_data.data,
                params = view_data.params,
                step = params.step;

            if (step >= this.steps.length) {
                return
            }

            var bottom_tpl = step == -1 ? this.tpl.map_bottom : this.tpl.map_bottom_step;

            var d = this.steps[step] || {
                'text' : So.Util.formatTimeS(this.list.duration) + '(' + So.Util.formatDistance(this.list.distance)+')'
            };
            var _map_plugin_installed = config.getMapPluginInstalled();
            var ua = _map_plugin_installed.ua;
            var map_plugin_installed = _map_plugin_installed.plugin || config.ISANDROID;
            
            var g = {
                map_plugin_installed:!!map_plugin_installed,
                start: params.start,
                end: params.end,
                text: d.text,
                step: step + 1,
                path: this.list,
                pre_class: step <= 0 ? "new_step_noclick" : '',
                next_class: step == this.steps.length - 1 ? "new_step_noclick" : ''
            };
            $("#CTextDiv1").html(So.View.template(bottom_tpl, g));
            // setTimeout(function(){
            //      $(".new_step_con .new_step_text").width($(window).width()-$('.new_step_con span').width()*2-22);
            // },0)

            if(step == -1){
                bmonitor.disp.enter();
            }else{
                bmonitor.disp.sub();
            }

        },
        getPoly: function(d, c) {
            return new so.maps.Polyline({
                id: d,
                path: c,
                strokeColor: this.routeColor,
                strokeOpacity: this.routeOpacity,
                strokeWeight: this.routeWidth,
            })
        },
        getPath: function(g, e) {
            var j = g.polyline.split(";");
            var d = j.length;
            if (this._lastcoor != "" && d > 0 && e) {
                if (this._lastcoor != j[0] && e) {
                    j.unshift(this._lastcoor)
                }
            }
            d = j.length;
            var c = [];
            for (var f = 0; f < d; f++) {
                var h = j[f].split(",");
                c.push(this.getLngLat(h[0], h[1]));
                if (f == d - 1 && e) {
                    this._lastcoor = j[f]
                }
            }
            return c
        },
        drawLine: function() {
            var me = this,
                view_data = me.view_data,
                params = me.view_data.params;

            So.UIMap.clearMap();

            var j = new so.maps.LatLng(params.start.y, params.start.x);
            var h = new so.maps.LatLng(params.end.y, params.end.x);
            var k = [];
            k.push(So.Util.createMarker("startend", {
                id: this._startId,
                position: j,
                flag: "start"
            }));
            k.push(So.Util.createMarker("startend", {
                id: this._endId,
                position: h,
                flag: "end"
            }));
            var f = this.steps.length;
            for (var e = 0; e < f; e++) {
                var d = this.getPath(this.steps[e], true);
                var c = this.getPath(this.steps[e], false);
                k.push(this.getPoly(this.getId("poly", e), d));
            }
            a._overlays = k;
            So.UIMap.getObj().addOverlays(k);
            So.UIMap.setFitView(k, {'left':50, 'right': 50, 'bottom': $('#CTextDiv1').height() + 10 });
            this._fitViewOverlays = k;
        },
        updateLine: function() {
            var me = this,
                view_data = me.view_data,
                data = view_data.data,
                params = view_data.params;

            var d = me.getOverlay(me.getId("poly", this._lastIndex));
             d && d.setStrokeColor(me.routeColor);

            this._lastIndex = params.step;
            d = me.getOverlay(me.getId("poly", this._lastIndex));
            d && d.setStrokeColor(me.routeColorHightlight);

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
        updateCenter: function(overlays) {
            overlays = _.isArray(overlays) ? overlays : [overlays];
            So.UIMap.setFitView(overlays, {'left':50, 'right': 50, 'bottom': $('#CTextDiv1').height() + 10 });
        },
        cmd: function(c) {
            var me = this,
                view_data = me.view_data,
                params = view_data.params,
                command = view_data.command;

            switch (c.id) {
                case 0:
                    bmonitor.click.sub();
                    a.onPreBtn();
                    break;
                case 1:
                    bmonitor.click.sub();
                    a.onNextBtn();
                    break;
                case 2:
                    So.Gcmd.changeHash("bike/index", view_data);
                    break;
                case 3:
                    window.history.back();
                    break;
                case 5:                
                    a.startRoute();
                    break;
                case 7:
                   So.Cookie.set('nav_type',1);
                   So.Gcmd.changeHash("bus/index", {
                    params:{
                        start: params.start,
                        end: params.end,
                        passing: params.passing,
                        city: So.CityData.citycode()
                    },
                    noChangeHash: true
                   });
                    break;
                case 8:
                   So.Cookie.set('nav_type',2);
                   So.Gcmd.changeHash("drive/map", {
                    params:{
                        start: params.start,
                        end: params.end,
                        passing: params.passing,
                        city: So.CityData.citycode()
                    },
                    noChangeHash: true
                   });
                    break;
                case 9:
                    c.scn = c.scn.replace(/\"|\'/,"");
                    c.ecn = c.ecn.replace(/\"|\'/,"");
                    c.eclon = c.eclon.replace(/\?/,"");
                    c.eclat = c.eclat.replace(/\?/,"");

                    var tmpFrom = (navigator.userAgent.indexOf('360around')>-1 || navigator.userAgent.indexOf('360shenbian')>-1)?'身边生活app':'haosou&msoAppVersion='+msoAppVersion;

                    var scheme_url = "openapp://com.qihoo.msearch.qmap/navigate?action=navigate&scn="+c.scn+"&sclon="+c.sclon+"&sclat="+c.sclat+"&ecn="+c.ecn+"&eclon="+c.eclon+"&eclat="+c.eclat+"&from="+tmpFrom+"&tramode=0";
                    var wapSchema = '$web_app#scheme_url:#mse_token#{"app_url":"'+scheme_url+'","web_url":"","leidian_url":"ddd","pkg_name":"包名"}';

                    console.log(wapSchema.replace('#mse_token', window.mse_token || '#null#'));
                    break;
                case 10:
                   So.Cookie.set('nav_type',3);
                   So.Gcmd.changeHash("walk/map", {
                    params:{
                        start: params.start,
                        end: params.end,
                        passing: params.passing,
                        city: So.CityData.citycode()
                    },
                    noChangeHash: true
                   });
                    break;
                case 100:
                    monitor.click.route_edit({
                        router_type: 'bike'
                    });
                    So.Gcmd.changeHash("route/index", {
                        params:{
                            start: params.start,
                            end: params.end,
                            passing: params.passing
                        }
                    });
                    break;
            }
        },
        onPreBtn: function() {
            var me = this,
                view_data = me.view_data,
                params = view_data.params;

            if (params.step <= 0) {
                return
            }
            params.step--;
            a.update()
        },
        onNextBtn: function() {
            var me = this,
                view_data = me.view_data,
                params = view_data.params;

            if (params.step >= this.steps.length - 1) {
                return
            }
            params.step++;
            a.update()
        },
        startRoute: function(){
            var me = this,
                view_data = me.view_data,
                data = view_data.data,
                params = view_data.params;

            data.step = 0;
            params.step = 0;

            So.Gcmd.changeHash("bike/map", _.extend(view_data,{
                mustChangeHash: true
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
