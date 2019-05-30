define(function(require){
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').user_index;
    var command = require('../command/index');
    var user_poi = require('js/app/common/user_poi');
    var service_favorite = require('../services/favorite');

    var count_dom;
    var user_index = {
        name: "user_index",
        containMap: false,
        setBodyMainHeight: false,
        command: command,
        tpl:{
            index: require('../../../templates/user/index/index.html')
        },
        el: '#CTextDiv',
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                view_data = this.view_data,
                params = view_data.params,
                data = view_data.data;

            //获取用户家、公司信息
            var poi_info = user_poi.getHomeAndCompany();

            

            $("#CTextDiv").html(So.View.template(me.tpl.index, {
                poi_info: poi_info,
                user_info: data
            }));

            this.bindEvent();

            //登录后再请求收藏数据
            if(data.username){
                this.getFavoriteCount();
            }

        },
        events:{
            'click .__view__name__user_index .result-header-bar .header-back': 'goback',
            'click .__view__name__user_index .user_container .login_con': 'toLogin',
            'click .__view__name__user_index .favorite_con': 'toFavorite',
            'click .__view__name__user_index .result-header-bar .login-out': 'loginOut'
        },
        visible: function(state) {
            var me = this,
                params = me.view_data.params,
                name = params.name || '';

            if (this._visible == state) {
                return
            }
            this._visible = state;

            count_dom = $('.user_container .favorite_con .info');

            var display = state ? "block" : "none";
            $("#CTextDiv").css("display", display);

        },
        bindEvent: function(){
            user_poi.bindEvent('.__view__name__user_index .user_container', 'div[data-type=home],div[data-type=company]');
        },
        goback: function(){
            window.history.go(-1);
        },
        getFavoriteCount: function(){

            var callback = function(data){
                data = data || {};
                var count = data.total || 0;
                var message = count ? '已收藏'+ count +'条' : '您还没有收藏任何内容。';

                count_dom.html(message);
            };

            service_favorite({}, callback);
        },
        toLogin: function(opts){
            opts = opts || {};
            var view_data = user_index.view_data,
                data = view_data.data;

            if(data.username){
                return false;
            }


            var dom = $(this),
                type = 'login',//dom.data('type') || opts.type || 'login',
                types = {
                    'login': "//i.360.cn/login/wap/",
                    'reg': "//i.360.cn/reg/wap/"
                },
                href = types[type];

            if(!href){
                return false;
            }            

            window.location.href = href +"?src=mpw_around&destUrl="+ encodeURIComponent(window.location.origin);
        },
        toFavorite: function(){
            var me = user_index,
                view_data = me.view_data,
                data = view_data.data;

            if(data.username){
                monitor.click.myfar();
                So.Gcmd.changeHash('user/favorite');    
            }else{
                // So.Gcmd.changeHash('user/favorite',{
                //     onlySetParams: true
                // });
                me.toLogin();
            }
            
        },
        loginOut: function(){
            QHPass.logout(function(){
                //删除POI历史记录;
                So.Util.storageItem("remove", config.STORAGE_KEYS.POIHISTORY);
                //删除路线历史记录;
                So.Util.storageItem("remove", config.STORAGE_KEYS.ROUTEHISTORY);
                //删除家
                So.Util.storageItem("remove", config.STORAGE_KEYS.HOME);
                //删除公司
                So.Util.storageItem("remove", config.STORAGE_KEYS.COMPANY);
                

                So.Gcmd.changeHash('user/index', {
                    noUseCache: true
                });
            })
        }
    };

    return user_index;
})
