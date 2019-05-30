define(function(require){
    var config = require('js/app/conf/config');
    var pagesize_default = 10;
    function mall_service(params, callback){
        params = params || {};
        var page = params.page || 1;
        var floor = params.floor || 1;
        var pagesize = params.pagesize || pagesize_default;
        var data = {
            pguid: params.id,
            page: page,
            pagesize: pagesize
        };

        if(params.floor){
            data.floor = params.floor;
        }

        if(params.category){
            data.category = params.category;
        }
        
        $.ajax({
            url: config.MALL_LIST,
            async: false,
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
    return mall_service;
});