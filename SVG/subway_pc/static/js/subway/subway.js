define(function(require, exports, module) {
    var Size = require('js/subway/base/size');
    var Bounds = require('js/subway/base/bounds');
    var store = require('js/lib/store');
    var XmlParser = require('js/subway/parse/xmlparser');
    var Position = require('js/subway/base/position');

    var centers = {
        beijing:[2100,1200],
        shanghai:[1800,1300]
    }

    module.exports = {
        imageData: {
            transfer: "data:image/png;base64,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",
            airport: "data:image/png;base64,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"
        },

        cityCode: "",
        cityName: "",
        fileName: "",

        fetchData: function(city, onsucess, onerror) {
            var url = 'other/subway_xml/'+ city +'.xml';            
            var self = this;
            var entity;
            var $defer = $.Deferred().done(onsucess).fail(onerror);
            var storeKeyPrefix = 'sw_' + city + '_';
            var storeKey = ''
            var center = centers[city] || []
            if(window._cdn_files && window._cdn_files[url]){
                url = window._cdn_files[url]
                storeKey = storeKeyPrefix + url.split("/").pop().split(".").shift()
            }else{
                url = '/' + url;
            }
            
            var imageIcon = this.fetchIcon();
            
            this.getData(storeKey, function(data) {
                data.cityName = self.fileName;
                data.cityCode = self.cityCode;
                data.imageIcon = imageIcon;
                data.imageData = self.imageData;
                data.center = center;
                self.entity = data;
                $defer.resolve(data);
            }, function() {
                try {
                    var filename = new RegExp(storeKeyPrefix + ".*");
                    store.forEach(function(k, v) {
                        k != storeKey && filename.test(k) && store.remove(k)
                    })
                } catch (e) {};
                self.getXmlOnline(url, function(data) {
                    if (data) {
                        entity = self.parseXML(data);
                        try{
                            storeKey && store.set(storeKey, entity);
                        }catch(e){};
                        entity.cityName = self.fileName;
                        entity.cityCode = self.cityCode;
                        entity.imageIcon = imageIcon;
                        entity.imageData = self.imageData;
                        entity.center = center;
                        self.entity = entity;
                        $defer.resolve(entity);
                    }else{
                        $defer.reject();
                    }
                }, function() {
                    $defer.reject({});
                })
            })

            return $defer.promise();
        },

        fetchIcon: function() {
            var imageIcon = {};
            for (var key in this.imageData) {
                if (!imageIcon[key]) {
                    imageIcon[key] = new Image;
                    var self = this;
                    imageIcon[key].onload = function() {
                        //imageIcon[key] = this;
                    }
                    imageIcon[key].src = this.imageData[key];
                }
            }
            return imageIcon;
        },

        parseXML: function(xmldoc) {
            var xmlparser = new XmlParser(xmldoc);
            var entity = xmlparser.parse();
            return entity;
        },

        getXmlOnline: function(url, onsucess, onerror) {
            if (url) {
                $.ajax({
                    type: "GET",
                    url: url,
                    dataType: "xml",
                    timeout: 5000,
                    success: function(data) {
                        data ? onsucess && onsucess(data) : onerror && onerror()
                    },
                    error: function() {
                        onerror && onerror()
                    }
                })
            } else {
                onerror && onerror()
            }
        },

        getData: function(storeKey, onsucess, onerror) {

            if (storeKey) {
                var data = store.get(storeKey);
                data ? onsucess && onsucess(data) : onerror && onerror()
            } else {
                onerror && onerror()
            }
        },

        findNearestStation: function(point, tolerance) {
            var maxDist = Number.POSITIVE_INFINITY,
                dist = 0,
                res = null;
            var entity = this.entity;
            if (point && point.x && point.y)
                for (var lines = entity.lines, i = 0; i < lines.length; i++)
                    for (var line = lines[i], j = 0; j < line.stations.length; j++) {
                        var station = line.stations[j];
                        if (station.iu) {
                            dist = Math.pow(station["x"] - point.x, 2) + Math.pow(station["y"] - point.y, 2);
                            maxDist > dist && (maxDist = dist, res = station);
                        }
                    }
            if (!(tolerance > 0 && maxDist > tolerance * tolerance)) return res
        },

        findNearestStationByName: function(name){
            if(!name){
                return ;
            }
            var entity = this.entity,res = null;
            for (var lines = entity.lines, i = 0; i < lines.length; i++){
                for (var line = lines[i], j = 0; j < line.stations.length; j++) {
                    var station = line.stations[j];
                    if (station.sid === name) {
                        return station;
                    }
                }
            }
            return null;
        },

        getStationExt: function(param,onsucess,onerror){
             $.ajax({
                    type: "GET",
                    async: true,
                    url: '/app/',
                    dataType: "jsonp", 
                    data: param,
                    jsonp: "jsoncallback",
                    timeout: 5000,
                    success: function(data) {
                        data ? onsucess && onsucess(data) : onerror && onerror()
                    },
                    error: function() {
                        onerror && onerror()
                    }
            })
        }
    };
});
