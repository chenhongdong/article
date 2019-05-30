define(function(require){
    var config = require('js/app/conf/config');
    var pagesize_default = 10;
    function service(params, callback){
        params = params || {};
        var page = params.page || 1;
        var tags = params.tags;
        var cityname = params.cityname;
        var id = params.id;
        var cenx = params.cenx;
        var ceny = params.ceny;
        var pagesize = params.pagesize || pagesize_default;
        var data = {
            "type": tags,
            "cityname": cityname,
            "pguid": id,
            "cenX": cenx,
            "cenY": ceny,
            "map_cpc": "off",
            "page": page,
            "number": pagesize
        };

        if(params.category){
            data.category = params.category;
        }
        
        $.ajax({
            url: config.RECOMMEND_SIMILAR,
            async: true,
            type: "GET",
            dataType: "jsonp",
            jsonp: "jsoncallback",
            data: data,
            cache: false,
            success: function(data) {
                callback(data)
            },
            error: function() {
                callback(data);
            }
        });
    }
    return service;
});