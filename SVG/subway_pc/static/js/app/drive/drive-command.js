define(function(require) {
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').route.drive;
    require('./drive-service');
    var driveCommand = {
        handleCarData: function(data, params) {
            params = params || {};
            data.__handleData__ = "1";
            if (data.status == "1" && data.info == 'OK') {
                if(data.route.paths){
                    _.each(data.route.paths, function(item, index){
                        driveCommand.prepareCarData(data.route.paths[index], params);
                    });
                }
            }
            return data
        },
        prepareCarData: function(data, params) {
            params = params || {};
            var passing = params.passing;
            var e = [];
            var c = data.steps.length;
            var g = "直行";
            var cur_tag_index;
            var passing_index = 0;
            var startCity,
                endCity,
                wayroads = [],
                jamlen = 0;
            _.each(data.steps, function(item, index) {
                var o = item.action;
                item.action = g;
                item._distance = item.distance;
                item.distance = driveCommand.formatDistance(item.distance);

                //数据端部分数据有问题，第一条数据没有折叠，前端强制折叠
                if(index == 0){
                    item.show_tag = 1;
                }
                

                g = o;
                var p = "";
                if (index == 0) {
                    startCity = item.cities[0].adcode;
                    p = "从起点出发"+ (item.orientation ? "向" + item.orientation : "") + "行驶" + item.distance;
                } else {
                    if (index != c - 1) {
                        var m = item.road || "无名道路";
                        p = item.action + "沿" + m + (item.orientation ? "向" + item.orientation : "") + "行驶" + item.distance
                    } else {
                        endCity = item.cities[0].adcode;
                        var m = item.road || "无名道路";
                        p = item.action + "沿" + m + (item.orientation ? "向" + item.orientation : "") +"行驶" + item.distance + item.assistant_action
                    }
                }

                _.each(item.jaminfo, function(jaminfo){
                    if(jaminfo.jamstate != 1){
                        jamlen += jaminfo.jamlen;
                    }
                });

                if(item.assistant_action == '到达途经点'){
                    item.is_passing = '途经点'+ (passing_index+1) +'：' + passing[passing_index].name;


                    // e.push({
                    //     text: '',
                    //     action: item.action,
                    //     icon: config.ROUTE.ACTION[item.action],
                    //     polyline: item.polyline,
                    //     jaminfos:item.jaminfo || '',
                    //     show_tag: item.show_tag,
                    //     roadName: item.road || '无名道路',
                    //     tag_distance: 0,
                    //     is_passing: 1
                    // });

                    if(data.steps[index+1]){
                        data.steps[index+1].show_tag=1;
                    }

                    passing_index++;
                }


                e.push({
                    text: item.instruction,
                    action: item.action,
                    icon: config.ROUTE.ACTION[item.action],
                    polyline: item.polyline,
                    jaminfos:item.jaminfo || '',
                    show_tag: item.show_tag,
                    roadName: item.road || '无名道路',
                    tag_distance: item._distance,
                    is_passing: item.is_passing
                });


                if(item.show_tag){
                    if(e[cur_tag_index] && e[cur_tag_index].tag_distance){
                        e[cur_tag_index].tag_distance = driveCommand.formatDistance(e[cur_tag_index].tag_distance);
                    }

                    cur_tag_index = e.length - 1;
                }
                if(cur_tag_index != e.length-1 && e[cur_tag_index]){
                    e[cur_tag_index].tag_distance += item._distance;
                }
            });

            e[cur_tag_index].tag_distance = driveCommand.formatDistance(e[cur_tag_index].tag_distance);

            _.each(data.wayroad, function(item){
                wayroads.push(item.name);
            })


            if(startCity && endCity && startCity != endCity){
                data.crossCity = true;
            }
            data.steps = e;
            data.time = data.duration;
            data.distance = data.distance;
            data.jamlen = jamlen;
            data.wayroads = wayroads.join('&nbsp;-&nbsp;');
        },
        formatDistance: function(distance) {
            if (/^[\d.]+$/.test(distance)) {
                if (1000 >= distance) return distance + "米";
                distance = (distance / 1000).toFixed(1);
                if (distance == parseInt(distance, 10)) {
                    distance = parseInt(distance, 10);
                }
                return distance + "公里"
            }
            return distance
        }
    };
    var command = So.Command.RouteSearch.extend({
        _run: function() {
            this._super.apply(this,Array.prototype.slice.call(arguments,0));
            var me = this;
            var start = this.start.x + ',' + this.start.y;
            var end = this.end.x + ',' + this.end.y;
            var passings = [];
            var params_passings = [];
            if(me.passing && _.isArray(me.passing) && me.passing.length){
                for(var i=0,l=me.passing.length;i<l;i++){
                    if(me.passing[i].x && me.passing[i].y){
                        passings.push(me.passing[i].x + ',' + me.passing[i].y);   

                        params_passings.push(me.passing[i]);
                    }
                }
                me.passing = params_passings;
            }
            passings = passings.join(';');
            var current_ui = So.State.currentUI,
                view_name = current_ui && current_ui.__view_name__ || 'drive/map';

            So.Waiting.show("正在搜索驾车线路");
            So.CarService.searchRoute(start, end, passings, {
                avoid_highway: me.avoid_highway,
                avoid_jam: me.avoid_jam,
                avoid_fee: me.avoid_fee
            }, function(data) {
                So.Waiting.hide();
                if(!data.__handleData__){
                    data = driveCommand.handleCarData(data, {
                        passing: me.passing
                    });
                }

                So.Gcmd.changeHash(view_name, {
                    data: _.extend({
                        _index: -1
                    },data),
                    params: {
                        start: me.start,
                        end: me.end,
                        passing: me.passing,
                        index: me._params.index,
                        step: me._params.step,
                        avoid_highway: me.avoid_highway,
                        avoid_jam: me.avoid_jam,
                        avoid_fee: me.avoid_fee,
                        src: me._params.src
                    },
                    command: me,
                    _hash: me._view_params._hash
                });
            })
        },
        setRouteType: function(types) {
            this.avoid_highway = types.avoid_highway;
            this.avoid_jam = types.avoid_jam;
            this.avoid_fee = types.avoid_fee;

            this.run()
        }
    });

    return command;
});
