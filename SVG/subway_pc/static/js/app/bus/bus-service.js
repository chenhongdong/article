define(function(require) {
    var config = require('js/app/conf/config');
    So.BusService = {
        ajax: function(b, c) {
            So.printWapSchema();
            var me = this;
            var cach_data = So.getCachData();

            if(cach_data){
                c(cach_data);
                return false;
            }
            $.ajax({
                url: config.BUS_SERVER,
                async: true,
                type: "GET",
                dataType: "jsonp",
                jsonp: "callback",
                data: b,
                success: function(data) {
                    me.invokeCallback(data, c)
                },
                error: function() {
                    me.invokeCallback({
                        status: "0"
                    }, callback)
                }
            })
        },
        invokeCallback: function(a, b) {
            b(a)
        },
        searchRoute: function(start, end, type,transit_type,sort_rule,expected_time, callback) {
            city = So.CityData.citycode();
            transit_type = transit_type || '';
            expected_time = expected_time.slice(-4) || '';
            sort_rule = sort_rule || 0;
            var data = {
                nightflag:0,
                origin:start,
                destination:end,
                strategy: type,
                transit_type: transit_type,
                sort_rule: sort_rule,
                city:city,
                expected_time: expected_time
            }
            this.ajax(data, callback)
        },
        byBusID: function(b, d, c, a, e) {
            if (_.isArray(b)) {
                b = b.join(",")
            }
            this.ajax({
                ids: b,
                city: d,
                batch: c,
                number: a,
                sid: 8004
            }, e)
        },
        byBusName: function(b, d, c, a, e) {
            this.ajax({
                busName: b,
                city: d,
                batch: c,
                number: a,
                sid: 8004
            }, e)
        },
        byStationName: function(b, d, c, a, e) {
            this.ajax({
                stationName: b,
                city: d,
                batch: c,
                number: a,
                sid: 8086
            }, e)
        }
    };
});