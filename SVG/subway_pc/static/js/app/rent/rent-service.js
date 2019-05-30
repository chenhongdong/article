define(function(require) {
	var config = require('js/app/conf/config');
    var rentService = {
		doGetRentList : function(d,c){
            sendJsonp(config.RENT_SERVICE,d,c);
		}
	};
    function sendJsonp(url,d,c){
        if(!c)return;
        $.ajax({
            url: url,
            async: true,
            type: "GET",
			dataType: "jsonp",
            data: d,
            cache: false,
            success: function(f) {
                c(f);
            },
            error: function(h, g, f) {
                logInfo.status = url + "_**rent**fail**";
                logInfo.code = g;
            }
        });
    }
	return rentService;
});
