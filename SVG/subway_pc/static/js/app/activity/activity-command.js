define(function(require) {
    require('js/app/activity/activity-service');
    var config = require('js/app/conf/config');

    var activityNear = So.Command.Base.extend({
        init: function(a) {
            this._super(a);
        },
        _run: function() {
            So.Waiting.show("正在加载 活动");
            var me = this;
            var ck = function(data) {
                So.Waiting.hide();
                So.Gcmd.changeHash("activity/index",{
                    data: data,
                    params: {cp:me._params.cp}
                });
            }
            var loc = window.__clientMsoXY__  || So.State.getLocation(),
                c = loc.city || '',
                y = loc.y,
                x = loc.x,
                i = this._params.cp || 1;

            So.ActivityService.getNearActivity({
                page: i,
                pagesize: 5,
                mso_y: y,
                mso_x: x
            }, ck);
        }
    });
    return activityNear;
});