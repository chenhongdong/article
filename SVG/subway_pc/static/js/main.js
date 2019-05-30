So._time.main_load = +new Date;
define(function(require) {
    So._time.main_init = +new Date;
    __errorMark__.push('main.js:11');

    var userAgent = navigator.userAgent,
        is360Browser = (userAgent.indexOf('360 Aphone Browser') > -1) || (userAgent.indexOf('360browser') > -1) || (userAgent.indexOf('QHBrowser') > -1),
        isMsoApp = userAgent.indexOf('mso_app') > -1,
        is360Around = /.*Android.*360around \(((([2-9]|\d{2,})([^)]+))|(1\.([5-9]+|\d{2,})([^)]+))|(1\.4\.([1-9]+|\d{2,})([^)]+))|(1\.4\.0\.(([2-9]+([^)]+))|1[1-9]+([^)]+)|10[1-9]+([^)]+)|100[1-9]+)))\)/.test(userAgent),
        isAndroid = userAgent.indexOf('Android') > -1;

    window.__targetBlank__ = isAndroid && (isMsoApp || is360Around);
    window.So = window.So || {};

    require('./lib/class');

    _.templateSettings = {
        interpolate: /\{\{\=(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g,
        escape: /\{\{\-([\s\S]+?)\}\}/g
    };

    var monitor = require('./app/monitor.js');
    var config = require('./app/conf/config');
    require('./app/map/util');
    require('./app/core/core-service');
    require('./app/common/gcmd');
    require('./app/common/sync');
    require('./app/core/core-command');

    //输入框
    require('./app/search/view/enter');

    //附近
    require('./app/search/search-command');

    require('./app/city/city-view');

    require('./app/home/home-view');

    require('./app/map/map');

    require('./app/other/parseQuery');

    __errorMark__.push('main.js:13');

    function getParamObj(params) {
        var paramObj = {};
        var url = params.split('?');
        if(/http\:\/\//.test(url[0])){
            paramObj['host'] = url[0];
            params = url[1];
        }
        if (params) {
            var i,item, params = params.split('&');
            var length = params.length;
            for (i = 0; i < length; i++) {
                item = params[i].split('=');
                item[0] = decodeURIComponent(item[0]);
                item[1] = item[1] ? decodeURIComponent(item[1]) : true;
                paramObj[item[0]] = item[1];
            }
        }
        return paramObj;
    }
    var main = {
        init: function(){
            __errorMark__.push('main.js:14');
            //登陆后由于新增了两条历史记录，手动后退删除登录时的历史记录;
            // if(config.ISFROMLOGIN){
            //     //后退历史记录有问题，先直接跳转到首页
            //     //window.history.go(-3);

            //     window.location.href = '/';
            // }
            var guid_cookie;
            this.bindEvent();
            if(guid_cookie = So.Cookie.get('__guid')){
                So.Cookie.set('__guid',guid_cookie,'so.com');
            }
            __errorMark__.push('main.js:15');

            if(config.STOPSCHEME){
                config.APPLOADTIMEOUT = 0;
                So.appDownloadUrl1 = So.downloadUrl;
                So.appDownloadUrl2 = So.downloadUrl;
                So.appDownloadUrl3 = So.downloadUrl;
            }

            

            //5s后隐藏下载提示
            setTimeout(function(){
                $('.app_download_con .app_download_tip_con').addClass('app_download_tip_hide');
                setTimeout(function(){
                    $('.app_download_con .app_download_tip_con').hide();
                },1000);
            },5000);

            //android模式下隐藏APP下载
            if(config.ISANDROID){
                monitor.index.disp.home_download_fc();
            }else{
                $('.app_download_con,.app_download1_con,.app_download2_con').hide();
            }

            var app_download_close_count = So.Cookie.get("app_download_list_close") || 0;
            var app_download_list_hide = So.Cookie.get("app_download_list_hide") || 0;
            if(app_download_close_count >= 2 || app_download_list_hide){
                $('.app_download1_con').hide();
                
                //记录6个小时
                So.Cookie.save("app_download_list_hide","1",0.25, "/");
            }            

        },
        bindEvent: function(){
            var timer,
                touchDirection = 0, //touch事件的滚动方向，1为向下滚动，-1为向上滚动
                scrollPoints = [0],
                pageshowReloads = {
                    "user_index": "user/index",
                    "user_favorite": "user/favorite"
                },
                location_params = So.urltojson(location.href);

            window.onload = So.Main.init();

            //添加点击统计
            $('#CTextDiv').delegate('*[data-log]', 'click', function(){
                var ele = $(this),
                    logs = ele.data('log') || {};

                try{
                    monitor.log(JSON.parse(logs), 'click');
                }catch(e){
                    window.__errorReport__ && window.__errorReport__.report(e,1097);
                }
            });

            //uc、360 等浏览器登录后从浏览器后退，不刷新页面，导致用户还是显示为未登录，用此方法强制刷新下
            // window.addEventListener('pageshow', function(event) {
            //     try{
            //         //如果不是从其他页面跳转进入则退出
            //         if(!document.referrer){
            //             return false;
            //         }
            //         var reloadPage = pageshowReloads[So.State.currentUI.name];
            //         if(reloadPage){
            //             So.Gcmd.changeHash(reloadPage, {
            //                 noUseCache: true
            //             });
            //         }
            //     }catch(e){}                
            // });

            //360浏览器下拖拽地图会触发浏览器自定义下拉、左右滑动事件
            //阻止浏览器默认事件
            $(document).on('touchmove', function(event){
                //地图模式下禁用浏览器下拉;
                if($('body').hasClass('view-mode-map') && !$('html').hasClass('show-select-sort')){
                    event.preventDefault();
                }
            });
            // document.addEventListener('touchmove', function(event){
            //     event.preventDefault();
            // });

            var scrollHandle = function(){
                var list = $(this),
                    direction = 0, //滚动方向，1为向下滚动，2为向上滚动
                    scrollTop = document.body.scrollTop || document.documentElement.scrollTop,
                    height = $(window).height(),
                    scrollHeight = document.body.scrollHeight || document.documentElement.scrollHeight;

                if(!scrollPoints.length){
                    scrollPoints.push(scrollTop);
                }else{
                    scrollPoints = [scrollPoints[scrollPoints.length-1], scrollTop];
                }

                if(scrollPoints[1]){
                    if(scrollPoints[1] - scrollPoints[0] > 0){
                        direction = 1;
                    }else{
                        direction = -1;
                    }
                }

                //console.log(scrollHeight,scrollTop,height,$(window).height(),$('#CTextDiv').height());
                var bottom_hei = scrollHeight - (scrollTop + height);

                if((touchDirection == 1 || direction == 1) && bottom_hei < 100){
                    So.State.currentUI.scrollLoad && So.State.currentUI.scrollLoad({direction:direction});
                    //清空touch事件的滚动状态
                    touchDirection = 0;
                }
            }

            //添加滚动
            $(window).on('scroll', scrollHandle);
            $(window).on('touchstart', scrollHandle);

//                切换显示与隐藏的公交线路
            $('body').on('click','.morebtnlink',this.toggleBusLine);

            //隐藏suggest;
            $('body').on('click', function(){
                $('body').trigger('hideSuggest');
            });

            $('#hd-m-home .search-input-mask').on('click', function(e){
                e.stopPropagation();
                e.preventDefault();

                So.Gcmd.headerTopSearch()
            });

            So.simulationClick($('.mapToolsBox .mapZoomin'), function(){
                So.Gcmd.zoomin();
            });
            So.simulationClick($('.mapToolsBox .mapZoomout'), function(){
                So.Gcmd.zoomout();
            });
            So.simulationClick($('.mapToolsBox.mapLocate'), function(){
                So.Gcmd.geolocate({'setCenter':1, 'from':'homebtn'});
            });
            So.simulationClick($('.mapToolsBox.mapTraffic'), function(){
                So.Gcmd.traffic();
            });

            So.simulationClick($('.app_download_icon'), function(){
                var btn = $(this);
                var now = Date.now();
                var lastclick = btn.data('lastclick');

                if(lastclick && now - lastclick < config.APPLOADTIMEOUT){
                    return false;
                }
                btn.data('lastclick', now);

                monitor.index.click.home_download_icon();
                So.callNative({}, {
                    view:'map/index',
                    loadApp: '3',
                    from: 'wap_home_icon'
                });
                
            });

            So.simulationClick($('.app_download_con .app_download_tip_con'), function(){
                monitor.index.click.home_download_fc();
                var appDownloadUrl = So.addparamsToUrl(So.appDownloadUrl3, {
                    from: 'wap_home_tip'
                })
                location.href = appDownloadUrl;
            });

            So.simulationClick($('.app_download1_con'), function(){
                var con = $('.app_download1_con');
                var view_params = con.data('scheme_params');
                var now = Date.now();
                var lastclick = con.data('lastclick');
                var currentUI_viewname = So.State.currentUI.__view_name1__;

                if(lastclick && now - lastclick < config.APPLOADTIMEOUT){
                    return false;
                }
                con.data('lastclick', now);


                var configs = {
                    'search/categories': {
                        monitor: function(){
                            monitor.categories.click.cross_download_xd_test1();
                        },
                        src: 'cross_xd_test1',
                        app_index: "2"
                    },
                    'search/map_list': {
                        monitor: function(){
                            monitor.index.click.list_download_xd();
                        },
                        src: 'wap_list_bottom',
                        app_index: "1"
                    },
                    'bus/index': {
                        monitor: function(){
                            monitor.route.bus.click.bus_download_app();
                        },
                        src: 'route_detail',
                        app_index: "3"
                    },
                    'drive/index': {
                        monitor: function(){
                            monitor.route.click.route_detail_download_xd();
                        },
                        src: 'route_detail',
                        app_index: "2"
                    },
                    'walk/index': {
                        monitor: function(){
                            monitor.route.click.route_detail_download_xd();
                        },
                        src: 'route_detail',
                        app_index: "2"
                    },
                    'bike/index': {
                        monitor: function(){
                            monitor.route.click.route_detail_download_xd();
                        },
                        src: 'route_detail',
                        app_index: "2"
                    }

                };
                var _config = configs[currentUI_viewname];
                var timeout=  _config.timeout || config.APPLOADTIMEOUT;
                var app_index = _config.app_index || '1';
                if(!_config){
                    return false;
                }
                


                try{
                    view_params = JSON.parse(view_params);    
                }catch(e){
                    view_params = {};
                }
                

                So.callNative(view_params, {
                    loadApp: app_index,
                    from: _config.src
                });

                _config.monitor();
                
            });

            So.simulationClick($('.app_download1_con .app_download1_close'), function(event){
                var btn = $('.app_download1_con');
                var count = So.Cookie.get("app_download_list_close") || 0;
                btn.hide();
                monitor.index.click.list_download_xd_close();
                event.stopPropagation();
                event.preventDefault();

                //记录2分钟
                So.Cookie.save("app_download_list_close",count*1+1,2 / (24 * 60), "/");
            });

            So.simulationClick($('.app_download2_con .app_download2_btns_close'), function(){
                var con = $('.app_download2_con');  
                var dialog_src = con.data('src') || '';
                con.hide();
                if(dialog_src == 'qr'){
                    monitor.index.click.scan_download_cancel();    
                }else if(dialog_src == 'onebox_goto'){
                    monitor.index.click.onebox_goto_download_close();    
                }else if(dialog_src == 'detail_goto' || dialog_src == 'map_detail_goto'){
                    monitor.index.click.mapp_download_goto_cancel();    
                }else if(dialog_src == 'wap_drive_navigation'){
                    monitor.index.click.route_car_download_close();
                }else if(dialog_src == 'wap_walk_navigation'){
                    monitor.index.click.route_walk_download_close();
                }else{
                    monitor.index.click.message_download_cancel();    
                }
            });

            So.simulationClick($('.app_download2_con .app_download2_btns_down'), function(){
                var con = $('.app_download2_con');
                var dialog_src = con.data('src') || '';
                var view_params = con.data('scheme_params');
                var currentUI_viewname = So.State.currentUI.__view_name1__;
                
                var now = Date.now();
                var lastclick = con.data('lastclick');

                if(lastclick && now - lastclick < 2000){
                    return false;
                }
                con.data('lastclick', now);

                var configs = {
                    'search/map_list': {
                        monitor: function(){
                        },
                        src: 'search_map_list'
                    },
                    'search/map_detail': {
                        monitor: function(){
                        },
                        src: 'search_mapdetail'
                    },
                    'bus/index': {
                        monitor: function(){
                        },
                        src: 'bus_index'
                    },
                    'bus_map': {
                        monitor: function(){
                        },
                        src: 'bus_map'
                    },
                    'drive_map': {
                        monitor: function(){
                        },
                        src: 'drive_map'
                    },
                    'walk_map': {
                        monitor: function(){
                        },
                        src: 'walk_map'
                    },
                    'bike_map': {
                        monitor: function(){
                        },
                        src: 'bike_map'
                    }
                };
                var _config = configs[currentUI_viewname];
                try{
                    view_params = JSON.parse(view_params);    
                }catch(e){
                    view_params = {};
                }
                

                con.hide();
                if(dialog_src == 'qr'){
                    monitor.index.click.scan_download();
                }else if(dialog_src == 'onebox_goto'){
                    monitor.index.click.onebox_goto_download_open();
                }else if(dialog_src == 'detail_goto' || dialog_src == 'map_detail_goto'){
                    monitor.index.click.mapp_download_goto_open();
                }else if(dialog_src == 'wap_drive_navigation'){
                    monitor.index.click.route_car_download_open();
                }else if(dialog_src == 'wap_walk_navigation'){
                    monitor.index.click.route_walk_download_open();
                }else{
                    monitor.index.click.message_download();
                }

                So.callNative(view_params, {
                    loadApp: '3',
                    from: 'qr_dialog'
                });

            });
            
        },
        toggleBusLine:function(event){
            event.preventDefault();
            var status = parseInt($(this).data('status'));
            if(!status){
                $(this).data('status',1);
                $(this).siblings('a').show();
                $(this).find('em').text('收起');
            }
            if(status){
                $(this).data('status',0);
                $(this).closest('.busnum').find('a:nth-child(n+10)').hide();
                $(this).find('em').text('更多');
            }
        }
    };

    main.init();


    __errorMark__.push('main.js:12');
});
