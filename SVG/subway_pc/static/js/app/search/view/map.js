define(function(require) {
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').detail;
    var tempIndex,is,qt = 0;
    var map;
    //切换地图中心点到00，防止地图中心点闪动;
    //So.UIMap.setCenter({x:0,y:0});
    var a = {
        _visible: false,
        _init: false,
        tpl:{
            map_top: require('../../../templates/search/map_top.html'),
            map_bottom: require('../../../templates/search/map_bottom.html')
        },
        name: "search_map",
        logname: "poimappage",
        mPrefix: "poimap_",
        containMap: true,
        _overlays: [],
        command: So.Command.CitySearch,
        prepare: function(view_data) {

            map = So.UIMap.getObj();

            $("#header_topbar").hide();
            this.view_data = view_data;
            var data = this.view_data.data,
                params = this.view_data.params,
                keyword = params._keyword || params.keyword || '';

            if(_.isUndefined(view_data.index)){
                view_data.index = 0;
            }
            view_data.name = view_data.name || keyword;

            //设置输入框内容
            $('#header-nav-query').val(keyword).prev().hide();

            this.prepareInfo();
            this.prepareMap();
            this.updateCenter(this._overlays);
        },
        prepareInfo: function() {
            var view_data = this.view_data;

            var e = this.filterData();
            var c = view_data.index;
            var params = this.view_data.params;
            this.poiList = e.poi;
            //fix by liwei========================
            if(!e.poi||e.poi.length == 0){
                //无结果时去列表页;
                this.cmd({id:4});
                return;
            }
            $("#CTextDiv").html(So.View.template(this.tpl.map_top, {
                name: e.keyword || params._keyword,
                show_result_header_bar: show_result_header_bar,
                isMapMode : config.isMapMode,
                hideList: !!params.ids
            }));
        },
        //修改地图部分的图标和div的position在退出地图时候重置为起始的
        adjustDiv:function(force){
            if(!force){//this.isFixed()&&
                
            }else{
                if(is){is.destroy();is = null;}
                So.UIMap.visible(false);
            }
        },
        prepareMap: function() {
            var view_data = this.view_data;
            var d = this.filterData();
            var c = view_data.index;

            if (this._overlays.length > 0) {
                map.removeOverlays(this._overlays);
                this._overlays = []
            }
            _.each(d.poi, function(j, h) {
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
            tempIndex = 0;//记录下目前index是多少
        },
        createMarker: function(info, d) {
            var mk = So.Util.createMarker("poi", info);
            var me = this;
            mk.on("click", function() {
                //临时处理click触发两次bug;
                var click_time = Date.now() || (new Date).getTime();
                var last_click_time = mk.click_time;
                if(last_click_time && (click_time - last_click_time < 100)){
                    return false;
                }
                mk.click_time = click_time;

                if(So.showLiveTraffic){
                    me.resize();
                    So.showLiveTraffic = false;
                }else{
                    me.update(d, false);
                }
            });
            return mk;
        },
        filterData: function(){
            var data = _.extend({},this.view_data.data),
                fold = data.fold || 10;


            data.poi = data.poi.slice(0, fold);

            return data;
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
        //处理下方的slide滚动条，每次resize的时候都会调用
        handleScroll:function(){
            if(is){is.destroy();is = null;}
            var view_data = this.view_data;
            var e = this.filterData();
            $("#CTextDiv1").html(So.View.template(this.tpl.map_bottom, {
                name:e.keyword,
                pois:e.poi,
                index: 'ABCDEFGHIJ'
            }));
            var calWidth = $(window).width();
            $('#fix-swipe-wrapper').width( calWidth );
            $("#scroller").css( "width", ((calWidth-25) * e.poi.length + 40) + 'px' );
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
            is.goToPage(tempIndex,0,500);


            var btnbannerTop = $('.fix-banner-top');
            So.simulationClick(btnbannerTop,function(){
                So.Gcmd.cmd({id:3});
            })

            var btnAround = $('.slide-bottom .slide-around-text');
            So.simulationClick(btnAround,function(){
                var btn = $(this);
                var mp = btn.data('mp');
                var local = btn.data('local')
                location.hash = '#search/categories/local='+encodeURIComponent(local)+'&mp='+mp;
            })
            var btnEnd = $('.slide-bottom .slide-end-text');
            So.simulationClick(btnEnd,function(){
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
            })
            var btnTel = $('.slide-bottom .slide-tel-text');
            So.simulationClick(btnTel,function(){
                var btn = $(this);
                var tel = btn.data('tel');
                So.Gcmd.cmd({
                        id:777,
                        tel:tel
                    });
            })
            var btnIndoor = $('.slide-bottom .slide-indoor-text');
            So.simulationClick(btnIndoor,function(){
                So.Gcmd.cmd({
                        id:9
                    });
            })
        },
        checkScroll:function(e){//更新滚动后的地图
            if(tempIndex == this.currentPage.pageX)return;
            a.update(this.currentPage.pageX,true);
        },
        clearMap: function() {
            So.UIMap.clearMap();
            this._overlays = []
        },
        update: function(index, panto) {
            if (index < 0 || index > this.poiList.length - 1) {
                return
            }

            var view_data = this.view_data;
            var data = view_data.data;

            var pre_index = view_data.index;
            var poi = data.poi[index];
            var pre_mk = map.getOverlays(this.mPrefix + pre_index);
            var pre_zIndex = pre_mk.getZIndex();
            var pre_zIndex_new = pre_zIndex - 100;
            var cur_mk = map.getOverlays(this.mPrefix + index);
            var cur_zIndex = cur_mk.getZIndex();
            var cur_zIndex_new = cur_zIndex + 100;

            cur_mk.setIcon(So.Util.createIcon('poiSelect', index));
            cur_mk.setZIndex(cur_zIndex_new);
            pre_mk.setIcon(So.Util.createIcon('poi', pre_index));
            pre_mk.setZIndex(pre_zIndex_new);

            view_data.index = index;

            is.goToPage(index,0,500);//将slide滚动到对应的slide
            // if(this.isFixed()){
            //     this.is.goToPage(index,0,500);
            // }else{
            //     this.prepareInfo();
            // }
            if (panto) {
                map.panTo(new so.maps.LatLng(poi.y, poi.x))
            }
            tempIndex = index;//更新index
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
                // case 0:
                //     a.update(view_data.index - 1, true);
                //     break;
                // case 1:
                //     a.update(view_data.index + 1, true);
                //     break;
                case 12://左上角后退
                    a.adjustDiv(true);
                    // if(this.isFixed()){
                    //     So.Gcmd.changeHash("search/nearby",{});
                    //     return;
                    // }
                    window.history.back();
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
                case 4://进入到list
                    clearTimeout(qt);
                    qt = setTimeout(this.quitToList,300);
                    break;
                case 7://进入路线规划
                    if(!map_plugin_installed){
                        a.adjustDiv(true);
                    }
                    // monitor.click.end()
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
                        if (0) {
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
        quitToList:function(){
            a.adjustDiv(true);
            var view_data = this.view_data;
            var c = this.command;
            So.Gcmd.changeHash("search/list", {
                data: a.view_data.data,
                params: a.view_data.params,
                command:a.command
            });
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
            this.handleScroll();//重置slide保证在resize的时候尺寸合适
            this.adjustDiv();            
        },
        isFixed:function(){
            var view_data = this.view_data;
            switch(view_data.data.keyword){
                default:
                return false;
                break;
                case "违章高发地":
                case "ATM":
                case "厕所":
                return true;
                break;
            }
        }
    };
    return a;
});
