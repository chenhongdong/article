define(function(require) {
    var config = require('js/app/conf/config');
    (function(b) {
        var _map = {
            tpl:{
                GeoInfo: require('../../templates/GeoInfo.html')
            },
            _trafficLayer:null,
            temp:{//存储地图没加载时候设置的 级别、中心点，地图加载时会使用这个值
                zoom:0,
                xy:0
            },
            events:[],
            callbacks:[],//地图没加载时需要执行地图相关的操作的function，临时存储
            bindEvent: function(){
                _.each(_map.events, function(item, index){
                    a.mapObj.on(item.type, item.fun);
                })
            },
            updateGeo: function(opts) {
                opts = opts || {};
                var setCenter = opts.setCenter;
                var c = So.State.getLocation();
                if (c.state == 2) {
                    So.UIGeoError.show(So.Util.getGeoErrorInfo(c.error))
                } else {
                    if (c.state == 1) {
                        if(setCenter || location.hash.indexOf('displaylocation=0') == -1){
                            _map.showUserLocation(new so.maps.LatLng(c.y, c.x), c.address, c.acc, opts)    
                        }

                        $('body').trigger('change_map_center');
                    }
                }
            },
            showUserLocation: function(e, c, d, opts) {
                opts = opts || {};
                if(!d) return;
                var map = a.mapObj;
                var from = opts.from || '';
                //非手动定位成功后不移动地图中心店，防止 POI、路线检索完后，再定位成功切走地图视野
                if (a._visible && So.State.currentUI.name == 'search_index') {
                    So.UIMap.setZoomAndCenter(a.getZoomFromAccuracy(d), e)
                } else {
                    //map.setCenter(e)
                }
                if(from == 'homebtn'){
                    if (!a.geoIW) {
                        a.geoIW = new so.maps.Label({
                            map:map,
                            offset: new so.maps.Size(-78,-80),
                            style:{
                                border:0
                            },
                            visible:false,
                            position: e,
                            content: So.View.template(_map.tpl.GeoInfo, {
                                name: c,
                                acc: d,
                                x: e.lng,
                                y: e.lat
                            })
                        });

                        //a.geoIW.setSize(new so.maps.Size(200, 0))
                    } else {
                        a.geoIW.setContent(So.View.template(_map.tpl.GeoInfo, {
                            name: c,
                            acc: d,
                            x: e.lng,
                            y: e.lat
                        }));
                        a.geoIW.setPosition(e);
                        a.geoIW.setMap(map);
                    }
                    if(So.State.currentUI.name == 'search_index'){
                        a.geoIW.setVisible(true);
                    }else{
                          a.geoIW.setVisible(false);
                    }

                }
                
                
                //a.geoIW.open();
                if (!a.geoAC) {
                    a.geoAC = So.Util.createMarker("geoaccuracy", {
                        id: "locAccuracy",
                        pos: e,
                        acc: d
                    })
                } else {
                    a.geoAC.setRadius(d);
                    a.geoAC.setCenter(e)
                }
                if (!map.getOverlays(a.geoAC.id)) {
                    map.addOverlays(a.geoAC)
                }
                if (!a.geoMK) {
                    a.geoMK = So.Util.createMarker("geolocation", {
                        id: "locMarker",
                        pos: e
                    });
                    if(So.isIOS){
                        function orientationHandler(event) {
                            if(event.webkitCompassHeading){
                                a.geoMK.setAngle(360 - event.webkitCompassHeading) //指向北方向
                            }
                        }
                        if(window.DeviceOrientationEvent){
                            window.addEventListener('deviceorientation', orientationHandler, false);
                        }
                    }
                    a.geoMK.on("click", function() {
                        //a.geoIW.open(map, e);
                        //map.addOverlays(a.geoAC);
                        if (a.geoIW && !a.geoIW.visible) {
                            a.geoIW.setVisible(true);
                        }
                        if (a.geoAC && !a.geoAC.visible) {
                            a.geoAC.setVisible(true);
                        }
                    });
                    map.on("click", function() {
                        if (a.geoIW && a.geoIW.visible) {
                            a.hideUserLocation()
                        }
                    })
                } else {
                    a.geoMK.setPosition(e);
                }
                if (!map.getOverlays(a.geoMK.id)) {
                    map.addOverlays(a.geoMK)
                }
            }
        };
        var a = {
            hasInit: false,
            mapObj: null,
            mapId: "amap",
            ctrls: [".mapZoomin", ".mapZoomout", ".mapLocate"],
            geoIW: null,
            geoMK: null,
            geoAC: null,
            top:41,
            createMap: function(callback) {
                var me = this;
                var timer;
                require.async('//api.map.so.com/js/?callback=So___MapInt___',function(){
                    var _callback = function(){
                        callback && _.isFunction(callback) && callback();
                    };

                    if (a.hasInit == true) {
                        _callback();
                        return
                    }

                    window.So___MapInt___ = function(){
                        delete window.So___MapInt___;
                        a.hasInit = true;

                    var _temp = _map.temp;
                    var level = _temp.zoom || 13;
                    var center = (_temp.xy && new so.maps.LatLng(_temp.xy.y, _temp.xy.x)) || So.CityData.citylnglat();

                    var e = {
                        zoom: level,
                        minZoom:3,
                        doubleClickZoom: true,
                        scrollWheel: true,
                        dragEnable: true,
                        center: center,
                        //__hideCopyRight__:true,
                        __hideLogo__:true
                    };

                    if (window.devicePixelRatio >= 1.5) {
                            e.defaultTileLayer = new so.maps.TileLayer({
                            detectRetina: true
                        });
                        e.zooms = [3, 17]
                    }
                    me.mapObj = new so.maps.Map(me.mapId, e);

                    _map.bindEvent();

                    _callback();
                    So.Gcmd.addGeoWatcher(_map.updateGeo);
                    _map.updateGeo();

                    (function(){
                        var zoominCon = $('.maptools .mapZoomin');
                        var zoomoutCon = $('.maptools .mapZoomout');
                        me.mapObj.on('zoom_changed', function(){
                            var zoom = me.mapObj.getZoom();
                            var mapTypeId = me.mapObj.getMapTypeId();
                            if(mapTypeId == 'roadmap'){
                                if(zoom > 17){
                                    zoominCon.addClass('mapNoZoom');
                                }else{
                                    zoominCon.removeClass('mapNoZoom');
                                }

                                if(zoom < 2){
                                    zoomoutCon.addClass('mapNoZoom');
                                }else{
                                    zoomoutCon.removeClass('mapNoZoom');
                                }
                            }else{
                                if(zoom >= 21){
                                    zoominCon.addClass('mapNoZoom');
                                }else{
                                    zoominCon.removeClass('mapNoZoom');
                                }

                                if(zoom <= 19){
                                    zoomoutCon.addClass('mapNoZoom');
                                }else{
                                    zoomoutCon.removeClass('mapNoZoom');
                                }
                            }
                        })
                    })();

                    //执行地图加载之前需要执行的function
                    _.each(_map.callbacks, function(fun){
                        fun && _.isFunction(fun) && fun();
                    });
                    _map.callbacks = [];

                    };
                    
                });
            },
            bindEvent: function(type, fun){
                if(a.hasInit){
                    this.mapObj && this.mapObj.bind && this.mapObj.bind(this.mapObj, type, fun);
                }else{
                    _map.events.push({
                        type: type,
                        fun: fun
                    });
                }
            },
            setCenter:function(xy){
                if(a.hasInit){
                   xy = xy instanceof so.maps.LatLng ? xy : new so.maps.LatLng(xy.y,xy.x);
                   this.mapObj.setCenter(xy);
                }else{
                    _map.temp.xy = xy;
                }
            },
            setZoomAndCenter: function(zoom, xy){
                if(a.hasInit){
                   this.mapObj.setZoom(zoom, true);
                   xy = xy instanceof so.maps.LatLng ? xy : new so.maps.LatLng(xy.y,xy.x);
                   this.mapObj.setCenter(xy);
                }else{
                    _map.temp.zoom = zoom;
                    _map.temp.xy = xy;
                }
            },
            getCenter: function() {
                return this.mapObj.getCenter()
            },
            getObj: function() {
                return this.mapObj
            },
            clearMap: function() {
                if(!this.mapObj){
                    return;
                }
                var overlays = this.mapObj.getOverlays();
                So.Util.removeOverlays(this.mapObj,overlays);
                //this.mapObj.clearOverlays();
                //this.mapObj.clearInfoWindow()
            },
            visible: function(c) {
                if (this._visible == c) {
                    return
                }
                //校准div liweifix
                //$("#header_topbar").show();
                var positionTop = $("#CTextDiv1").height() + 20;
                $("#mapRoute").hide();
                $(".mapToolsLefCon").css({"bottom": positionTop });
                $(".mapZoomCon").css({"bottom":positionTop });

                if(c){
                    $('body').addClass('view-mode-map');
                }else{
                    $('body').removeClass('view-mode-map');
                }

                //
                this._visible = c;
                var d = c ? "visible" : "hidden";
                $("#mapDiv").css("visibility", d);
                $("#amap").css({
                    "width": "100%",
                    "height": "100%"
                });
            },
            setMapHeight: function(c) {
                // if (this.lastHeight == c) {
                //     return
                // }
                // this.lastHeight = c;
                // var d = document.getElementById(this.mapId);
                // d.style.width = "100%";
                // var width = $("#bodyMain").width() - 2;
                // //d.style.width = width + "px";
                // if (!So.Util.isIE()) {
                //     document.body.scrollWidth = "100%"
                // }
                // if(So.State.currentUI && So.State.currentUI.name == 'search_map'
                //     && !/mso_app/i.test(navigator.userAgent)){
                //     d.style.height = c + "px";
                // }else{
                //      d.style.height = c + "px";
                // }
                // d = document.getElementById("mapDiv");
                // //d.style.width = "100%";
                // return
            },
            getZoomFromAccuracy: function(d) {
                var c = 16;
                if (d <= 150) {
                    c = 17
                } else {
                    if (d <= 300) {
                        c = 16
                    } else {
                        if (d <= 600) {
                            c = 15
                        } else {
                            if (d <= 1400) {
                                c = 14
                            } else {
                                if (d <= 2800) {
                                    c = 13
                                } else {
                                    if (d <= 4400) {
                                        c = 12
                                    } else {
                                        if (d <= 8000) {
                                            c = 11
                                        } else {
                                            if (d <= 16000) {
                                                c = 10
                                            } else {
                                                c = 9
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return c
            },
            hideUserLocation: function() {
                if (this.geoIW) {
                    this.geoIW.setVisible(false);
                }
                if (this.geoAC) {
                    this.geoAC.setVisible(false);
                }
            },
            addTileLayer_TRAFFIC: function() {
                var me = this;
                var addTile = function(){
                    _map._trafficLayer = new so.maps.TrafficLayer({
                        map: me.mapObj,
                        isTansparentPng: true
                    });
                };

                if(!this.mapObj){
                    _map.callbacks.push(addTile);
                }else{
                    addTile();
                }
            },
            removeTileLayer_TRAFFIC: function() {
                _map._trafficLayer.setMap(null);
            },
            zoomIn: function() {
                if(!this.mapObj){
                    return;
                }
                this.mapObj.zoomBy(1);
                if (So.State.trafficeOn) {
                    this.removeTileLayer_TRAFFIC();
                    this.addTileLayer_TRAFFIC()
                }
            },
            zoomOut: function() {
                if(!this.mapObj){
                    return;
                }
                this.mapObj.zoomBy(-1);
                if (So.State.trafficeOn) {
                    this.removeTileLayer_TRAFFIC();
                    this.addTileLayer_TRAFFIC()
                }
            },
            hasOverlays: function() {
                if(!this.mapObj){
                    return;
                }
                var d = this.mapObj.getOverlaysByType("marker");
                var e = this.mapObj.getOverlaysByType("polyline");
                var c = this.mapObj.getOverlaysByType("infowindow");
                return d.length + e.length + c.length > 0 ? true : false
            },
            // @api 自适应函数，需要处理circle，path等类型
            setFitView: function (overlays, opts) {
                if (_.isEmpty(overlays)) {
                    return false;
                }

                if (! _.isArray(overlays)) {
                    overlays = [overlays];
                }

                // filter markers, something such as ..., unvisible obj
                var right = [], len = overlays.length;
                for ( var i = 0; i < len; i++) {
                    if (overlays[i] && (overlays[i].getPosition || overlays[i].getBounds || overlays[i].getPath)) {
                        // unvisible
                        if (overlays.getVisible && ! overlays.getVisible()) {
                            continue;
                        }

                        right.push(overlays[i]);
                    }
                }

                if (! right.length) {
                    return false;
                }

                var bounds = new so.maps.LatLngBounds();

                overlays = right;
                len = overlays.length;

                for ( var i = 0; i < len; i++) {
                    if (overlays[i].getPosition) {
                        bounds.extend(overlays[i].getPosition());
                    }
                    if (overlays[i].getBounds) {
                        bounds.union(overlays[i].getBounds());
                    }
                    //
                    // if(overlays[i].getPath){
                    //     var _path = overlays[i].getPath();
                    //     _path.forEach(function(ele, index){
                    //         bounds.extend(ele);
                    //     })
                    // }
                }
                var me = this;

                // 添加一个padding值 避免icon在视窗外
                this.setBounds(bounds, false, opts);

                //liwei fix 横竖屏幕修改
            },

            setBounds: function (bounds, zoom, opts) {
                opts = opts || {};
                var top = opts.all || opts.top || 10;
                var left = opts.all || opts.left || 10;
                var right = opts.all || opts.right || 10;
                var bottom = opts.all || opts.bottom || 10;
                if (!(bounds instanceof so.maps.LatLngBounds)) {
                    bounds = this.formatBounds(bounds);
                }

                var self = this;
                // 不添加setTimeout 会在ie6、7、8下卡死
                //setTimeout(function(){
                    self.getObj().fitBounds(bounds, zoom, {top:top, left:left, right:right, bottom:bottom});
                //}, 0);

                return bounds;
            }
        };
        So[b] = a
    })("UIMap");
});
