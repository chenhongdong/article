define(function(require) {
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').route;
    var view = {
        _visible: false,
        _init: false,
        tpl: {
            error: So.Tpl.error
        },
        name: "search_error",
        containMap: false,
		prepare: function(view_data) {
            this.view_data = view_data;
            var me = this,
                data = this.view_data.data || {},
                params = this.view_data.params || {},
                _type = params.type || '',
                start = params.start && params.start.name || '',
                end = params.end && params.end.name || '';

                _type == 'bus' && data.transit_type &&  (_type = data.transit_type);
                var types = {
                    'bus': '公交',
                    'drive': '驾车',
                    'walk': '步行',
                    'train':'火车',
                    'plane':'飞机'
                },
                type = types[_type] || '',
                message = data.message || start && end ? '很抱歉，没有找到从 "<em class="k">' + start + '</em>" 到 "<em class="k">' + end + '</em>"的' + type + '路线方案' : '';

            $('#CTextDiv').html(So.View.template(this.tpl.error,{
                show_result_header_bar: true,
                message: message,
                type:_type,
                transit_type:data.transit_type || _type
            }));

            monitor[_type].disp.no()
        },
        visible: function(c) {
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CTextDiv").css("display", d);
            So.UIMap.visible(false);
        },
        cmd: function(c) {
            var params = this.view_data.params;
            switch (c.id) {
                case 0:
                    window.history.back();
                    break;
                case 1:
                    monitor.click.bus()
                   So.Cookie.set('nav_type',1);
                   So.Gcmd.changeHash("bus/index", {
                        params:{
                            start: params.start,
                            end: params.end,
                            passing: params.passing,
                            city: So.CityData.citycode(),
                            transit_type:c.t
                        },
                        noChangeHash: true
                    });
                    break;
                case 7:
                    monitor.click.bus()
                   So.Cookie.set('nav_type',1);
                   So.Gcmd.changeHash("bus/index", {
                        params:{
                            start: params.start,
                            end: params.end,
                            passing: params.passing,
                            city: So.CityData.citycode()
                        },
                        noChangeHash: true
                    });
                    break;
                case 8:
                    monitor.click.drive()
                    So.Cookie.set('nav_type',2);
                    So.Gcmd.changeHash("drive/map", {
                        params:{
                            start: params.start,
                            end: params.end,
                            passing: params.passing,
                            city: So.CityData.citycode()
                        },
                        noChangeHash: true
                    });
                    break;
                case 9:
                    monitor.click.walk()
                    So.Cookie.set('nav_type',3);
                    So.Gcmd.changeHash("walk/map", {
                        params:{
                            start: params.start,
                            end: params.end,
                            passing: params.passing,
                            city: So.CityData.citycode()
                        },
                        noChangeHash: true
                    });
                    break;
                case 6:
                    So.Cookie.set('nav_type',4);
                    So.Gcmd.changeHash("bike/map", {
                        params:{
                            start: params.start,
                            end: params.end,
                            passing: params.passing,
                            city: So.CityData.citycode()
                        },
                        noChangeHash: true
                    });
                    break;
                case 10:
                    monitor.click.ex()
                    So.Gcmd.changeHash('route/index', {
                        params:{
                            end: params.end
                        }
                    });
                break;
            }
        },
        resize: function() {
        }
    };

    return view;
});
