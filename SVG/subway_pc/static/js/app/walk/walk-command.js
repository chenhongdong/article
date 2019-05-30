define(function(require) {
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').route.walk;
    require('./walk-service');
    var walkCommand = {
        handleWalkData: function(data,cmd) {
            data.__handleData__ = "1";
            if (data.status == "1" && data.info == 'OK' && data.route.paths) {
                walkCommand.prepareWalkData(data,cmd)
            }
            return data
        },
        prepareWalkData: function(data,cmd) {
            var path = data.route.paths[0];
            var e = [];
            var d = this;
            var c = path.steps.length;
            var g = "直行";
            var wayroads = [];
            _.each(path.steps, function(n, l) {
                var o = n.action;
                n.action = g;
                g = o;
                var p = "";
                if (l == 0) {
                    var start = cmd.start;
                    n.polyline = start.x+','+start.y + ';' + n.polyline
                    p = "从起点出发" + (n.orientation ? "向" + n.orientation :'') + "步行" + n.distance + "米"
                } else {
                    if (l != c - 1) {
                        var m = n.road || "无名道路";
                        p = n.action + "沿" + m + (n.orientation ? "向" + n.orientation :'') + "步行" + n.distance  + "米"
                    } else {
                        var end = cmd.end;
                        n.polyline = n.polyline + ';' + end.x+','+end.y;
                        var m = n.road || "无名道路";
                        p = n.action + "沿" + m + (n.orientation ? "向" + n.orientation :'') + "步行" + n.distance + "米" + n.assistant_action
                    }
                }
                e.push({
                    text: p,
                    action: n.action,
                    icon: config.ROUTE.ACTION[n.action],
                    polyline: n.polyline
                })
            });

            _.each(path.wayroad, function(item){
                wayroads.push(item.name);
            });

            path.steps = e;
            path.wayroads = wayroads.join('&nbsp;-&nbsp;');
        }
    };
    var command = So.Command.RouteSearch.extend({
        _run: function() {
            this._super.apply(this,Array.prototype.slice.call(arguments,0));
            var me = this;
            var start = this.start.x + ',' + this.start.y;
            var end = this.end.x + ',' + this.end.y;
            var current_ui = So.State.currentUI,
                view_name = current_ui && current_ui.__view_name__ || 'walk/map';

            So.Waiting.show("正在搜索步行线路");
            So.WalkService.searchRoute(start, end, function(data) {
                data.cmd = me;
                So.Waiting.hide();
                data.routeType = me.type;
                if(!data.__handleData__){
                    data = walkCommand.handleWalkData(data,me);
                }
                So.Gcmd.changeHash(view_name, {
                    data: _.extend({
                        index: -1
                    },data),
                    params: {
                        start: me.start,
                        end: me.end,
                        passing: me.passing,
                        type: me.type,
                        step: me._params.step,
                        src: me._params.src
                    },
                    command: me,
                    _hash: me._view_params._hash
                })
            })
        },
        setRouteType: function(a) {
            this.type = a;
            this.run()
        }
    });

    return command;
});
