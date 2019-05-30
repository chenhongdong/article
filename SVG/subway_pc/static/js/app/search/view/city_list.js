define(function(require) {
    var config = require('js/app/conf/config');
    var a = {
        _visible: false,
        tpl:{
            city_list: require('../../../templates/search/city_list.html')
        },
        name: "search_city_list",
        containMap: false,
        command: So.Command.CitySearch,
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                data = this.view_data.data,
                params = this.view_data.params;
                data.keyword = params.keyword;

            $("#CTextDiv").html(So.View.template(this.tpl.city_list, data));

            $('#city-suggestion-result-tips li').on('click', function() {
                params.city = $(this).data('city');
                params.cityname = $(this).data('cityname');
                //指定城市搜索需要强制 qii 为 false
                params.qii = false;
                So.Gcmd.changeHash("search/map_list", {
                    params: params
                });
            });
        },
        visible: function(c) {
            var me = this,
                params = this.view_data.params;
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
                case 1:
                    window.history.back();
                    break;
            }
        },
        resize: function() {

        }
    };

    return a;
});
