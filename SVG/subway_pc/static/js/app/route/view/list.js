define(function(require){
    var routeCommand = require('js/app/route/command/index');
    var titles = {
        "start":"起点",
        "end":"终点",
        "passing":"途经点"
    }
    var a = {
        _visible: false,
        _init: false,
        tpl:{
            AddrNotSure: require('../../../templates/AddrNotSure.html'),
            AddrSure: require('../../../templates/AddrSure.html'),
            AddrChoose: require('../../../templates/AddrChoose.html')
        },
        name: "route_list",
        logname: "addresspage",
        containMap: false,
        getHtml: function(data, type, params) {
            var d;
            params = params || {};
            if (!data.x) {
                var list = data.list || [];
                _.each(list, function(g, f) {
                    g.icon = So.Util.numberToLetter(f);
                    g.faddress = g.address == "" ? "暂无" : g.address
                });
                d = So.View.template(this.tpl.AddrNotSure, {
                    title: titles[type] + _.escape(data.name),
                    items: list,
                    type: type,
                    passing_index: typeof params.passing_index != 'undefined' ? params.passing_index : '-1'
                })
            } else if (data.x) {
                d = So.View.template(this.tpl.AddrSure, {
                    title: data.name
                })
            }
            return d
        },
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                data = me.view_data.data,
                params = me.view_data.params,
                passingHtmls = [];

            //地址选择页不可直接进入
            if(!data){
                So.Gcmd.changeHash('route/index', view_data);
            }

            if(params.type =='drive' && data.passing && data.passing.length){
                for(var i=0,l=data.passing.length;i<l;i++){
                    passingHtmls.push(this.getHtml(data.passing[i], 'passing',{passing_index: i}));
                }
            }

            $("#CTextDiv").html(So.View.template(this.tpl.AddrChoose, {
                startHtml: this.getHtml(data.start, 'start'),
                passingHtml: passingHtmls.join(''),
                endHtml: this.getHtml(data.end, 'end')
            }))
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CTextDiv").css("display", d)
        },
        cmd: function(g) {
            var me = this,
                view_data = me.view_data,
                data = view_data.data,
                params = view_data.params;

            switch (g.id) {
                case 1:
                    var routeData = data[g.type];
                    if(g.passing_index != '-1'){
                        routeData = routeData[g.passing_index];
                    }
                    var info = routeData.list && routeData.list[g.index];
                    if (!info) {
                        return;
                    }

                    _.extend(routeData,{
                        name: info.name,
                        address: info.address,
                        city: info.city && info.city.replace('城区', '') || info.cityid,
                        x: info.x,
                        y: info.y
                    });

                    //删除列表；
                    delete routeData.list;

                    new routeCommand({
                        start: data.start,
                        end: data.end,
                        passing: data.passing,
                        city: params.city,
                        start_city: params.start_city,
                        end_city: params.end_city,
                        type: params.type
                    }).run();
                    break;
                case 2:
                    window.history.back();
                    break
            }
        }
    };

    return a;
})