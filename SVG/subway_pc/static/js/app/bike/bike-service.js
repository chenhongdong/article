define(function(require) {
    var config = require('js/app/conf/config');
    So.BikeService = {
        ajax: function(b, c) {
            So.printWapSchema();
            var a = this;
            var cach_data = So.getCachData();

            if(cach_data){
                c(cach_data);
                return false;
            }
            $.ajax({
                url: config.BIKE_SERVER,
                async: true,
                type: "GET",
                dataType: "jsonp",
                jsonp: "jsoncallback",
                data: b,
                success: function(d) {
                    a.invokeCallback(d, c)
                },
                error: function() {}
            })
        },
        invokeCallback: function(a, b) {
            b(a)
        },
        searchRoute: function(start, end, callback) {
            this.ajax({
                origin: start,
                destination: end
            }, callback)
        }
    };
});