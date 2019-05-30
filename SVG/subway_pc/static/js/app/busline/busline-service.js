define(function(require) {
    var config = require('js/app/conf/config');
    So.BusLineService = {
        ajax: function(data, callback) {
            var me = this;
            $.ajax({
                url: config.ASS_SERVER,
                async: true,
                type: "GET",
                dataType: "jsonp",
                jsonp: "jsoncallback",
                data: data,
                cache: false,
                success: function(data) {
                    me.invokeCallback(data, callback)
                },
                error: function() {
                    me.invokeCallback({
                        status: "E1"
                    }, callback)
                }
            })
        },
        invokeCallback: function(data, callback) {
            data = data || {};
            callback(data)
        },
        searchById: function(lineid, callback) {
            this.ajax({
                lineid: lineid,
                //city_id: '110000',
                sid: '38100'
            }, callback);
        }
    };
});