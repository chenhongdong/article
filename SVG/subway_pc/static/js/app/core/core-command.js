define(function(require) {
    var config = require('js/app/conf/config');
    require('js/app/core/core-service');
    require('./core-view');
    var monitor = require('js/app/monitor');
    var wpo_monitor = false;
    So.Command = {
        _commandAliasMapping: {},
        init: function(a) {
            this._commandAliasMapping = _.extend(this._commandAliasMapping, a)
        },
        getAlias: function(b) {
            for (var a in this._commandAliasMapping) {
                if (b instanceof this._commandAliasMapping[a]) {
                    return a
                }
            }
            return false
        },
        serialize: function(b) {
            var a = this.getAlias(b);
            if (a) {
                return '{cmd:"' + a + '", data:' + b.serialize() + "}"
            }
            return false
        },
        deserialize: function(ctx) {
            if (!_.isObject(ctx)) {
                ctx = So.eval(ctx)
            }
            if (ctx && ctx.cmd) {
                var cmd = this._commandAliasMapping[ctx.cmd];
                if (_.isUndefined(cmd)) {
                    var func = So.eval(ctx.cmd);
                    if (_.isFunction(func)) {
                        cmd = So.Command.Base.extend({
                            _run: function() {
                                func(ctx.data)
                            }
                        })
                    }
                }
                cmd = cmd || So.Command.Base;
                return new cmd(ctx.data)
            }
        }
    };

    So.Command.User = {
        checkUserInfo : function(scb,ecb){
            QHPass.getUserInfo(function(data){
                if(scb){
                    scb(data);
                }else{
                     $(".geo-btns.logout").hide();
                    $(".geo-btns.login").show();
                }
            },function(){
                if(ecb){
                    ecb();
                }else{
                    $(".geo-btns.login").hide();
                    $(".geo-btns.logout").show();
                }
            });
        }
    }

    So.Command.Base = So.Class.extend({
        _params: {},
        init: function(a, view_params, callback) {
            this._params = a || {};
            this._view_params = view_params || {};
            this._callback = callback;
        },
        getParams: function() {
            return So.clone(this._params)
        },
        serialize: function() {
            return JSON.stringify(this.getParams())
        },
        run: function(cbk) {
            this._run(cbk)
        },
        _run: function() {}
    });

    So.Command.ChangeUI = So.Command.Base.extend({
        init: function(a) {
            this._super(a);
            this.ui = a.ui;
            this.param = a.params;
            this.hash = a.hash;
            this.view_name = a.view_name;
            this.change_from = a.change_from;
        },
        _run: function() {
            //alert('run');
            var me = this;
            var uiParams = So.State.uiParams;

            //结果列表页下拉加载，加载结果未返回时回退到上一个页面，后面结果再返回需要将请求抛弃掉;
            try{
                if(me.param.view_params && me.param.view_params.from && me.param.view_params.from == 'scrollLoad' && So.State.currentUI.__view_name1__ !== this._params.ui.__view_name1__){
                    return false;
                }
            }catch(e){}

            // if (So.State.currentUI == this._params.ui) {
            //     var b = new Date().getTime();
            //     if (b - So.State.uiTimestamp > 500) {
            //         So.State.uiTimestamp = new Date().getTime();
            //         var c = So.State.currentUI;
            //         if (c.prepare) {
            //             c.prepare(this.param)
            //         }
            //     }
            //     return
            // }
            var current_ui_name = this._params.ui.name;
            if (current_ui_name != 'search_nearby') {
                $(".nearby-geolocate").css('display', 'none');
                if(current_ui_name != 'search_list' && current_ui_name != 'route_index' && current_ui_name != 'search_index'){
                   $('#header_topbar').hide();
                }else{
                   $('#header_topbar').show();
                }
            } else {
                 $(".nearby-geolocate").css('display', 'block');
                 $('#header_topbar').show();

                 //So.Command.User.checkUserInfo();
            }

            So.State.uiTimestamp = new Date().getTime();
            var curUi = So.State.currentUI;

            if (curUi){//&& curUi.__view_name1__ != this._params.ui.__view_name1__) {
                $('body').removeClass('__view__name__' + curUi.name);
                if(curUi.__view_name1__ != this._params.ui.__view_name1__){
                    curUi.visible(false);
                    $('.app_download2_con').hide();
                }
                //卸载事件
                if(curUi.el && curUi.events){
                    me.event('unbind', curUi);
                }
            }

            $('body').addClass('__view__name__' + current_ui_name);

            //清空搜索框内容;
            $('#header-nav-query').val('').prev().html('搜地点、找商户、查公交').show();

            //存储当前view
            So.State.currentUI = this._params.ui;
            if (!So.State.currentUI) {
                return
            }
            var map = So.UIMap.getObj();
            if(map){
                if(current_ui_name == 'indoor_index'){
                    map.setMaxZoom(21);
                    map.setMinZoom(19);
                }else{
                    $('.maptools.indoorMap').html('');
                    $(".mapToolsBox.maptools.mapTraffic").css('display','block');
                    map.setMaxZoom(18);
                    map.setMinZoom(3);
                    map.setMapTypeId('roadmap');
                    map.setZoom(10, true);
                    map.setBoundary(null);
                }
            }
            var c = So.State.currentUI;

            var initView = function(){
                //统计首页的展现量
                var callee = arguments.callee;
                var prepareResult;
                var loc = So.urltojson(location.href);
                var __src__;
                try{
                    __src__ = me.param.params.src || '';    
                }catch(e){}           

                if(c.command && !me.param.data){
                    if(me.change_from == 'init' && me.view_name === So._time.view.name){
                       So._time.view.data = +new Date;
                    }

                    //通过分享url进入后记录需要显示的view，保证最终展示的是对应的view
                    if(!(me.param.loadView && me.param.loadView == 'default')){
                        c.__view_name__ = me.view_name;
                    }

                    if(!me.param.view_params){
                        me.param.view_params = {};
                    }

                    me.param.view_params._hash = me.hash;
                    
                    

                    (new c.command(me.param.params, me.param.view_params, me.param.callback)).run();                    
                    
                    return;
                }

                //src=qr 是通过PC地图POI详情页、公交、驾车、步行、骑行结果页 底部的二维码扫描
                //src=short_url 是通过PC地图POI详情页、公交、驾车、步行、骑行结果页 中的发送到手机的短信内容中的url
                //if(config.ISANDROID && (__src__ == 'qr' || __src__ == 'short_url' || __src__ == 'onebox_goto' || __src__ == 'detail_goto' || __src__ == 'map_detail_goto') && (me.view_name == 'search/map_list' || me.view_name == 'search/map_detail' || me.view_name == 'bus/index' || me.view_name == 'bus/map' || me.view_name == 'drive/map' || me.view_name == 'walk/map' || me.view_name == 'bike/map')){
                if(config.ISANDROID && (__src__.indexOf('__app__') === 0 || __src__ == 'qr' || __src__ == 'short_url') && (me.view_name == 'search/categories' || me.view_name == 'search/aggregates' || me.view_name == 'search/map_list' || me.view_name == 'search/map_detail' || me.view_name == 'bus/index' || me.view_name == 'bus/map' || me.view_name == 'drive/map' || me.view_name == 'walk/map')){
                    if(__src__.indexOf('__app__') === 0){
                        So.callNative(me.param.params, {
                            loadApp: "1"
                        });
                        //带有__app__开头的src表示调用app scheme，调用完后修改src
                        me.param.params.src = me.param.params.src.slice(7);
                    }else{
                        $('.app_download2_con').show();
                        $('.app_download2_con').data('src', __src__);
                        if(__src__ == 'qr'){
                            monitor.index.disp.scan_download();
                        }else if(__src__ == 'short_url'){
                            monitor.index.disp.mapp_download_message();
                        }
                        So.callNative(me.param.params);

                        //二维码扫描一次后删除src=qr标识，用于确定是从二维码扫描过来的url，打开后再刷新、复制链接均不可以
                        //短信分享点击一次后删除src=short_url标识，用于确定是从短信分享点击过来的url，打开后再刷新、复制链接均不可以
                        me.param.params.src = '';
                        
                    }

                    So.Gcmd.changeHash(me.view_name, {
                        params:me.param.params,
                        onlySetParams: true
                    });
                }
                
                if(config.ISANDROID){
                    if(me.view_name == 'search/map_list'){
                        //monitor.search.disp.list_download_xd();
                    }else if(me.view_name == 'search/categories'){
                        monitor.categories.disp.cross_download_xd_test1();
                    }else if(me.view_name == 'drive/index' || me.view_name == 'walk/index' || me.view_name == 'bike/index'){
                        monitor.route.disp.route_detail_download_xd();
                    }else if(me.view_name == 'bus/index'){
                        monitor.route.bus.disp.bus_download_app();
                    }
                }

                if(me.view_name === So._time.view.name && !So._time.view.dataed){
                   So._time.view.dataed = +new Date;
                }
                //view渲染一次后清除
                c.__view_name__ = '';

                $('#bodyMain').css('display', 'block');
                So.Waiting.hide();
                if (c.prepare) {
                    try{
                        $('body').removeClass('app_download_navigation');
                        prepareResult = c.prepare(me.param, {
                            change_from: me.change_from
                        });
                    }catch(e){
                        window.__errorReport__ && window.__errorReport__.report(e,101);
                        //view初始化失败后跳转到首页
                        //if(me.change_from == 'init'){
                        if(c.__view_name1__ != config.MAIN_PAGE){
                            So.Gcmd.changeHash(config.MAIN_PAGE, {noChangeHash:true});
                        }
                        //}else{
                            console.log(e.stack);
                        //}
                    }
                }
                //prepare返回false后不执行下面的逻辑;
                if(prepareResult === false){
                    return;
                }
                c.visible(true);

                if(me.view_name === So._time.view.name && !So._time.view.visibled){
                   So._time.view.visibled = +new Date;
                }

                if(c.el && c.events){
                    me.event('bind', c);
                }

                //ios好搜客户端无法监听hash事件，添加自定义协议通知
                if(!!So.isIOS && So.isMsoApp){
                    So.sendMessageToApp(me.view_name);
                }

                So.State.showLocation();

                if (typeof(c.resize) == "function") {
                    c.resize()
                }
                if (!_.isUndefined(config.RouteTop)) {
                    c.top = config.RouteTop
                }
                if(c.fitMapView){
                    c.fitMapView();
                }

                

                // if(!wpo_monitor){
                //     //性能打点统计;
                //     try{
                //         monitor.performance()
                //         wpo_monitor = true;
                //     }catch(e){}
                // }
            };

            if(c.containMap){
                So.UIMap.createMap(initView);
            }else{
                initView();
            }
        },
        event: function(action, view){
            var actions = {
                'bind': 'delegate',
                'unbind': 'undelegate'
            };

            //参数值验证;
            if(!(action && actions[action])){
                return;
            }
            action = actions[action];

            if(view.el && view.events){
                _.forEach(view.events, function(item, key){
                    var _event_info = key.match(/^(\S+)\s+(.*)$/);
                    $(view.el)[action](_event_info[2], _event_info[1], view[item]);
                });
            }
        }
    });

    So.Command.UICmd = So.Command.Base.extend({
        _run: function() {
            var a = So.State.currentUI;
            if (a) {
                a.cmd(this.getParams())
            }
        }
    });

    So.Command.RouteSearch = So.Command.Base.extend({
        init: function(params) {
            params = params || {};
            this._super.apply(this,Array.prototype.slice.call(arguments,0));
            this.start = params.start;
            this.end = params.end;
            this.passing = params.passing;
            this.city = params.city;
            this.sort_rule = this._params.sort_rule = params.sort_rule || 0;
            this.type = this._params.type = params.type || 0;
            this.expected_time = params.expected_time;
            this.req_num = this._params.req_num = params.req_num || 10;
            this.avoid_highway = params.avoid_highway;
            this.avoid_jam = params.avoid_jam;
            this.avoid_fee = params.avoid_fee;
        },
        _run: function() {
            var scheme_params = this._params;

            $('.app_download1_con').data('scheme_params', JSON.stringify(scheme_params));
            $('.app_download2_con').data('scheme_params', JSON.stringify(scheme_params));
        }
    });
});
