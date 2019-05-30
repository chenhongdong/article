define(function(require) {
    var config = require('js/app/conf/config');
    So.CarService = {
        ajax: function(data, callback) {
            So.printWapSchema();
            var me = this;
            $.ajax({
                url: config.DRIVE_SERVER,
                async: true,
                type: "GET",
                dataType: "jsonp",
                jsonp: "jsoncallback",
                data: data,
                success: function(data) {
                    me.invokeCallback(data, callback)
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
        searchRoute: function(start, end, passing, routeTypes, callback) {
            var cach_data = So.getCachData();

            if(cach_data){
                callback(cach_data);
                return false;
            }


            So.CarService.ajax({
                extensions:'all',
                show_road_tag: 'true',
                origin: start,
                destination: end,
                waypoints: passing,
                avoid_highway: routeTypes.avoid_highway ? routeTypes.avoid_highway : '',
                avoid_jam: routeTypes.avoid_jam ? routeTypes.avoid_jam : '',
                avoid_fee: routeTypes.avoid_fee ? routeTypes.avoid_fee : '',
                count: 3
            },
            callback);
        }
    };
});