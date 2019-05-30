define(function(require) {
    var config = require('js/app/conf/config');
    var user_poi = require('./user_poi');
    var sync = {
        init: function(){
            this.bindEvent();
            
            //同步数据;
            $('body').trigger('app-sync');
        },
        bindEvent: function(){
            var me = this;

            $('body').on('app-sync-homeandcompany', function(eve, args){
                args = args || {};
                var type = args.type,
                    info = args.info;

                me.updateHomeAndCompany(type, info);
            });

            $('body').on('app-sync-history', function(eve, args){
                args = args || {};
                var handle = args.handle, 
                    type = args.type,
                    info = args.info;

                me.updateHistory(handle, type, info);
            });

            $('body').on('app-sync', function(eve, args){
                args = args || {};
                var params;
                var sn;
                var homeAndCompany = me.getHomeAndCompany();
                var company = homeAndCompany.company;
                var home = homeAndCompany.home;
                var poi = me.getPoiHistory();
                var route = me.getRouteHistory();
                var info = {};
                var clear_info = args.clear;
                
                // //同步家
                // if(company.name && company.x && company.y){
                //     info.company = company;
                // }

                // //同步公司
                // if(home.name && home.x && home.y){
                //     info.home = home;
                // }

                //同步POI，登录后需要把本地的POI历史记录传到服务端
                if(config.ISFROMLOGIN && poi && poi.length){
                    info.poi = poi;
                }

                // //同步路线
                if(config.ISFROMLOGIN && route && route.length){
                    info.route = route;
                }

                //清空服务器数据;
                // if(clear_info){
                //     _.each(clear_info, function(val, key){
                //         info[key] = {};
                //     })
                // }


                params = {
                    info: JSON.stringify(info),
                    far_src: 2
                };

                sn = config.makeSign(params);

                params.sn = sn;


                var callback = function(data){
                    data = data || {};                    
                    var errno = data.errno;

                    //接口报错，则返回;
                    if(errno != 0){
                        return false;
                    }

                    data = data.data || {};
                    var company = data.company || {},
                        home = data.home || {},
                        poi = data.poi || [],
                        route_bus = data.route_1 || [],
                        route_drive = data.route_2 || [],
                        route_walk = data.route_3 || [],
                        route_bike = data.route_4 || [];

                    //同步公司
                    if(company && company.name && company.address && company.x && company.y){
                        me.saveHomeAndCompany(_.extend({
                            type: 'company'
                        },company));
                    }else{
                        user_poi.deleteHomeOrCompany('company');
                    }

                    //同步家
                    if(home && home.name && home.address && home.x && home.y){
                        me.saveHomeAndCompany(_.extend({
                            type: 'home'
                        },home));
                    }else{
                        user_poi.deleteHomeOrCompany('home');
                    }

                    //同步POI历史记录
                    me.savePoiHistory(poi);

                    //公交同步路线记录记录
                    me.saveRouteHistory(route_bus, {
                        type: 'bus'
                    });

                    //驾车同步路线记录记录
                    me.saveRouteHistory(route_drive, {
                        type: 'drive'
                    });

                    //步行同步路线记录记录
                    me.saveRouteHistory(route_walk, {
                        type: 'walk'
                    });

                    //骑行同步路线记录记录
                    me.saveRouteHistory(route_bike, {
                        type: 'bike'
                    });
                }


                $.ajax({
                    url: config.USERINFO_SYNC,
                    async: true,
                    type: "POST",
                    data: params,
                    dataType: 'json',
                    cache: false,
                    withCredentials: true,
                    success: function(data) {
                        callback(data);
                    },
                    error: function() {
                        callback();
                    }
                });

            });            
        },
        getHomeAndCompany: function(){
            //获取用户家、公司信息
            var info = user_poi.getHomeAndCompany();

            return info;
        },
        saveHomeAndCompany: function(data){
            user_poi.saveHomeOrCompany(data);
        },
        getPoiHistory: function(){
            var history = So.getPoiHistory();

            return history;
        },
        savePoiHistory: function(data){
            So.updatePoiHistory(data, {
                reset: true
            });
        },
        getRouteHistory: function(){
            var history = So.getRouteHistory();

            return history;
        },
        saveRouteHistory: function(historys, opts){
            opts = opts || {};
            var type = opts.type;

            So.saveRouteHistory(historys, {
                reset: true,
                type: type
            });
        },
        //设置家、公司后马上同步服务端，
        //前端不验证是否登录，由服务端去验证;
        updateHomeAndCompany: function(type, info){
            if(!(type && info)){
                return false;
            }
            var sn;
            info = JSON.stringify(info);
            var data = {
                "handle": "modify",
                "key": type, // home company
                "info": info
            };
            sn = config.makeSign(data);

            data.sn = sn;

            $.ajax({
                url: config.HOMECOMPANY_SYNC,
                async: true,
                type: "POST",
                data: data,
                dataType: 'json',
                cache: false,
                withCredentials: true,
                success: function(data) {
                    //callback(data);
                },
                error: function() {
                    //callback();
                }
            });
        },
        updateHistory: function(handle, type, info){
            var sn;
            info = JSON.stringify(info);
            var data = {
                "handle": handle, //add delete
                "key": type, // poi route
                "info": info
            };
            sn = config.makeSign(data);

            data.sn = sn;

            $.ajax({
                url: config.HISTORY_SYNC,
                async: true,
                type: "POST",
                data: data,
                dataType: 'json',
                cache: false,
                withCredentials: true,
                success: function(data) {
                    //callback(data);
                },
                error: function() {
                    //callback();
                }
            });
        }
    };

    sync.init();

    return sync;
});
