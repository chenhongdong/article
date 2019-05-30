define(function(require){
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').user_favorite;
    var scrollLoading = false; //记录是否正在滚动数据加载中
    var command = require('../command/favorite');

    var LIST_STATE_NORMAL = 'normal'; //正常
    var LIST_STATE_EDIT = 'edit'; //编辑
    var list_state = LIST_STATE_NORMAL; //列表页的模式：normal：正常 edit：编辑

    var user_index = {
        name: "user_favorite",
        containMap: false,
        setBodyMainHeight: false,
        command: command,
        tpl:{
            index: require('../../../templates/user/favorite/index.html'),
            item: require('../../../templates/user/favorite/item.html')
        },
        el: '#CTextDiv',
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                view_data = this.view_data,
                params = view_data.params,
                view_params = view_data.view_params || {},
                info = view_data.data,
                pageCount = info.pageCount,
                list = [];            

            if(info.total && info.data.length){
                _.each(info.data, function(item){
                    if(item.far_id && item.pguid && item.poi_name && item.poi_address && item.create_time){
                        item.distance_format = item.distance ? So.Util.formatDistance1(item.distance) : '';
                        list.push(So.View.template(me.tpl.item, item));
                    }
                });
            }


            if(!(view_params.from && view_params.from == 'scrollLoad')){
                $("#CTextDiv").html(So.View.template(me.tpl.index, {
                    list: list.join(''),
                    pageCount: pageCount
                }));
                user_index.checkLoad();
            }else{
                $('.__view__name__user_favorite #CTextDiv .favorite_list').append(list.join(''));

                //滚动加载完毕;
                scrollLoading = false;
                
            }

            if(info.page >= pageCount){
                $("#CTextDiv .favorite_container .load-more").hide();
            }
            

        },
        events:{
            'click .__view__name__user_favorite .result-header-bar .header-back': 'goback',
            'click .__view__name__user_favorite .result-header-bar .header-btn[data-action="changeState"]': 'changeState',
            'click .__view__name__user_favorite .favorite_container .favorite_list li': 'clickItem',
            'click .__view__name__user_favorite .favorite_container .remove_btn span[data-action="deleteFav"]': 'deleteFav'
        },
        visible: function(state) {
            var me = this,
                params = me.view_data.params,
                name = params.name || '';

            if (this._visible == state) {
                return
            }
            this._visible = state;

            var display = state ? "block" : "none";
            $("#CTextDiv").css("display", display);


            //初始页面模式;
            user_index.quitEidtStat();

        },
        bindEvent: function(){

        },
        scrollLoad:function(){
            var view_data = this.view_data || {},
                data = view_data.data || {},
                page = data.page,
                dataNum = data.data && data.data.length;

            //正在加载数据中，不再次加载数据;
            if(scrollLoading){
                return;
            }

            if(page >= data.pageCount){
                return false;
            }

            this.loadData();            
        },
        loadData: function(){
            var view_data = this.view_data || {},
                data = view_data.data,
                page = data.page;

            //正在滚动加载;
            scrollLoading = true;
            

            $('#poi-wrapper .load-more').show();
            view_data.params.page = ++page;
            view_data.data = null;
            view_data.noChangeUrl = true;
            view_data.noUseCache = true; //收藏数据会编辑，禁止使用缓存数据
            view_data.view_params.from = 'scrollLoad';

            So.Gcmd.changeHash("user/favorite", view_data);
        },
        clickItem: function(){
            var item = $(this);
            var pguid = item.data('pguid');
            var favorite_container = item.closest('.favorite_container');
            var active_item;
            
            if(list_state == LIST_STATE_NORMAL){

                monitor.click.myfar_list();
                window.location.href = "/onebox/?type=detail&id="+ pguid +"&d=mobile&src=map_wap&fields=movies_all"

            }else if(list_state == LIST_STATE_EDIT){
                
                item.toggleClass('active');

                active_item = $('.favorite_container .favorite_list li.active');

                if(active_item.length > 0){
                    if(!favorite_container.hasClass('can_remove')){
                        favorite_container.addClass('can_remove');
                    }
                }else{
                    favorite_container.removeClass('can_remove');
                }
                
                return false;
            }
        },
        deleteFav: function(){
            var active_item = $('.favorite_container .favorite_list li.active');
            var ids = [];
            var params;
            var sn;

            if(active_item.length == 0){
                return false;
            }

            _.each(active_item, function(item){
                ids.push($(item).data('id'));
            });            

            params = {
                far_id: ids.join(',')
            };

            sn = config.makeSign(params);

            params.sn = sn;


            var callback = function(data){
                user_index.quitEidtStat({
                    refreshPage: true
                });
            }


            $.ajax({
                url: config.FAVORITE_DELETE,
                async: true,
                type: "GET",
                dataType: "jsonp",
                jsonp: "jsoncallback",
                data: params,
                cache: false,
                success: function(data) {
                    callback(data);
                },
                error: function() {
                    callback();
                }
            });

            active_item.remove();
            user_index.checkLoad();

            monitor.click.myfar_del();
        },
        checkLoad: function(){
            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop,
                winHeight = $(window).height(),
                contaimer = $('.favorite_container .favorite_list'),
                load_dom = $('.favorite_container .load-more'),
                load_dom_offset = load_dom.offset() || {},
                load_top = load_dom_offset.top,
                needLoad = load_top - (scrollTop + winHeight) <= 70;

            if(needLoad){
                user_index.scrollLoad();
            }
        },
        goback: function(){
            window.history.go(-1);
        },
        enterEditState: function(){
            $('body').addClass('edit_fav');
            list_state = LIST_STATE_EDIT;
        },
        quitEidtStat: function(opts){
            opts = opts || {};
            var refreshPage = opts.refreshPage || false;
            var items = $('.favorite_container .favorite_list li');
        
            $('body').removeClass('edit_fav');
            list_state = LIST_STATE_NORMAL;

            if(refreshPage && items.length == 0){
                So.Gcmd.changeHash("user/favorite");
            }
            
        },
        changeState: function(){
            if(list_state == LIST_STATE_NORMAL){
                user_index.enterEditState();
            }else{
                user_index.quitEidtStat();
            }
        }
    };

    return user_index;
})
