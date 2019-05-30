define(function(require){
    var playindex = 0;
    var fanbulist,
        max_num,
        temp_timer,//模板渲染定时器;
        play_timer, //动画定时器
        play_timer1, //动画定时器
        play_timer2, //动画定时器
        fanbu_container_dom,
        user_image_dom,
        user_money_container,
        user_money_dom,
        user_tools_newuser,
        user_tools_help,
        user_all_info,
        user_tools_withdraw,
        user_tools_grabmoney,
        isLogin,
        userInfo;

    var fanbu = {
        tpl: {
            list: require('../../../templates/search/fanbu/list.html')
        },
        init: function(){
            var me = this;
            try{
                if(!(window.__HaosouApp__ && __HaosouApp__.getProtocol)){
                    return;
                }
                var version = __HaosouApp__.getProtocol("fanbu");
                if(!(version & 8)){ //version右边数第4位为1则表示支持饭补功能  1<<3 为8
                    return;
                }

                //清除动画定时器;
                play_timer && clearTimeout(play_timer);
                play_timer1 && clearTimeout(play_timer1);
                play_timer2 && clearTimeout(play_timer2);
                
                //APP更新登陆状态
                //window.__fanbu__.updateLoginState();
                //从APP判断饭补是否登陆
                isLogin = __HaoSouFun__.isLogin();


                if(isLogin && isLogin !== 'false'){
                    isLogin = true;
                    userInfo = __HaoSouFun__.getUserInfo();
                    //userInfo = '{"account":{"private_account":"91.53","share_account":"91.53"},"avatar":"http://u1.qhmsg.com/qhimg/quc/180_180/2b/02/81/2b02815q290e6.1266fd.jpg","cash_account":"wuxupeng_1314@163.com","total_add":"167.56","loc":[116.490536,39.982888],"name":"happy.sky.2013","qid":"267898714","sex":"男","today_add":"0","tel":"152****6392","share_add":1,"improve_add":0,"valid":1,"vit":10}';
                    //__errorReport__.report({message: JSON.parse(userInfo)});

                    try{
                        me.updateInfo(JSON.parse(userInfo));
                    }catch(e){}
                    
                }else{
                    isLogin = false;
                    this.getList();
                }
            }catch(e){}
            

            // window.__HaoSouFun__ && window.__HaoSouFun__.toHowToPlayPage && alert(__HaoSouFun__.toHowToPlayPage);
            // window.__HaoSouFun__ && window.__HaoSouFun__.getUserInfo && alert(__HaoSouFun__.getUserInfo);
            // window.__HaoSouFun__ && window.__HaoSouFun__.toUserInfoPage && alert(__HaoSouFun__.toUserInfoPage);
            // window.__HaoSouFun__ && window.__HaoSouFun__.toOverlayPage && alert(__HaoSouFun__.toOverlayPage);
            // window.__HaoSouFun__ && window.__HaoSouFun__.isLogin && alert(__HaoSouFun__.isLogin);
        },
        play: function(){
            var me = this;
            if(playindex == max_num -1){
                playindex = -1;
            }

            playindex ++;

            $(user_image_dom[0]).css({
                'background-image': 'url("' + fanbulist[playindex].avatar + '")'
            });

            play_timer = setTimeout(function(){
                //用户头像隐藏;
                user_image_dom.css({
                    'transform' : 'scaleX(0)',
                    '-webkit-transform' : 'scaleX(0)'
                });

                //用户饭补金额隐藏
                user_money_container.css({
                    'opacity': 0
                });

                //用户头像显示，动画执行500ms，延时400ms更换头像;
                play_timer1 = setTimeout(function(){
                    $(user_image_dom[1]).css({
                        'background-image': 'url("' + fanbulist[playindex].avatar + '")',
                    });
                    user_image_dom.css({
                        'transform' : 'scaleX(1)',
                        '-webkit-transform' : 'scaleX(1)'
                    });

                    me.play();
                },400);

                //用户饭补金额显示
                play_timer2 = setTimeout(function(){
                    user_money_dom.html('￥' + fanbulist[playindex].money);
                    user_money_container.css({
                        'transition': '0.3s',
                        '-webkit-transition': '0.3s',
                        'opacity': 1
                    });
                },700);
            },5000);
        },
        bindEvent: function(){
            // user_image_dom[0].addEventListener('webkitTransitionEnd', function(){
            //     user_image_dom.css({
            //         'transform' : 'rotateY(0)',
            //         'transition': '1s'
            //     });
            // }, false);

            user_tools_newuser.on('click', function(){
                __HaoSouFun__.toOverlayPage();
            });
            user_tools_help.on('click', function(){
                __HaoSouFun__.toHowToPlayPage();
            });
            //用户信息
            user_all_info.on('click', function(){
                __HaoSouFun__.toUserInfoPage();
            });
            //提现
            user_tools_withdraw.on('click', function(){
                __HaoSouFun__.toGroupOnPage();
            });
            //抢饭补
            user_tools_grabmoney.on('click', function(){
                __HaoSouFun__.toOverlayPage();
            });
        },
        updateInfo: function(data){
            var me = this;
            //如果已经存在容器则先删除;
            fanbu_container_dom && fanbu_container_dom.remove();

            fanbu_container_dom = $(So.View.template(me.tpl.list, data));
            $('#around_list_con').before(fanbu_container_dom);

            user_image_dom = $('.fanbu_con .user_image span');
            user_money_container = $('.fanbu_con .user_info span');
            user_money_dom = $('.fanbu_con .user_info .money');
            user_tools_newuser = $(".fanbu_con .user_tools .newuser");
            user_tools_help = $('.fanbu_con .user_info .fb_help');
            user_all_info = $('.fanbu_con .user_all_info');
            user_tools_withdraw = $('.fanbu_con .user_tools .withdraw');
            user_tools_grabmoney = $('.fanbu_con .user_tools .grabmoney');
            me.bindEvent();
        },
        getList: function(){
            var me = this;
            $.ajax({
                url: 'http://fb.app.m.so.com/api/fanbu/cardInfo?filter=1',
                async: true,
                type: "GET",
                dataType: "jsonp",
                jsonp: "callback",
                data: {},
                cache: false,
                success: function(data) {
                    //数据出错则返回;
                    if(!(data.errno ==0 && data.data && data.data.length)){
                        return;
                    }

                    //如果用户已经登录，则不进行渲染;
                    if(isLogin){
                        return;
                    }

                    fanbulist = data.data;
                    max_num = fanbulist.length;
                    
                    me.updateInfo(data);
                    
                    me.play();
                },
                error: function() {
                }
            });
        },
        updateLoginState: function(){

            //延时更新状态，防止客户端重复调用好几次;
            temp_timer && clearTimeout(temp_timer);
            temp_timer = setTimeout(function(){
                fanbu.init();
            },10);
            
        }
    };

    window.__fanbuApp__ = {};
    window.__fanbuApp__.updateLoginState = fanbu.updateLoginState;

    fanbu.init();
})
