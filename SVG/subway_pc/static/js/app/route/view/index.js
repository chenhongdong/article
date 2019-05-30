define(function(require){
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').route;
    var user_poi = require('js/app/common/user_poi');
    var routeCommand = require('../command/index');
    var routeType,//搜索路线类型
        startInput,
        endInput,
        start, //起点名称
        end, //终点名称
        passing = [], //途经点名称
        noShowView,//不显示模板
        passing_count = 0; //途经点个数

    var routeTypes = {
            '1': 'bus',
            '2': 'drive',
            '3': 'walk',
            '4': 'bike'
        };    

    var a = {
        _visible: false,
        _init: false,
        name: "route_index",
        tpl:{
            index: require('../../../templates/route/index.html'),
            passing: require('../../../templates/route/passing-input.html')
        },
        init: function() {
            if (!this._init) {
                this._init = true;                
            }
        },
        prepare: function(view_data, opts) {
            this.view_data = view_data;
            opts = opts || {};

            var me = this,
                loc = So.State.getLocation(true),
                view_data = me.view_data,
                params = view_data.params,
                view_params = view_data.view_params || {},
                _passing_count = params.passing_count,
                change_from = opts.change_from || '',
                passing_html = [],
                _passing;            

            //view_params.autosearch == '1' 自动搜索、不保留历史记录
            //view_params.autosearch == '2' 自动搜索、保留历史记录

            if(change_from == 'init' || view_params.autosearch == '1'){
                view_data.params.autosearch=1;
            }


            start = params.start && params.start.name ? params.start : params.start && !_.isObject(params.start) ? {name:params.start} : {};
            end = params.end && params.end.name ? params.end : params.end && !_.isObject(params.end) ? {name:params.end} : {};
            passing = params.passing || [];

            if(passing && _.isString(passing)){
                _passing = passing.split(';');
                for(var i=0,l=_passing.length;i<l;i++){
                    _passing[i] = {
                        name: _passing[i]
                    };
                }
                passing = _passing;
            }

            passing_count = passing.length;

            //如参数中指定显示passing的数量，则依据参数指定
            if(_passing_count){
                passing_count = _passing_count;
            }
            
            if(!start.name ){
                if(end.name !== '您现在的位置' ){
                    start = {
                        name: '您现在的位置'
                    }
                }else{
                    start = {};
                }
            }

            routeType = params.type || routeTypes[+So.Cookie.get('nav_type')||2];
            
            $('#navToolBarDiv .header-label li').removeClass('active');
            $('#J-nav-'+routeType).parent().addClass('active');

            //记录方案类型，用于驾车tab下增加途经点样式特殊处理
            $('#lineDiv').attr('tab_type', routeType);

            //记录途经点个数，用于驾车tab下增加途经点的样式显示调整
            $('#lineDiv').attr('passing_count', passing_count);

            for(var i=0;i<passing_count;i++){
                passing_html.push(So.View.template(this.tpl.passing,{
                    passing: passing[i] && passing[i].name
                }));
            }

            //获取用户家、公司信息
            var user_info = user_poi.getHomeAndCompany();

            $("#lineDiv").html(So.View.template(this.tpl.index, {
                start: start.name || '',
                end: end.name || '',
                passing_html: passing_html.join(''),
                passing_count: passing_count,
                historys: me.getHistory({
                    type: routeType
                }),
                user_info: user_info,
                show_app_download: config.ISANDROID
            }));


            startInput = $("#lineStartInputBox");
            endInput = $("#lineEndInputBox");


            this.bindEvent();

            this.bindEventOnce && this.bindEventOnce();

            //如果起点、终点名称都有，并且指定线路类型，则直接进行搜索
            //params.autosearch 为1时，自动搜索，并且不记录历史记录，主要是onebox在使用，从onebox进入路线后，再返回直接到onebox
            //view_params.autosearch 为2时，自动搜索，但是会记录历史记录，主要是地图内部使用;
            if((params.autosearch==1 || view_params.autosearch == '2') && start.name && end.name){// && routeType){
                this.makeSureAddress({
                    from: 'autosearch'
                });
                noShowView = true;
            }else{
                noShowView = false;

                if(config.ISANDROID){
                    monitor.disp.route_download();
                }
            }
            
        },
        bindEventOnce: function(){
            var me = this;
            $('.header-label').on('tap', 'li', function () {
                var that = $(this),
                    nid = that.index() + 1;
                routeType = routeTypes[nid];
                that.addClass("active").siblings().removeClass('active');
                So.Cookie.set('nav_type',nid);
                So.Gcmd.changeHash('route/index', {
                    params:{
                        start:start,
                        end: end,
                        passing: passing,
                        type: routeType
                    }
                });

                //记录方案类型，用于驾车tab下增加途经点样式特殊处理
                $('#lineDiv').attr('tab_type', routeType);
                // monitor log
                monitor.click[routeType]()
            });

            $('body').on('saveHistory', function(e, params){
                var type = params.type;
                delete params.type;
                me.saveHistory(params, {
                    type: type
                });
            });

            //一次调用后清除;
            this.bindEventOnce = null;
        },
        bindEvent: function(){
            var me = this;
            var passing_input_html = So.View.template(this.tpl.passing);
            var end_input_container = $('.mh-form .mh-end');
            var add_passing_btn = $('.add-passing-btn');

            $('#rt-style-button').on('tap',function(){
                var start_val = startInput.val();
                monitor.click.all()
                // if((start_val == '您现在的位置' || start_val == '我的位置') && !(start.x && start.y)){
                //       So.GeolocationService.getPosition(function(pt) {
                //             start = {
                //                 name: '您现在的位置',
                //                 x: pt.lng,
                //                 y: pt.lat,
                //                 autoLoc:true
                //             }
                //             So.State.setLocation({
                //                 state: 1,
                //                 acc: pt.accuracy,
                //                 x: pt.lng,
                //                 y: pt.lat
                //             });

                //             var mector = So.Util.fromLatlngToMercator(pt.lat,pt.lng);
                //             var mso_map_xyt = Math.floor(mector.x)+'_'+Math.floor(mector.y)+'_'+new Date().getTime();
                //             So.Cookie.set('mso_map_xyt',mso_map_xyt,'haosou.com');
                //             So.Cookie.set('mso_map_xyt',mso_map_xyt,'so.com');
                //             So.Cookie.set('map_user_loc',mso_map_xyt);
                //             So.Gcmd.fetchAddressName(pt);
                //             So.Gcmd.cmd({id:routeType});
                //       },function(error){
                //             startInput.focus();
                //             So.Waiting.show("获取您现在的位置失败",true);
                //             setTimeout(function(){
                //                 So.Waiting.hide();
                //             },1000)
                //       });
                // }else{
                    So.Gcmd.cmd({id:routeType});
                // }
            });

            add_passing_btn.on('click', function(){
                if(passing_count >= 3){
                    return false;
                }
                passing_count++;
                if(passing_count == 3){
                    add_passing_btn.hide();
                }
                end_input_container.before(passing_input_html);

                //记录途经点个数，用于驾车tab下增加途经点的样式显示调整
                $('#lineDiv').attr('passing_count', passing_count);

                monitor.click.point_add();
                
            });

            $('.mh-route').on('click', '.remove-passing-btn', function(){
                var btn = $(this),
                    all_passing = $('.mh-route .mh-passing .remove-passing-btn'),
                    index = all_passing.indexOf(this);
                    container = btn.parent();

                passing_count--;

                if(passing_count < 3){
                    add_passing_btn.show();
                }

                container.remove();

                //从数组中删除;
                passing.splice(index, 1);

                So.Gcmd.changeHash('route/index', {
                    params:{
                        start:start,
                        end: end,
                        passing: passing,
                        type: routeType
                    },
                    onlySetParams: true
                });

                //记录途经点个数，用于驾车tab下增加途经点的样式显示调整
                $('#lineDiv').attr('passing_count', passing_count);

                monitor.click.point_delet();
            });

            $('.mh-route').on('click', '.mh-passing .search-input-mask', function(){
                var btn = $(this),
                    all_passing = $('.mh-route .mh-passing .search-input-mask'),
                    index = all_passing.indexOf(this);

                So.Gcmd.cmd({id:4, type:'passing', index: index});
            });


            user_poi.bindEvent('.route-tools', 'div[data-type=home],div[data-type=company]', {autosearch: "2"});


            //历史记录点击
            $('#routeHistory .suggest-content').on('click', '.suggest-item', function(){
                var data = $(this).data('json');
                data = JSON.parse(data);

                var start = data.start;
                var end = data.end;
                var _passing = data.passing;
                var passing = [];
                var params = {
                        start:{
                            name:start.name,
                            x:start.x,
                            y:start.y
                        },
                        passing: passing,
                        end: {
                            name:end.name,
                            x:end.x,
                            y:end.y
                        }
                    };

                if(_passing && _passing.length){
                    $.each(_passing, function(index, item){
                        passing.push({
                            name: item.name,
                            x: item.x,
                            y: item.y
                        });
                    });
                }

                if(passing && passing.length){
                    params.passing = passing;
                }


                So.Gcmd.changeHash('route/index', {
                    params: params
                });

                //历史记录很多时拉到底部点击历史记录，页面滚动至顶部;
                window.scrollTo(0,0);
            });


            //清除历史记录
            $('#routeHistory .suggest-clearhistory').on('click', function(){
                var routeHistoryStorageKey = config.STORAGE_KEYS['ROUTEHISTORY' + routeType.toUpperCase()];
                var route_historys = So.getRouteHistory({
                    type: routeType
                });

                So.Util.storageItem("remove", routeHistoryStorageKey);
                $('#routeHistory').hide();
                
                //删除服务端历史记录;
                $('body').trigger('app-sync-history', {
                    handle: 'delete',
                    type: 'route',
                    info: route_historys
                });

            });

            $('.__view__name__route_index .app_download_route_con').on('click', function(){
                monitor.click.route_download();

                So.callNative({
                    "type": routeType
                }, {
                    loadApp: "2",
                    from: 'route'
                });
                
            })


        },
        
        visible: function(d) {
            //起终点、路线类型都确定后不显示当前页面;
            if(d && noShowView){
                return;
            }

            var me = this,
                params = me.view_data.params;

            if (this._visible == d) {
                return
            }
            this._visible = d;
            var c = d ? "block" : "none";
            $("#navToolBarDiv").css("display", c);
            $("#lineDiv").css("display", c);
            //So.UIMap.visible(d);
            $('.suggest-container').hide();

            //如果起终点有一个为空，出检索历史suggestion
            //if(!(start && start.name && end && end.name)){

            //}
        },
        getHistory: function(opts){
            opts = opts || {};
            var type = opts.type || '';
            var history = So.getRouteHistory({type: type, output_html:1});
            return history;
        },
        saveHistory: function(historys, opts){
            opts = opts || {};
            var types = {
                "bus": 1,
                "drive": 2,
                "walk": 3,
                "bike": 4
            };
            var type = opts.type || '';
            historys.time = +(new Date);
            historys.type = types[type];

            So.saveRouteHistory(historys, opts);

            //添加服务端历史记录;
            $('body').trigger('app-sync-history', {
                handle: 'add',
                type: 'route',
                info: [historys]
            });
        },
        //更新起终点信息
        updateInfo: function(){
            var _start = $.trim(startInput.val()),
                _end = $.trim(endInput.val());

            //检测起终点信息跟输入框起终点信息是否一致
            if(_start != start.name && start.autoLoc==false){
                start = {
                    name: _start
                }
            }

            if(_end != end.name && start.autoLoc==false){
                end = {
                    name: _end
                }
            }
        },
        onToggle: function() {
            var me = this,
                params = me.view_data.params;


            this.updateInfo();

            var temp = So.clone(start);
            start = So.clone(end);
            end = temp;

            So.Gcmd.changeHash('route/index', {
                params:{
                    start:start,
                    end: end,
                    passing: passing
                },
                onlySetParams: true
            });
            //表单input框的显示值
            startInput.attr( 'value', start.name || '');
            endInput.attr( 'value', end.name || '');
        },
        formatAddress:function(addr){
            var addr_name = addr.name;
            if(addr.autoLoc){
                addr_name = '您现在的位置';
            }else{
                addr_name = addr_name && So.Util.subByte(addr.name);
            }
            return addr_name;
        },
        checkAddress: function() {
            this.updateInfo();
            if (!(start && start.name)) {
                $("#lineStartInputBox").focus();
                return false
            }
            if (!(end && end.name)) {
                $("#lineEndInputBox").focus();
                return false
            }
            if (start.name == end.name) {
                $("#lineEndInputBox").focus();
                So.Waiting.show("起终点相同,请更换",true);
                setTimeout(function(){
                    So.Waiting.hide();
                },1000)
                return false
            }
            return true
        },
        makeSureAddress: function(opts) {
            opts = opts || {};
            var me = this,
                params = me.view_data.params,
                from = opts.from || 'search-bottom';

            if (a.checkAddress() == false) {
                return
            }

            //更新hash中的参数;
            So.Gcmd.changeHash('route/index', {
                params:{
                    start:start,
                    end: end,
                    passing: passing,
                    city: params.city,
                    start_city: params.start_city,
                    end_city: params.end_city,
                    type: routeType
                },
                onlySetParams: true
            });
            new routeCommand({
                start: start,
                end: end,
                passing: passing,
                type: routeType,
                city: params.city,
                start_city: params.start_city,
                end_city: params.end_city,
                autosearch: params.autosearch || 0,
                from: from,
                src: params.src
            }).run();
        },
        onBus: function() {
            routeType = 'bus';
            this.makeSureAddress();
        },
        onCar: function() {
            routeType = 'drive';
            this.makeSureAddress();
        },
        onWalk: function() {
            routeType = 'walk';
            this.makeSureAddress();
        },
        onBike: function() {
            routeType = 'bike';
            this.makeSureAddress();
        },
        cmd: function(c) {
            var me = this,
                names = {
                    start: start.name,
                    end: end.name
                },
                params = me.view_data.params;

            switch (c.id) {
                case 0:
                    monitor.click.ex()
                    this.onToggle();
                    break;
                case 'bus':
                    this.onBus();
                    break;
                case 'drive':
                    this.onCar();
                    break;
                case 'walk':
                    this.onWalk();
                    break;
                case 'bike':
                    this.onBike();
                    break;
                case 4:
                    event.stopPropagation();
                    event.preventDefault();
                    So.Gcmd.changeHash('search/enter',{
                        params: {
                            name: names[c.type],
                            type:c.type,
                            showlocation:'1',
                            city: params.city
                        },
                        callback: function(keyword, opts){
                            opts = opts || {};
                            var pguid = opts.pguid || '',
                                address = opts.address || '',
                                cat_new = opts.cat_new || '',
                                x = Number(opts.x) || '',
                                y = Number(opts.y) || '',
                                userLocation = opts.userLocation;

                            var new_params = {};
                            if(c.type != 'passing'){
                                new_params[c.type] = {
                                    name: keyword,
                                    x: x,
                                    y: y
                                };
                            }
                            else{
                                passing[c.index] = {
                                    name: keyword,
                                    x: x,
                                    y: y
                                };
                            }
                            var _params = _.extend({
                                start: start,
                                end: end,
                                passing: passing,
                                city: params.city,
                                start_city: params.start_city,
                                end_city: params.end_city,
                                passing_count: passing_count
                            }, new_params);

                            //So.removeLastHistory(function(){
                                So.Gcmd.changeHash('route/index',{
                                    params: _params
                                });
                            //});

                            //236 省、237 市，走正常搜索流程，不存pguid
                            if(cat_new == 236 || cat_new == 237 ){
                                pguid = '';
                                cat_new = '';
                            }

                            if(!userLocation){
                                //存储历史记录
                                $('body').trigger('enter:updateHistory', {
                                    name: keyword,
                                    pguid: pguid,
                                    address: address,
                                    cat_new: cat_new
                                });    
                            }
                        }
                    });

                    $('#header-nav-query').focus();
                    $('#header-nav-query').trigger('input');
                    break;
            }
        },
        resize: function() {

        }
    };
    return a;
});
