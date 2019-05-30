define(function(require) {
    var config = require('js/app/conf/config');    
    var routeUtil = {
        autoSelectPoi: function(pois, keyword){
            var poi,
                name,
                first,
                target = pois;

            for (var count = 0, e = 0; e < pois.length; e++) {
                poi = pois[e];
                name = poi.name.replace(/\(.*?\)/g, '');

                if (poi.name == keyword || name == keyword) {
                    count++;
                    !first && (first = poi);

                    // 如果是地铁，直接使用
                    if (poi.typecode == 150500 || poi.name.indexOf('(地铁站)') != -1 || poi.name.indexOf('（地铁站）') != -1) {
                        target = [poi];
                        break;
                    } else {
                        // 如果是公交，再没地铁的情况下使用
                        if ((poi.typecode == 150700 || poi.name.indexOf('(公交站)') != -1 || poi.name.indexOf('（公交站）') != -1)  && (!target || target.typecode != 150700)) {
                            target = [poi];
                            break;
                        }
                    }
                }
            }

            if (count == 1) {
                target = [first];
            }

            return target;
        }
    };

    var routes = {
        'bus': {
            id: '1',
            name: 'bus/index'

        },
        'drive': {
            id: '2',
            name: 'drive/map'

        },
        'walk': {
            id: '3',
            name: 'walk/map'
        },
        'bike': {
            id: '4',
            name: 'bike/map'
        }
    };

    var hasShowList = false;

    var command = So.Command.Base.extend({
        _run: function() {
            var me = this;
            var params = this._params || {};
            var keyword,
                allPoints = [];


            //第一次搜索进入地址选择页则清空之前的状态
            if(params.from == "search-bottom"){
                hasShowList = false;
            }

            //默认使用 bus
            if(!(params.type && routes[params.type])){
                params.type = 'drive';
            }

            this.start = params.start || {};
            this.end = params.end || {};
            this.passing = params.passing || [];

            //删除途经点中无效数据;
            if(this.passing.length){
                var _passing = this.passing;
                var _passing_arr = [];
                for(var i=0,l=_passing.length;i<l;i++){
                    if(_passing[i]){
                       _passing_arr.push(_passing[i]);
                    }
                }
                this.passing = params.passing = _passing_arr;
            }

            allPoints.push(this.start);

            if(params.type == 'drive'){
                allPoints = allPoints.concat(this.passing);
            }
            
            allPoints.push(this.end);

            for(var i=0,l=allPoints.length;i<l;i++){
                if(!allPoints[i]){
                    continue;
                }
                if(!allPoints[i].x){
                    me.routePoi = allPoints[i];
                    me.routePoi["_index"] = i;
                    break;
                }
            }

            //所有的点都已确定;
            if(!me.routePoi){
                me.toNextStep();
                return false;
            }
            
            keyword = me.routePoi.name;

            if (!params.start || !params.end) return;

            if ((keyword == "您现在的位置" || keyword == '我的位置') && !me.routePoi.x) {
                So.GeolocationService.getPosition(function(j) {
                    So.Gcmd.fetchAddressName(j, {
                        callback: function(_position){
                            _.extend(me.routePoi, {
                                x: j.lng,
                                y: j.lat,
                                name: _position.address,
                                address: _position.address,
                                list: null
                            });
                            me.toNextStep()    
                        }
                    });
                    
                }, function(j) {                   

                    So.Gcmd.changeHash('route/index', {
                        params:{
                            start:params.start,
                            end: params.end,
                            passing: params.passing,
                            type: params.type,
                            src: params.src
                        }
                    });

                    So.Waiting.show("获取您现在的位置失败",true);
                    setTimeout(function(){
                        So.Waiting.hide();
                    },1000);
                })
            } else {
                if (!me.routePoi.x) {
                    var citycode = (me.routePoi["_index"] == 0 ? params.start_city : params.end_city) || params.city || So.CityData.citycode();
                    var callback = function(data) {
                        if (data.status == "E0" && data.poi.length >= 1) {

                            //自动选择POI；
                            //当fold小于等于3的时候启动自动选择逻辑;
                            if(data.fold <= 3){
                                data.poi = routeUtil.autoSelectPoi(data.poi, keyword);    
                            }
                            

                            if (data.poi.length == 1) {
                                var k = data.poi[0];
                                _.extend(me.routePoi, {
                                    x: k.x,
                                    y: k.y,
                                    name: keyword,
                                    address: k.address,
                                    list: null
                                });
                            } else {
                                _.extend(me.routePoi, {
                                    name: keyword,
                                    list: data.poi
                                });
                            }
                            me.toNextStep()
                        } else {
                            So.Waiting.hide();
                            So.SplashError.show("无法定位“" + keyword + "”,请更换输入并重试");

                            //无结果的时候返回上一步;
                            if(hasShowList){
                                window.history.go(-1);
                            }else{
                                So.Gcmd.changeHash('route/index', {
                                    params:{
                                        start:params.start,
                                        end: params.end,
                                        passing: params.passing,
                                        type: params.type
                                    }
                                });
                            }
                            
                            return
                        }
                    };
                    var _md = routes[params.type].id || 1; //bus 1; drive 2; walk 3;
                    So.PoiService.citySearch(keyword, citycode, 1, 10, callback, true, citycode, {
                        routePoint:1,
                        routeType:_md,
                        routeSelectPOI:params.reselect ? 1 : 0
                    })
                } else {
                    me.toNextStep()
                }
            }
        },
        toNextStep: function() {
            var me = this;
            var params = this._params;

            if(me.routePoi && me.routePoi.list){
                So.Waiting.hide();
                So.Gcmd.changeHash("route/list", {
                    params: {
                        start: me.start,
                        end: me.end,
                        passing: me.passing,
                        city: params.city,
                        start_city: params.start_city,
                        end_city: params.end_city,
                        type: params.type
                    },
                    data: {
                        start: me.start,
                        end: me.end,
                        passing: me.passing
                    }
                });
                //记录是否显示过列表，用来确定无结果的时候是后退，还是跳转
                hasShowList = true;
            }else if(!me.routePoi) {
                So.printWapSchema();

                $('body').trigger('saveHistory',{
                    type: params.type,
                    start: me.start,
                    end: me.end,
                    passing: me.passing
                });
                
                So.Waiting.hide();
                var startToEndDistance = So.Util.distanceTo(me.start,me.end);
                //小于500米，默认步行
                if(startToEndDistance<=500){
                    params.type = 'walk';
                }else if(params.type=='walk'){
                    var nav_type = parseInt(So.Cookie.get('nav_type')) || 1;
                    nav_type = nav_type == 3 ? 2 : 1;
                    var routeTypes = {
                        '1': 'bus',
                        '2': 'drive'
                    };
                    params.type = routeTypes[nav_type];
                }

                //目前无法判断是否是点击首页button来的，先屏蔽掉
                // var schemes = {
                //     'bus': {
                //         "action": "buslinemap",
                //         "tramode": 0
                //     },
                //     'drive': {
                //         "action": "carlinemap",
                //         "tramode": 1
                //     },
                //     'walk': {
                //         "action": "walklinemap",
                //         "tramode": 2
                //     },
                //     'bike': {
                //         "action": "walklinemap",
                //         "tramode": 2
                //     }
                // };
                // var scheme = schemes[params.type];

                // if(params.from == 'search-bottom'){
                //     So.callNative(_.extend({
                //         "scn": me.start.name,
                //         "sclon": me.start.x,
                //         "sclat": me.start.y,
                //         "ecn": me.end.name,
                //         "eclon": me.end.x,
                //         "eclat": me.end.y,
                //     },scheme));
                // }
                

                So.Gcmd.changeHash(routes[params.type].name, {
                    params: {
                        start: me.start,
                        end: me.end,
                        passing: me.passing,
                        city: So.CityData.citycode(),
                        src: params.src
                    },
                    noChangeHash: !!params.autosearch
                });
            }else{
                new command({
                    start: me.start,
                    end: me.end,
                    passing: me.passing,
                    city: params.city,
                    start_city: params.start_city,
                    end_city: params.end_city,
                    type: params.type,
                    autosearch: params.autosearch || 0,
                    src: params.src
                }).run()
            }
        }
    });

    return command;
});
