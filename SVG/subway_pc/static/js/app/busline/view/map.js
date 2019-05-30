define(function(require) {
    var config = require('js/app/conf/config');
    var command = require('js/app/busline/busline-command');
    var monitor = require('js/app/monitor').detail;
    var tempIndex,is;
    var a = {
        _visible: false,
        _init: false,
        tpl:{
            map_top: require('../../../templates/busline/map_top.html'),
            map_bottom: require('../../../templates/busline/map_bottom.html')
        },
        name: "busline_map",
        logname: "buslinemappage",
        containMap: true,
        _overlays: [],
        routeColor: "#0e7af3",
        routeWidth: 6,
        routeOpacity: 0.9,
        _fitViewOverlays:'',
        command: command,
        prepare: function(view_data) {
            this.view_data = view_data;
            var me = this,
                data = me.view_data.data,
                params = me.view_data.params;

            //默认参数填充;
            params.index = +params.index || 0;
            params.station = params.station != null ? +params.station : -1;

            var index = params.index;

            if (index >= 0 && index < data.busline.length) {
                this.busline = data.busline[index];
            }
            this._lastIndex = -1;
            // prepare info
            $("#CTextDiv").html(So.View.template(this.tpl.map_top, {
                name:this.busline.name
            }));
            // prepare map
            this.prepareMap().update( params.station );
        },
        getLngLat: function(c, d) {
            c = parseFloat(c);
            d = parseFloat(d);
            return new so.maps.LatLng(d, c)
        },
        getId: function(c, d) {
            if (c == "poly") {
                return "buslinepoly_" + d
            } else if (c == "marker") {
                return "buslinemk_" + d
            } else {
                return d
            }
        },
        prepareMap: function() {
            So.UIMap.clearMap();
            var self = this,
                data = this.busline,
                o = [],
                c = [],
                len;
            _.each(data.xs, function(h, i) {
                c.push(self.getLngLat(h, data.ys[i]));
            });
            o.push(new so.maps.Polyline({
                id: this.getId("poly", 0),
                path: c,
                strokeColor: this.routeColor,
                strokeOpacity: this.routeOpacity,
                strokeWeight: this.routeWidth,
                strokeStyle: "solid"
            }));
            len = data.stations.length - 1
            data.stations.forEach(function (n, index) {
                if( index === 0 || index === len ){
                    q = So.Util.createMarker('startend', {
                        id: self.getId("marker", index),
                        position: self.getLngLat(n.x, n.y),
                        flag: index === 0 ? 'start' : 'end'
                    });
                }else {
                    q = So.Util.createMarker('linestation', {
                        id: self.getId("marker", index),
                        pos: self.getLngLat(n.x, n.y)
                    });
                }
                o.push(q);
            });
            var map = So.UIMap.getObj();
            //map.clearOverlays();
            var overlays = map.getOverlays();
            So.Util.removeOverlays(map,overlays);
            a._overlays = o;
            map.addOverlays(o);
            this.updateCenter(o);
            this._fitViewOverlays = o;
            return this;
        },
        update: function( station ) {
            var me = this,
                view_data = me.view_data,
                params = view_data.params;
                station =  typeof station === 'undefined' ? params.station : station;

            var f = So.UIMap.getObj();
            if(_.isNumber(this._lastIndex) && this._lastIndex > 0){
                f.removeOverlays("BSL" + this._lastIndex);
            }
            this._lastIndex = station;
            var g = this.busline.stations;
            var _viewOverlays = this._overlays;
            if (this._lastIndex >= 0 && this._lastIndex < g.length) {
                var d = g[this._lastIndex];
                if(this._lastIndex > 0){
                    f.addOverlays(So.Util.createMarker("curlinestation", {
                        markerid: "BSL" + this._lastIndex,
                        highlight: false,
                        x: d.x,
                        y: d.y,
                    }));
                }
                _viewOverlays = me._overlays[me._lastIndex + 1];
            }
            this.updateCenter(_viewOverlays);
            _viewOverlays && (this._fitViewOverlays = _viewOverlays);
            tempIndex = station;//更新index
        },
         //处理下方的slide滚动条，每次resize的时候都会调用
        handleScroll:function(){
            if(is){is.destroy();is = null;}
            var calWidth = $(window).width();
            $("#CTextDiv1").html(So.View.template(this.tpl.map_bottom, {
                name: this.busline.name,
                startname: this.busline.startname,
                endname: this.busline.endname,
                starttime: this.busline.starttime.slice(0,2) + ':' + this.busline.starttime.slice(2),
                endtime: this.busline.endtime.slice(0,2) + ':' + this.busline.endtime.slice(2),
                totalprice: this.busline.totalprice,
                stations: this.busline.stations
            }));

            $('#fix-swipe-wrapper').width( calWidth );
            $("#scroller").css( "width", ((calWidth-25) * ( this.busline.stations.length + 1 ) + 40) + 'px' );
            $(".slide").css("width", (calWidth-30) + 'px');

            is = new IScroll( '#fix-swipe-wrapper',{
                scrollX: true,
                scrollY: false,
                snap: '.slide',
                momentum: false,
                hScrollbar:false,
                vScrollbar: false,
                preventDefault:false
            });
            is.on('scrollEnd',this.checkScroll);
            is.goToPage( tempIndex + 1, 0, 0 );

            

            var btnAround = $('.slide-bottom .slide-around-text');
            So.simulationClick(btnAround,function(){
                var btn = $(this);
                var mp = btn.data('mp');
                location.hash = '#search/categories/_=809445&mp='+mp;
            })
            var btnEnd = $('.slide-bottom .slide-end-text');
            So.simulationClick(btnEnd,function(){
                var btn = $(this);
                var name = btn.data('name');
                var x = btn.data('x');
                var y = btn.data('y');
                var address = btn.data('address');
                So.Gcmd.cmd({
                        id:3,
                        name:name,
                        x:x,
                        y:y,
                        address:address
                    });
            });

            a.adjustDiv();
        },
        //更新滚动后的地图
        checkScroll:function(e){
            if(tempIndex == this.currentPage.pageX - 1) return;
            a.update( this.currentPage.pageX - 1, true );
        },
        updateCenter: function(overlays) {
            overlays = _.isArray(overlays) ? overlays : [overlays];
            So.UIMap.setFitView(overlays);
        },
        clearMap: function() {
            So.UIMap.clearMap();
            this._overlays = []
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var _display = c ? "block" : "none";
            $("#CTextDiv").css("display", _display);
            $("#CTextDiv1").css( { "display": _display, 'height': 112 });
            So.UIMap.visible(c);

            if (c) {
                So.UIMap.hideUserLocation()
            } else {
                if (c == false) {
                    a.clearMap()
                }
            }
        },
        cmd: function(c) {
            var view_data = this.view_data,
                data = view_data.data,
                params = view_data.params,
                params_mp = params.mp || '',
                params_loc = params_mp.split(','),
                use_loc_state = params.use_loc_state || 0,
                geolocation = So.State.getLocation(true),
                geoaddress = '您现在的位置('+So.Util.subByte(geolocation.address,16)+')',
                position = '',
                user_address = '您现在的位置';

            var map_plugin_installed = config.getMapPluginInstalled().plugin;

            switch (c.id) {
                case 2:
                    window.history.back();
                    break
                case 3://进入路线规划
                    if(!map_plugin_installed){
                        a.adjustDiv(true);
                    }
                    var currentCity =  So.CityData.citycode();
                    var nav_type = parseInt(So.Cookie.get('nav_type')) || 1;
                    if (currentCity != data.firstCity) {
                        nav_type = 2;
                    }
                    var routeTypes = {
                        '1': 'bus',
                        '2': 'drive',
                        '3': 'walk'
                    };
                    var routeType = routeTypes[nav_type];

                    if(!position || (use_loc_state && geolocation.state != 1)){ //定位成功直跳
                        //王维强&赵洪乐 要求，取消进入导航APP
                        if (0 && map_plugin_installed) {
                            So.goToHere('', '', '', c.name, c.x, c.y, routeType, 'wap_map_list');
                        } else {
                            So.Gcmd.changeHash('route/index', {
                                params: {
                                    end: {
                                        name: c.name || c.address,
                                        x: c.x,
                                        y: c.y
                                    }
                                }
                            });
                        }
                    }else{
                        //王维强&赵洪乐 要求，取消进入导航APP
                        if (0 && map_plugin_installed) {
                            So.goToHere(user_address, position.x, position.y, c.name, c.x, c.y, routeType, 'wap_map_list');
                        } else {
                            So.Gcmd.changeHash("route/index", {
                                params: {
                                    start: {
                                        name: user_address,
                                        x: position.x,
                                        y: position.y
                                    },
                                    end: {
                                        name: c.name || c.address,
                                        x: c.x,
                                        y: c.y
                                    },
                                    city: currentCity,
                                    autosearch: 1
                                }
                            });
                        }
                    }
                    break;
            }
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
            this.handleScroll()
        },
        //修改地图部分的图标和div的position在退出地图时候重置为起始的
        adjustDiv:function(force){
            if(force){
                if(is){
                    is.destroy();
                    is = null;
                }

                So.UIMap.visible(false);                
            }
        },
    };

    return a;
});
