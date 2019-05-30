define(function(require) {
    var command = require('js/app/busline/busline-command');
    var a = {
        _visible: false,
        _init: false,
        tpl:{
            BuslineText: require('../../../templates/busline/info.html')
        },
        name: "busline_detail",
        logname: "buslinepage",
        containMap: false,
        command: command,
        prepare: function(view_data) {
            this.view_data = view_data;
            var me = this,
                data = me.view_data.data,
                params = me.view_data.params;

            if (data.busline && data.busline[0]) {
                var c = data.busline[0];
                c.fstarttime = c.starttime.substring(0, 2) + ":" + c.starttime.substring(2);
                c.fendtime = c.endtime.substring(0, 2) + ":" + c.endtime.substring(2);
                c.flength = parseInt(Number(c.length) * 100) / 100;
                $("#CTextDiv").html(So.View.template(this.tpl.BuslineText, c))
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
                data = me.view_data.data,
                params = me.view_data.params;

            switch (d.id) {
                case 0:
                    window.history.back();
                    break;
                case 1:
                    view_data.params.station = d.i;
                    So.Gcmd.changeHash("busline/map", view_data);
                    break;
                case 2:
                    view_data.params.station = -1;
                    So.Gcmd.changeHash("busline/map", view_data);
                    break;
            }
        }
    };

    return a;
});