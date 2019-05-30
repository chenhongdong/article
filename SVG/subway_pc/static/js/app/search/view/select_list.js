define(function(require){    
    var command = require('../command/select_list');
    var scrollLoading = false; //记录是否正在滚动数据加载中

    var select_list = {
        name: "select_list",
        containMap: false,
        setBodyMainHeight: false,
        command: command,
        tpl:{
            container: require('../../../templates/search/select_list/container.html'),
            item: require('../../../templates/search/select_list/item.html')
        },
        el: '#CTextDiv',
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                view_data = this.view_data,
                params = view_data.params,
                callback = view_data.callback,
                view_params = view_data.view_params || {},
                data = view_data.data,
                poi = data.poi || [];
                type = params.type || '',
                name = params.name || '',
                keyword = params.keyword,
                _val = keyword || name,
                items = [],
                button_names= {
                    home: '设为家',
                    company: '设为公司'
                },
                button_name = type && button_names[type] || '确定';



            if(!(callback && _.isFunction(callback))){
                throw new Error('请设置正确的callback!');
            }

            var pageCount = parseInt(data.totalcount / data.pagesize) + (data.totalcount % data.pagesize == 0 ? 0 : 1);
            pageCount = pageCount == 0 ? 1 : pageCount;

            data.pageCount = pageCount;


            _.each(poi, function(item, index){
                item._button_name = button_name;
                items.push(So.View.template(me.tpl.item,item));
            });


            if(!(view_params.from && view_params.from == 'scrollLoad')){
                $("#CTextDiv").html(So.View.template(me.tpl.container,{
                    list: items.join(''),
                    pageCount: pageCount
                }));
            }else{
                $('.__view__name__select_list #CTextDiv .select_list').append(items.join(''));

                //滚动加载完毕;
                scrollLoading = false;
                
            }

            if(data.page >= pageCount){
                $("#CTextDiv .select_container .load-more").hide();
            }            

        },
        events:{
            'click .__view__name__select_list .result-header-bar .header-back': 'goback',
            'click .__view__name__select_list .select_list li': 'selectItem'
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
        bindEvent: function(){

        },
        scrollLoad:function(){
            var view_data = this.view_data || {},
                data = view_data.data || {},
                poiNum = data.poi && data.poi.length;

            //正在加载数据中，不再次加载数据;
            if(scrollLoading){
                return;
            }

            //数据已加载完毕取消loading;
            if(poiNum == data.count){
                return;
            }

            this.loadData();


            //正在滚动加载;
            scrollLoading = true;
        },
        loadData: function(){
            var view_data = this.view_data || {},
                data = view_data.data,
                page = data.page;

            if(page >= data.pageCount){
                return false;
            }

            $("#CTextDiv .select_container .load-more").show();
            view_data.params.page = ++page;
            view_data.data = null;
            view_data.noChangeUrl = true;
            view_data.view_params.from = 'scrollLoad';

            So.Gcmd.changeHash("search/select_list", view_data);
        },
        goback: function(){
            window.history.go(-1);
        },
        selectItem: function(){
            var view_data = select_list.view_data || {},
                callback = view_data.callback,
                item = $(this),
                name = item.data('name'),
                address = item.data('address'),
                x = item.data('x'),
                y = item.data('y');

            callback({
                name: name,
                address: address,
                x: x,
                y: y
            });

        }
    };

    return select_list;
})
