define(function(require) {
    var config = require('js/app/conf/config');

    var v1 = 111319.49077777777777777777777778;
    So.Util = {
        stringToBytes: function(e) {
            var d, a, c = [];
            for (var b = 0; b < e.length; b++) {
                d = e.charCodeAt(b);
                a = [];
                do {
                    a.push(d & 255);
                    d = d >> 8
                } while (d);
                c = c.concat(a.reverse())
            }
            return c
        },

        subByte: function(str, len, ext) {
            ext = undefined == ext ? '...' : ext;

            //str转为字符串，可能为数字;
            str = str + "";

            var r = /[^\x00-\xff]/g;

            if (str.replace(r, "mm").length <= len) {
                return str;
            }

            var m = Math.floor(len / 2);

            for (var i = m; i < str.length; i++) {
                if (str.substr(0, i).replace(r, "mm").length >= len) {
                    return str.substr(0, i) + ext;
                }
            }

            return str;
        },

        CharTranNum: function(f) {
            var b = this.stringToBytes("09AN");
            var d = b[0];
            var c = b[1];
            var a = b[2];
            var e = b[3];
            if (f >= d && f <= c) {
                return (f - d)
            } else {
                if (f >= a && f <= e) {
                    return (f - a + 10)
                } else {
                    return 24
                }
            }
        },
        _tcslen: function(b) {
            var a = b.length;
            for (var c = 0; c < a; c++) {
                if (b[c] == 0) {
                    return c
                }
            }
            return a
        },
        SPCodeToWorld: function(g) {
            var e = new Array(2);
            var a = this.stringToBytes(g);
            var h = this.stringToBytes("- \0");
            var c, b;
            var f = this._tcslen(a);
            for (c = 0; c < f; c++) {
                if (a[c] == h[0] || a[c] == h[1]) {
                    for (b = c; b < f - 1; b++) {
                        a[b] = a[b + 1]
                    }
                    a[b] = h[2]
                }
            }
            f = this._tcslen(a);
            if (f != 12) {
                return null
            }
            var k, l = 0;
            var d = 0;
            for (c = 0; c < 6; c++) {
                d = this.CharTranNum(a[c]);
                if (d == 24) {
                    return null
                }
                k = 1;
                for (b = c + 1; b < 6; b++) {
                    k *= 24
                }
                l += d * k
            }
            if (l > 136000000 || l < 73000000) {
                return null
            }
            e[0] = l / 1000000;
            d = 0;
            l = 0;
            for (c = 0; c < 6; c++) {
                d = this.CharTranNum(a[c + 6]);
                if (d == 24) {
                    return null
                }
                k = 1;
                for (b = c + 1; b < 6; b++) {
                    k *= 24
                }
                l += d * k
            }
            if ((l > 55000000) || (l < 17000000)) {
                return null
            }
            e[1] = l / 1000000;
            return e
        },
        checkLocalStorageSupport: function() {
            try {
                return "localStorage" in window && window.localStorage !== null
            } catch (a) {
                return false
            }
        },
        storageItem: function(b, a, c) {
            if (this.checkLocalStorageSupport() == false) {
                return null
            }
            if (b == "get") {
                try {
                    return window.localStorage.getItem(a)
                } catch (d) {
                    return null
                }
            } else {
                if (b == "set") {
                    try {
                        window.localStorage.setItem(a, c)
                    } catch (d) {}
                } else {
                    if (b == "remove") {
                        try {
                            window.localStorage.removeItem(a)
                        } catch (d) {}
                    }
                }
            }
        },
        formatDistance: function(distance,en) {
            var units = en ? ['m','km'] : ['米','公里'];
             if (/^[\d.]+$/.test(distance)) {
                distance = Math.round(distance);
                if (1000 >= distance){
                    if(distance < 10){
                        distance = '<10';
                    }
                    //单位为米的时候不显示小数点
                    return '<em>' + distance + '</em>' + units[0];
                }
                distance = (distance / 1000).toFixed(2);
                if (distance == parseInt(distance, 10)) {
                    distance = parseInt(distance, 10);
                }
                
                return '<em>' + distance + '</em>' +  units[1]
            }
            return distance ? '<em>' + distance + '</em>' : ''
        },
        formatDistance1: function(distance) {
                distance = distance || 0;
                if(0 < distance && distance < 1000){
                    return Math.round(distance) + 'm';
                }else if(1000 <= distance && distance < 10000){
                    return Math.round(distance / 100) / 10 + 'km';
                }else if(10000 <= distance && distance < 500000){
                    return Math.round(distance / 1000) + 'km';
                }

                return 0;
        },
        formatDistance2: function(distance) {
                if(typeof distance == 'undefined'){
                    distance = '';
                }
                if(0 <= distance && distance < 10){
                    return '小于10m';
                }else if(0 < distance && distance < 1000){
                    return Math.round(distance) + 'm';
                }else if(1000 <= distance && distance < 10000){
                    return Math.round(distance / 100) / 10 + 'km';
                }else if(10000 <= distance && distance < 500000){
                    return Math.round(distance / 1000) + 'km';
                }

                return 0;
        },
        formatTimeM: function(a) {
            a = parseInt(a) || 1;
            if (a < 60) {
                return a + "分钟"
            } else {
                return Math.floor(a / 60) + "小时" + (a % 60 == 0 ? "" : (parseInt(a % 60) + "分"))
            }
        },
        formatTimeS: function(a) {
            a = parseInt(a) / 60;
            return this.formatTimeM(a)
        },
        numberToLetter: function(c) {
            var b = "A";
            b = b.charCodeAt() + c;
            b = String.fromCharCode(b);
            return b
        },
        createLngLat: function(a, c) {
            try {
                return new so.maps.LatLng(c, a)
            } catch (b) {
                return {
                    x: a,
                    y: c
                };
            }
        },
        getUrlPosition: function(a, flag) {
            if (!a) return '';
            if (a.indexOf(",") >= 0) {
                a = a.split(",");
                if (flag) {
                    return this.createLngLat(a[0], a[1])
                } else {
                    return this.createLngLat(a[1], a[0])
                }
            } else {
                a = this.SPCodeToWorld(a);
                if (a && a.length > 1) {
                    return this.createLngLat(a[0], a[1])
                } else {
                    return null
                }
            }
        },
        createIcon: function(type, stype){
            var iconConf = {
                'poi': function(stype){
                    stype = stype || 0;
                    return {
                        src : '//p4.ssl.qhimg.com/t01f9a098d0d09aa7c5.png',
                        width: 20,
                        height: 35,
                        origin: {
                            x:0,
                            y:38 * stype
                        },
                        anchor: {
                            x:10,
                            y:35
                        },
                        scale:{
                            w:66,
                            h:377
                        }
                    }
                },
                'poiIndoor': function(stype){
                    stype = stype || 0;
                    return {
                        src : '//p4.ssl.qhimg.com/t01f9a098d0d09aa7c5.png',
                        width: 20,
                        height: 35,
                        origin: {
                            x:46,
                            y:38
                        },
                        anchor: {
                            x:10,
                            y:35
                        },
                        scale:{
                            w:66,
                            h:377
                        }
                    }
                },
                'poiSelect': function(stype){
                    stype = stype || 0;
                    return {
                        src : '//p4.ssl.qhimg.com/t01f9a098d0d09aa7c5.png',
                        width: 20,
                        height: 35,
                        origin: {
                            x:23,
                            y:38 * stype
                        },
                        anchor: {
                            x:10,
                            y:35
                        },
                        scale:{
                            w:66,
                            h:377
                        }
                    }
                },
                'startend' : function(stype){
                    stype = stype || '';
                    var cof = {
                        start: '/static/img/route_icon_start.png',
                        end: '/static/img/route_icon_end.png',
                        passing0: '/static/img/route_icon_passing1.png',
                        passing1: '/static/img/route_icon_passing2.png',
                        passing2: '/static/img/route_icon_passing3.png'
                    }
                    return {
                        src : cof[stype],
                        width: 21,
                        height: 25,
                        origin: {
                            x:0,
                            y:0
                        },
                        anchor: {
                            x:10,
                            y:25
                        },
                        scale:{
                            w:21,
                            h:25
                        }
                    }
                },
                'bus': function(stype){
                    stype = stype || '';
                    var cof = {
                        bus:{
                          origin:{
                                x:0,
                                y:66
                            }  
                        },
                        metro:{
                          origin:{
                                x:0,
                                y:86
                            }  
                        },
                        train:{
                          origin:{
                                x:0,
                                y:108
                            }  
                        },
                        plane:{
                          origin:{
                                x:0,
                                y:128
                            }  
                        },
                        drive:{
                          origin:{
                                x:0,
                                y:148
                            }  
                        }
                    }
                    return {
                        src : '/img/bus_icon.png?v=20151029',
                        width: 20,
                        height: 21,
                        origin: (cof[stype] && cof[stype].origin) || {
                            x:0,
                            y:0
                        },
                        anchor: {
                            x:10,
                            y:21
                        },
                        scale:{
                            w:20,
                            h:168
                        }
                    }
                },
                'geolocation': function(){
                   var ua = navigator.userAgent;
                   if(So.isIOS){                    
                        return {
                            src : '//p0.ssl.qhimg.com/t0154e080b559c4e042.png',
                            width: 46,
                            height: 50,
                            origin:{
                                x:0,
                                y:0
                            },
                            anchor: {
                                x:11.5,
                                y:12.5
                            },
                            scale:{
                                w:23,
                                h:25
                            }
                        }
                   }else{
                        return {
                            src : '//p0.ssl.qhimg.com/t01e541e36192ebdeca.gif',
                            width: 28,
                            height: 28,
                            origin:{
                                x:0,
                                y:0
                            },
                            anchor: {
                                x:10,
                                y:10
                            },
                            scale:{
                                w:20,
                                h:20
                            }
                        }
                   }
                },
                'linestation': function(){
                    return {
                        src : '/img/last-all.png?v=1205',
                        width: 12,
                        height: 12,
                        origin:{
                            x:40,
                            y:61
                        },
                        anchor: {
                            x:6,
                            y:6
                        },
                        scale:{
                            w:56,
                            h:150
                        }
                    }
                },
                'curlinestation': function(){
                    return {
                        src : '//p4.ssl.qhimg.com/t01f9a098d0d09aa7c5.png',
                        width: 20,
                        height: 35,
                        origin: {
                            x:46,
                            y:76
                        },
                        anchor: {
                            x:10,
                            y:35
                        },
                        scale:{
                            w:66,
                            h:377
                        }
                    }
                },
                'point': function(){
                    return {
                        src : '//p4.ssl.qhimg.com/t01f9a098d0d09aa7c5.png',
                        width: 20,
                        height: 35,
                        origin: {
                            x:46,
                            y:0
                        },
                        anchor: {
                            x:10,
                            y:35
                        },
                        scale:{
                            w:66,
                            h:377
                        }
                    }
                },
                'center': function(){
                    return {
                        src : '//p4.ssl.qhimg.com/t01f9a098d0d09aa7c5.png',
                        width: 20,
                        height: 31,
                        origin: {
                            x:46,
                            y:194
                        },
                        anchor: {
                            x:10,
                            y:31
                        },
                        scale:{
                            w:66,
                            h:377
                        }
                    }
                },
                'livetraffic':function(){
                    return {
                        src : '//s.ssl.qhres.com/static/14283ec1d506ae16/livetraffic.png',
                        width: 34,
                        height: 36,
                        origin: {
                            x:0,
                            y:0
                        },
                        anchor: {
                            x:17,
                            y:18
                        },
                        scale:{
                            w:34,
                            h:36
                        }
                    }
                },
                video: function(stype){
                    var types = {
                        'active' : 33
                    },
                        x = stype && types[stype] || 0;
                    
                    return {
                        src : '//p0.ssl.qhimg.com/t013cb8c960d01f3057.png',
                        width: 28,
                        height: 34,
                        origin: {
                            x:x,
                            y:0
                        },
                        anchor: {
                            x:14,
                            y:34
                        },
                        scale:{
                            w:94,
                            h:34
                        }
                    }
                },
                'parking': function(){
                    return {
                        src : '//p4.ssl.qhimg.com/t01f9a098d0d09aa7c5.png',
                        width: 20,
                        height: 35,
                        origin: {
                            x:46,
                            y:228
                        },
                        anchor: {
                            x:10,
                            y:35
                        },
                        scale:{
                            w:66,
                            h:377
                        }
                    }
                },
            };

            var conf = _.isFunction(iconConf[type]) ? iconConf[type](stype) : iconConf[type];
            var img_src = conf.src || '/img/map_poi.png';

            var icon = new so.maps.MarkerImage(
                img_src,
                new so.maps.Size(conf.width, conf.height),
                new so.maps.Point(conf.origin.x, conf.origin.y),
                new so.maps.Point(Math.abs(conf.anchor.x), Math.abs(conf.anchor.y)),
                new so.maps.Size(conf.scale.w, conf.scale.h)
            );
            return icon;
        },
        createMarker: function(d, c) {
            var me = this;
            
            var funs = {
                'poi' : function(){
                    var icontype = 'poi';
                    var zIndex = 10;
                    if(c.highlight){
                        icontype = 'poiSelect';
                        zIndex = 110;
                    }
                    
                    var icon = me.createIcon(icontype, c.flag);
                    var b = {
                        id: c.markerid,
                        position: new so.maps.LatLng(c.y, c.x),
                        icon: icon,
                        zIndex: zIndex,
                        offset: {
                            x: -icon.size.width / 2,
                            y: -icon.size.height
                        }
                    };
                    return new so.maps.Marker(b)
                },
                'point': function(){
                    var icon = me.createIcon('point');
                    var b = {
                        id: c.markerid,
                        position: new so.maps.LatLng(c.y, c.x),
                        icon: icon,
                        zIndex: 100,
                        offset: {
                            x: -icon.size.width / 2,
                            y: -icon.size.height
                        }
                    };
                    return new so.maps.Marker(b)
                },
                'center': function(){
                    var icon = me.createIcon('center');
                    var b = {
                        id: c.markerid,
                        position: new so.maps.LatLng(c.y, c.x),
                        icon: icon,
                        zIndex: 100,
                        offset: {
                            x: -icon.size.width / 2,
                            y: -icon.size.height
                        }
                    };
                    return new so.maps.Marker(b)
                },
                'livetraffic': function(){
                    var icon = me.createIcon('livetraffic');
                    var b = {
                        id: c.markerid,
                        position: new so.maps.LatLng(c.y, c.x),
                        icon: icon,
                        zIndex: 100,
                        offset: {
                            x: -icon.size.width / 2,
                            y: -icon.size.height
                        }
                    };
                    return new so.maps.Marker(b)
                },
                'startend': function(){
                    var icon = me.createIcon('startend', c.flag);
                    var b = {
                        id: c.id,
                        position: c.position,
                        icon: icon,
                        zIndex: 100,
                        offset: {
                            x: -icon.size.width / 2,
                            y: -icon.size.height
                        }
                    };
                    return new so.maps.Marker(b)
                },
                'geolocation': function(){
                    var icon = me.createIcon('geolocation', c.flag);
                    var b = {
                        id: c.id,
                        position: c.pos,
                        icon: icon,
                        zIndex: 1,
                        offset: {
                            x: -icon.size.width / 2,
                            y: -icon.size.height
                        }
                    };
                    return new so.maps.Marker(b)
                },
                'busmarker': function(){
                    var icon = me.createIcon('bus', c.flag);
                    var b = {
                        id: c.id,
                        position: c.position,
                        icon: icon,
                        zIndex: 10,
                        offset: {
                            x: -icon.size.width / 2,
                            y: -icon.size.height
                        }
                    };
                    return new so.maps.Marker(b)
                },
                'linestation': function(){
                    var icon = me.createIcon('linestation', c.flag);
                    var b = {
                        id: c.id,
                        position: c.pos,
                        icon: icon,
                        zIndex: 10,
                        offset: {
                            x: -icon.size.width / 2,
                            y: -icon.size.height
                        }
                    };
                    return new so.maps.Marker(b)
                },
                'curlinestation': function(){
                    var icon = me.createIcon('curlinestation');
                    var b = {
                        id: c.markerid,
                        position: new so.maps.LatLng(c.y, c.x),
                        icon: icon,
                        zIndex: 10,
                        offset: {
                            x: -icon.size.width / 2,
                            y: -icon.size.height
                        }
                    };
                    return new so.maps.Marker(b)
                },
                'geoaccuracy': function(){
                    var b = {
                        id: c.id,
                        center: c.pos,
                        radius: c.acc,
                        strokeWeight: 1,
                        strokeColor: "#4C7FB2",
                        strokeOpacity: 1,
                        fillColor: "#4C7FB2",
                        fillOpacity: 0.2,
                        simplify:false
                    };
                    return new so.maps.Circle(b)
                },
                'video': function(){
                    var icon = me.createIcon('video');
                    var b = {
                        id: c.id,
                        position: new so.maps.LatLng(c.y, c.x),
                        icon: icon,
                        zIndex: 10,
                        offset: {
                            x: -icon.size.width / 2,
                            y: -icon.size.height
                        }
                    };
                    return new so.maps.Marker(b)
                },
                'parking': function(){
                    var icon = me.createIcon('parking');
                    var b = {
                        id: c.markerid,
                        position: new so.maps.LatLng(c.y, c.x),
                        icon: icon,
                        zIndex: 10,
                        offset: {
                            x: -icon.size.width / 2,
                            y: -icon.size.height
                        }
                    };
                    return new so.maps.Marker(b)
                }
            }

            return d && funs[d] && funs[d]();
        },
        getGeoErrorInfo: function(a) {
            if (!a) {
                return ""
            }
            var b = "抱歉, 无法定位您的位置";
            switch (a.code) {
                case a.PERMISSION_DENIED:
                    b = "定位失败,请在系统设置中打开定位服务,刷新并允许定位";
                    break;
                case a.POSITION_UNAVAILABLE:
                    b = "您的设备目前无法定位,请稍后再试";
                    break;
                case a.TIMEOUT:
                case 3:
                    b = "定位请求超时, 请重试";
                    break;
                case a.UNKNOWN_ERROR:
                    b = "抱歉, 无法定位您的位置";
                    break
            }
            return b
        },
        isIE: function() {
            return (document.all && window.ActiveXObject && !window.opera) ? true : false
        },
        hasQuery: function(url) {
            var params = So.urltojson(url);
            var keys = ["k", "q",'type', "pid", "pguid", "ids", "showtf"];
            var hasquery = false;
            _.each(keys, function(e, d) {
                if (params[e]) {
                    hasquery = true
                }
            });
            return hasquery
        },
        fromLatlngToMercator:function(lat,lng){ //经纬度转换成墨卡托坐标
            lat = parseFloat(lat);
            lng = parseFloat(lng);
            var x = lng * v1;
            var y = Math.log(Math.tan((90 + lat) *
                    0.0087266462599716478846184538424431)) /
                0.017453292519943295769236907684886;
            y = y * v1;
            return {x:x,y:y}
        },
        fromMercatorToLatLng:function(x,y){//墨卡托坐标转换成经纬度
            x = parseFloat(x);
            y = parseFloat(y);
            var lat = y / v1;
            lat = Math.atan(Math.exp(lat *
                0.017453292519943295769236907684886)) *
                114.59155902616464175359630962821 - 90;
            var lng = x / v1;
            return {lat:lat,lng:lng}
        },
        removeOverlays:function(map,overlays){
            _.each(overlays,function(overlay,index){
                  if(overlay.id != 'locAccuracy' && overlay.id != 'locMarker' && (overlay.id&&overlay.id.indexOf('livetraffic')<0)){
                        map.removeOverlays(overlay);
                  }  
            });
        },
        toRadian:function (deg) {
            return deg * (Math.PI / 180)
        },
        distanceTo:function(start, end){
            var dLat = this.toRadian(start.y) - this.toRadian(end.y);
            var dLon = this.toRadian(start.x) - this.toRadian(end.x);
            var a = (Math.sin(dLat / 2) * Math.sin(dLat / 2)) +
                    (Math.cos(this.toRadian(end.y)) *
                    Math.cos(this.toRadian(start.y)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2));
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return 6378136.49 * c;
        }
    };
});