define(function(require) {
    var config = require('js/app/conf/config');
    require('./search-service');
    require('./view/list_con');
    var PoiSearch = So.Command.Base.extend({
        init: function(a) {
            this._super.apply(this,Array.prototype.slice.call(arguments,0));

            this.keyword = this._params.keyword;
            this.page = (this._params.page = a.page) || 1;
            this.pageSize = (this._params.pageSize = a.pageSize) || 10;
            this.radius = this._params.radius = a.radius || '';
            this.filter = this._params.filter = a.filter || '';
            this.price = this._params.price = a.price || '';
            this.star = this._params.star = a.star || '';
            this.isLoading = false;
        },
        pre: function() {
            if(this.isLoading || this.page == 1){
                return;
            }
            this.isLoading = true;
            this.page--;
            this.run({
                _from: 'pager'
            });            
        },
        next: function() {
            if(this.isLoading){
                return;
            }
            this.isLoading = true;
            this.page++;
            this.run();
        }
    });

    So.Command.CitySearch = PoiSearch.extend({
        _run: function() {
            
            var me = this,
                loc = So.State.getLocation(),
                _params = me._params,
                _has_city = !!_params.city;


            //优先使用params指定的city，如果没指定时使用定位信息中的城市，没定位信息时使用城市信息;
            //传了mp没传city时不传city，防止city跟mp不一致
            this._params.city = _params.city || (!_params.mp ? loc.city : '');

            me._params.mp = _params.mp || window.__clientMsoXY__ && window.__clientMsoXY__.x && window.__clientMsoXY__.y &&(window.__clientMsoXY__.y + ',' + window.__clientMsoXY__.x) || (!_has_city && (loc.y + ',' + loc.x)) || '';
            


            //config.isMapMode = modeType && (modeType=='map');
            if(config.isMapMode){
                me._params['_modeType'] = 'map';
            }else{
                if(me._params['_modeType'] == 'map'){
                    //开启地图模式
                    config.setApptoMapMode();
                }
            }

            var city = _params.city;
            var cityid = _params.cityid;
            var b = !_.isUndefined(_params.qii) ? _params.qii : config.QII;
            var cityname = _params.cityname || _params.city;
            var mp = _params.mp;
            var sort = _params.sort;
            var order = _params.order;
            var filter = _params.filter;
            var price = _params.price;
            var star = _params.star;
            var ids = _params.ids;
            var src = _params.src;
            var filter_adcode = _params.filter_adcode;
            var usermp = _params.usermp;
            var business_area = _params.business_area;
            var business_name = _params.business_name;
            var modeType= _params.modeType;
            var view = _params.view;

            if(!(me._view_params.from && me._view_params.from == 'scrollLoad')){
                if(this.keyword){
                    So.Waiting.show("正在搜索 " + this.keyword);    
                }
            }

            var kw = _params.keyword||"";//分辨不同的类型

            var callback = function(data) {
                var changeCity = function(h) {
                    So.CityData.setCity(h.name, h.adcode, h.x, h.y);

                    var name = '';
                    try{
                        name = decodeURIComponent(h.name);
                    }catch(e){
                        name = h.name;
                    }
                    So.State.setLocation({
                        state: 0,
                        acc: '',
                        x: h.x,
                        y: h.y,
                        city: h.city,
                        address: h.city
                    });
                    
                    So.UIMap.clearMap();

                    var zoomlevel = 11;
                    if (h.type == '地名地址信息;行政地名;省级地名') {
                        zoomlevel = 9;
                    }
                    if (h.type == '地名地址信息;行政地名;国家') {
                        zoomlevel = 4;
                    }

                    if('北京市上海市天津市重庆市'.indexOf(name) > -1){
                        zoomlevel = 11;
                    }

                    So.UIMap.setZoomAndCenter(zoomlevel, {x:h.x,y:h.y});
                    So.Gcmd.changeHash("search/index", {
                        params: {
                            'center': h.x + ',' + h.y,
                            'zoom': zoomlevel,
                            'displaylocation' : '0'
                        }
                    });
                }

                //存储在全局的keyword，顶部频道切换调用
                So.__query__ = kw;

                So.Waiting.hide();
                if (data.querytype == null || data.querytype == "5" || data.querytype == "3" || data.querytype == "2"||data.keyword == "违章高发") {
                    //console.log(data);
                    if(!(me._view_params.from && me._view_params.from == 'scrollLoad')){
                        So.UIMap.clearMap();    
                    }
                    
                    data.citycode = city;
                    if (data.status == "E0") {
                        if (data.content && data.content.is_city) {
                            var h = data.poi[0];
                            changeCity(h);
                            return;
                        }
                        data.count = Number(data.totalcount);
                        data.page = me.page;
                        data.pageSize = me.pageSize;
                    }else if(data.citysuggestion){//有组分类时不出城市选择页面
                        var loc = So.State.getLocation();

                        So.Gcmd.changeHash('search/city_list', {
                            data: data,
                            city:loc.city,
                            params: me._params,
                            command: me,
                            noChangeHash: true
                        });
                         return
                    }

                    //忽略接口返回的fold字段;
                    //只有有公交数据的时候进行折叠;
                    //delete data.fold;

                    //有公交时poi全部折叠，从第0个开始
                    if(data.busline && data.busline.length){
                        data.fold = 0;
                    }

                    //1、从翻页过来后不进行折叠
                    //2、如果折叠数大于 结果总数，删除折叠参数
                    if(params._from == 'pager' || data.fold >= data.count){
                        data._fold = data.fold;
                        delete data.fold;
                    }

                    var current_ui = So.State.currentUI,
                        cur_view_name = current_ui && current_ui.__view_name__,
                        view_name = cur_view_name || 'search/map_list';

                    //if((config.isMapMode|| modeType=='map') && !(current_ui && current_ui.__view_name__)){
                    //    view_name = 'search/map';
                    //}

                    //如果有公交数据强制改为列表模式;
                    if(data.busline){
                        view_name = 'search/list';
                    }else if(kw == '违章高发地'){
                        view_name = 'search/map';
                    }else if(view == 'map'){
                        view_name = 'search/map';
                    }else if(data.address_aggregation){
                        view_name = 'search/aggregates';
                    }

                    //地图模式下无数据时强制进入列表模式;
                    //团购list，强制进入列表模式
                    if(!(data.poi && data.poi.length) || filter == 'groupon'){
                        view_name = 'search/list';
                    }

                    if(data._regeo){
                        view_name = 'search/map_detail'
                    }
                    


                    data.keyword = kw;
                    //取到 关键字类别
                    So.Gcmd.changeHash(view_name, {
                        data: data,
                        params: me._params,
                        command: me,
                        noChangeUrl: data.page > 1 ? true : false,
                        noChangeHash: !!(cur_view_name && (view_name != cur_view_name)),
                        view_params: me._view_params
                    });
                } else {
                    if (data.querytype == "1" && data.poi.length > 0) {
                        var h = data.poi[0];
                        var e = false;
                        var i = ["北京", "天津", "重庆", "上海"];
                        _.each(i, function(j) {
                            if (h.name.indexOf(j) >= 0) {
                                e = true
                            }
                        });
                        changeCity(h);
                    } else {
                        if (data.querytype == "4" && data.startpoi && data.endpoi) {
                            var routeData = {},
                                type = data.qcontrol.routetype == 1 ? 'drive' : 'bus';

                            if (data.startpoi.length == 1) {
                                routeData.start = data.startpoi[0];
                                routeData.start.list = null;
                            } else {
                                routeData.start = {
                                    name: data.startkey,
                                    list: data.startpoi
                                }
                            }
                            if (data.endpoi.length == 1) {
                                routeData.end = data.endpoi[0];
                                routeData.end.list = null;
                            } else {
                                routeData.end = {
                                    name: data.endkey,
                                    list: data.endpoi
                                }
                            }

                            var routeUrl = {
                                'drive': 'drive/map',
                                'bus': 'bus/index'
                            };

                            //如果起终点都已确定直接进入路线搜索
                            if(routeData.start.x && routeData.end.x){
                                So.Gcmd.changeHash(routeUrl[type], {
                                    params: routeData,
                                    loadView: 'default'
                                });
                            }else{
                                //起终点没确定时走地址选择模块
                                So.Gcmd.changeHash("route/list", {
                                    params: routeData,
                                    data: routeData
                                })
                            }
                            
                        }
                    }
                }
            };
            var params = {
                cityid: cityid,
                mp: mp,
                sort: sort,
                range: this.radius,
                order: order,
                filter: filter,
                star: star,
                price: price,
                src: src,
                filter_adcode: filter_adcode,
                usermp: usermp,
                business_area: business_area,
                business_name: business_name,
                map_cpc: 'on'
            };

            params.qc = _params.qc||'';//强制搜索错误的关键词kw   

            //由于目前美团无法返回肯德基优惠券的消费状态，需要在 饭补 项目中 过滤掉肯德基的结果
            if(this._params.style == 'fanbu'){
                params.qp = '{"exclude":{"tags":"肯德基"},"type":"餐饮"}';
            }
            //神州租车查询条件
            if(!_.isUndefined(this._params.locality_id)){
                params.locality_id = this._params.locality_id;
            }

            //给APP下载框设置调起APP的scheme参数
            $('.app_download1_con').data('scheme_params', JSON.stringify(_params));
            $('.app_download2_con').data('scheme_params', JSON.stringify(_params));


            if(/^\d{1,3}\.\d{1,}\,\d{1,3}\.\d{1,}$/.test(kw)){
                var xys = kw.split(',');
                var x = xys[1];
                var y = xys[0];

                So.GeocoderService.regeocode({x:x,y:y}, function(data){
                    data = data || {};
                    var name;
                    var address = '';
                    var result = {};
                    if ("1" == data.status && "OK" == data.info) {
                        name = '地图选点';
                        if (data.regeocode && data.regeocode) {
                            if(data.regeocode.formatted_location){
                                name = data.regeocode.formatted_location;
                            }
                            if(data.regeocode.formatted_address){
                                address = data.regeocode.formatted_address;
                            }
                        }

                        result = {
                            poi: [{
                                name: name,
                                address: address,
                                x: x,
                                y: y
                            }],
                            _regeo: 1
                        }

                        callback(result)


                    }else{
                        So.PoiService.citySearch(me.keyword, city, me.page, me.pageSize, callback, b, cityname,params)
                    }
                })

            }else if(!ids){
                //仅在search/map_list 页，并且第一页时加载广告
                var current_ui = So.State.currentUI,
                    cur_view_name = current_ui && (current_ui.__view_name__ || current_ui.__view_name1__);
                    
                //if((cur_view_name == 'search/enter' || cur_view_name == 'search/map_list') && this.page == 1){

                So.PoiService.citySearch(me.keyword, city, me.page, me.pageSize, callback, b, cityname,params)
            }else{
                So.PoiService.searchByIds(ids, callback, {mp:mp});
            }

        }
    });
});
