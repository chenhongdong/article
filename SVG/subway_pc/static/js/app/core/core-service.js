define(function(require) {
    var config = require('js/app/conf/config');
    var ua = navigator.userAgent;
    var monitor = require('js/app/monitor').location;

    So.GeoDeviationService = {
        geodev: function(opts, callback) {
            var logdata = {
                latlon: opts.lat + "," + opts.lng,
                oprCmd: "latlonPY",
                oprCategory: "service",
                status: "request"
            };
            if(!So.GeolocationService.correct){
                var _onsuccess = function(e) {
                    logdata.status = "success";
                    // monitor log
                    monitor.disp.success(logdata)
                    var j = e.locations.split(",");
                    opts.lng = Number(j[0]);
                    opts.lat = Number(j[1]);
                    callback(opts)
                };
                var _onfail = function(e) {
                    // logdata.status = "fail";
                    // logdata.code = e.status;
                    // monitor.pv(logdata);
                    callback(opts)
                };
                var url = config.GEO_DEV_SERVER + "&locations=" + opts.lng + "," + opts.lat+ "&t="+new Date().getTime();
                try {
                     $.ajax({
                        url: url,
                        async: true,
                        type: "GET",
                        dataType: "jsonp",
                        jsonp: "callback",
                        data: {},
                        success: function(e){
                            if (e.status == "1") {
                                _onsuccess(e)
                            } else {
                                _onfail(e)
                            }
                        },
                        error: function() {}
                    })
                } catch (f) {}
            }else{
                callback(opts);
            }
       }
    };

    So.GeocoderService = {
        _lnglatToPoi_cache: {},
        regeocode: function(a, b) {
            $.ajax({
                url: config.RGEOCODE_SERVICE_URL,
                async: true,
                type: "GET",
                dataType: "jsonp",
                jsonp: "jsoncallback",
                data: a,
                success: b,
                error: function() {}
            })
        }
    };
    So.Geocoder = function(a) {
        this.defaults = {
            radius: 1000
        };
        this.option = a;
        this.regeocode = function(b, d, c) {
            b.lng = b.lng || b.x;
            b.lat = b.lat || b.y;
            if (!b || !b.lng || !b.lat || !d || !c) {
                return false
            }
            var f = {};
            f = _.extend(f, this.defaults, this.option, {
                //location: b.lng + "," + b.lat
                x: b.lng,
                y: b.lat
            });
            So.GeocoderService.regeocode(f, function(g) {
                if (g.status == "1" && g.info == "OK") {
                    d(g)
                } else {
                    c(g)
                }
            })
        }
    };

    So.GeolocationService = {
        getPosition: function(d, a, loc) {
            if (navigator.geolocation == null) {
                a && a();
                return
            }
            if (loc) {
                var p = loc.split(',');
                var e = {
                    accuracy: 1,
                    lng: p[1],
                    lat: p[0],
                    name: p[2]
                };
                d(e);
                return;
            }
            var c = {
                oprCategory: "geolocation"
            };
            var b = function(f) {
                //模拟您现在的位置
                // f = f && f.coords ? f : {
                //     coords: {
                //         latitude:39.98275975717564,
                //         longitude:116.49060041600791
                //     }
                // };
                c.latlon = f.coords.latitude + "," + f.coords.longitude;
                c.status = "success";
                var g = f.coords.accuracy;
                if (g == null) {
                    g = 1000
                }
                g = parseInt(g);

                monitor.disp.all(c)

                So.GeoDeviationService.geodev({
                    lng: f.coords.longitude,
                    lat: f.coords.latitude,
                    accuracy: g
                }, d)
            };
            var errorFun = function(f) {
                var loc = So.State && So.State.getLocation() || {};

                //定位失败但是当前的定位状态是99时返回定位成功;
                if(loc.state==99){
                    b({
                        coords:{
                            latitude:loc.y,
                            longitude:loc.x
                        }
                    })
                    return false;
                }
                c.status = "fail";
                c.code = f.code;
                a && a(f)
            };
            // b();
            if((/mso_app/i.test(ua) || /gaia_app/i.test(ua)) && !navigator.userAgent.match(/(i[^;]+\;(U;)? CPU.+Mac OS X)/)){ //if is 360 soapp
                /*	var f = {
            		coords:{
            		   latitude:39.98275975717564,
            		   longitude:116.49060041600791,
            		   accuracy:50
            		}
            	}
            	b(f);*/

                var _position = {
                    message:'timeout',
                    code:3
                };
                So.GeolocationService.correct = true;
                if(window.position){
                        try{
                            _position = {
                                 coords:{
                                    latitude:position.getLatitude(),
                                    longitude:position.getLongitude(),
                                    accuracy:position.getAccuracy()
                                 }
                             }
                             b(_position);
                        }catch(e){
                            errorFun(_position);
                        }
                }else{
                    errorFun(_position);
                }
            }else if(config.ISIPHONE && config.MSOAPP && So.compareVersion && So.compareVersion(config.MSOAPP) >= So.compareVersion("9999.1.5.0")){
                So.GeolocationService.correct = true;
                config.connectWebViewJavascriptBridge(function(responseData){
                    try{
                        var position = JSON.parse(responseData),
                            f = {
                                coords:{
                                    latitude:position.y,
                                    longitude:position.x,
                                    accuracy:100
                                }
                            };

                        b(f);
                    }catch(e){
                        window.__errorReport__ && window.__errorReport__.report(e,1098);
                    }
                });
            }else{
                if(/UCBrowser/i.test(ua)){
                    So.GeolocationService.correct = true;
                } else if(/360 Aphone/.test(ua)){ //360 Aphone
                    var ver360Browser = /360 Aphone Browser \((\d+\.\d+)\.\d+/i.test(ua)? + RegExp['\x241'] : 0;
                    if(So.locateNum && ((ver360Browser > 6.2 && ver360Browser < 8.0) || (ver360Browser>100 && ver360Browser < 100.2))){ //,大于6.2小于8.0不处理纠偏，奇酷360手机浏览器版本>=100
                        So.GeolocationService.correct = true
                    }else{
                        So.GeolocationService.correct = false
                    }
                }else{
                    So.GeolocationService.correct = false
                }
                navigator.geolocation.getCurrentPosition(b, errorFun, {//b
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 2000//1
                })
            }
        }
    };

    So.PartitionService = {
        byCity: function(cityName, callback) {
            var me = this;
            var data = {
                address: cityName
            };
            $.ajax({
                url: config.GEOCODE_SERVICE_URL,
                async: true,
                type: "GET",
                dataType: "jsonp",
                jsonp: "jsoncallback",
                data: data,
                success: function(d) {
                    me.invokeCallback(d, callback)
                },
                error: function() {
                    me.invokeCallback({
                        status: "0"
                    }, callback)
                }
            })
        },
        invokeCallback: function(data, callback) {
            callback(data)
        },
    };
});
