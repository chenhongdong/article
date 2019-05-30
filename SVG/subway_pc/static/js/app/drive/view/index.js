define(function(require) {
    var monitor = require("js/app/monitor").route.drive;
    var command = require('../drive-command');
    var a = {
        _visible: false,
        _init: false,
        tpl:{
            RouteError: require('../../../templates/RouteError.html'),
            CarList: require('../../../templates/drive/list.html')
        },
        name: "drive_index",
        logname: "carlistpage",
        lastIndex: -1,
        containMap: false,
        command: command,
        el: '#CTextDiv',
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                data = this.view_data.data,
                params = this.view_data.params,
                index = params.index || 0,
                path;

            this.param = data;
            try{
                path = data.route.paths[index];
                $("#CTextDiv").html(So.View.template(this.tpl.CarList, {
                    start: params.start.name,
                    end: params.end.name,
                    time: So.Util.formatTimeS(path.time),
                    distance: So.Util.formatDistance(path.distance),
                    items: path.steps,
                    path: path
                }))
                monitor.disp.detail()
            }catch(e){

                params.type = 'drive';
                So.Gcmd.changeHash('search/error', {
                    noChangeHash: true,
                    data: {
                        start: params.start.name,
                        end: params.end.name,
                        type: 'drive'
                    },
                    params:params
                });
                return false;
            }
        },
        events:{
            'click .new_route_detail_drive .roadName': 'toggleList'
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CTextDiv").css("display", d)
        },
        toggleList: function(){
            var title = $(this),
                li = title.parent();

            li.toggleClass('unfold');
        },
        cmd: function(d) {
            var me = this,
                view_data = this.view_data,
                data = view_data.data,
                params = view_data.params,
                command = view_data.command;

            switch (d.id) {
                case 0:
                    command.setRouteType(d.i);
                    break;
                case 1:
                    So.Gcmd.changeHash("route/index", {});
                    break;
                case 3:
                    window.history.back();
                    break;
                case 4:
                    monitor.click.list()
                    params.step = d.i;
                    So.Gcmd.changeHash("drive/map", view_data);
                    break
            }
        }
    };

    return a;
});
