define(function(require) {
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').detail;
    var userAgent = navigator.userAgent;
    var _So = {
        _snapshot: {},
        isIOS:userAgent.match(/(i[^;]+\;(U;)? CPU.+Mac OS X)/),
        isMsoApp:/mso_app/.test(userAgent),
        eval: function(s) {
            if (_.isString(s)) {
                try {
                    s = JSON.parse(s);
                } catch (e) {
                    try{
                        s = eval("(" + s + ")");
                    }catch(e){
                        s = '';
                    }
                }
            }
            return s
        },
        call: function(fn, args) {
            if (_.isString(fn)) {
                fn = _So.eval(fn)
            }
            if (_.isFunction(fn)) {
                fn.apply(this, _.rest(arguments, 1))
            }
        },
        htmlEncode: function(a) {
            return a.replace(/&/g, "&gt;").replace(/\"/g, "&quot;").replace(/\'/g, "&#39;").replace(/ /g, "&nbsp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        },
        HtmlDecode:function(text){
            return text.replace(/&amp;/g, '&').replace(/&quot;/g, '/"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        },
        clone: function(json) {
            return this.eval(JSON.stringify(json))
        },
        snapshot: function(b, a) {
            if (!b) {
                return false
            }
            if (a) {
                this._snapshot[b] = a
            }
            return this._snapshot[b]
        },
        el: function(a) {
            return document.getElementById(a)
        },
        swap: function(d, c) {
            var b = this.el(d).value;
            this.el(d).value = this.el(c).value;
            this.el(c).value = b
        },
        rc: function(b, a) {
            if (_.isUndefined(a)) {
                if (_.isString(b)) {
                    b = _So.el(b)
                }
                if (!_.isObject(b)) {
                    return false
                }
                a = b.getAttribute("afcd")
            }
            _So.Command.deserialize(a).run()
        },
        urltojson: function(url) {
            var hash;
            var obj = {};
            var off = url.indexOf('#');
            if (off > 0) {
                url = url.substring(0, off);
            }
            var params_str = url.split('?')[1] || url;
            var hashes = params_str.split('&') || [];
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');

                if(!hash[0]){
                    continue;
                }
                try{
                    obj[hash[0]] = decodeURIComponent(hash[1]);
                }catch(e){
                    obj[hash[0]] = hash[1];
                }

            }
            return obj;
        },
        urltojson1: function(url) {
            var hash;
            var obj = {};
            var off = url.indexOf('#');
            if (off > 0) {
                url = url.substring(0, off);
            }
            var params_str = url.split('?')[1] || "";
            var hashes = params_str.split('&') || [];
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');

                if(!hash[0]){
                    continue;
                }
                try{
                    obj[hash[0]] = decodeURIComponent(hash[1]);
                }catch(e){
                    obj[hash[0]] = hash[1];
                }

            }
            return obj;
        },
        addparamsToUrl: function(url, params){
            /*
             *测试的url：
             *http://m.map.so.com/onebox/?act=moviedetail&id=78535&type=super-map-cinema&d=mobile
             *http://m.map.haosou.com/#search/nearby/_=807997
             */
            params = params || {};
            if(!url){
                return false;
            }

            var cur_path = url.replace(/[\?|#].*/,''),
                cur_params = _So.urltojson1(url),
                cur_hash = url.split('#')[1],
                all_params = _.extend(cur_params, params),
                all_params_arr = [],
                all_params_str;

            _.forEach(all_params, function(val, key){
                all_params_arr.push(key + '=' + val);
            })

            all_params_str = all_params_arr.join('&');

            return cur_path + (all_params_str ? '?' + all_params_str : '') + (cur_hash ? '#' + cur_hash : '');

        },
        supportWaimai:function(citycode) {
            var data = config.WAIMAI_CITIES;
            var result = data[citycode];
            //如果是城市名称;;
            if (!result) {
                for (var p in data) {
                    var n = data[p];
                    var c = n.split(',')[1];
                    if (citycode.indexOf(c) > -1) {
                        result = n;
                        break;
                    }
                }
            }
            var ua = navigator.userAgent,
                andorid = /android((\s)*|\/)(1\.\d|2\.[12])/i,
                flyflow = /FlyFlow/i,
                available = !(andorid.test(ua) || flyflow.test(ua));
            return available ? result : false
        },
        supportSubway: function(citycode) {
            var data = config.SUBWAY_CITIES;
            var result = data[citycode];
            //如果是城市名称;;
            if (!result) {
                for (var p in data) {
                    var n = data[p];
                    var c = n.split(',')[1];
                    if (citycode.indexOf(c) > -1) {
                        result = n;
                        break;
                    }
                }
            }
            var ua = navigator.userAgent,
                andorid = /android((\s)*|\/)(1\.\d|2\.[12])/i,
                flyflow = /FlyFlow/i,
                available = !(andorid.test(ua) || flyflow.test(ua));
            return available ? result : false
        },
        printWapSchema:function(){
            /*if(__src_open_app == 'nav_app'){
                var scheme_url = "openapp://com.qihoo.msearch.qmap/routine?action=query";
                var wapSchema = '$web_app#scheme_url:#mse_token#{"app_url":"'+scheme_url+'","web_url":"","leidian_url":"ddd","pkg_name":"?.."}';
                console.log(wapSchema.replace('#mse_token', window.mse_token || '#null#'));
            }*/
            if(window.map_routine_used){
               window.map_routine_used.onMapRoutineUsed();
            }
        },
        goToHere:function(scn,sclon,sclat,ecn,eclon,eclat,tramode,from){
            var scn = scn.replace(/\"|\'/,"");
            var ecn = ecn.replace(/\"|\'/,"");
            var msoAppVersion = msoAppVersion || '';
            var scheme_url = "openapp://com.qihoo.msearch.qmap/route?scn="+scn+"&sclon="+sclon+"&sclat="+sclat+"&ecn="+ecn+"&eclon="+eclon+"&eclat="+eclat+"&tramode="+tramode+"&action=topoi&from="+from+"&msoAppVersion="+msoAppVersion;
            var wapSchema = '$web_app#scheme_url:#mse_token#{"app_url":"'+scheme_url+'","web_url":"","leidian_url":"ddd","pkg_name":"包名"}';
            //
            monitor.click.end({
                msoAppVersion:msoAppVersion
            })
            console.log(wapSchema.replace('#mse_token', window.mse_token || '#null#'));
        },
        compareVersion: function(version){
            if(!version){
                return false;
            }
            //强制转为字符串
            version = version + '';

            var versions = version.split('.'),
                num = 0;

            for(var i=0,l=versions.length;i<l;i++){
                num += versions[i] * Math.pow(10,l-i);
            }

            return num;
        },
        sendMessageToApp: (function(){
            var messageCon;
            var sendMessageToApp = function(view){
                if(!messageCon){
                   messageCon = $('<iframe width="0" height="0" style="display:none;""></iframe>').appendTo($('body'));
                }
                if(!(messageCon && view)){
                    return;
                }
                messageCon.attr('src', 'msearchappsbb://www.haosou.com?view=' + encodeURIComponent(view));
            };
            return sendMessageToApp;
        })(),
        simulationClick:function(dom,func){
            var scrolling = false;
            dom.on("touchmove", function(evt) {
                dom.attr('pointer-events','auto');
                evt.preventDefault();
                scrolling = true;
            });
            dom.on("touchend", function(event) {
                if (scrolling === false) {
                    func && func.call(this, event);
                }
                scrolling = false;
                dom.attr('pointer-events','none');
            });
        },
        removeLastHistory: function(callback){
            //删除上一条历史记录
            //记录此变量用于onHashChange 时不执行页面绘制
            var userAgent = config.userAgent;
            if(userAgent.indexOf('360 Aphone Browser') > -1){
                callback && callback();
            }else{
                config.stopHashChange = true;
                window.history.go(-1);
                setTimeout(function(){
                    callback && callback();
                },100);
            }            
        },
        getCachData: function(){
            try{
                var uiParams = window.So.State.uiParams;
                var hash = window.location.hash.slice(1);
                var view_url = hash && hash.split('/').slice(0,2);

                //模块名
                var view_name = view_url && view_url.join('/');
                var _data_hash = uiParams[view_name]['_hash_'][hash];
                var data = uiParams[view_name][_data_hash]['data'];
            }catch(e){}

            return data;
        },
        getPoiHistory: function(){
            var _history = So.Util.storageItem("get", config.STORAGE_KEYS.POIHISTORY) || '[]';
            var history = [];

            if(_history){
                _history = JSON.parse(_history);

                //localstorage中存储的key是简写，取出的是改为全拼;
                _.each(_history, function(item, index){
                    history.push({
                        name: item.n,
                        pguid: item.p,
                        address: item.a,
                        district: item.d,
                        cat_new: item.c,
                        time: item.t,
                        from: item.f || '2'
                    });
                });
            };

            return history;
        },
        updatePoiHistory: function(values, opts){
            opts = opts || {};
            var history = opts.reset ? [] : So.getPoiHistory();
            var storage_key = config.STORAGE_KEYS.POIHISTORY;
            var new_history = [];
            var str_history = '';
            var do_remove = opts.remove || false;
            var temp;

            if(!_.isArray(values)){
                values = [values];
            }

            _.each(values, function(value, index){
                if(value === "" || value === "您现在的位置"){
                    return;
                }

                // {
                //     n: name,
                //     t: time,
                //     p: pguid,
                //     a: address,
                //     d: district,
                //     c: cat_new
                // }

                temp = {
                    n: value.name,
                    t: value.time || (new Date).getTime()
                };

                //减少数据存储，只存储其他端的，2代表wap来源，本来源不存储来源标识
                if(value.from && value.from != 2){
                    temp.f = value.from;
                }

                //pguid
                if(value.pguid){
                    temp.p = value.pguid;
                }

                //address
                if(value.address){
                    temp.a = value.address;
                }

                //address
                if(value.district){
                    temp.d = value.district;
                }

                //cat_new
                if(value.cat_new){
                    temp.c = value.cat_new;
                }


                if(!do_remove){
                    new_history.push(temp);
                }
            });


            //过滤重复数据;
            _.each(history, function(item, index){
                //name相同，pguid不同需要记录为2条记录
                //赋默认值为 空字符串;
                if(!item.pguid){
                    item.pguid = '';
                }
                var cur_item_key = item.name + item.pguid;
                var new_item_key = values[0].name + values[0].pguid;
                if(cur_item_key != new_item_key){
                    temp = {
                        n: item.name,
                        t: item.time
                    };

                    //减少数据存储，只存储其他端的，2代表wap来源，本来源不存储来源标识
                    if(item.from && item.from != 2){
                        temp.f = item.from
                    }
                    
                    //pguid
                    if(item.pguid){
                        temp.p = item.pguid;
                    }

                    //address
                    if(item.address){
                        temp.a = item.address;
                    }

                    //address
                    if(item.district){
                        temp.d = item.district;
                    }

                    //adcode
                    if(item.cat_new){
                        temp.c = item.cat_new;
                    }

                    new_history.push(temp);
                }
            });

            if(new_history && new_history.length){
                //存储数不超过20个，超过20个后，移除之前的数据;
                if(new_history.length >20){
                    new_history.splice(20);    
                }
                
                str_history = JSON.stringify(new_history);
            }

            if(str_history){
                So.Util.storageItem("set", storage_key, str_history)
            }else{
                 So.Util.storageItem("remove", storage_key);
            }
        },
        getRouteHistory: function(opts){
            opts = opts || {};
            var types = {
                "bus": 1,
                "drive": 2,
                "walk": 3,
                "bike": 4
            };
            var type = opts.type || '';
            var routeHistoryStorageKey = config.STORAGE_KEYS['ROUTEHISTORY' + type.toUpperCase()];
            var _historys = So.Util.storageItem("get", routeHistoryStorageKey);
            var historys = [];
            var history_item = {};
            var output_html = opts.output_html || false;

            _historys = JSON.parse(_historys);

            if(_historys && _historys.length){
                $.each(_historys, function(index, item){
                    //前端展示的时候过滤掉 名称为“您现在的位置” 的坐标
                    if(output_html){
                        if(item.s.n == '您现在的位置'){
                            delete item.s.x;
                            delete item.s.y;
                        }
                        if(item.e.n == '您现在的位置'){
                            delete item.e.x;
                            delete item.e.y;
                        }
                    }
                    
                    history_item = {
                        start: {
                            name: item.s.n,
                            x: item.s.x,
                            y: item.s.y
                        },
                        end: {
                            name: item.e.n,
                            x: item.e.x,
                            y: item.e.y
                        },
                        time: item.t,
                        from :item.f || '2'
                    };
                    var _passing = [];
                    var passing = [];
                    var names = [item.s.n];
                    if(item.p && item.p.length){
                        $.each(item.p, function(p_index, p_item){
                            var passing_item = {
                                name: p_item.n,
                                x: p_item.x,
                                y: p_item.y
                            };
                            _passing.push(p_item.n);

                            passing.push(passing_item);
                        });
                    }
                    names = names.concat(_passing);
                    names.push(item.e.n);


                    history_item.passing = passing;

                    if(output_html){
                        history_item.str_val = names.join('<em class="arrow"></em>');    
                    }

                    history_item.type = types[type];

                    historys.push(history_item);
                });
            }
            return historys;
        },
        saveRouteHistory: function(historys, opts){
            historys = historys || {};
            opts = opts || {};
            var reset = opts.reset || false;
            var type = opts.type || '';
            var new_historys = [];
            var routeHistoryStorageKey = config.STORAGE_KEYS['ROUTEHISTORY' + type.toUpperCase()];

            if(!routeHistoryStorageKey){
                return false;
            }

            if(!_.isArray(historys)){
                historys = [historys];
            }

            $.each(historys, function(index, history){
                var _start = history.start;
                var _end = history.end;
                var _passing = history.passing;
                var now = history.time || (new Date).getTime();
                if(!(_start && _end)){
                    return false;
                }

                var start = {
                        n: _start.name,
                        x: _start.x,
                        y: _start.y
                    },
                    end = {
                        n: _end.name,
                        x: _end.x,
                        y: _end.y
                    },
                    passing = [],
                    temp,
                    saveVal = {
                        s: start,
                        e: end,
                        t: now
                    };
                if(_passing && _passing.length){
                    for(var i=0,l=_passing.length;i<l;i++){
                        var item = _passing[i];
                        temp = {
                            n: item.name,
                            x: item.x,
                            y: item.y
                        };

                        passing.push(temp);
                    }
                }

                if(passing && passing.length){
                    saveVal.p = passing;
                }

                //减少数据存储，只存储其他端的，2代表wap来源，本来源不存储来源标识
                if(history.from && history.from != 2){
                    saveVal.f = history.from; 
                }

                new_historys.push(saveVal);
            });


            

            var stroageVals = So.Util.storageItem("get", routeHistoryStorageKey);

            if (!reset && stroageVals) {
                stroageVals = JSON.parse(stroageVals);

                $.each(stroageVals, function(index, item){
                    //去重，删除之前从重复的存储记录
                    if(item.s.n == new_historys[0].s.n && item.e.n == new_historys[0].e.n){
                        var passing_same = false;
                        var temp = true;

                        if(new_historys[0].p == item.p){
                            passing_same = true;
                        }else if(new_historys[0].p && new_historys[0].p.length && item.p && item.p.length && new_historys[0].p.length == item.p.length){
                            $.each(item.p, function(p_index, p_item){
                                if(p_item.n != new_historys[0].p[p_index].n){
                                    temp = false;
                                }
                            });

                            if(temp){
                                passing_same = true;
                            }
                        }

                        passing_same && stroageVals.splice(index, 1);
                    }
                });

                stroageVals.unshift(new_historys[0]);

                //存储数不超过20个，超过20个后，移除前面的数据;
                if(stroageVals.length > 20){
                    stroageVals.splice(20);
                }

            } else {
                stroageVals = new_historys;
            }
            if(stroageVals){
                stroageVals = JSON.stringify(stroageVals);
                So.Util.storageItem("set", routeHistoryStorageKey, stroageVals)
            }else{
                 So.Util.storageItem("remove", routeHistoryStorageKey);
            }
        },
        getNativeParams: function(params, view){
            params = params || {};
            view = view || So.State.currentUI.__view_name1__;
            var schemes_config = {
                'map/index': function(){
                    var obj = {//open360map://com.qihoo.msearch.qmap/route?action=map
                        "action": "map"
                    };
                    return obj;
                },
                'route/index': function(){
                    var obj = {//open360map://com.qihoo.msearch.qmap/route?action=toroutine&tramode=0
                        "action": "toroutine",
                        //"tramode": 0 //0公交 1驾车 2步行
                    };
                    var types = {
                        'bus': 0,
                        'drive': 1,
                        'walk': 2
                    };
                    var type = types[params.type];
                    if(typeof type != "undefined"){
                        obj.tramode = type;
                    }
                    return obj;
                },
                'tohere': function(){
                    var obj = {//open360map://com.qihoo.msearch.qmap/route?action=topoi&tramode=0&ecn=北京西站&eclon=116.321265&eclat=39.894872
                        "action": "topoi",
                        // "ecn" :"北京西站",
                        // "eclon": "116.321265",
                        // "eclat": "39.894872"
                    };
                    
                    if(params.name){
                        obj.ecn = params.name;
                    }
                    if(params.x){
                        obj.eclon = params.x;
                    }
                    if(params.y){
                        obj.eclat = params.y;
                    }
                    return obj;
                },
                'search/categories': function(){
                    var obj = {//open360map://com.qihoo.msearch.qmap/route?action=tocat
                        "action": "tocat"
                    };

                    return obj;
                },
                'search/map_list': function(){
                    var obj = {//open360map://com.qihoo.msearch.qmap/route?action=poilist&keyword=汉拿山&cityname=北京市
                        "action": "poilist",
                        //"keyword" :"汉拿山",
                        //"cityname": "北京市"
                    };
                    if(params.keyword){
                        obj.keyword = params.keyword;
                    }
                    if(params.city){
                        obj.cityname = params.city;
                    }
                    return obj;
                },
                'bus/map': function(){
                    var obj ={//open360map://com.qihoo.msearch.qmap/route?scn=360大厦&sclon=116.490616&sclat=39.983185&ecn=北京西站&eclon=116.321265&eclat=39.894872&tramode=0&policy=3&action=buslinemap&from=wap"
                        "action": "buslinemap",
                        "tramode": 0,
                        // "scn" :"360大厦",
                        // "sclon" :"116.490616",
                        // "sclat" :"39.983185",
                        // "ecn" :"北京西站",
                        // "eclon": "116.321265",
                        // "eclat": "39.894872",
                        "policy": 0,  //0较快捷   2少换乘  3少步行   5不坐地铁 ，默认为0,必须有默认值，否则客户端报错

                    };
                    var start = params.start;
                    var end = params.end;

                    if(start.name){
                        obj.scn = start.name;
                    }
                    if(start.x){
                        obj.sclon = start.x;
                    }
                    if(start.y){
                        obj.sclat = start.y;
                    }
                    if(end.name){
                        obj.ecn = end.name;
                    }
                    if(end.x){
                        obj.eclon = end.x;
                    }
                    if(end.y){
                        obj.eclat = end.y;
                    }
                    if(typeof params.type != 'undefined'){
                        obj.policy = params.type;
                    }

                    return obj;
                },
                'drive/map': function(){
                    var obj ={//open360map://com.qihoo.msearch.qmap/route?scn=360大厦&sclon=116.490616&sclat=39.983185&ecn=北京西站&eclon=116.321265&eclat=39.894872&tramode=1&policy=3&action=carlinemap&from=wap
                        "action": "carlinemap",
                        "tramode": 1,
                        // "scn" :"360大厦",
                        // "sclon" :"116.490616",
                        // "sclat" :"39.983185",
                        // "ecn" :"北京西站",
                        // "eclon": "116.321265",
                        // "eclat": "39.894872",
                        "policy": 1,  // 1路线最短   2不走高速  4少收费  ,如果是组合策略，则 相加，默认为1,必须有默认值，否则客户端报错

                    };
                    var start = params.start;
                    var end = params.end;
                    var policy = 0;

                    //路线最短、躲避拥堵
                    if(params.avoid_jam == 'true'){
                        policy += 1;
                    }
                    //不走高速
                    if(params.avoid_highway == 'true'){
                        policy += 2;
                    }
                    //少收费、避免收费
                    if(params.avoid_fee == 'true'){
                        policy += 4;
                    }

                    if(start.name){
                        obj.scn = start.name;
                    }
                    if(start.x){
                        obj.sclon = start.x;
                    }
                    if(start.y){
                        obj.sclat = start.y;
                    }
                    if(end.name){
                        obj.ecn = end.name;
                    }
                    if(end.x){
                        obj.eclon = end.x;
                    }
                    if(end.y){
                        obj.eclat = end.y;
                    }
                    if(policy){
                        obj.policy = policy;
                    }

                    return obj;
                },
                'walk/map': function(){
                    var obj ={//open360map://com.qihoo.msearch.qmap/route?scn=360大厦&sclon=116.490616&sclat=39.983185&ecn=北京西站&eclon=116.321265&eclat=39.894872&tramode=2&action=walklinemap&from=wap
                        "action": "walklinemap",
                        "tramode": 2,
                        // "scn" :"360大厦",
                        // "sclon" :"116.490616",
                        // "sclat" :"39.983185",
                        // "ecn" :"北京西站",
                        // "eclon": "116.321265",
                        // "eclat": "39.894872"

                    };
                    var start = params.start;
                    var end = params.end;

                    if(start.name){
                        obj.scn = start.name;
                    }
                    if(start.x){
                        obj.sclon = start.x;
                    }
                    if(start.y){
                        obj.sclat = start.y;
                    }
                    if(end.name){
                        obj.ecn = end.name;
                    }
                    if(end.x){
                        obj.eclon = end.x;
                    }
                    if(end.y){
                        obj.eclat = end.y;
                    }

                    return obj;
                },
                'search/map_detail': function(){
                    var obj = {//openapp://com.qihoo.msearch.qmap/route?pn=故宫博物馆&plon=116.39701843261719&plat=39.918487548828125&pid=d7320387151a1713&address=北京市东城区景上前街4号&action=poimap
                        "action": "poimap",
                        // "pn": "故宫博物馆",
                        // "plon": "116.39701843261719",
                        // "plat": "39.918487548828125",
                        // "pid": "d7320387151a1713",
                        // "address": "北京市东城区景上前街4号"
                    }
                    if(params.xx){
                        obj.pn = params.xx
                    }
                    if(params.xx){
                        obj.plon = params.xx
                    }
                    if(params.xx){
                        obj.plat = params.xx
                    }
                    if(params.ids){
                        obj.pid = params.ids
                    }
                    if(params.xx){
                        obj.address = params.xx
                    }
                    return obj;
                }
            };

            schemes_config["bus/index"] = schemes_config["bus/map"];
            schemes_config["drive/index"] = schemes_config["drive/map"];
            schemes_config["walk/index"] = schemes_config["walk/map"];
            schemes_config["search/aggregates"] = schemes_config["search/map_list"];

            var scheme = schemes_config[view];

            if(scheme){
                return scheme();
            }

        },
        callNative: (function(){
            var iframe;

            var userAgent = config.userAgent;
            var _from = 'wap';
            if(userAgent.indexOf('mso_app') > -1){
                _from = 'haosou';
            }

            var appload_timer;
            var delay_time = 500;

            var bindEvent = function() {
                document.addEventListener("visibilitychange", clear_appload);
                document.addEventListener("webkitvisibilitychange", clear_appload);
                document.addEventListener("blur", clear_appload);
                document.addEventListener("msvisibilitychange", clear_appload);
                window.addEventListener("blur", clear_appload);
            };

            var clear_appload = function() {
                appload_timer && clearTimeout(appload_timer)
            };

            bindEvent();

            

            var scheme = "open360map://com.qihoo.msearch.qmap/route?";

            return function(params, opts){
                opts = opts || {};
                var view = opts.view;
                var loadApp = opts.loadApp;
                var from = opts.from || '';
                var new_params = So.getNativeParams(params, view);
                var url = new_params;
                var params_arr = [];
                var click_time = (new Date).getTime();

                

                if(_.isObject(new_params)){
                    new_params.from = _from; //添加来源;
                    _.each(new_params, function(val, key){
                        params_arr.push(key + "=" + encodeURIComponent(val));
                    });
                    url = scheme + params_arr.join('&');
                }

                console.log(url);

                //var url = "baidumap://map/marker?location=40.047669,116.313082&title=我的位置&content=百度奎科大厦&src=yourCompanyName|yourAppName";

                if(!config.STOPSCHEME){
                    if(iframe){
                        document.body.removeChild(iframe);
                    }

                    iframe = document.createElement('iframe');
                    iframe.width="0";
                    iframe.height="0";
                    iframe.style.border="0";
                    iframe.style.display="none";
                    iframe.src = url;
                    document.body.appendChild(iframe);
                }

                if(loadApp){

                    appload_timer = setTimeout(function(){
                        var now = (new Date).getTime();
                        var appDownloadUrl = So["appDownloadUrl" + loadApp];
                        if(!appDownloadUrl){
                            return false;
                        }
                        appDownloadUrl = _So.addparamsToUrl(appDownloadUrl, {
                            from: from
                        })

                        if(now - click_time - delay_time < config.APPLOADTIMEOUT){
                            location.href = appDownloadUrl;
                        }
                        
                    },config.APPLOADTIMEOUT);
                }
                
            };
        })(),
        Class: Class.extend({})
    };    
    _.extend(window.So, _So);
});
