define(function(require) {
    var config = require('js/app/conf/config');
    var command = require('../command/mall_shop');
    var a = {
        _visible: false,
        tpl:{
            mall_shop: require('../../../templates/search/mall_shop.html')
        },
        name: "search_market_bus",
        containMap: false,
        command: command,
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                data = this.view_data.data,
                params = this.view_data.params;

            $("#CTextDiv").html(So.View.template(this.tpl.mall_shop,_.extend({
                data: this.view_data.data
            })));
            this.bindEvents();
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CTextDiv").css("display", d);
        },
        cmd: function(d) {
            var view_data = this.view_data,
                data = view_data.data;

            switch (d.id) {
                case 0:
                    window.history.back();
                    break;
            }
        },
        resize: function() {
        },
        bindEvents: function(){

        }
    };

    return a;
});
