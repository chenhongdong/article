define(function(require) {
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor');
    var listContent = require('js/app/search/view/list_con');
    var tempIndex,is,qt = 0;
    var map;
    var urlArgs = So.urltojson(location.href);
    //切换地图中心点到00，防止地图中心点闪动;
    //So.UIMap.setCenter({x:0,y:0});
    var a = {
        _visible: false,
        _init: false,
        tpl:{
            map_top: require('../../../templates/search/map_top.html'),
            map_bottom: require('../../../templates/search/map_detail_bottom.html'),
            poi_item: require('../../../templates/search/list_item.html')
        },
        name: "search_mapdetail",
        logname: "poimappage",
        mPrefix: "poimap_",
        containMap: true,
        _overlays: [],
        el: '#CTextDiv1',
        command: So.Command.CitySearch,
        prepare: function(view_data) {

            map = So.UIMap.getObj();

            $("#header_topbar").hide();
            this.view_data = view_data;
            var data = this.view_data.data,
                params = this.view_data.params,
                keyword = params._keyword || params.keyword || '',
                fold = data.page == 1 && _.isNumber(data.fold) && data.fold ? data.fold : data.poi && data.poi.length || command.pageSize;

            if(_.isUndefined(view_data.index)){
                view_data.index = 0;
            }
            view_data.name = view_data.name || keyword;

            //设置输入框内容
            $('#header-nav-query').val(keyword).prev().hide();

            this.prepareInfo();
            this.prepareMap({
                showoutline: fold <= 3 && data.poi[0].bounds//当有折叠并且第一条数据有轮廓，则显示轮廓
            });
            this.updateCenter(this._overlays);

            //android 下到这里去展示量
            if(config.ISANDROID){
                monitor.detail.disp.mapp_download_goto();
            }
        },
        prepareInfo: function() {
            var view_data = this.view_data;

            var data = view_data.data;
            var c = view_data.index;
            var params = this.view_data.params;
            var me = this;
            var title = data.keyword || params._keyword;
            var address = '';
            var time = '';
            var year;
            var month;
            var day;
            var hour;
            var minute;
            this.poiList = data.poi;
            //fix by liwei========================
            if(!data.poi||data.poi.length == 0){
                //无结果时去列表页;
                this.cmd({id:4});
                return;
            }
            if(params.style == '1' && params.t && params.t.length == 13 && !Number.isNaN(Number(params.t))){
                time = new Date(Number(params.t))
                year = time.getFullYear();
                month = time.getMonth() + 1;
                day = time.getDate();
                hour = time.getHours();
                minute = time.getMinutes();

                month = month < 9 ? '0' + month : month;
                day = day < 9 ? '0' + day : day;
                hour = hour < 9 ? '0' + hour : hour;
                minute = minute < 9 ? '0' + minute : minute;

                time = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
                data.poi[0].name = '停车地点('+ data.poi[0].name +'附近)'

                me.showParking = true;
            }

            if(data.poi.length == 1){
                title = data.poi[0].name
                address = data.poi[0].address
            }            
            
            $("#CTextDiv").html(So.View.template(this.tpl.map_top, {
                name: title,
                address: address,                
                show_result_header_bar: show_result_header_bar,
                isMapMode : config.isMapMode,
                hideList: !!params.ids
            }));

            var list_htmls = [];

            _.each(data.poi, function(poi, index){
                var list_item = me.tpl.poi_item;

                poi.index = 0;
                poi.fdistance = So.Util.formatDistance1(poi.distance);

                //公交数据过滤
                if(poi.busline && poi.busline.length){
                    var _busline = [],
                        _busline_obj = {};

                    _.forEach(poi.busline, function(val, key){
                        if(!_busline_obj[val.name]){
                            _busline_obj[val.name] = 1;
                            _busline.push(val);
                        }
                    })

                    poi.busline = _busline;
                }

                var listItemCon = me.getListItemCon(poi,data);

                //违章高发单独使用一套模板
                list_htmls.push(So.View.template(list_item,{
                    poi: poi,
                    time: time,
                    twoLineInfo: listItemCon.twoLineInfo,
                    barInfo: listItemCon.barInfo,
                    showtools: true
                }));
            });

            $("#CTextDiv1").html(So.View.template(this.tpl.map_bottom, {
                list_item: list_htmls.join('')
            }));
        },
        events:{
            'click .tools-container .around': 'clickAround',
            'click .tools-container .router': 'clickRouter'
        },
        clickAround: function(){
            var btn = $(this);
            var mp = btn.data('mp');
            var local = btn.data('local')
            location.hash = '#search/categories/local='+encodeURIComponent(local)+'&mp='+mp;
        },
        clickRouter: function(){
            var btn = $(this);
            var name = btn.data('name');
            var x = btn.data('x');
            var y = btn.data('y');
            var address = btn.data('address');
            So.Gcmd.cmd({
                    id:7,
                    name:name,
                    x:x,
                    y:y,
                    address:address
                });
        },
        //修改地图部分的图标和div的position在退出地图时候重置为起始的
        adjustDiv:function(force){
        },
        prepareMap: function(params) {
            params = params || {};
            var view_data = this.view_data;
            var data = view_data.data;
            var c = view_data.index;
            var showoutline = params.showoutline || false;
            var me = this;

            if (this._overlays.length > 0) {
                map.removeOverlays(this._overlays);
                this._overlays = []
            }
            _.each(data.poi, function(j, h) {
                j.markerid = a.mPrefix + h;
                j.flag = h;
                if (h == c) {
                    j.highlight = true
                } else {
                    j.highlight = false
                }
                var g = a.createMarker(j, h);
                a._overlays.push(g)
            });
            map.addOverlays(this._overlays);
            if(showoutline){
                me.showOutline();
            }
            tempIndex = 0;//记录下目前index是多少
        },
        showOutline: function(){
            var data = this.view_data.data,
                areas = data.poi[0].bounds,
                coords = areas.split(';'),
                path = [],
                polygon;

            for (var n = coords.length, j = 0; j < n; j++) {
                var coord = coords[j].split(',');
                var latlng = new so.maps.LatLng(coord[0], coord[1]);
                path.push(latlng);
            }

            polygon = new so.maps.Polygon({
                    id: 'outline_polygon',
                    map: map,
                    path: path,
                    strokeColor: '#7299e4',
                    strokeWeight: 2,
                    fillColor: '#7299e4',
                    fillOpacity: 0.3,
                    cursor: 'default'
                });

            this._overlays.push(polygon);
        },
        createMarker: function(info, d) {
            var mktype = 'poi';

            if(this.showParking){
                mktype = 'parking'
            }
                
            var mk = So.Util.createMarker(mktype, info);
            return mk;
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CTextDiv").css("display", d);
            $("#CTextDiv1").css("display", d);
            So.UIMap.visible(c);
            if (c) {
                $("body").addClass("search-map-ids");
                So.UIMap.hideUserLocation()
            } else {
                $("body").removeClass("search-map-ids");
                if (c == false && this._overlays.length > 0) {
                    a.clearMap()
                }
                $("#CTextDiv1").css({"width":"auto"});
            }
        },
        clearMap: function() {
            So.UIMap.clearMap();
            this._overlays = []
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


            if(params_loc[0] && params_loc[1]){
                position = {x:params_loc[1],y:params_loc[0]};
            }

            if(use_loc_state){
                position = geolocation;
                user_address = geoaddress;
            }

            switch (c.id) {
                case 12://左上角后退
                    a.adjustDiv(true);
                    // if(this.isFixed()){
                    //     So.Gcmd.changeHash("search/nearby",{});
                    //     return;
                    // }
                    window.history.back();
                    break;
                case 2:
                    var _data = data.poi[c.index] || {},
                        _detail_src = urlArgs.src || 'map_wap';

                    _data.firstCity = data.firstCity;
                    //测试地址，上线时请切回正式地址http://m.map.so.com
                    var openType = window.__targetBlank__ ? '_blank' : '_self',
                        href = c.href || '//m.map.so.com/onebox/?type=detail&id='+_data.pguid+'&mso_x='+ position.x+'&mso_y='+position.y+'&d=mobile&src=' + _detail_src + '&fields=movies_all';

                    monitor.search.click.list({
                        mod: 'search_list',
                        type: 'godetail',
                        detil: c.href ? 'coupon' : 'poi'
                    })

                    //在身边生活APP中详情页跳转至APP详情页
                    if(config.detailToApp){
                        console.log('360around://com.qihoo.around.poidetail/?pguid=' + _data.pguid);
                        return;
                    }

                    if(config.detailToApp1){
                        console.log('360shenbian://com.qihoo.shenbian.poidetail/?pguid=' + _data.pguid);
                        return;
                    }

                    //详情页全部切换至 detail
                    setTimeout(function(){window.open(href, openType);},100);
                    break;
                case 3://进入detail
                    var index = view_data.index,
                        _data = data.poi[index];

                    var loc = So.State.getLocation();

                    //在身边生活APP中详情页跳转至APP详情页
                    if(config.detailToApp){
                        console.log('360around://com.qihoo.around.poidetail/?pguid=' + _data.pguid);
                        return;
                    }
                    if(config.detailToApp1){
                        console.log('360shenbian://com.qihoo.shenbian.poidetail/?pguid=' + _data.pguid);
                        return;
                    }
                    window.location.href = '//map.so.com/onebox/?type=detail&id='+_data.pguid+'&mso_x='+ loc.x+'&mso_y='+loc.y+'&d=mobile';
                    break;
                case 7://进入路线规划
                    if(!map_plugin_installed){
                        a.adjustDiv(true);
                    }
                    // monitor.detail.click.end()
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
                        if (0) {
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
                        //android 下到这里去点击量（定位成功后）
                        if(config.ISANDROID){
                            monitor.detail.click.mapp_download_goto();
                        }
                        if (0) {
                            So.goToHere(user_address, position.x, position.y, c.name, c.x, c.y, routeType, 'wap_map_list');
                        } else {
                            So.callNative(c, {
                                view:'tohere'
                            });
                            
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
                                        autosearch: 1,
                                        src: "map_detail_goto"
                                    }
                            });
                        }
                    }
                    break;
                case 9:
                    var index = view_data.index;
                    var poi_data = data.poi[index];
                    var ext = poi_data.ext;
                    So.Gcmd.changeHash('search/indoor', {
                        params:{
                            bid:ext.bid,
                            bounds:ext.bounds,
                            floors: ext.floors+'',
                            center:poi_data.y + "," +poi_data.x,
                            currentFloor:'F1'
                        }
                    });
                    break;
                case 777:
                    window.location.href = 'tel:' + c.tel;
                    break;
            }
        },
        updateCenter: function(overlays) {
            if(!overlays){
                return;
            }

            var view_data = this.view_data;

            var _selectPoi = view_data._selectPoi;

            overlays = _.isArray(overlays) ? overlays : [overlays];
            if(overlays.length > 1){
                So.UIMap.setFitView(overlays,{'top':50,'bottom':100});
            }else{
                So.UIMap.setZoomAndCenter(16, overlays[0].getPosition())
            }

            _selectPoi && map.setCenter(new so.maps.LatLng(_selectPoi.y, _selectPoi.x))
        },
        fitMapView: function(){
            var me = this;
            setTimeout(function(){
                me._overlays && me.updateCenter(me._overlays);
            },300)
        },
        mapheight: function(d) {
            return $(window).height();
        },
        resize:function(d){
        }
    };

    _.extend(a,listContent);

    return a;
});
