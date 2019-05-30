define(function(require) {
    var config = require('js/app/conf/config');
    var SlideUpBox = require('js/app/widget/slideupbox');
    var monitor = require('js/app/monitor').route;
    var command = require('../drive-command');
    var planSelectBox;
    var routeTypes = {
        'avoid_jam': {
            name: '躲避拥堵'
        },
        'avoid_highway': {
            name: '不走高速'
        },
        'avoid_fee': {
            name: '避免收费'
        }
    };
    var a = {
        _visible: false,
        _init: false,
        tpl:{
            map_top: require('../../../templates/drive/map_top.html'),
            map_bottom: require('../../../templates/drive/map_bottom.html'),
            map_bottom_step: require('../../../templates/drive/map_bottom_step.html')
        },
        name: "drive_map",
        logname: "carmappage",
        containMap: true,
        _overlays: [],
        routeColor: "#9933ff",
        routeJamColor: "#00c100",
        routeColorHightlight: "#EE0000",
        routeWidth: 6,
        routeOpacity: 0.8,
        _startId: "carmk_start",
        _endId: "carmk_end",
        _passingId: "carmk_passing",
        _lastcoor: "",
        _fitViewOverlays:'',
        command: command,
        el: '#CTextDiv',
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                params = this.view_data.params,
                index = params.index || 0;

            try {
                this.showline(index);
                a.update();                
            } catch (e) {
                params.type = 'drive';
                So.Gcmd.changeHash('search/error', {
                    noChangeHash: true,
                    data: {
                        start: params.start.name,
                        end: params.end.name,
                        type: 'drive'
                    },
                    params:params
                });
                return false;
            }
        },
        showline: function(index, opts){
            opts = opts || {};
            var me = this,
                from = opts.from || '',
                view_data = this.view_data,
                data = view_data.data,
                params = view_data.params;

            if(from == 'scroll' && params.index == index){
                return false;
            }

            data._step = !params.step && params.step != 0 ? -1 : parseInt(params.step);

            if(isNaN(data._step)){
                data._step =  -1;
            }
            this.list = data.route.paths[index];
            if(!this.list){
                return false;
            }
            this.steps = this.list.steps;
            this._lastIndex = -1;
            this._lastcoor = "";
            a.drawLine();
            a.updateLine();

            params.index = index;

            So.Gcmd.changeHash("drive/map", _.extend(So.clone(view_data),{
                onlySetParams: true
            }));
            //            
        },
        events:{
            //'click .new_route_type a': 'setRouteType'
        },
        setRouteType: function(){
            var params = a.view_data.params,
                command = a.view_data.command,
                types = {
                    avoid_highway: params.avoid_highway,
                    avoid_jam: params.avoid_jam,
                    avoid_fee: params.avoid_fee,
                };
            
            _.forEach(routeTypes, function(item, key){
                if(item.active){
                    types[key] = 'true';
                }else{
                    types[key] = 'false';
                }
            });

            command.setRouteType(types);
            monitor.drive.click.pre(types)
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
                return "carpoly_" + d
            } else {
                if (c == "marker") {
                    return "carmk_" + d
                } else {
                    return d
                }
            }
        },
        updateInfo: function() {
            var me = this,
                view_data = this.view_data,
                data = view_data.data,
                params = view_data.params,
                passing = params.passing || [],
                index = data._step;

            if (index >= this.steps.length) {
                return
            }
            var c = config.MAP_CTRL_V.split(",");
            var f = parseInt(c[4]) == 1 ? "block" : "none";
            var bottom_tpl = index == -1 ? this.tpl.map_bottom : this.tpl.map_bottom_step;

            var _map_plugin_installed = config.getMapPluginInstalled();
            var ua = _map_plugin_installed.ua;
            var map_plugin_installed = _map_plugin_installed.plugin || config.ISANDROID;

            var html = So.View.template(this.tpl.map_top, {
                map_plugin_installed:!!map_plugin_installed,
                crossCity:me.list.crossCity,
                index: index,
                start: params.start.name,
                end: params.end.name,
                cls0: params.avoid_jam == 'true' ? "optionbar-item-highlight" : "",
                cls1: params.avoid_highway == 'true' ? "optionbar-item-highlight" : "",
                cls2: params.avoid_fee == 'true' ? "optionbar-item-highlight" : ""
            });
            $("#CTextDiv").html(html);
            var d = this.steps[index] || {
                'text' : So.Util.formatTimeS(me.list.time) + '(' + So.Util.formatDistance(me.list.distance)+')'
            };
            var g = {
                map_plugin_installed:!!map_plugin_installed,
                crossCity:me.list.crossCity,
                start: params.start,
                end: params.end,
                policy:'',
                step: d.text,
                paths: data.route.paths,
                index: index + 1,
                cls: "",
                type: "car",
                pre_class: index <= 0 ? "new_step_noclick" : '',
                next_class: index == this.steps.length - 1 ? "new_step_noclick" : ''
            };
            $("#CTextDiv1").html(So.View.template(bottom_tpl, g));
            // setTimeout(function(){
            //      $(".new_step_con .new_step_text").width($(window).width()-$('.new_step_con span').width()*2-22);
            // },0)

            if(index == -1){
                monitor.drive.disp.enter({
                    Vpoint_number: passing.length
                });
            }else{
                monitor.drive.disp.sub();
            }

            //导航按钮展示量 android下，没插件
            if(!_map_plugin_installed.plugin && config.ISANDROID){
                monitor.drive.disp.route_car_download();
            }

        },
        getPoly: function(d, c, color,strokeLinecap,type) {
            var zIndex = type ? 100 : 0;
            var routeOpacity = type ? 0.8 : 0.4;
            return new so.maps.Polyline({
                id: d,
                path: c,
                strokeColor: color,
                strokeOpacity:routeOpacity,
                strokeWeight: this.routeWidth,
                strokeLinecap : strokeLinecap,
                zIndex : zIndex
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
        equal: function(d, c) {
            var f = d.split(",");
            var e = c.split(",")
        },
        drawLine: function() {
            var me = this,
                view_data = this.view_data,
                params = view_data.params;

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

            //添加途经点
            if(params.passing && params.passing.length){
                for(var i=0,l=params.passing.length;i<l;i++){
                    var _passing = params.passing[i];
                    var lnglat = new so.maps.LatLng(_passing.y, _passing.x);
                    k.push(So.Util.createMarker("startend", {
                        id: this._passingId + i,
                        position: lnglat,
                        flag: "passing" + i
                    }));
                }
            }

            var f = this.steps.length;
            for (var e = 0; e < f; e++) {
                //基础路线
                //var d = this.getPath(this.steps[e], true);
                var c = this.getPath(this.steps[e], false);
                k.push(this.getPoly(this.getId("poly", e), c, this.routeColor,'round',0));
                //路况展示
                var jaminfos = this.steps[e].jaminfos;
                for(var i =0,l = jaminfos.length;i<l;i++){
                    var jaminfo = jaminfos[i];
                    var color = this.routeJamColor;
                    switch(jaminfo.jamstate){
                        case 1:
                            color = '#00c100';
                        break;
                        case 2:
                            color = '#ffb100';
                        break;
                        case 3:
                            color = '#f52d26';
                        break;
                        default:
                           color =  this.routeJamColor;
                    }
                    var strokeLinecap = (e == 0 || e == f-1) ? 'round' : 'square';
                    var p = this.getPath(jaminfo, false);
                    k.push(this.getPoly(this.getId("poly", e+'-'+i), p,color,strokeLinecap,1));
                }
            }

            a._overlays = k;
            So.UIMap.getObj().addOverlays(k);
            So.UIMap.setFitView(k, {'left':50, 'right': 50, 'bottom': $('#CTextDiv1').height() + 10 });

            this._fitViewOverlays = k;
        },
        updateLine: function() {
            var me = this;
            var view_data = me.view_data;
            var data = view_data.data;

            var d = me.getOverlay(me.getId("poly", me._lastIndex));
            if( d ) {
                d.setStrokeColor(me.routeColor);
                d.setZIndex(0);
                d.setStrokeOpacity(0.4);
            }

            me._lastIndex = data._step;
            d = me.getOverlay(me.getId("poly", me._lastIndex));
            if( d ) {
                d.setStrokeColor(me.routeColorHightlight);
                d.setZIndex(101);
                d.setStrokeOpacity(1);
            }

            d = d || me._overlays;

            me.updateCenter(d);
            d && (me._fitViewOverlays = d);
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
                view_data = this.view_data,
                params = view_data.params,
                command = view_data.command;

            var map_plugin_installed = config.getMapPluginInstalled().plugin;

            switch (c.id) {
                case 0:
                    monitor.drive.click.sub()
                    a.onPreBtn();
                    break;
                case 1:
                    monitor.drive.click.sub()
                    a.onNextBtn();
                    break;
                case 2:
                    monitor.drive.click.detail()
                    So.Gcmd.changeHash("drive/index", view_data);
                    break;
                case 3:
                    command.setRouteType(c.i);
                    break;
                case 4:
                    window.history.back();
                    break;
                case 5:
                    if(map_plugin_installed){
                        monitor.click.btn()
                    }
                    a.startRoute();
                    break;
                case 7:
                   monitor.click.bus()
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
                case 9:
                    monitor.click.walk()
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
                case 10:
                    monitor.click.bus()
                    So.Cookie.set('nav_type',1);
                    So.Gcmd.changeHash("bus/index", {
                    params:{
                        start: params.start,
                        end: params.end,
                        transit_type:'plane',
                        city: So.CityData.citycode()
                    },
                    noChangeHash: true
                    });
                    break;
                case 11:
                    if(!map_plugin_installed){
                        // $('.app_download2_con').show();
                        // $('.app_download2_con').data('src','wap_drive_navigation');
                        // $('body').addClass('app_download_navigation');
                        // //导航按钮展示量 android下，没插件
                        // monitor.drive.click.route_car_download();

                        var btn = $('.drive_route_container .startNav');
                        var now = Date.now();
                        var lastclick = btn.data('lastclick');

                        if(lastclick && now - lastclick < 2000){
                            return false;
                        }
                        btn.data('lastclick', now);

                        monitor.click.route_download_navigation();

                        So.callNative(params, {
                            loadApp: "3",
                            from: 'drive_navigation'
                        });
                        return false;
                    }
                    c.scn = c.scn.replace(/\"|\'/,"");
                    c.ecn = c.ecn.replace(/\"|\'/,"");
                    c.eclon = c.eclon.replace(/\?/,"");
                    c.eclat = c.eclat.replace(/\?/,"");

                    var tmpFrom = (navigator.userAgent.indexOf('360around')>-1 || navigator.userAgent.indexOf('360shenbian')>-1)?'身边生活app':'haosou&msoAppVersion='+msoAppVersion;

                    var scheme_url = "openapp://com.qihoo.msearch.qmap/navigate?action=navigate&scn="+c.scn+"&sclon="+c.sclon+"&sclat="+c.sclat+"&ecn="+c.ecn+"&eclon="+c.eclon+"&eclat="+c.eclat+"&policy="+c.policy+'&tramode=1&from='+tmpFrom;
                    var wapSchema = '$web_app#scheme_url:#mse_token#{"app_url":"'+scheme_url+'","web_url":"","leidian_url":"ddd","pkg_name":"包名"}';
                    //
                    // monitor.click.btn({
                    //     msoAppVersion:msoAppVersion
                    // })
                    monitor.drive.click.navi({
                        msoAppVersion:msoAppVersion
                    })
                    console.log(wapSchema.replace('#mse_token', window.mse_token || '#null#'));
                    break;
                case 12:
                   So.Cookie.set('nav_type',4);
                   So.Gcmd.changeHash("bike/map", {
                    params:{
                        start: params.start,
                        end: params.end,
                        passing: params.passing,
                        city: So.CityData.citycode()
                    },
                    noChangeHash: true
                   });
                  break;
                case 13:
                   if(!planSelectBox){
                        var html = ['<ul class="drive_selector_list">'];

                        _.forEach(routeTypes, function(item, key){
                            var active_class = '';
                            if(params[key] == 'true'){
                                active_class = 'class="active"';
                            }

                            html.push('<li '+ active_class +' data-routetype="'+ key +'"><a href="javascript:;" onclick="So.Gcmd.cmd({id:14,event:event})"><span>'+ item.name +'<em></em></span></a></li>');
                        });

                        html.push('</ul>');
                        planSelectBox = new SlideUpBox({
                            title: '偏好设置',
                            content:html.join(''),
                            cancel: function(){
                            },
                            onClose: function(){
                            },
                            confirm: function(){
                                me.setRouteType();
                            },
                            "class": 'bus_selector_list',
                            open: false
                        });

                    }else{
                        _.forEach(routeTypes, function(item, key){
                            if(params[key] == 'true'){
                                $('.drive_selector_list li[data-routetype="' + key + '"]').addClass('active');
                            }else{
                                $('.drive_selector_list li[data-routetype="' + key + '"]').removeClass('active');
                            }
                        });
                    }
                    planSelectBox.open();
                  break;
                case 14:
                    var click_dom = $(c.event.target),
                        click_parent = click_dom.closest('li'),
                        routetype = click_parent.data('routetype');

                    if(click_parent.hasClass('active')){
                        click_parent.removeClass('active');
                        routeTypes[routetype].active = 0;
                    }else{
                        click_parent.addClass('active');
                        routeTypes[routetype].active = 1;
                    }
                    break;
                case 100:
                    monitor.click.route_edit({
                        router_type: 'drive'
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
            var view_data = this.view_data;
            var data = view_data.data;

            if (data._step <= 0) {
                return
            }
            data._step--;
            a.update();
            view_data.params.step = data._step;
            So.Gcmd.changeHash("drive/map", _.extend(view_data,{
                onlySetParams: true
            }));
        },
        onNextBtn: function() {
            var view_data = this.view_data;
            var data = view_data.data;

            if (data._step >= this.steps.length - 1) {
                return
            }
            data._step++;
            a.update();
            view_data.params.step = data._step;
            So.Gcmd.changeHash("drive/map", _.extend(view_data,{
                onlySetParams: true
            }));
        },
        startRoute: function(){
            var view_data = this.view_data;
            var data = view_data.data;
            data._step = 0;
            view_data.params.step = 0;
            So.Gcmd.changeHash("drive/map", _.extend(view_data,{
                mustChangeHash: true
            }));

        },
        visible: function(c) {
            if (this._visible == c) {
                var positionTop = $("#CTextDiv1").height() + 20;
                $(".mapToolsLefCon").css({"bottom": positionTop });
                $(".mapZoomCon").css({"bottom":positionTop });
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
                planSelectBox && planSelectBox.close();
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
        handleScroll: function(){
            var view_data = this.view_data;
            var data = view_data.data;
            var params = view_data.params;
            var paths = data.route.paths;


            //只有在列表模式下执行
            if(data._step != -1){
                return false;
            }
            var me = this;
            var calWidth = $(window).width();
            var iscroll;
            $('.drive_route_con').width( calWidth );
            $(".drive_route_con ul").css( "width", (calWidth * (paths.length + 1)) + 'px' );
            $(".drive_route_con ul li").css( "width", calWidth + 'px' );
            iscroll = new IScroll( '.drive_route_con',{
                scrollX: true,
                scrollY: false,
                snap: 'li',
                momentum: false,
                hScrollbar:false,
                vScrollbar: false,
                preventDefault:false
            });
            iscroll.on('scrollEnd',function(){
                var index = iscroll.currentPage.pageX;
                $('.drive_nav_list span').removeClass('active');
                $($('.drive_nav_list span').get(index)).addClass('active');
                setTimeout(function(){
                    me.showline(index, {from: 'scroll'});
                },0)
            });

            iscroll.goToPage(params.index,0,500);//将slide滚动到对应的slide

            So.simulationClick($('.drive_route_con'));
        },
        resize:function(d){
            this.handleScroll();
        }
    };

    return a;
});
