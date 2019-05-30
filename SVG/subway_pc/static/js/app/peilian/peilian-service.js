define(function(require) {
	var config = require('js/app/conf/config');

    So.PeilianProxy = {};

    So.PeilianService = {

        doGetCityList:function(d,c){
            sendJsonp(config.PEILIAN_SERVICE+config.CITY_LIST,d,c);
        },

		doGetCarTypeList : function(d,c){
            sendJsonp(config.PEILIAN_SERVICE+config.CAR_TYPE_LIST,d,c)
		},
        doGetJiaolianList: function(d,c){
            So.PeilianProxy.lat = d.lat||So.PeilianProxy.lat||0;
            So.PeilianProxy.lon = d.lon||So.PeilianProxy.lon||0;
            sendJsonp(config.PEILIAN_SERVICE+config.JIAOLIAN_LIST+'/'+d.page+'/'+d.pagesize+'/'+So.PeilianProxy.lat+'/'+So.PeilianProxy.lon+'/',
                {},c,{cp:d.page});
        },
        doGetJiaolianInfo:function(d,c){
            So.PeilianProxy.jid = d.id;
            sendJsonp(config.PEILIAN_SERVICE+config.JIAOLIAN_INFO+'/'+d.id,{},c);
        },
        doGetOrderService:function(d,c){
            //courseid:1
            //codef:1
            d.courseid = 1;d.codef = 1;
            sendJsonp(config.PEILIAN_SERVICE+config.ORDER_SERVICE,d,c);
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
                if(att)f.att = att;
                //f.count = 61;
                c(f);
            },
            error: function(h, g, f) {
                /*logInfo.status = url + "_**peilian**fail**";
                logInfo.code = g;*/
            }
        });
    }
});