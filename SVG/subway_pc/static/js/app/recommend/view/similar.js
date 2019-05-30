define(function(require){
    var command = require('../command/similar');
    var selectSort = require('../../../lib/filterSort');
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').similar;
    var selectSortObj;
    var scrollLoading = false; //记录是否正在滚动数据加载中

    var recommend_similar = {
        name: "recommend_similar",
        containMap: false,
        setBodyMainHeight: false,
        command: command,
        tpl:{
            index: require('../../../templates/recommend/similar/index.html'),
            item: require('../../../templates/recommend/similar/item.html')
        },
        el: '#CTextDiv',
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                view_data = this.view_data,
                params = view_data.params,
                view_params = (view_data.view_params || (view_data.view_params = {})),
                data = view_data.data,
                pageCount = data.pageCount,
                list = [];

            //显示前35条数据;
            data.poi = data.poi.slice(0,35);


            if(data.poi && data.poi.length){
                _.each(data.poi, function(item){
                    list.push(So.View.template(me.tpl.item, item));
                });
            }


            if(!(view_params.from && view_params.from == 'scrollLoad')){

                $("#CTextDiv").html(So.View.template(me.tpl.index, {
                    list: list.join(''),
                    pageCount: pageCount
                }));

            }else{
                $('.__view__name__recommend_similar #CTextDiv .recommend_similar').append(list.join(''));

                //滚动加载完毕;
                scrollLoading = false;
                
            }

            if(data.page >= pageCount){
                $("#CTextDiv .recommend_con .load-more").hide();
            }

            this.bindEvent();

            monitor.disp.detail_tuijian_kindlist();

        },
        events:{
            'click .__view__name__recommend_similar .result-header-bar .header-back': 'goback',
            'click .__view__name__recommend_similar .recommend_con .recommend_similar li': 'toDetail'
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

        },        
        scrollLoad:function(){
            var view_data = this.view_data || {},
                data = view_data.data || {},
                page = data.page;

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
            

            $('#mall-wrapper .load-more').show();
            view_data.params.page = ++page;
            view_data.data = null;
            view_data.noChangeUrl = true;
            view_data.view_params.from = 'scrollLoad';

            So.Gcmd.changeHash("recommend/similar", view_data);
        },
        bindEvent: function(){
        },
        toDetail: function(){
            var li = $(this),
                id = li.data('id');

            if(!id){
                return false;
            }
            monitor.click.detail_tuijian_kindlist();

            setTimeout(function(){
                window.location.href = "/onebox/?type=detail&id="+ id +"&d=mobile&src=map_wap&fields=movies_all";    
            },200)
            
            
        },
        goback: function(){
            window.history.go(-1);
        }
    };

    return recommend_similar;
})
