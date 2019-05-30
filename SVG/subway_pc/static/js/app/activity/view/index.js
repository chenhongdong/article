define(function(require) {
    //活动列表
    var command = require('js/app/activity/activity-command');
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor.js').detail;
    var ct, da, ci, page; //当前类别，全部数据，当前页面序列（是首页列表，还是精选活动列表）,页数
    var enabled = false;
    var a = {
        _visible: false,
        _init: false,
        tpl: {
            activity_index: require('../../../templates/activity/index.html')
        },
        name: "activity_index",
        logname: "activityindexpage",
        containMap: false,
        setBodyMainHeight: false,
        command: command,
        prepare: function(view_data) {
            //console.log(view_data);
            this.view_data = view_data;
            var me = this,
                data = me.view_data.data,
                params = me.view_data.params;

            data.totalPages = Math.ceil(data.totalcount/10);
            data.cp = params.cp || 1;
            var loc = So.State.getLocation(true);
            data.mso_loc = loc;
            data.show_result_header_bar = show_result_header_bar;
            enabled = true;
            var html = So.View.template(this.tpl.activity_index, data);
            $('#CTextDiv').html(html);
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $('#CTextDiv').css("display", d);
        },
        cmd: function(c) {
            switch (c.id) {
                case 0:
                    if(window.__HaoSouFun__ && __HaoSouFun__.goback){
                        __HaoSouFun__.goback();
                    }else{
                        window.history.back();
                    }
                    break;
                case 1: //prev
                    if (!enabled) return;
                    enabled = false;
                    window.scroll(0, 1);
                    c.cp -= 1;
                    new command(c).run();
                    break;
                case 2: //next
                    if (!enabled) return;
                    enabled = false;
                    window.scroll(0, 1);
                    c.cp += 1;
                    new command(c).run();
                    break;
                case 6:
                    var loc = window.__clientMsoXY__  || So.State.getLocation(true);
                    var currentCity =  So.CityData.citycode();
                    if(loc.state == 1 || window.__clientMsoXY__.x){ //定位成功直跳
                        So.Gcmd.changeHash("route/index", {
                            params:{
                                start: {
                                    name: loc.address || '您现在的位置',
                                    x: loc.x,
                                    y: loc.y
                                },
                                end: {
                                    name: c.name,
                                    x: c.x,
                                    y: c.y
                                },
                                autosearch:1
                            }
                       });
                    }else{
                        So.Gcmd.changeHash('route/index', {
                            params:{
                                end: {
                                    name: c.name,
                                    x: c.x,
                                    y: c.y
                                }
                            }
                        });
                    }
                    break;
            }
        }
    };
    return a;
});
