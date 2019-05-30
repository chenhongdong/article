define(function(require) {
    var monitor = require('js/app/monitor').route.bike;
    var command = require('../bike-command');
    var a = {
        _visible: false,
        _init: false,
        tpl:{
            BikeList: require('../../../templates/bike/list.html'),
            RouteError: require('../../../templates/RouteError.html')
        },
        name: "bike_index",
        logname: "bikelistpage",
        lastIndex: -1,
        containMap: false,
        command: command,
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                data = me.view_data.data,
                params = me.view_data.params;

            try{
                var path = data.route.paths[0];
                $("#CTextDiv").html(So.View.template(this.tpl.BikeList, {
                    start: params.start.name,
                    end: params.end.name,
                    time: So.Util.formatTimeS(path.duration),
                    distance: So.Util.formatDistance(path.distance),
                    items: path.steps,
                    path: path,
                    cls0: data.routeType == 0 ? "optionbar-item-highlight" : "",
                    cls1: data.routeType == 1 ? "optionbar-item-highlight" : "",
                    cls2: data.routeType == 2 ? "optionbar-item-highlight" : "",
                    cls3: data.routeType == 3 ? "optionbar-item-highlight" : ""
                }));

                monitor.disp.detail();

            }catch(e){
                params.type = 'bike';    
                So.Gcmd.changeHash('search/error', {
                    noChangeHash: true,
                    data: {
                        start: params.start.name,
                        end: params.end.name,
                        type: 'bike'
                    },
                    params:params
                });
                return false;
            }
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CTextDiv").css("display", d)
        },
        cmd: function(d) {
            var me = this,
                view_data = me.view_data,
                data = view_data.data,
                params = view_data.params,
                command = view_data.command;

            switch (d.id) {
                case 0:
                    command.setRouteType(d.i);
                    break;
                case 1:
                    window.history.back();
                    break;
                case 3:
                    view_data.params.step = -1;
                    So.Gcmd.changeHash("bike/map", view_data);
                    break;
                case 4:
                    monitor.click.list();
                    view_data.params.step = d.i;
                    So.Gcmd.changeHash("bike/map", view_data);
                    break
            }
        }
    };

    return a;
});