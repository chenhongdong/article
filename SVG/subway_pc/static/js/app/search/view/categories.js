define(function(require){
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').categories;

    var a = {
        _visible: false,
        _init: false,
        tpl:{
            categorie: require('../../../templates/search/categories.html')
        },
        name: "search_categories",
        containMap: false,
        setBodyMainHeight: false,
        prepare: function(view_data) {
            this.view_data = view_data;
            var me = this,
                params = this.view_data.params,
                name = params.name || '',
                cityname = So.CityData.cityname(),
                __guid = So.Cookie.get("__guid"),
                __random_num = __guid.slice(-1);


            $("#CTextDiv").html(So.View.template(this.tpl.categorie, {
                name: name,
                hasWaimai: !!So.supportWaimai(cityname),
                hasSubway: !!So.supportSubway(cityname),
                show_result_header_bar: show_result_header_bar
            }));
            //
            if( params.local )
                $('#header-nav-query').prev().html('在<b>'+params.local+'</b>周边找').show()
            else if( params.keyword ){
                $('#header-nav-query').val(params.keyword)
                $('#header-nav-query').prev().hide()
            } else {
                $('#header-nav-query').prev().show()
            }

            //清空scheme参数;
            $('.app_download1_con').data('scheme_params', JSON.stringify({}));
        },
        visible: function(c) {
            var me = this,
                params = me.view_data.params,
                name = params.name || '';

            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CTextDiv").css("display", d);
            if(c){
                this.bindEvent();
            }

        },
        bindEvent: function(){
            // $('.ui-superbox-category-nav').delegate('li', 'click', function(e){
            //     var dom = $(this);
            //     monitor.click.list1({
            //         text: dom.text()
            //     })
            // })

            // $('.categories_list').delegate('li a', 'click', function(e){
            //     var dom = $(this);
            //     monitor.click.list({
            //         text: dom.text()
            //     })
            // })
        },
        cmd: function(c) {
            var params = this.view_data.params,
                _mp = params.mp && params.mp.split(','),
                loc = So.State.getLocation(),
                location = {};

            if(_mp && _mp[0] && _mp[1]){
                location.x = _mp[1];
                location.y = _mp[0];
            }


            switch (c.id) {
                case 0:
                    if(window.__HaoSouFun__ && __HaoSouFun__.goback){
                        __HaoSouFun__.goback();
                    }else{
                        window.history.back();
                    }
                    break;
                case 1: //地铁
                    var cityname = So.CityData.cityname(),
                        city = So.supportSubway(cityname),
                        code = city ? city.split(',')[0] : 'beijing',
                        xy = c.x && c.y ? {x:c.x,y:c.y} : (loc.state == 1 || loc.istips) ? loc : {},
                        url = '/subway/index.html?city=' + code;
                    if (xy.x > 0) {
                        url += '&x=' + xy.x + '&y=' + xy.y;
                    }
                    window.location.href = url;
                    break;                
                case 3: //周边号列表
                    c.x = location.x;
                    c.y = location.y;
                    var type = c.type,
                        tpl = c.tpl,
                        wd = c.wd,
                        xy = c.x && c.y ? {x:c.x,y:c.y} : (loc.state == 1 || loc.istips) ? loc : {},
                        city = loc.city || So.CityData.citycode();

                    var urls = {
                        'article': '//m.map.so.com/app/shenbian/list/?' + 'city=' + city + '&mso_x=' + xy.x + '&mso_y=' + xy.y,
                        'tickets': '//m.map.so.com/app/tickets/list?city=' + city + '&page=1&number=5&mso_x=' + xy.x + '&mso_y=' + xy.y,
                        'takeout': 'http://i.waimai.meituan.com/#360map'
                    };

                    if (type == 'activity') {
                        So.Gcmd.changeHash('activity/index');
                        return;
                    }

                    var test_url = "http://ptrunk.143.m.qss.test.so.com/",
                        normal_url = "/";

                    var url_params = [normal_url + 'onebox/?act=list&from_wap=1',
                                        'type=super-map-' + type,
                                        'user_tpl=more/list/m-' + tpl,
                                        'query=' + wd,
                                        'url=' + wd,
                                        'mso_x=' + (xy.x || ''),
                                        'mso_y=' + (xy.y || ''),
                                        'pagesize=5',
                                        'city=' + city,
                                        'd=mobile'
                                    ];
                    var url = urls[type] || url_params.join('&');

                    window.location.href = url;
                    break;
                case 9: //新列表
                    if(c.params){
                        c.params.mp = params.mp;
                        c.params.local = params.local;
                        c.params.show_center_mk = 1;
                    }
                    So.Gcmd.changeHash("search/map_list", {
                        params: c.params
                    })
                    break;
                case 999:

                  if (c.hash) {
                    window.location.hash = c.hash;
                  } else if (c.href) {
                    switch (c.type) {
                      case 'massage':
                        var c_n = So.State.getLocation().city || "北京市";
                        var url = "http://360life.diandao.org/api/QihuShenBian/selCity?utm_source=disanfang&utm_medium=360_haosou",
                          p = ['pid=16', 'ufrom=c'];
                        window.location.href = url
                        break;
                      default:
                        window.location.href = c.href;
                        break;
                    }
                  }
            }
        }
    };

    return a;
})
