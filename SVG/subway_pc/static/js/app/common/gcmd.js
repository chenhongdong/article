define(function(require) {
    __errorMark__.push('gcmd:11');
    var config = require('js/app/conf/config');
    var isFirstLoadView = true;
    require('./util');
    require('./state');
    var monitor = require("js/app/monitor").index;
    (function(b) {
        //设置Cookie存储的用户定位坐标;
        function setCookieUserLocation(userLocation){
            //userLocation = 'NaN_NaN_13123113213';
            if(userLocation){
                var locInfo = userLocation.split('_');
                var x = parseFloat(locInfo[0]);
                var y = parseFloat(locInfo[1]);
                var lastUpateTime = parseFloat(locInfo[2]);
                var loc = So.State.getLocation();

                if(!isNaN(x) && !isNaN(y) && loc.state!=1){
                    var info = So.Util.fromMercatorToLatLng(locInfo[0],locInfo[1]);
                    info.from = 'cookie';
                    // var currentTime = new Date().getTime();
                    // var deltaTime = currentTime - lastUpateTime;
                    //新首页上线后，何捷、付强 要求缓存永久有效，使用缓存比城市中心点好
                    // if(deltaTime < 60 * 60 * 1000){ //如果与上次更新时间小于60分钟，则使用上次定位的数据
                        So.State.setLocation({
                            state: 1,
                            acc: 50,
                            x: info.lng,
                            y: info.lat,
                            name:'',
                            city:'',
                            cityid:'',
                            address:''
                        });
                        //So.State.noLocation = true;
                        !So.CityData && (So.CityData = {});
                        //TODO，需要调整js加载的顺序来优化,暂时先延迟处理
                        //setTimeout(function(){
                            fetchAddressName(info);
                        //},1000)
                    // }else{
                    //     So.State.setLocation({state: 0});
                    //     So.State.noLocation = false;
                    // }
                }
            }
        }
        var cookieLocation = So.Cookie.get('mso_map_xyt'); //从cookie中获取定位坐标
        var mapUesrLocation = So.Cookie.get('map_user_loc'); //从地图自身域cookie中获取定位坐标
        setCookieUserLocation(cookieLocation);
        setCookieUserLocation(mapUesrLocation);

        function fetchAddressName(pt,opts){
            opts = opts || {};
            var callback = opts.callback,
                setCenter = opts.setCenter;
            var c = function() {
                _.each(Gcmd.geoWatcher, function(e, d) {
                    if (e) {
                        e({
                            from: pt.from || '',
                            setCenter: setCenter
                        });
                    }
                })
            };

             var d = {
                radius: 1000,
                crossnum: 0,
                roadnum: 0,
                poinum: 3
            };
            new So.Geocoder(d).regeocode(pt, function(data) {
                var location = data.regeocode.addressComponent,
                    province = location.province || '',
                    city = location.city || '',
                    district = location.district || '',
                    township = location.township || '',
                    streetNumber = location.streetNumber || {},
                    street = streetNumber.street || '',
                    number = streetNumber.number || '',
                    address;

                if (!city) {
                    city = province;
                    province = '';
                }

                //删除 province、city 两级（安轩要求）
                address = district + township+street+number;

                //citycode 为空时使用city替代
                var citycode = location.citycode || city;

                So.CityData.setCity(citycode, citycode, pt.lng, pt.lat);

                //Uncaught URIError: URI malformed fixed
                try{
                    address = decodeURIComponent(address);
                }catch(e){}
                var loc = {
                    state: 1,
                    address: address,
                    city: city,
                    from: pt.from || '',
                    adcode: location.adcode
                };
                So.State.setLocation(loc);
                callback && callback(loc);

                c();

                // if(city.indexOf('北京') == 0){
                //     $('#daijia_banner1').show();
                //     $('#daijia_banner1 a')[0].href = 'daijia.html?lat_lng='+ e.lat + '_' + e.lng + '&from=360';
                // }

            }, function() {
                So.State.setLocation({
                    state: 0,
                    address: '未知位置',
                    city: '未知城市'
                });
                c()
            })

        }

        So.locateNum = 0;
        var timerId;//,reLoacation=true;
        var is360browser = /360 Aphone/.test(navigator.userAgent);
        var Gcmd = {
            geoWatcher: [],
            fetchAddressName:fetchAddressName,
            addGeoWatcher: function(c) {
                this.geoWatcher.push(c)
            },
            zoomin: function() {
                So.UIMap.zoomIn();
            },
            zoomout: function() {
                So.UIMap.zoomOut();
            },
            geolocate: function(opts) {
                var self = this;
                opts = opts || {};
                var from = opts.from;
                if(So.State.noLocation && !opts.manualTrigger ) return; //手工定位除外
                var loc = opts.loc,
                    dom_geolocate = $('.nearby-geolocate'),
                    setCenter = opts.setCenter || 0;
                if (So.State.getLocation().state != 0) {
                    $('.js-locationTips').html('定位中，请稍候');
                    dom_geolocate.removeClass('showGeolocate');
                    dom_geolocate.removeClass('hiddenGeolocate');
                }
                (function try_location(){
                    var c = function() {
                        _.each(Gcmd.geoWatcher, function(e, d) {
                            if (e) {
                                e();
                            }
                        })
                    };

                    So.GeolocationService.getPosition(function(pt) {
                        self.geolocatecallback(pt,setCenter, opts);
                    }, function(d) {
                        if (So.State.getLocation().state != 0) {
                            So.Waiting.hide()
                        }
                        So.State.setLocation({
                            from: 'locate',
                            error: d,
                            state: 2
                        });
                        c()
                    }, loc)
                    var locateState = So.State.getLocation().state;
                    if(locateState == 1){
                        if(!is360browser){
                            clearTimeout(timerId);
                            return
                        }
                    }
                    if(So.locateNum >= 3){ //多尝试一次定位
                        clearTimeout(timerId);
                        return;
                    }
                    So.locateNum++;
                    if(is360browser || locateState!==1){ //针对360浏览器
                       timerId =  setTimeout(arguments.callee,1000);
                    }

                })();
            },
            traffic: function() {
                if (!So.State.trafficeOn) {
                    $('#mapTraffic').addClass('mapTraffic_active');
                    So.UIMap.addTileLayer_TRAFFIC();
                } else {
                    $('#mapTraffic').removeClass('mapTraffic_active');
                    So.UIMap.removeTileLayer_TRAFFIC();
                }
                So.State.trafficeOn = !So.State.trafficeOn;
                monitor.click.tmc({ trafficeOn: So.State.trafficeOn })
            },
            gotoHome: function(){
                So.Gcmd.changeHash("search/index");
            },
            changecity: function() {
                var c = So.CityData.getData();
                So.Gcmd.changeHash("city/index", c);
            },
            clearmap: function() {
                So.UIMap.clearMap();
            },
            search: function() {
                // debugger
                // monitor.log({
                //     mod: 'tab',
                //     type: 'sch'
                // }, 'click');

                var c = So.State.currentUI;
                if(c.name !="search_index" ){
                    So.Gcmd.changeHash("search/index", {})
                }
            },
            getQT:function(p,id,cb,src){
                //qtoken不可缓存，每次请求返回的qtoken都不一样
                src = src || '';
                var p = p.sort(),rp = "",
                sk = '&sk=b69ed2538337afa80dbb10e71814b152';

                rp = (p.length > 1)?p.join('&')+sk:p[0]+sk;
                var sn = hex_md5(rp);

                // $.ajaxJSONP({
                //       url: "//shenbian.so.com/order/getQtoken?"+p.join("&")+"&sn="+sn+"&src="+src+"&callback=?",
                //       success: function(data){
                //           if(!data.errno){
                //             cb(data.data);
                //           }else{
                //             alert('QToken获取失败');
                //           }
                //       }
                // });
                cb("x");
            },
            nearby: function(name, x, y) {
                // debugger
                // monitor.log({
                //     mod: 'tab',
                //     type: 'nb'
                // }, 'click');

                if(name){
                    So.State.setLocation({
                        x: x,
                        y: y,
                        name: name,
                        address: name
                    });
                }
                var c = So.State.currentUI;
                if(c.name !="search_nearby" ){
                    So.Gcmd.changeHash("search/nearby", {})
                }
            },
            route: function() {
                // log index page route click
                monitor.click.route()

                var c = So.State.currentUI;
                if(c.name !="route_index" ){
                    So.Gcmd.changeHash("route/index");
                }
            },
            cmd: function(d) {
                var c = So.State.currentUI;
                if (c) {
                    d.name = unescape(d.name);
                    c.cmd(d);
                }
            },
            formatUrl: function(view, key, data, type){
                type = type || 'url';

                //改为在JSON.parse之后decode
                if(_.isString(data)){
                    data = decodeURIComponent(data);
                }

                var formats = {
                    route: {
                        'url':'{{=name}}{{ if((typeof x != "undefined" && x) && (typeof y != "undefined" && y)){ }}$${{=x}},{{=y}}{{ } }}',
                        'reg':/([^\$]*)(\$\$([^,]*)\,(.*))?/,
                        'obj_str':'{"name":"{{1}}","x":"{{3}}","y":"{{4}}"}'
                    }
                };
                var urls = {
                    'route/index':{
                        'start':formats.route,
                        'end':formats.route,
                        'passing':formats.route
                    },
                    'route/list':{
                        'start':formats.route,
                        'end':formats.route,
                        'passing':formats.route
                    },
                    'bus/index':{
                        'start':formats.route,
                        'end':formats.route,
                        'passing':formats.route
                    },
                    'bus/detail':{
                        'start':formats.route,
                        'end':formats.route,
                        'passing':formats.route
                    },
                    'bus/map':{
                        'start':formats.route,
                        'end':formats.route,
                        'passing':formats.route
                    },
                    'drive/map':{
                        'start':formats.route,
                        'end':formats.route,
                        'passing':formats.route
                    },
                    'drive/index':{
                        'start':formats.route,
                        'end':formats.route,
                        'passing':formats.route
                    },
                    'walk/map':{
                        'start':formats.route,
                        'end':formats.route,
                        'passing':formats.route
                    },
                    'walk/index':{
                        'start':formats.route,
                        'end':formats.route,
                        'passing':formats.route
                    },
                    'search/error':{
                        'start':formats.route,
                        'end':formats.route,
                        'passing':formats.route
                    },
                    'bike/map':{
                        'start':formats.route,
                        'end':formats.route,
                        'passing':formats.route
                    },
                    'bike/index':{
                        'start':formats.route,
                        'end':formats.route,
                        'passing':formats.route
                    }
                };
                var info = view && key && urls[view] && urls[view][key] || {},
                    tpl = info[type] || (typeof data == 'object' ? '{{=encodeURIComponent(JSON.stringify(arguments[0]))}}' : '{{=arguments[0]}}'),
                    returnVal = data;

                if(type == 'url'){                    

                    if(key == 'passing'){
                        var _returnVal = [];
                        for(var i=0,l=data.length;i<l;i++){
                            _returnVal.push(So.View.template(tpl, data[i]));
                        }
                        returnVal = _returnVal.join(";");
                    }else{
                        returnVal = So.View.template(tpl, data);
                    }

                }else if(type == 'obj' && info.reg && info.obj_str){
                    try{
                        
                        var str2Obj = function(str){
                            //如果data为字符串，不添加双引号直接JSON.parse 会报错 JSON.parse('"报错"');
                            var _obj = JSON.parse(str.replace(info.reg, function(){
                                var reg_obj = arguments;
                                return info.obj_str.replace(/\{\{(\d+)\}\}/g, function(){
                                    return encodeURIComponent(reg_obj[arguments[1]] || '');
                                });
                            }));

                            return _obj;
                        }


                        if(key == 'passing'){
                            var _data = data.split(";");
                            var _returnVal = [];
                            for(var i=0,l=_data.length;i<l;i++){
                                if(!_data[i]){
                                    continue;
                                }
                                var _obj = str2Obj(_data[i]);
                                _obj && _returnVal.push(_obj);
                            }
                            returnVal = _returnVal;
                        }else{
                            returnVal = str2Obj(data);
                        }

                        
                    }catch(e){
                        console.log(e);
                    }


                    var decodeVal = function(obj){
                        //如果数据中有双引号的，在JSON.parse之前进行decodeURIComponent会导致 JSON.parse报错;
                        _.forEach(obj, function(val, key){
                            if(_.isString(val)){
                                obj[key] = decodeURIComponent(val);
                            }else{
                                decodeVal(obj[key]);
                            }
                        })
                    };

                    decodeVal(returnVal);

                    
                }

                return returnVal;
            },
            changeHash: function(view_name, data) {
                //__errorMark__.push('gcmd-changeHash:11');

                if(!view_name){
                    return;
                }

                data = data || {};
                data.params = data.params || {};
                var _params = data.params,
                    _hash = data._hash,
                    params = [],
                    uiParams = So.State.uiParams,
                    delete_views,
                    mustChangeHash = data.mustChangeHash || false,//是否强制hashchange
                    noChangeHash = data.noChangeHash || false,
                    noChangeUrl = data.noChangeUrl || false, //不修改url，只请求下数据
                    onlySetParams = data.onlySetParams || false,//仅用于更新当前hash地址（如更新hash中的参数），不触发hashchange事件
                    noUseCache = data.noUseCache || false,//禁止使用缓存数据
                    cache_params,
                    cache_data;

                _params._ = parseInt((new Date).getTime() / (1000 * 60 * 30));

                for(var i in _params){
                    var _value = _params[i];

                    (!_.isUndefined(_value) && _value !== '')  && params.push(i+'='+ encodeURIComponent(this.formatUrl(view_name, i, _value)));
                }

                var hash = view_name + '/' + params.join('&');

                if(onlySetParams){
                    if(window.history.replaceState){
                        window.history.replaceState(null, "", "#" + hash);
                    }else{
                        window.location.replace(location.search + "#" + hash);
                    }
                    return;
                }


                //存储view hashchange需要的数据
                //data需要进行深度拷贝，否则存储后可能被修改
                //库中没有深度拷贝暂使用如下方法代替
                data.data && (data.data = So.clone(data.data));
                // try{
                //     if(!data.data && uiParams[view_name][uiParams[view_name]['_hash_'][hash]]['data']){
                //         data.data = uiParams[view_name][uiParams[view_name]['_hash_'][hash]]['data'];
                //     }
                // }catch(e){}

                uiParams[view_name] = uiParams[view_name] || {};
                uiParams[view_name]['_views_'] = uiParams[view_name]['_views_'] || [];
                uiParams[view_name]['_hash_'] = uiParams[view_name]['_hash_'] || {};

                if(_hash){
                    uiParams[view_name]['_hash_'][_hash] = hash;
                }


                //使用缓存数据;
                cache_params = uiParams[view_name][hash];
                cache_data = cache_params && cache_params.data;

                //没有传递data时才使用缓存data

                //user/index 强制不使用缓存，登录状态需要实时检测;
                if(!(view_name == 'user/index' || view_name == 'user/favorite' )){
                    if(!noUseCache && !data.data && cache_data){
                        data.data = cache_data;
                    }    
                }
                

                //填充默认数据，防止view中不判断直接使用报错;
                //data.data = data.data || {};


                //删除数组中已存储的当前view，保证view唯一
                uiParams[view_name]['_views_'] = _.without(uiParams[view_name]['_views_'],hash);
                uiParams[view_name]['_views_'].unshift(hash);

                uiParams[view_name][hash] = data;

                //删除早于maxStackLength的缓存数据;
                delete_views = uiParams[view_name]['_views_'].splice(So.State.maxStackLength);


                _.each(delete_views, function(key){
                    delete uiParams[view_name][key];
                });

                if(noChangeUrl){
                    So.State.onHashChange({
                        'hash': hash
                    });
                    return;
                }


                //使浏览器返回能返回至上一个view，必须使用 history.replaceState 修改location.hash，
                //使用 history.replaceState 修改hash时 不会触发 onhashchange事件
                if(!mustChangeHash && ((So.State.currentUI && (So.State.currentUI.__view_name1__ == view_name)) ||
                    (So.State.currentUI && So.State.currentUI.__view_name1__ == 'route/list') ||
                    (So.State.currentUI && So.State.currentUI.__view_name1__ == 'search/enter') ||
                    noChangeHash
                )){
                    if(window.history.replaceState){
                        window.history.replaceState(null, "", "#" + hash);
                    }else{
                        window.location.replace(location.search + "#" + hash);
                    }

                    So.State.onHashChange({
                        'from': 'replaceState'
                    });
                }else{
                    window.location.hash = hash;
                }
                //__errorMark__.push('gcmd-changeHash:12');
            },
            defaultSearch: function(keyword, opts) {
                opts = opts || {};
                var filter_adcode = opts.filter_adcode || '',
                    pguid = opts.pguid || '';

                var modeType = opts.modeType;

                //判断是否是360统一头部搜索输入框
                var inputBox = $(".g-header-q");
                var keyword =keyword || inputBox && inputBox.val() || '';
                if ($.trim(keyword) == "") {
                    inputBox.focus();
                    return
                }
                inputBox.blur();
                var loc = So.State.getLocation();
                new So.Command.CitySearch({
                    keyword: keyword,
                    mp: loc.y + ',' + loc.x,
                    use_loc_state:1,
                    filter_adcode: filter_adcode,
                    ids: pguid,
                    modeType:modeType||''
                }).run()
            },
            headerTopSearch: function(event){
                var keyword = $('#header-nav-query').val();
                var url_params = So.urltojson(window.location.hash);
                var local = url_params.local;
                var mp = url_params.mp;
                var city = url_params.city;
                var params = {
                    viewname:'search',
                    keyword: keyword
                }
                if(local){
                    params.local = local;
                }
                if(mp){
                    params.mp = mp;
                }
                if(city){
                    params.city = city;
                }
                So.Gcmd.changeHash('search/enter',{
                    params: params
                });
                // monitor log
                monitor.click.input()

                $('#header-nav-query').focus();
                $('#header-nav-query').trigger('input');
            },
            geolocatecallback:function(pt,setCenter, opts){                            
                opts = opts || {};
                pt.from = opts.from || 'locate';
                if (So.State.getLocation().state != 0) {
                    So.Waiting.hide()
                }

                //每一次定位，如果是360浏览器
                /*if(So.locateNum == 0 && window._loc_position){
                    pt = window._loc_position;
                    pt.from = 'locate';
                    reLoacation = false;
                }*/
                So.State.setLocation({
                    state: 1,
                    acc: pt.accuracy,
                    x: pt.lng,
                    y: pt.lat,
                    name:'',
                    city:'',
                    cityid:'',
                    address:''
                });


                //在地图列表模式下，设置地图中心点的时候需要进行下偏移;
                try{                    
                    if(So.State.currentUI.name == 'search_map_list'){
                        var map = So.UIMap.getObj();
                        var position = new so.maps.LatLng(pt.lat,pt.lng);
                        var latLng_pixel = map.getMapCanvasProjection().fromLatLngToContainerPixel(position);
                        var list_height = $('#CTextDiv1').data('list-height') * 1;
                        var _pt = new so.maps.Point(latLng_pixel.x,latLng_pixel.y + list_height/2);
                        position = map.getMapCanvasProjection().fromContainerPixelToLatLng(_pt);

                        //如果是用户手动点击定位按钮，重新用新定位请求数据;
                        if(opts.from == 'homebtn'){
                            $('body').trigger('research_by_new_position');
                        }
                    }
                }catch(e){}


                //定位成功后移动到定位点，自动定位不移动地图中心店，用户手动发起的定位才设置中心店;
                if(setCenter){
                    So.UIMap.setCenter({
                        x:pt.lng,
                        y:pt.lat
                    });
                }


                //定位成功后存入so.com域的cookie中，方便下次使用
                var mector = So.Util.fromLatlngToMercator(pt.lat,pt.lng);
                var mso_map_xyt = Math.floor(mector.x)+'_'+Math.floor(mector.y)+'_'+new Date().getTime();
                So.Cookie.set('mso_map_xyt',mso_map_xyt,'haosou.com');
                So.Cookie.set('mso_map_xyt',mso_map_xyt,'so.com');
                So.Cookie.set('map_user_loc',mso_map_xyt);
                fetchAddressName(pt, {
                    setCenter: setCenter
                });
                //So.locateNum++;
            }
        };
        function hackLocationSuccess(data){
            //alert(data.latitude+'\n'+data.longitude+'\n'+data.accuracy);
           /* var pt = {
                lng:data.coords.longitude,
                lat:data.coords.latitude,
                accuracy:data.coords.accuracy
            }*/
            So.Gcmd.geolocate({manualTrigger:1});
        }
        window.hackLocationSuccess = hackLocationSuccess;
        So[b] = Gcmd;
    })("Gcmd");
    __errorMark__.push('gcmd:12');
});
