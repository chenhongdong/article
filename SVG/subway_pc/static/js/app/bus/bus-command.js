define(function(require) {
    var monitor = require('js/app/monitor').route;
    require('./bus-service');
    var startName;
    var endName;

    var busCommand = {
        tpl:{
            bus:require('../../templates/bus/info-bus.html'),
            subway:require('../../templates/bus/info-subway.html'),
            drive:require('../../templates/bus/info-drive.html'),
            train:require('../../templates/bus/info-train.html'),
            plane:require('../../templates/bus/info-plane.html'),
            walk:require('../../templates/bus/info-walk.html')
        },
        handleBusData: function(data) {
            data.__handleData__ = "1";
            if (data.status == "1" && data.route && data.route.transits && data.route.transits.length) {
                _.each(data.route.transits, function(transit, key) {
                    var routeOverInfo = busCommand.getRouteOverviewInfo(transit);
                    transit.index = key;
                    transit.routeOver = routeOverInfo;
                    busCommand.prepareBusData(transit, key,data.route.bus);
                })

                if(data.route.taxi_cost){
                    data.route.taxi_cost = Math.round(data.route.taxi_cost);
                }
            }
            return data
        },
        getRouteOverviewInfo: function(data) {
           if (!1 == _.isObject(data)){
                return null;
            }
            var busLineNames = [],
                trainOrPlaneLineNames = [],
                busDistance = 0,
                busDuration = 0,
                walkDistance = 0,
                walkDuration = 0,
                segments = data.segments,
                hasTrainOrPlane = false,
                lineType = 'bus',
                onTrainOrPlaneStop,
                offTrainOrPlaneStop,

                //表示折叠部分的时间
                startInCityDuration = 0,
                endInCityDuration = 0,

                //表示折叠部分是否为驾车与公交
                startRouteType ='bus',
                endRouteType = 'bus',

                //出现火车与飞机时的分段索引
                firstTrainOrPlaneIndex = -1,
                lastTrainOrPlaneIndex = -1;


            for (var i= 0,l = segments.length; i<l; i++) {
                var walking = segments[i].walking;
                if(walking+''){
                    walkDistance += parseInt(walking.distance);
                    walkDuration +=  parseInt(walking.duration);
                   if(!hasTrainOrPlane && firstTrainOrPlaneIndex>=-1){
                        startInCityDuration += parseInt(walking.duration);
                    }else if(lastTrainOrPlaneIndex>-1){
                        endInCityDuration += parseInt(walking.duration);
                    }
                }

                var bus = segments[i].bus,g;
                if(bus){
                    g = bus.buslines[0];
                    if(g){
                        if(g.type=='火车'||g.type=='飞机'){
                            if(!hasTrainOrPlane){
                                if(g.type == '火车' && g.departure_stop.name.slice(-1) != "站"){
                                    g.departure_stop.name += "站";
                                }
                                onTrainOrPlaneStop = g.departure_stop;
                                hasTrainOrPlane = true;
                                firstTrainOrPlaneIndex = i;
                            }
                            endInCityDuration = 0;
                            if(g.type == '火车' && g.arrival_stop.name.slice(-1) != "站"){
                                g.arrival_stop.name += "站";
                            }
                            offTrainOrPlaneStop = g.arrival_stop;
                            var startTimes = g.start_time.split(":");
                            var alltimes = Math.floor((startTimes[0]*3600+startTimes[1]*60+g.duration)/(3600*24));
                            var pre_times=["","次日","第三日","第四日","第五日"];

                            trainOrPlaneLineNames.push("<em class='title'>"+g.name.split("(")[0]+"</em>" + " <em class='time'>" + g.start_time +"-"+pre_times[alltimes]+g.end_time+"</em>");
                            lineType = g.type =='火车' ? 'train' : 'plane';
                        }else{
                            if(!hasTrainOrPlane && firstTrainOrPlaneIndex>=-1){
                                startInCityDuration += parseInt(g.duration);
                            }else if(lastTrainOrPlaneIndex >=0){
                                endInCityDuration += parseInt(g.duration);
                            }
                            busLineNames.push(g.name.split("(")[0]);
                            if(hasTrainOrPlane && lastTrainOrPlaneIndex < 0){
                                lastTrainOrPlaneIndex = i - 1;
                            }
                        }
                        busDistance += parseInt(g.distance);
                        busDuration += parseInt(g.duration);
                    }
                }

                if(hasTrainOrPlane && lastTrainOrPlaneIndex < 0 && g && (g.type!='火车' && g.type!='飞机')){
                    lastTrainOrPlaneIndex = i - 1;
                }


                var driver = segments[i].driver;
                if(driver){
                    walkDistance += parseInt(driver.distance);
                    walkDuration +=  parseInt(driver.duration);
                    if(!hasTrainOrPlane && firstTrainOrPlaneIndex>=-1){
                        startInCityDuration += parseInt(driver.duration);
                    }else if(lastTrainOrPlaneIndex>=-1){
                        endInCityDuration += parseInt(driver.duration);
                    }
                }
            }
            var getRouteType = function(segment){
                var routeType = 'bus';
                for(var type in segment){
                    if(type=='bus' || type =='driver'){
                        if((segment.bus &&segment.bus.buslines && segment.bus.buslines.length) || segment.driver){
                            if(segment.driver || segment.bus.buslines[0].type !='火车' && segment.bus.buslines[0].type !='飞机'){
                                routeType = type == 'driver' ? 'drive' : 'bus';
                            }else{
                                routeType = 'walk';
                            }
                        }else{
                            routeType = 'walk';
                        }
                    }
                }
                return routeType;
            };

            if(hasTrainOrPlane){
                var segment = segments[firstTrainOrPlaneIndex-1 < 0 ? 0 : firstTrainOrPlaneIndex-1];
                //debugger;
                startRouteType = getRouteType(segment);
                if(lastTrainOrPlaneIndex <= 0){
                    lastTrainOrPlaneIndex = l - 1 - 1;
                }
                var segment = segments[lastTrainOrPlaneIndex+1];
                endRouteType = getRouteType(segment);
            }

            var b = {};
            b.lineNames = hasTrainOrPlane ? trainOrPlaneLineNames : busLineNames;
            b.walkDis = walkDistance;
            b.expenseTime = walkDuration + busDuration;
            b.allLength = walkDistance + busDistance;
            b.hasTrainOrPlane = hasTrainOrPlane;
            b.lineType = lineType;
            b.onTrainOrPlaneStop = onTrainOrPlaneStop;
            b.offTrainOrPlaneStop = offTrainOrPlaneStop;
            b.startInCityDuration = startInCityDuration;
            b.endInCityDuration = endInCityDuration;
            b.startRouteType = startRouteType;
            b.endRouteType = endRouteType;
            //console.log(b,startRouteType,endRouteType)
            return b
        },
        getLiveBusInfo:function(liveinfo,bus){
            if(!liveinfo || !liveinfo.jamcars) return;
            for(var i=0,l=liveinfo.jamcars.length;i<l;i++){
                var jam = liveinfo.jamcars[i];
                if(jam.buslineid == bus.id){
                    var  stopname = bus.departure_stop.name;
                    var  linename = bus.name.split("(")[0];
                    var  distance = jam.nearestlen;
                    var  neareststop = jam.neareststop;
                    return {
                        stopname:stopname,
                        linename:linename,
                        distance:distance,
                        neareststop:neareststop
                    }
                }
          }
        },
        prepareBusData: function(data, key, liveinfo) {
            if (!1 == _.isObject(data)) {
                return null;
            }
            var stations = [],
                stationType = '',
                segments = data.segments,
                bus_distance = 0,
                walk_distance = 0,
                all_depotCount = 0,
                time_limit_info = {
                    1: '可能错过末班车',
                    2: '首班车未发',
                    3: '已经回库'
                };

            var route_title = [];
            for (var i= 0,l= segments.length; i<l; i++) {
                var segment = segments[i],
                    pre_segment = segments[i-1] || {},
                    next_segment = segments[i+1] || {},
                    bus = segment && segment.bus && segment.bus.buslines[0] || '',
                    driver = segment && segment.driver || '',
                    exit_name = segment && segment.exit && segment.exit.name || '',
                    pre_bus = pre_segment.bus && pre_segment.bus.buslines[0] || {},
                    next_bus = next_segment.bus && next_segment.bus.buslines[0] || {},
                    walking = segment && segment.walking || {},
                    f;
                //如果终点没有步行信息，segments长度+1，增加终点步行信息;
                if(i == l-1 && bus){
                    l++;
                }

                if(bus.departure_stop || bus.arrival_stop){
                    bus.departure_stop.name = bus.departure_stop.name;
                    bus.arrival_stop.name = bus.arrival_stop.name
                }

                //起点、终点必须有步行信息；中间的换成有步行则添加步行
                if(i == 0 || (walking.distance && 0 != parseInt(walking.distance)) || i == l-1){
                    if(driver){
                        f = {
                            tool: "",
                            type: "drive"
                        };
                        var _distance =0,_duration=0;
                        _.forEach(driver.steps, function(item, index){
                            _distance += parseInt(item.distance);
                            _duration += parseInt(item.duration);
                        });

                        f.stationName = i==0 ? startName : pre_bus && pre_bus.arrival_stop && pre_bus.arrival_stop.name || '';
                        if(i==0){
                            f.desName = next_bus && next_bus.departure_stop && next_bus.departure_stop.name || startName;
                        }else{
                            f.desName = bus && bus.departure_stop && bus.departure_stop.name || endName;
                        }
                        f.distance = parseInt(_distance) || parseInt(driver.distance) || 0;
                        f.duration = parseInt(_distance) || parseInt(driver.duration) || 0;
                        f.text = So.View.template(this.tpl[f.type], f);
                        f.drive_steps = driver.steps;
                        f.segmentIndex = i;
                        stations.push(f);
                    }else{
                        f = {
                            tool: "",
                            type: "walk"
                        };
                        var _distance =0,_duration=0;
                        _.forEach(walking.steps, function(item, index){
                            _distance += parseInt(item.distance);
                            _duration += parseInt(item.duration);
                        });
                        f.stationName = i==0 ? startName : pre_bus && pre_bus.arrival_stop && pre_bus.arrival_stop.name || '';
                        f.desName = bus && bus.departure_stop && bus.departure_stop.name || endName;
                        f.distance = parseInt(_distance) || parseInt(walking.distance) || 0;
                        f.duration = parseInt(_duration) || parseInt(walking.duration) || 0;
                        f.text = So.View.template(this.tpl[f.type], f);
                        f.segmentIndex = i;
                        stations.push(f);

                        walk_distance += f.distance;
                    }
                }

                if(bus && bus.name){
                    var buslive = this.getLiveBusInfo(liveinfo,bus)||'';
                    route_title.push(bus.name.split("(")[0]);
                    //route_title += (!route_title ? "" : "<em class='arrow'></em>") + bus.name.split("(")[0];
                    //busType = 0 <= bus.type.indexOf("公交") ? "bus" : "subway";
                    switch(bus.type){
                        case '地铁':
                            busType = 'subway';
                        break;
                        case '火车':
                           busType = 'train';
                        break;
                        case '飞机':
                           busType = 'plane';
                        break;
                        default:
                           busType = 'bus';
                    }
                                        f = {};
                    f.tool = bus.name.split("(")[0];

                    var buslinesLen =  segment.bus && segment.bus.buslines.length;
                    var optionLines,optionTools=[];
                    if(buslinesLen){
                        for(var n = 1;n < buslinesLen;n++){
                            var lineName = segment.bus.buslines[n].name;
                            lineName = lineName.split('(')[0];
                            optionTools.push(lineName);
                        }
                    }
                    f.optionTools = optionTools.join(','); //可选线路名称
                    f.buslive = buslive;

                    f.type = busType;
                    f.depotCount = parseInt(bus.via_num) + 1;
                    f.via_stops = bus.via_stops || [];
                    f.stationName = bus.departure_stop.name;
                    f.desName = bus.arrival_stop.name;
                    f.distance = parseInt(bus.distance);
                    f.duration = parseInt(bus.duration);
                    f.direction = bus.name.substring(bus.name.indexOf("-") + 2, bus.name.indexOf(")"));
                    //stationType = bus.arrival_stop.name;
                    f.via_stops.unshift(bus.departure_stop);
                    f.via_stops.push(bus.arrival_stop);
                    f.exit_name = exit_name ? '(' + exit_name.split('(')[0] + '出口)' : '';
                    f.time_limit = data.time_limit;
                    f.start_time = bus.start_time;
                    f.end_time = bus.end_time;
                    f.text = So.View.template(this.tpl[f.type], f);
                    f.segmentIndex = i;
                    stations.push(f);

                    all_depotCount += parseInt(f.depotCount);
                    bus_distance += parseInt(bus.distance);
                    if(!data.buslive){
                        data.buslive = buslive;
                    }
                }


            }

            data.all_depotCount = all_depotCount;
            data.time_limit_info = data.time_limit && time_limit_info[data.time_limit];
            data.all_distance = parseInt(data.walking_distance) + bus_distance;
            data.walk_distance = walk_distance;
            data.index = key;
            data.icon = So.Util.numberToLetter(key);
            var separatedChar = data.routeOver.hasTrainOrPlane ? '' : '<em class="separator"></em>';
            data.info = data.routeOver.lineNames.join(" "+separatedChar+" ") || '步行方案';


            var firstFoldingIndex = -1,
                lastFoldingIndex = -1,
                detailVisble = '';
            _.each(stations, function(step, i) {
                if(step.type=='train'||step.type=='plane'){
                   if(firstFoldingIndex<0){
                        firstFoldingIndex = i;
                   }
                   lastFoldingIndex = i;
                }
                step.detailVisble = data.routeOver.hasTrainOrPlane && step.type!='train' && step.type!='plane' ? 'none' : 'block'
            })
            data.firstFoldingIndex =  firstFoldingIndex;
            data.lastFoldingIndex = lastFoldingIndex;
            data.maxStepId = stations.length - 1;

            data.steps = stations;
         }
    };

    var command = So.Command.RouteSearch.extend({
        _run: function() {
            this._super.apply(this,Array.prototype.slice.call(arguments,0));
            var me = this;
            var start = this.start.x + ',' + this.start.y;
            var end = this.end.x + ',' + this.end.y;

            var expected_time = this._params.expected_time || this.getTimeStr({type:'data'});

            startName = this.start.name;
            endName = this.end.name;

            var current_ui = So.State.currentUI,
                view_name = current_ui && current_ui.__view_name__ || 'bus/index';
            So.Waiting.show("正在搜索公交线路");            

            So.BusService.searchRoute(start, end, this.type,this._params.transit_type,this.sort_rule,expected_time, function(data) {
                So.Waiting.hide();

                data.routeType = me.type;
                data.sort_rule = me.sort_rule;
                data.transit_type = me.transit_type;

                if(!data.__handleData__){
                    data = busCommand.handleBusData(data);
                }

                So.Gcmd.changeHash(view_name, {
                    data: data,
                    params: {
                        start: me.start,
                        end: me.end,
                        passing: me.passing,
                        type: me.type,
                        sort_rule: me.sort_rule,
                        index: me._params.index,
                        step: me._params.step,
                        expected_time: expected_time,
                        transit_type: me._params.transit_type || me.transit_type,
                        src: me._params.src
                    },
                    command: me,
                    _hash: me._view_params._hash
                })
            })
        },
        setRouteType: function(type,transit_type, expected_time) {
            if(type >=0){
                this.type = type;
            }

            if(!_.isUndefined(transit_type)){
                this.transit_type = transit_type;
                this._params.transit_type = transit_type;
            }

            if(expected_time){
                this._params.expected_time = expected_time;
            }

            this.run()
        },
        setSortRule:function(a){
            this.sort_rule = a;
            this.run()
        },
        getTimeStr: function(opts){
            opts = opts || {};
            var now = new Date(So.now);
            now = new Date(now.getTime() + (10 - now.getMinutes() % 10) % 10 * 6e4);

            var time = opts.time || '',
                type = opts.type || '',
                year = now.getFullYear(),
                month = now.getMonth()+1,
                day = now.getDate(),
                hour = now.getHours(),
                minute = now.getMinutes(),
                params_year = time.slice(-12,-8),
                params_month = time.slice(-8,-6),
                params_day = time.slice(-6,-4),
                params_hour = time.slice(-4,-2),
                params_minute = time.slice(-2),
                time_str = '';

            //日期不足两位的用0补齐;
            month = month < 10 ? '0'+month : month;
            day = day < 10 ? '0'+day : day;
            hour = hour < 10 ? '0'+hour : hour;
            minute = minute < 10 ? '0'+minute : minute;

            //如果指定了日期的使用指定的日期;
            year = params_year || year;
            month = params_month || month;
            day = params_day || day;
            hour = params_hour || hour;
            minute = params_minute || minute;

            time_str = hour + ':' + minute;

            if(type == 'data'){
                time_str = time_str.replace(/-|\s|:/g,"");
            }else if(type == 'show'){
                //time_str = '今天'
            }
            return time_str;
        }
    });

    return command;
});
