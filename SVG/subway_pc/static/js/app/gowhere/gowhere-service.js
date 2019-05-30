define(function(require) {
	var config = require('js/app/conf/config');

    So.GowhereService = {
        gowhereProxy : {},
		doGetNearSports : function(d,c){
            sendJsonp(config.GOWHERE_SERVICE+config.NEAR_SPORTS,d,c,{cp:d.page});
		},
        doGetHotSports: function(d,c){
            sendJsonp(config.GOWHERE_SERVICE+config.HOT_SPORTS,d,c,{cp:d.page});
        },
        doGetSportDetail:function(d,c){
            if(d.from == "hot"){
                sendJsonp(config.GOWHERE_SERVICE+config.HOT_SPORTS_DETAIL,d,c,d.from);
            }else{
                sendJsonp(config.GOWHERE_SERVICE+config.NEAR_SPORTS_DETAIL,d,c,d.from);
            }
        }
	}
    function sendJsonp(url,d,c,att){//att 需要额外记录的数据
        if(!c)return;
        $.ajax({
            url: url,
            async: true,
            type: "GET",
            dataType: "jsonp",
            jsonp: "jsoncallback",
            data: d,
            cache: false,
            success: function(f) {
                //alert('suc',f);
                if(att)f.att = att;
                c(f);
            },
            error: function(h, g, f) {
                //alert('fail');
                logInfo.status = url + "_**peilian**fail**";
                logInfo.code = g;
            }
        });
    }
});