define(function(require) {
    var monitor = require('js/app/monitor').route;
    var command = require('../bus-command');
    var SlideUpBox = require('js/app/widget/slideupbox');
    var TimeSelecter = require('js/app/widget/timeSelecter');
    var timeSelectBox;
    var planSelectBox;
    var timeSelecter;// = new TimeSelecter; 用的时候再new，提前new在UC浏览器上有问题
    var routeTypes = {
        0: {
            name: '时间短',
            acid: '0'
        },
        2: {
            name: '少换乘',
            acid: '0'
        },
        3: {
            name: '少步行',
            acid: '0'
        },
        5: {
            name: '少地铁',
            acid: '0'
        }
    };
    var sort_rules = {
        0: {
            name: '时间短',
            acid: '10'
        },
        1: {
            name: '出发早',
            acid: '10'
        },
        2: {
            name: '票价低',
            acid: '10'
        },
        3: {
            name: '到达早',
            acid: '10'
        }
    };
    var curRouteTypes;
    var curRouteType;
    var routeTime;
    var transitType;
    var a = {
        _visible: false,
        _init: false,
        tpl:{
            list: require('../../../templates/bus/list.html'),
            listInfo: require('../../../templates/bus/info.html'),
            detail:require('../../../templates/bus/detail.html'),
            error: require('../../../templates/RouteError.html')
        },
        name: "bus_index",
        logname: "buslistpage",
        el: '#CTextDiv',
        lastIndex: -1,
        containMap: false,
        command: command,
        events:{
            'click .bus_list1 .bus_item': 'showItem'
        },
        showItem: function(){
            var ele = $(this),
                index = ele.data('index'),
                li_detail = $('#bus-route-detail-'+index),
                ele_top = ele.offset().top;

            if(!ele.hasClass('open')){
                li_detail.css('display','block');
                ele.addClass('open');
                $('#livebus_'+index).css('display','none');
                monitor[transitType].disp.detail()
            }else{
                li_detail.css('display','none');
                ele.removeClass('open');
                $('#livebus_'+index).css('display','block');
            }

            //滚动至点击的元素
            window.scrollTo(0,ele_top);
            //
            monitor[transitType].click.list()
        },
        prepare: function(view_data) {
            this.view_data = view_data;
            this.firstSummaryShow = 0;
            this.lastSummaryShow = 0;

            var me = this,
                data = me.view_data.data,
                params = me.view_data.params,
                short_distance = false,
                hasTrainOrPlane = false;

            if (!data) {
                return
            }

            var me = this;
            if (data.status == "1" && data.route && data.route.transits && data.route.transits.length) {
                routeTime = command.prototype.getTimeStr({time:params.expected_time})
                var c = "";
                _.each(data.route.transits, function(h, g) {
                    c += So.View.template(me.tpl.listInfo, h);
                    if(!hasTrainOrPlane){
                        hasTrainOrPlane = h.routeOver.hasTrainOrPlane;
                    }
                    //总距离小于100米的提示步行通过;
                    if(h.all_distance < 100){
                        short_distance = true;
                    }
                    c += So.View.template(me.tpl.detail, _.extend({
                        startName: params.start.name,
                        endName: params.end.name,
                        index: params.index
                    },h))
                });
                if(hasTrainOrPlane){
                    curRouteTypes = sort_rules;
                    curRouteTypes[data.sort_rule].active = '1';
                    curRouteType = data.sort_rule;
                }else{
                    curRouteTypes = routeTypes;
                    curRouteTypes[data.routeType].active = '1';
                    curRouteType = data.routeType;
                }

                $(this.el).html(So.View.template(me.tpl.list, {
                    short_distance: short_distance,
                    start: params.start.name,
                    end: params.end.name,
                    hasTrainOrPlane:hasTrainOrPlane,
                    transit_type:data.route.transit_type,
                    items: c,
                    taxi_cost: data.route.taxi_cost,
                    routeTypeText: hasTrainOrPlane ? sort_rules[data.sort_rule].name : routeTypes[data.routeType].name,
                    time_str: routeTime,
                    cls0: data.routeType == 0 ? "optionbar-item-highlight" : "",
                    cls1: data.routeType == 2 ? "optionbar-item-highlight" : "",
                    cls2: data.routeType == 3 ? "optionbar-item-highlight" : "",
                    cls3: data.routeType == 5 ? "optionbar-item-highlight" : "",
                    cls7: data.sort_rule == 0 ? "optionbar-item-highlight" : "",
                    cls8: data.sort_rule == 1 ? "optionbar-item-highlight" : "",
                    cls9: data.sort_rule == 3 ? "optionbar-item-highlight" : ""
                }));
            } else {
                params.type = 'bus';
                So.Gcmd.changeHash('search/error', {
                    noChangeHash: true,
                    data: {
                        start: params.start.name,
                        end: params.end.name,
                        type: 'bus',
                        transit_type:params.transit_type
                    },
                    params:params
                });
                return false;
            }
            //
            var start = params.start;
            var end = params.end;
            transitType = data.route.transit_type;
            monitor[transitType].disp.enter({
                startAddress: start.startName,
                startLatLon: start.y + "," + start.x,
                endAddress: end.endName,
                endLatLon: end.y + "," + end.x,
            })
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CTextDiv").css("display", d);

            if(!c){
                timeSelecter && timeSelecter.hide();
                timeSelectBox && timeSelectBox.close();
                planSelectBox && planSelectBox.close();
            }
        },
        cmd: function(c) {
            var me = this,
                view_data = this.view_data,
                data = view_data.data,
                params = view_data.params,
                command = view_data.command;

            switch (c.id) {
                case 0:
                    if(c.i >= 0){
                        planSelectBox && planSelectBox.close();
                        $('.bus_route_type li.active').removeClass('active');
                        if(c.event && c.event.target){
                            $(c.event.target).closest('li').addClass('active');
                        }
                    }

                    setTimeout(function(){
                        command._view_params._hash = '';
                        command.setRouteType(c.i, c.t, c.expected_time);

                    },200);
                    monitor.click[data.route.transit_type]()
                    break;
                case 1:
                    window.history.back();
                    break;
                case 2:
                    window.history.back();
                    break;
                case 3:
                    if (this.lastIndex >= 0 && this.lastIndex < data.route.transits.length) {
                        $("#bus-list-item-" + this.lastIndex).html(So.View.template(this.tpl.listInfo, data.route.transits[this.lastIndex]))
                    }
                    this.lastIndex = c.b;
                    if (this.lastIndex >= 0 && this.lastIndex < data.route.transits.length) {
                        $("#bus-list-item-" + this.lastIndex).html(So.View.template(this.tpl.detail, _.extend({
                            startName: params.start.name,
                            endName: params.end.name,
                        },data.route.transits[this.lastIndex])));
                    }
                    break;
                case 4:
                    if (this.lastIndex >= 0 && this.lastIndex < data.route.transits.length) {
                        $("#bus-list-item-" + this.lastIndex).html(So.View.template(this.tpl.listInfo, data.route.transits[this.lastIndex]))
                    }
                    this.lastIndex = -1;
                    break;
                case 5:
                    view_data.params.index = c.b;
                    view_data.params.step = -1;
                    So.Gcmd.changeHash("bus/map", view_data);
                    break;
                case 6:
                    view_data.params.index = c.b;
                    view_data.params.step = c.s;
                    So.Gcmd.changeHash("bus/map", view_data);
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
                case 7:
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
                    monitor[data.route.transit_type].click.ex()
                    command.setSortRule(c.i);
                    planSelectBox && planSelectBox.close();
                    $('.bus_route_type li.active').removeClass('active');
                    if(c.event && c.event.target){
                        $(c.event.target).closest('li').addClass('active');
                    }
                    break;
                case 11:
                    var step_lis = $('#bus-route-detail-'+c.index+' li');
                    if(!this.firstSummaryShow){
                        for(var i= 2; i <= c.firstFoldingIndex+1;i++){
                            $(step_lis[i]).css('display','block');
                            $(step_lis[i]).find('dd').css('margin-left','10px');
                            this.firstSummaryShow = 1;
                        }
                        $('#btn_summary_detail_'+c.index+'_'+c.stepId).text('收起');
                    }else{
                        for(var i= 2; i <= c.firstFoldingIndex+1;i++){
                            $(step_lis[i]).css('display','none');
                            $(step_lis[i]).find('dd').css('margin-left','0');
                            this.firstSummaryShow = 0;
                        }
                        $('#btn_summary_detail_'+c.index+'_'+c.stepId).text('详情');
                    }
                    break;
                case 12:
                    //console.log(c.index,c.lastFoldingIndex,c.maxStepId)
                    var step_lis = $('#bus-route-detail-'+c.index+' li');
                    if(!this.lastSummaryShow){
                        for(var i= c.lastFoldingIndex+4 ; i <= c.maxStepId+3;i++){
                            $(step_lis[i]).css('display','block');
                            $(step_lis[i]).find('dd').css('margin-left','10px');
                            this.lastSummaryShow = 1;
                        }
                        $('#btn_summary_detail_'+c.index+'_'+c.stepId).text('收起');
                    }else{
                       for(var i= c.lastFoldingIndex+4; i <=c.maxStepId+3;i++){
                            $(step_lis[i]).css('display','none');
                            $(step_lis[i]).find('dd').css('margin-left','0');
                            this.lastSummaryShow = 0;
                        }
                        $('#btn_summary_detail_'+c.index+'_'+c.stepId).text('详情');
                    }
                    break;
                case 13:
                    c.e.stopPropagation();
                    view_data.params.step = c.s;
                    So.Gcmd.changeHash("bus/map", view_data);
                    break;
                case 14:
                    view_data.params.step = c.s;
                    view_data.params.index = c.b;
                    So.Gcmd.changeHash("bus/map", view_data);
                    break;
                case 15:
                    var _time = 0;
                    if(!timeSelectBox){
                        timeSelectBox = new SlideUpBox({
                            title: '设置出发时间',
                            cancel: function(){
                                timeSelecter.hide();
                            },
                            onClose: function(){
                                timeSelecter.hide();
                            },
                            confirm: function(){
                                var time = timeSelecter.getCurTime(),
                                    datetime = time.replace(/-|\s|:/g,"");

                                timeSelecter.hide();

                                setTimeout(function(){
                                    me.cmd({id:0,expected_time:datetime});
                                },200);
                            },
                            height: 148,
                            "class": 'test',
                            open: false
                        });
                    }
                    timeSelectBox.open();

                    //UC浏览器高度设置为100%时，需要延后执行动画，否则动画执行有偏差;
                    setTimeout(function(){
                        if(!timeSelecter){
                            timeSelecter = new TimeSelecter;
                        }
                        timeSelecter.show({date:routeTime});
                    },100);
                    //
                    monitor.bus.click.time({
                        time: routeTime
                    })
                    break;
                case 16:

                    if(!planSelectBox){
                        var html = ['<ul class="bus_selector_list1">'];

                        _.forEach(curRouteTypes, function(item, key){
                            var active_class = '';
                            if(item.active){
                                active_class = 'class="active"';
                            }

                            html.push('<li '+ active_class +' data-routetype="'+ key +'"><a href="javascript:;" onclick="So.Gcmd.cmd({id:'+ item.acid +',i:'+ key +',event:event})"><span>'+ item.name +'<em></em></span></a></li>');
                        });

                        html.push('</ul>');

                        planSelectBox = new SlideUpBox({
                            content:html.join(''),
                            open:!1,
                            title:"路线方案",
                            "class":"bus_route_type"
                        });
                    }else{
                        $('.bus_route_type li.active').removeClass('active');
                        $('li[data-routetype="'+ curRouteType +'"]',planSelectBox.box).addClass('active');
                    }

                    planSelectBox.open();
                    //
                    monitor.bus.click.ex({
                        routeType: curRouteType
                    })
                    break;
                case 100:
                    monitor.click.route_edit({
                        router_type: 'bus'
                    });
                    So.Gcmd.changeHash("route/index", {
                        params:{
                            start: params.start,
                            end: params.end,
                            passing: params.passing
                        }
                    });
                    break;
            }
        }
    };
    return a;
});
