define(function(require) {
    var config = require('js/app/conf/config');

    So.ActivityService = {
        getNearActivity: function(param, cbk) {
            param.act = 'list';
            sendJsonp(config.ACTIVITY_SERVICE, param, cbk);
        },
        getActivityDetail: function(param, cbk) {
            sendJsonp(config.ACTIVITY_SERVICE, param, cbk);
        }
    }

    function sendJsonp(url, param, cbk) {
        if (!cbk) return;
        param.outputType = 'json';
        $.ajax({
            url: url,
            async: true,
            type: "GET",
            dataType: "jsonp",
            jsonp: "jsoncallback",
            data: param,
            cache: false,
            success: function(data) {
                cbk(data);
            },
            error: function(h, code, f) {
                logInfo.status = url + "_**activity**fail**";
                logInfo.code = code;
            }
        });
    }
});