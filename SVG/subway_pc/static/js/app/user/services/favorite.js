define(function(require){
    var config = require('js/app/conf/config');
    var pagesize_default = 10;
    function favorite(params, callback){
        params = params || {};
        var page = params.page;
        var pagesize = params.pagesize || pagesize_default;
        var geolocation = So.State.getLocation(true);
        var data = {
            type: 1,
            need_page: 1,
            page_no: page,
            page_rows: pagesize
        };

        if(geolocation.state == 1 && geolocation.x && geolocation.y){
            data.mp = geolocation.y + ',' + geolocation.x;
        }
        
        $.ajax({
            url: config.FAVORITE_GETLIST,
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
    return favorite;
});