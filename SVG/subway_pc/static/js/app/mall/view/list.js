define(function(require){
    var command = require('../command/list');
    var selectSort = require('../../../lib/filterSort');
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').mall_list;
    var selectSortObj;
    var scrollLoading = false; //记录是否正在滚动数据加载中

    var mall_list = {
        name: "mall_list",
        containMap: false,
        setBodyMainHeight: false,
        command: command,
        tpl:{
            index: require('../../../templates/mall/list/index.html'),
            item: require('../../../templates/mall/list/item.html')
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



            if(data.children && data.children.length){
                _.each(data.children, function(item){
                    list.push(So.View.template(me.tpl.item, item));
                });
            }


            if(!(view_params.from && view_params.from == 'scrollLoad')){

                $("#CTextDiv").html(So.View.template(me.tpl.index, {
                    poi: data.poi,
                    list: list.join(''),
                    pageCount: pageCount
                }));

                me.initSortbar();

            }else{
                $('.__view__name__mall_list #CTextDiv .mall_list').append(list.join(''));

                //滚动加载完毕;
                scrollLoading = false;
                
            }

            if(data.page >= pageCount){
                $("#CTextDiv .mall_con .load-more").hide();
            }

            this.bindEvent();

            monitor.disp.detail_malllist();

        },
        events:{
            'click .__view__name__mall_list .result-header-bar .header-back': 'goback',
            'click .__view__name__mall_list .mall_con .mall_list li': 'toDetail'
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
        makeFloorFilterData: function(floor, config, params){
            if(!(floor && config)){
                return false;
            }

            var floor_filter = {
                    label: "全部楼层",
                    "disable": false,
                    "log": "floor"
                },
                params_floor = params.floor,
                floor_children = [{
                    "label": '全部楼层',
                    "active": 1,
                    'params': {
                        "floor": "",
                    }
                }],
                sub_nav_selected = 0,
                newlabel;


            $.each(floor, function(index, item){
                var _sub_nav_selected = params_floor == item ? 1 : 0;

                if(_sub_nav_selected){
                    sub_nav_selected = _sub_nav_selected;
                    newlabel = item;
                }

                floor_children.push({
                        label: item,
                        active: _sub_nav_selected,
                        params: {
                            "floor": item,
                        }
                    });
            });

            if(sub_nav_selected){
                floor_children[0].active = 0;
            }

            floor_filter.children = floor_children;

            if(newlabel){
                floor_filter.newlabel = newlabel;
            }

            config.push(floor_filter);
        },
        makeCatFilterData: function(cat, config, params){
            if(!(cat && config)){
                return false;
            }

            var category_filter = {
                    label: "全部频道",
                    "disable": false,
                    "log": "category"
                },
                params_categorys = params.category && params.category.split(',') || [],
                category_1 = params_categorys[0] || '',
                category_2 = params_categorys[1] || '',
                cityarea_config = [{
                    "label": '全部频道',
                    "active": 1,
                    'params': {
                        "category": "",
                    },
                    "children": [{
                        'label': '全部',
                        "active": 1,
                        'params': {
                            "category": "",
                        }
                    }]
                }],
                sub_nav_selected = 0,
                newlabel;


            $.each(cat, function(index, item){
                var _sub_nav_selected = category_1 == item.name ? 1 : 0;

                if(_sub_nav_selected){
                    sub_nav_selected = _sub_nav_selected;
                    newlabel = item.name;
                }

                var childrens = [{
                        'label': '全部',
                        "active": _sub_nav_selected, //默认选中全部，后面有其他选中的则取消"全部"选中
                        'params': {
                            "category": item.name,
                        }
                    }],
                    area = {
                        label: item.name,
                        active: _sub_nav_selected,
                        children: childrens
                    };

                $.each(item.child, function(ind, _cat){
                    var _sub_list_selected = category_2 == _cat;
                    childrens.push({
                        "label": _cat,
                        "active": _sub_list_selected,
                        "params": {
                            "category": item.name + "," + _cat,
                        }
                    });

                    //默认选中全部，后面有其他选中的则取消"全部"选中
                    if(_sub_list_selected){
                        childrens[0].active = 0;
                        newlabel = _cat;
                    }
                });

                cityarea_config.push(area);
            });

            if(sub_nav_selected){
                cityarea_config[0].active = 0;
            }

            category_filter.children = cityarea_config;

            if(newlabel){
                category_filter.newlabel = newlabel;
            }

            config.push(category_filter);
        },
        initSortbar: function(){
            var me = this,
                view_data = this.view_data,
                data = view_data.data,
                params = view_data.params,
                floor_cat = data.filter && data.filter.floor,
                filter_cat = data.filter && data.filter.cat;

            var sortList = So.clone(config.sortType["mall_list"]);

            if(floor_cat){
                me.makeFloorFilterData(floor_cat, sortList, params);
            }
            if(filter_cat){
                me.makeCatFilterData(filter_cat, sortList, params);
            }
            

            var header_bar = $('#mall_list_selecter');
            if(sortList){

                    selectSortObj = new selectSort({
                        element: header_bar,
                        items: sortList,//config.sortList.catering,
                        useMask: 1
                    });
                    header_bar.show();
                    selectSortObj.on('item.click', function(data){
                        var item = data.params || {};


                    selectSortObj.removeDropdown();

                    var new_params = _.extend(params, item);
                    new_params.page = 1;

                    So.Gcmd.changeHash("mall/list", {
                        params: new_params
                    });
                });
            }else{
                header_bar.hide();
            }
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

            So.Gcmd.changeHash("mall/list", view_data);
        },
        bindEvent: function(){
        },
        toDetail: function(){
            var li = $(this),
                id = li.data('id');

            if(!id){
                return false;
            }
            monitor.click.detail_malllist();
            
            setTimeout(function(){
                window.location.href = "/onebox/?type=detail&id="+ id +"&d=mobile&src=map_wap&fields=movies_all";
            },100);
            
        },
        goback: function(){
            window.history.go(-1);
        }
    };

    return mall_list;
})
