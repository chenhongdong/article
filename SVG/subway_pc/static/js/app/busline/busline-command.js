define(function(require) {
    require('./busline-service');
    
    var command = So.Command.Base.extend({
        init: function(a) {
            this._super(a);
            this.id = a.id;
        },
        _run: function() {
            var me = this;
            var current_ui = So.State.currentUI,
                view_name = current_ui && current_ui.__view_name__ || 'busline/detail';
            So.Waiting.show("正在搜索公交线路");
            So.BusLineService.searchById(this.id, function(data) {
                So.Waiting.hide();
                
                data = data || {};
                data.busline = data.busline || [];

                _.each(data.busline, function(g, f) {
                    g.type = g.name.indexOf("地铁") < 0 ? "bus" : "subway"
                });

                So.Gcmd.changeHash(view_name, {
                    data: data,
                    params:me._params
                });
            })
        }
    });

    return command;
});
