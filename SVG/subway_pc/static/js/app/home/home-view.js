define(function(require) {
    __errorMark__.push('home-view:11');
    var config = require('js/app/conf/config');
    (function(b) {
        var temp;//resize width 记录
        var a = {
            init: function() {
                __errorMark__.push('home-view-init:11');
                //添加打点统计，记录地图初始化文件加载完毕时间;
                So._time.based = +new Date;

                So.Command.init({
                    uicmd: So.Command.UICmd
                });
                window.onresize = this.onResize;
                var search_params = window.location.search;
                var hash = window.location.hash;

                /*
                 *解决访问url中search部分参数&是&amp;时，参数无法识别导致页面报错的问题
                 *实例url： //m.map.so.com/#bus/index/start=%E6%88%91%E7%9A%84%E4%BD%8D%E7%BD%AE%24%24116.187251%2C39.915256&amp;end=%E5%8C%97%E4%BA%AC%E5%B8%82%E7%87%95%E9%83%BD%E5%8C%BB%E9%99%A2%24%24116.22969%2C39.892609&amp;city=%E5%8C%97%E4%BA%AC%E5%B8%82&amp;_=803573
                 *
                 * */
                search_params = search_params.replace(/&amp;/g,"&");//将url地址中$amp转码
                //有search_params 走老接口，有hash走新接口，
                //两个都有时优先走hash;
                var old_share = So.Util.hasQuery(search_params) && !hash;
                So.State.init(old_share);
                var d = this;
                var c = function() {
                    __errorMark__.push('home-view-init:21');
                    try{
                        var g = decodeURIComponent(search_params);
                    }catch(e){
                        var g = search_params;
                    }
                    if (!old_share && !hash) {
                        $('.header').css('display', 'block');
                        So.Gcmd.changeHash(config.MAIN_PAGE, {});
                    }
                    if (old_share == true) {
                        new So.Command.parseQuery({
                            query: g
                        }).run()
                    }
                    So.Gcmd.geolocate();
                    var map = So.UIMap.getObj();
                    if (typeof(config.initCallback) == "function") {
                        config.initCallback(map)
                    }
                    __errorMark__.push('home-view-init:22');
                };
                c();

                $(document).ready(function(){


                })
                __errorMark__.push('home-view-init:12');
                this.gotoTop();
            },
            onResize: function() {
                if (So.State.currentUI && typeof(So.State.currentUI.resize) == "function") {
                    So.State.currentUI.resize();
                }
            },
            gotoTop: function(){
                /*回到顶部浮层*/
                (function(win, doc) {
                    var $elTop = $('#mso-goto-top');
                    //找不到所需元素，直接返回
                    if (!$elTop.length) {
                        return;
                    }
                    var ua = navigator.userAgent.toLowerCase();
                    var uaBlackList = [];
                    //UA 中包含黑名单之间的字符，直接返回
                    for(var i = 0; i < uaBlackList.length; i++) {
                        if(ua.indexOf(uaBlackList[i]) > -1) {
                            return;
                        }
                    }
                    var iOSBlackList = ['micromessenger', 'mso_app', 'baidu', 'ucbrowser'];
                    var needFallback = false;
                    //针对 iOS，如果包含黑名单之类的字符，采用降级策略
                    if(/ipad|iphone|ipod/.test(ua)) {
                        for(var i = 0; i < iOSBlackList.length; i++) {
                            if(ua.indexOf(iOSBlackList[i]) > -1) {
                                needFallback = true;
                                break;
                            }
                        }
                    }
                    var scrollTop = $(win).scrollTop();
                    var timer;

                    function show() {
                        if($elTop.hasClass('show')) {
                            return;
                        }
                        $elTop.addClass('show');

                        // monitor.log({
                        //     pro: 'map_onebox',
                        //     pid: 'detail',
                        //     ptype: 'pguid-detail',
                        //     cat: 'm-map-list-pv',
                        //     'data-md-p': 'scrollBtn'
                        // }, 'click');
                    }
                    function hide() {
                        if(!$elTop.hasClass('show')) {
                            return;
                        }
                        $elTop.removeClass('show');
                    }
                    function changeStatus(status) {
                        var newScrollTop = $(win).scrollTop();
                        var maxHeight = Math.max(win.innerHeight, 600);
                        //fallback 则不做滑动隐藏策略
                        if(needFallback) {
                            status = 'show';
                        }
                        //高度小于指定值，一定隐藏
                        if(newScrollTop < maxHeight) {
                            hide();
                        } else {
                            if(status == 'show') {
                                show();
                            } else {
                                hide();
                            }
                        }
                    }
                    function scroll() {
                        if(timer) {
                            clearTimeout(timer);
                            timer = null;
                        }
                        //滚动停止200ms后，设置状态为显示
                        timer = setTimeout(function() {
                            changeStatus('show');
                        }, 200);
                        var newScrollTop = $(win).scrollTop();
                        if(newScrollTop - scrollTop > 5) {
                            changeStatus('hide');
                        } else if(newScrollTop - scrollTop < -5) {
                            changeStatus('show');
                        } else {
                            return;
                        }
                        scrollTop = newScrollTop;
                    }

                    $(win).on('scroll', scroll);
                    scroll();
                    $elTop.on('click', function() {
                        var timerId;
                        var startTime;
                        var frameTime = 13;
                        var dur = 350;
                        var scrollTop = $(win).scrollTop();
                        function animFun(time) {
                            var p = (new Date - startTime) / dur;
                            if (p >= 1) {
                                clearTimeout(timerId);
                                $(win).scrollTop(0);
                            } else {
                                $(win).scrollTop(Math.round((1 - p * p) * scrollTop));
                            }
                        }
                        startTime = new Date;
                        timerId = setInterval(animFun, frameTime);

                        // monitor.log({
                        //     pro: 'map_onebox',
                        //     pid: 'detail',
                        //     ptype: 'pguid-detail',
                        //     cat: 'm-map-list-click',
                        //     'data-md-p': 'scrollBtn'
                        // }, 'click');
                        return false;
                    })
                })(window, document);
            },
            pageheight: function() {
                var g = document.documentElement.clientHeight;
                var heightMin = config.heightMin;
                var d = g;

                d = g - config.HEADER_HEIGHT;

                return d
            }
        };
        new Image().src = "./img/blank.gif?counterforpv&" + new Date().getTime();
        So[b] = a
    })("Main");
    __errorMark__.push('home-view:12');

    So.UIGeoError = {
        show: function(a) {
            $("#btm-bar").html(So.View.template(require('../../templates/Btmbar.html'), {
                msg: a
            }));
            $("#btm-bar").css("display", "block");
            setTimeout(function() {
                $("#btm-bar").css("display", "none")
            }, 5000)
        }
    };

    So.SplashError = {
        show: function(a) {
            $("#error-info").html(_.escape(a));
            $("#error-dialog").css("display", "block");
            setTimeout(function() {
                $("#error-dialog").css("display", "none")
            }, 5000)
        }
    };

    So.Waiting = {
        show: function(content,type) {
            var b = So.Main.pageheight() + config.HEADER_HEIGHT;
            var a = document.documentElement.scrollHeight;
            $("#effect-dialog").css("display", "block");
            if(type){
                $("#effect-dialog").empty().html('<div class="load-more g-night-bgcolor normal-user-loading" data-class="content">'+content+'</div>');
            }else{
                $("#effect-dialog").empty().html('<div class="load-more g-night-bgcolor normal-user-loading" data-class="loading"><div class="logo-icon"></div></div>');
            }
            this.spinOpen = true
        },
        hide: function() {
            $("#effect-dialog").css("display", "none");
            this.spinOpen = false
        }
    };
});
