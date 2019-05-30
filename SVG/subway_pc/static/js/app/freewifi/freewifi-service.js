define(function(require) {
	var config = require('js/app/conf/config');

    So.FreeWifiService = {
		doGetFreeWifiList : function(d,c){
            sendJsonp(config.FREEWIFI_SERVICE,d,c);
		}
	}
    function sendJsonp(url,d,c,att){//att 需要额外记录的数据
        if(!c)return;
        $.ajax({
            url: url,
            async: true,
            type: "GET",
            dataType: "jsonp",
            jsonp: "cb",
            data: d,
            cache: false,
            success: function(f) {
                if(att)f.att = att;
                //f.count = 61;
                c(f);
            },
            error: function(h, g, f) {
                logInfo.status = url + "_**peilian**fail**";
                logInfo.code = g;
            }
        });
    }
});