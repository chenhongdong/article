define(function(require){
    var config = require('js/app/conf/config');
    var user_poi = require('js/app/common/user_poi');

    var scrollLoading = false;
    var count_dom;
    var aggregates_index = {
        name: "aggregates_index",
        containMap: false,
        setBodyMainHeight: false,
        command: So.Command.CitySearch,
        tpl:{
            index: require('../../../templates/search/aggregates/index.html'),
            item: require('../../../templates/search/aggregates/item.html')
        },
        el: '#CTextDiv',
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                view_data = this.view_data,
                view_params = view_data.view_params || {},
                params = view_data.params,
                data = view_data.data,
                pageCount = parseInt(data.count / data.pageSize) + (data.count % data.pageSize == 0 ? 0 : 1),
                list = [];
            
            pageCount = pageCount == 0 ? 1 : pageCount;
            
            data.pageCount = pageCount;

            if(data.poi && data.poi.length){
                _.each(data.poi, function(item){
                    list.push(So.View.template(me.tpl.item, item));
                });
            }

            

            if(!(view_params.from && view_params.from == 'scrollLoad')){
                $("#CTextDiv").html(So.View.template(me.tpl.index, {
                    address_aggregation: data.address_aggregation,
                    list: list.join(''),
                    pageCount: pageCount
                }));
                
            }else{
                $('.__view__name__aggregates_index #CTextDiv .aggregates_container ul').append(list.join(''));

                //滚动加载完毕;
                scrollLoading = false;
            }
            

        },
        events:{
            'click .__view__name__aggregates_index #CTextDiv .result-header-bar .header-back': 'goback',
            'click .__view__name__aggregates_index #CTextDiv .aggregates_container .header_con .btns .around': 'searchAround',
            'click .__view__name__aggregates_index #CTextDiv .aggregates_container .header_con .btns .route': 'toHere',
            'click .__view__name__aggregates_index #CTextDiv .aggregates_container .header_con .btns .app': 'toApp',
            'click .__view__name__aggregates_index #CTextDiv .aggregates_container .list_con li': 'toDetail'
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

            if(state){
                this.checkIsFull();
            }

        },
        goback: function(){
            window.history.go(-1);
        },
        searchAround: function(){
            var me = aggregates_index,
                view_data = me.view_data,
                data = view_data.data,
                address_aggregation = data.address_aggregation;

            So.Gcmd.changeHash('search/categories', {
                params: {
                    local: address_aggregation.address,
                    mp: address_aggregation.y + ',' + address_aggregation.x
                }
            });
        },
        toHere: function(){
            var me = aggregates_index,
                view_data = me.view_data,
                data = view_data.data,
                address_aggregation = data.address_aggregation;

            So.Gcmd.changeHash('route/index', {
                params: {
                    end: {
                        name: address_aggregation.address,
                        x: address_aggregation.x,
                        y: address_aggregation.y
                    }
                }
            });
        },
        toApp: function(){
            var me = aggregates_index,
                view_data = me.view_data,
                params = view_data.params;
                
            So.callNative(params, {
                view: 'search/map_list',
                loadApp: "1"
            });
        },
        toDetail: function(){
            var li = $(this);
            var geolocation = So.State.getLocation(true);
            var pguid = li.data('pguid');


            href = '/onebox/?type=detail&id='+pguid+'&mso_x='+ geolocation.x+'&mso_y='+geolocation.y+'&d=mobile&src=map_wap&fields=movies_all';

            setTimeout(function(){window.location.href = href},100);
        },
        checkIsFull: function(){
            var window_height = $(window).height();
            var load_more_offset = $('#CTextDiv .load-more').offset() || {};

            if(load_more_offset.top < window_height){
                this.scrollLoad();
            }
        },
        scrollLoad:function(){
            var view_data = this.view_data || {},
                data = view_data.data || {},
                command = view_data.command,
                poiNum = data.poi && data.poi.length || command.pageSize;

            //正在加载数据中，不再次加载数据;
            if(scrollLoading){
                return;
            }

            //数据已加载完毕取消loading;
            if(poiNum == data.count){
                return;
            }


            //正在滚动加载;
            scrollLoading = true;

            this.loadData();            
        },
        loadData: function(){
            var view_data = this.view_data || {},
                data = view_data.data,
                pageCount = data.pageCount,
                page = data.page;


            if(page >= pageCount){
                $('#CTextDiv .load-more').hide();
                return false;
            }
            
            view_data.params.page = ++page;
            view_data.data = null;
            view_data.noChangeUrl = true;
            view_data.noUseCache = true; //收藏数据会编辑，禁止使用缓存数据
            view_data.view_params.from = 'scrollLoad';

            So.Gcmd.changeHash("search/aggregates", view_data);
        }
    };

    return aggregates_index;
})
