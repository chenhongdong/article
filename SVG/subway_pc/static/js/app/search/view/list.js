define(function(require) {
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').search;
    var listContent = require('js/app/search/view/list_con');
    var categories = require('../categories');
    var selectSort = require('../../../lib/filterSort');
    var groupId = require('../groupid');
    var qt, selectSortObj;
    var urlArgs = So.urltojson(location.href);
    var scrollLoading = false;
    var data_pois = [];
    var userAgent = navigator.userAgent;
    var logInfo = {
        "pro": "map_list",
        "pid": "list",
        "data-md-client": config.APP_CLIENT,
        "data-md-system": config.APP_SYSTEM
    };
    var partnerMap = {
        'ctrip': '携程',
        'elong': '艺龙',
        'bookingyun': '有间房',
        'meiwei': '美味不用等',
        'xiaomishu': '小秘书',
        'meituan': '美团',
        'dianping': '大众点评',
        'maoyan': '猫眼',
        'bjguahao': '北京挂号网',
        'bang': '360同城帮',
        'gfxiong': '功夫熊',
        'diandao': '点到',
        'meililai': '美丽来',
        'xiaolinxiaoli': '小美',
        'meidaojia': '美到家',
        'weidaijia': '微代驾',
        'edaijia': 'e代驾',
        'ayibang': '阿姨帮',
        'rongchain': 'e袋洗',
        '58.com': '58',
        'ganji': '赶集',
        'mocar': '摩卡i车',
        'shengri': '生日管家',
        'dogwhere': '狗狗去哪儿',
        'medicinepower': '要给力',
        'idachu': '爱大厨',
        'diditaxi': '滴滴打车',
        'beequick': '爱鲜蜂',
        'nuomi': '糯米'
    };

    var createCityAreaFilterConfig = function(cityarea, config, params, index){
        if(!(cityarea && config)){
            return false;
        }

        var _config = config[index],
            params_business_area = params.business_area,
            params_business_name = params.business_name,
            cityarea_config = [{
            "label": '附近',
            "active": 1,
            "children": _config.children
        }],
            sub_nav_selected = false,
            newlabel;

        //添加参数;
        $.each(_config.children, function(index, item){
            item.params.business_area = "";
            item.params.business_name = "";
        });


        $.each(cityarea, function(index, item){
            var _sub_nav_selected = params_business_area == index;

            if(_sub_nav_selected){
                sub_nav_selected = _sub_nav_selected;
                newlabel = index;
            }

            var childrens = [{
                    'label': '全部',
                    "active": _sub_nav_selected, //默认选中全部，后面有其他选中的则取消"全部"选中
                    'params': {
                        "business_area": index,
                        "business_name": "",
                        "range": ""
                    }
                }],
                area = {
                    label: index,
                    active: _sub_nav_selected,
                    children: childrens
                };

            $.each(item, function(ind, place){
                var _sub_list_selected = params_business_name == place;
                childrens.push({
                    "label": place,
                    "active": _sub_list_selected,
                    "params": {
                        "business_area": index,
                        "business_name": place,
                        "range": ""
                    }
                });

                //默认选中全部，后面有其他选中的则取消"全部"选中
                if(_sub_list_selected){
                    childrens[0].active = 0;
                    newlabel = place;
                }
            });

            cityarea_config.push(area);
        });

        if(sub_nav_selected){
            cityarea_config[0].active = 0;
        }

        _config.children = cityarea_config;

        if(newlabel){
            _config.newlabel = newlabel;
        }
    };

    var a = {
        _visible: false,
        _init: false,
        tpl: {
            list: require('../../../templates/search/list.html'),
            group_info: require('../../../templates/search/group_info.html'),
            list_servicelife: require('../../../templates/search/list_servicelife.html'),
            list_qc : require('../../../templates/search/list-qc-frame.html'),
            list_item: {
                def: require('../../../templates/search/list_item.html'),
                wzgf: require('../../../templates/search/list_item_wzgf.html'),
                groupon: require('../../../templates/search/list_item_groupon.html')
            }
        },
        name: "search_list",
        logname: "poilistpage",
        containMap: false,
        setBodyMainHeight: false,
        command: So.Command.CitySearch,
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                data = this.view_data.data,
                params = this.view_data.params,
                command = this.view_data.command||this.command,
                view_params = this.view_data.view_params || {},
                fold = data.page == 1 && _.isNumber(data.fold) ? data.fold : data.poi && data.poi.length || command.pageSize,
                group_info = params.groupid && groupId[params.groupid],
                city_name = data.firstCity && data.firstCity.replace(/市$/,''),
                sortType = group_info && group_info.sortType || data.is_rich,
                fixContent = data.content || {},
                query_parse = fixContent.query_parse || {},
                serviceLifeData = (function () {
                    var type = -1,liftData = {};
                    try {
                        type = query_parse.onsite_info.type;
                        if(fixContent.service_card){
                            liftData = fixContent.service_card || {};
                            liftData.category = 'new';
                        }else if(fixContent.fix_content){
                            liftData = fixContent.fix_content || {};
                            liftData.category = 'old';
                        }
                        if(_.isEmpty(liftData)) return '';
                        liftData.type = type;
                        return So.View.template(me.tpl.list_servicelife,liftData);
                    } catch (err) {
                        return '';
                    }
                })(),
                loadType = "first";

            //设置输入框内容
            if( params.local )
                $('#header-nav-query').prev().html('<span>'+params.local+'附近的'+params.keyword+'</span>').show()
            else if( params.keyword ){
                $('#header-nav-query').val(params.keyword)
                $('#header-nav-query').prev().hide()
            } else {
                $('#header-nav-query').prev().show()
            }

            if(group_info && group_info.show_by_city){
                if(group_info.city_querys[city_name]){
                    group_info.querys = group_info.city_querys[city_name];
                }else{
                    group_info.querys = '';
                }
            }

            //限制最大数据条数；团购引擎突出数据有问题，最多只能显示200条，超过200条后会有数据重复
            if(group_info && group_info.maxCount){
                data.count = Math.min(data.count,group_info.maxCount);
            }


            command.isLoading = false;
            var error = function() {
                //如果是滚动加载，出错时不跳转错误页
                if(view_params.from && view_params.from == 'scrollLoad'){
                    return;
                }
                var g = "";
                var f = _.escape(command.keyword);
                if (data.center) {
                    g = '很抱歉，没有在附近找到"<em>' + f + '</em>"相关的结果'
                } else {
                    g = '很抱歉，没有找到"<em>' + f + '</em>"相关的结果'
                }
                var parent_catname = categories.getParentName(params.keyword);
                if (data.is_rich == "catering") {
                    parent_catname = '美食'
                }
                var host = location.host,insideMap=false;
                if(host == 'm.map.haosou.com' || host=='m.map.so.com'){
                    insideMap = true;
                }

                var loc = So.State.getLocation();
                var html = So.View.template(me.tpl.list, {
                    cats: categories.data[parent_catname],
                    area: params.radius,
                    sort: params.sort,
                    keyword: params.keyword,
                    display: "visibility: hidden;",
                    is_rich: data.is_rich,
                    class_type: data.cond && data.cond['class'] || '',
                    show_result_header_bar: (urlArgs.src && urlArgs.src == 'yaoyiyao61' || urlArgs._hidebar && urlArgs._hidebar == 1) ? 0 : show_result_header_bar, //m.so.com头部统一框时是否有列表结果bar
                    show_noresult_tips: show_noresult_tips,
                    userLocation: (loc.state == 1 || loc.istips) ? So.State.getLocation() : {x:0, y: 0},
                    count:data.totalcount,
                    citysuggestion:data.citysuggestion,
                    city:loc.city,
                    msg:g,
                    insideMap:insideMap,
                    tpl_style: params.style,
                    hasQC : null,
                    isMapMode : config.isMapMode,
                    productTitle: config.isMapMode ? '地图' : '地图'
                });

                $('#CTextDiv').html(html);
                 genSortBar();
                 monitor.disp.no()
            };
            var genSortBar = function () {
                var sortList = So.clone(config.sortType[sortType]);
                var addCityAreas = {
                    catering: '2',
                    groupon: '1',
                    spot: '0'
                };
                if(params.style == 'fanbu'){
                    return;//饭补不显示筛选
                    sortList.splice(0,1);
                }

                var header_bar = $('#super_map_sort');
                if(sortList){
                      /* console.log(sortList,data.is_rich);
                       console.log(me.view_data.params); */

                        //参数转换;
                        me.view_data.params.range = me.view_data.params.radius;

                        //跳转链接过来腮腺三星筛选组件，选中状态
                        _.forEach(sortList,function(sortItem, index){
                            var hasActive = false;
                            var params = me.view_data.params;

                            _.forEach(sortItem.children,function(data,index){

                                //指定usermp时，隐藏 按距离排序
                                if((params.usermp || (query_parse && query_parse.mode && query_parse.mode == 'around')) &&
                                    data.params &&
                                    data.params.sort &&
                                    data.params.sort == "distance"){
                                    //sortItem.children[index] = {};
                                    //delete sortItem.children[index];
                                    sortItem.children.splice(index, 1);
                                }
                            });

                            _.forEach(sortItem.children,function(data,index){

                                var active = 1;
                                _.forEach(data.params, function(p_val, p_key){

                                    if (_.isUndefined(params[p_key])) {
                                        if(p_val == ''){
                                            return;
                                        }
                                        return active = 0;
                                    } else{

                                        var keywordTemp = ['餐饮','美食'];

                                        if(keywordTemp.indexOf(params[p_key]) != -1){
                                            return active = data.active || 0;
                                        }

                                        if (_.isUndefined(data.type) && params[p_key] != p_val){
                                            return active = 0;
                                        }

                                        if( data.type === 'checkbox' && params[p_key].indexOf( p_val ) == -1 ){
                                            return active = 0;
                                        }

                                        if( data.type === 'button' ){
                                            return active = 0;
                                        }

                                        if( _.isObject(data.type) ){
                                            data.params[p_key] = params[p_key]
                                            return active = 0;
                                        }
                                    }
                                });

                                //如果已经有选中的，则取消后续选中;
                                // if(hasActive){
                                //     active = 0;
                                // }

                                // if(active){
                                //     hasActive = true;
                                // }


                                if( active && _.isUndefined(data.type) && index > 0){
                                    sortItem.newlabel = data.label
                                }
                                data.active = active;
                            })
                         });

                        //生成范围商圈 数据
                        if(addCityAreas[sortType] && data.business){
                            createCityAreaFilterConfig(data.business, sortList, me.view_data.params, addCityAreas[sortType]);
                        }

                        selectSortObj = new selectSort({
                            element: header_bar,
                            items: sortList,//config.sortList.catering,
                            useMask: 1
                        });

                        header_bar.show();
                        selectSortObj.on('item.click', function(data){
                            var item = data.params || {},
                                filter_order,
                                filter_sort;

                            if(item.hasOwnProperty('sort')){
                                 filter_sort = item.sort;
                            }
                            if(item.hasOwnProperty('order')){
                                if(data.active){
                                    filter_order = item.order;
                                }else{
                                    if(data.sort && data.sort == 'sortAsc' ){
                                       filter_order = filter_order == 'desc' ? 'asc' :'desc';
                                    }
                                    if(data.sort && data.sort == 'sortDesc'){
                                        filter_order = '';
                                        filter_sort = '';
                                    }
                                }
                            }
                            //console.log(So.Command.filter_order)

                            var loc = So.State.getLocation(),
                            mp = params.mp || (loc.y + ',' + loc.x);

                            var _params = {
                                keyword: !_.isUndefined(item.keyword) ? item.keyword : params.keyword,
                                radius: !_.isUndefined(item.range) ? item.range : params.radius,
                                sort: !_.isUndefined(filter_sort) ? filter_sort : params.sort,
                                order: !_.isUndefined(filter_order) ? filter_order : params.order,
                                price: !_.isUndefined(item.price) ? item.price : params.price,
                                star: !_.isUndefined(item.star) ? item.star : params.star,
                                filter: !_.isUndefined(item.filter) ? item.filter : params.filter,
                                groupid: params.groupid,
                                style: params.style,
                                mp: mp,
                                city: params.city || city_name,
                                usermp: params.usermp,
                                business_area: !_.isUndefined(item.business_area) ? item.business_area : params.business_area,
                                business_name: !_.isUndefined(item.business_name) ? item.business_name : params.business_name
                            };
                            if( params.local ) _params.local = params.local
                            monitor.click.scr({
                                cat: sortType,
                            })
                           new So.Command.CitySearch(_params).run();
                        });
                        // monitor.disp.list({
                        //     cat: sortType,
                        //     keyword: params.keyword,
                        //     status: 'success',
                        // })
                }else{
                    header_bar.hide();
                }
            }
            if (group_info && group_info.querys || params.style == 'fanbu' || data.status == "E0") {
                _.each(data.poi, function(g, f) {
                    g.index = (data.page -1) * 10 + f;
                    g.icon = So.Util.numberToLetter(f);
                    g.fdistance = So.Util.formatDistance1(g.distance);

                    //添加隐藏距离显示的接口,供onebox使用
                    if(params._hide_distance && params._hide_distance == 1){
                        g.fdistance = '';
                    }
                    if (g.type&&g.type.indexOf("地铁") >= 0 && g.name.indexOf("地铁站") < 0) {
                        g.name += "(地铁站)"
                    } else {
                        if (g.type&&g.type.indexOf("公交") >= 0 && g.name.indexOf("公交站") < 0) {
                            g.name += "(公交站)"
                        }
                    }

                    //公交数据过滤
                    if(g.busline && g.busline.length){
                        var _busline = [],
                            _busline_obj = {};

                        _.forEach(g.busline, function(val, key){
                            if(!_busline_obj[val.name]){
                                _busline_obj[val.name] = 1;
                                _busline.push(val);
                            }
                        })

                        g.busline = _busline;
                    }

                });
                data.busline = data.busline || [];
                _.each(data.busline, function(g, f) {
                    g.type = g.name.indexOf("地铁") < 0 ? "bus" : "subway"
                });
                if (group_info && group_info.querys || params.style == 'fanbu' || data.count > 0 || data.busline.length > 0) {
                    var parent_catname = categories.getParentName(params.keyword),cats,
                        cats = categories.data[parent_catname];
                    if (data.is_rich == "catering") {
                        parent_catname = '美食';
                        cats = categories.data[parent_catname];
                    }else if(data.is_rich == 'zuche'){
                        cats = {};
                        cats.items = _.map(data.locality,function(loc){
                            return {label: loc.name,id:loc.id}
                        });
                        var cond = data.cond || {};
                        cats.currentCat = cond.locality_id || 0;
                        cats.filter = cond.filter || '';
                        cats.sort = params.sort;
                        _.each(data.poi,function(poi,index){
                            var url = poi.detail && poi.detail.business_murl,
                            pos = url && url.indexOf('depId=');
                            if(pos > 0) {
                                data.poi[index].detail.business_murl = 'http://m.zuche.com/rentbystore/'+url.slice(pos+6)+'-360safe';
                            }
                        })
                    }
                    var pageCount = parseInt(data.count / data.pageSize) + (data.count % data.pageSize == 0 ? 0 : 1);
                    pageCount = pageCount == 0 ? 1 : pageCount;

                    data.pageCount = pageCount;

                    var list_htmls = [];
                    var groupInfo = {};
                    var url_src = urlArgs.src || '';

                    if(group_info){
                        groupInfo.id = params.groupid;
                        groupInfo.title = params.style == 'fanbu' ? '提现专区' : group_info.title;
                        groupInfo.html = group_info.querys ? So.View.template(me.tpl.group_info, {
                            group_info: group_info,
                            keyword: params.keyword
                        }): '';
                    }

                    _.each(data.poi, function(poi, index){
                        var listItemCon = me.getListItemCon(poi,data);
                        var list_item = me.tpl.list_item['def'];
                        //违章高发单独使用一套模板
                        if(data.keyword == "违章高发地") list_item = me.tpl.list_item['wzgf'];
                        if(group_info && group_info.sortType == 'groupon') list_item =  me.tpl.list_item['groupon'];
                        list_htmls.push(So.View.template(list_item,{
                            poi: poi,
                            twoLineInfo: listItemCon.twoLineInfo,
                            barInfo: listItemCon.barInfo,
                            display: index < fold ? true : false,
                            src: url_src
                        }));
                    });
                    var showDownloadApkBanner = So.Cookie.get('download-apk-banner') == 1 ? false : true;

                    //在好搜、身边生活、摇一摇中不出banner;
                    if(userAgent.indexOf('mso_app') > -1 || userAgent.indexOf('360around') > -1 || userAgent.indexOf('360shenbian') > -1 || userAgent.indexOf('360HY') > -1 || userAgent.indexOf('360Shake') > -1 || url_src == 'mbrowser'){
                        showDownloadApkBanner = false;
                    }
                    if(this.view_data.data.qcsuggestion&&this.view_data.data.qcsuggestion.orgkeyword!==this.view_data.data.qcsuggestion.qckeyword){
                        var qcOrig = this.view_data.data.qcsuggestion.orgkeyword,qcFix = this.view_data.data.qcsuggestion.qckeyword;
                        var qc_part_html = _.template(this.tpl.list_qc)({qcFix: qcFix,qcOrig:qcOrig});
                    }
                    if(!(view_params.from && view_params.from == 'scrollLoad')){
                        var hideBackBtn = config.ISIPHONE && window.history.length == 1;
                        var loc = So.State.getLocation();
                        var html = So.View.template(this.tpl.list, {
                            serviceLifeData:serviceLifeData,
                            list_item: list_htmls.join(''),
                            cats: cats,
                            area: params.radius,
                            count: data.count,
                            isFold: data.poi.length > fold,
                            sort: params.sort,
                            keyword: params.keyword,
                            _keyword: params._keyword,
                            pageIndex: data.page,
                            curHour: new Date(So.now).getHours(),//当前时间的 时
                            pageCount: pageCount,
                            buses: data.busline,
                            display: "visibility: hidden;",
                            is_rich: sortType,
                            class_type: data.cond && data.cond['class'] || '',
                            show_result_header_bar: (urlArgs.src && urlArgs.src == 'yaoyiyao61' || urlArgs._hidebar && urlArgs._hidebar == 1) ? 0 : show_result_header_bar, //m.so.com头部统一框时是否有列表结果bar
                            userLocation: (loc.state == 1 || loc.istips) ? So.State.getLocation() : {x:0, y: 0},
                            groupInfo: groupInfo,
                            listClassName: (group_info && group_info.listClassName) || '',
                            fanbu_banner_height: document.body.clientWidth / 2.676579925650558,
                            tpl_style: params.style,
                            show_apk_banner: showDownloadApkBanner,
                            fb_showkw: view_params.showkw,
                            isMapMode : config.isMapMode,
                            hasQC : qc_part_html || null,
                            hideBackBtn: hideBackBtn
                        });

                        $("#CTextDiv").html(html);


                        genSortBar();

                        if (params.view == 1) {
                            So.Gcmd.cmd({
                                id: 5
                            })
                        }

                        data_pois = [];
                    }else{
                        $('#CTextDiv #poi-content .newTemplate').append(list_htmls.join(''));

                        //滚动加载完毕;
                        scrollLoading = false;

                        loadType = "scroll";
                    }
                    if(data.page >= pageCount){
                        $("#poi-wrapper .load-more").hide()
                        $(".place-and-opinion").show()
                    }
                    var loc = So.State.getLocation();
                    monitor.disp[data.busline.length?'bus':'list']({
                        loadType: loadType,
                        keyword: params.keyword,
                        city:loc.city,
                        city_id:loc.adcode
                    })

                    data_pois = data_pois.concat(data.poi);

                } else {
                    error()
                }
            } else {
                error()
            }
        },
        visible: function(c) {
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CTextDiv").css("display", d);
            scrollLoading = false;
            if(selectSortObj) selectSortObj.removeDropdown();
            //
            $('[data-md]').on('click', function(ev) {
                try{
                    ev.stopPropagation();
                    var md = JSON.parse(this.dataset.md),
                    info = {
                        "data-md-partner": function (url) {
                            var partner = 'other';
                            if(url){
                                for(var k in partnerMap){
                                    if(url.indexOf(k) > -1){
                                        partner = partnerMap[k];
                                        break;
                                    }
                                }
                            }
                            return partner;
                        }(this.href)
                    };
                    $.each(md, function(key, item) {
                    info['data-md-' + key] = item;
                    });
                    // monitor.log($.extend(info, logInfo), 'click');
                }catch(e){
                    window.__errorReport__ && window.__errorReport__.report(e,1099);
                }
            }); /*pv*/
         //在360搜索app内隐藏返回按钮
          var ua = navigator.userAgent;
          if(ua.indexOf('mso_app')>-1){
            $('.ask-btn').parent('dd').hide();
          }
        },
        showAll: function(){
            var view_data = this.view_data,
                data = view_data.data,
                params = view_data.params,
                command = this.view_data.command,
                hide_list = $('#poi-content li'),
                show_all_btn = $('#poilistShowMore'),
                pager_con = $('#pResultFooterBar'),
                poiNum = data.poi && data.poi.length || 0;

            hide_list.show();
            show_all_btn.hide();
            pager_con.show();

            if(poiNum < data.count){
                $('#poi-wrapper .load-more').show();
                $(".place-and-opinion").hide();
            }

            //重置折叠参数;
            data.fold = poiNum || command.pageSize;
        },
        cmd: function(c) {
            var view_data = this.view_data,
                data = view_data.data,
                params = view_data.params,
                params_mp = params.mp || '',
                params_loc = params_mp.split(','),
                use_loc_state = params.use_loc_state || 0,
                command = this.view_data.command,
                page = data.page,
                pageCount = data.pageCount,
                geolocation = So.State.getLocation(true),
                geoaddress = '您现在的位置('+So.Util.subByte(geolocation.address,16)+')',
                position = '',
                user_address = '您现在的位置';

            var map_plugin_installed = config.getMapPluginInstalled().plugin;

            if(params_loc[0] && params_loc[1]){
                position = {x:params_loc[1],y:params_loc[0]};
            }

            if(use_loc_state){
                position = geolocation;
                user_address = geoaddress;
            }

            switch (c.id) {
                case 0:
                    if(page <2){
                        return;
                    }
                    view_data.params.page = --page;

                    //第一页不传递page参数，保证缓存数据有效;
                    if(page == 1){
                        delete view_data.params.page;
                    }
                    view_data.data = null;

                    So.Gcmd.changeHash("search/list", view_data);
                    //window.scroll(0, 1);
                    break;
                case 1:
                    if(page >= pageCount){
                        return;
                    }
                    $('#poi-wrapper .load-more').show();
                    view_data.params.page = ++page;
                    view_data.data = null;
                    view_data.noChangeUrl = true;
                    view_data.view_params = {
                        'from': 'scrollLoad'
                    };

                    So.Gcmd.changeHash("search/list", view_data);
                    //window.scroll(0, 1);
                    break;
                case 2:
                    var _data = data_pois[c.index] || {},
                        _detail_src = urlArgs.src || 'map_wap';

                    _data.firstCity = data.firstCity;
                    //测试地址，上线时请切回正式地址http://m.map.so.com
                    var openType = window.__targetBlank__ ? '_blank' : '_self',
                        href = c.href || '//m.map.so.com/onebox/?type=detail&id='+_data.pguid+'&mso_x='+ position.x+'&mso_y='+position.y+'&d=mobile&src=' + _detail_src + '&fields=movies_all';

                    monitor.click[c.i ? 'list' : 'list1']({
                        type: 'godetail',
                        detil: c.href ? 'coupon' : 'poi'
                    })

                    //在身边生活APP中详情页跳转至APP详情页
                    if(config.detailToApp){
                        console.log('360around://com.qihoo.around.poidetail/?pguid=' + _data.pguid);
                        return;
                    }

                    if(config.detailToApp1){
                        console.log('360shenbian://com.qihoo.shenbian.poidetail/?pguid=' + _data.pguid);
                        return;
                    }

                    //详情页全部切换至 detail
                    setTimeout(function(){window.open(href, openType);},100);
                    break;
                case 3:
                    var busline = c.i && [data.busline[c.i]];
                    var buslineData;
                    busline && (buslineData={
                        busline:busline
                    });
                    So.Gcmd.changeHash("busline/detail", {
                        params: {
                            id: c.pguid
                        },
                        data: buslineData
                    });
                    break;
                case 4:
                    if(window.location.href.indexOf('&qc=0') > -1){
                        var tmp = window.location.href,_i = window.location.href.indexOf('&qc=0');
                        window.location.replace(tmp.slice(0,_i));
                        return;
                    }
                    if(window.__HaoSouFun__ && __HaoSouFun__.goback){
                        __HaoSouFun__.goback();
                    }else{
                        window.history.back();
                    }

                    break;
                case 5:
                    clearTimeout(qt);
                    qt = setTimeout(this.quitToList,300);
                    break;
                case 6:
                    var currentCity =  So.CityData.citycode();
                    var nav_type = parseInt(So.Cookie.get('nav_type')) || 1;
                    if (currentCity != data.firstCity) {
                        nav_type = 2;
                    }
                    var routeTypes = {
                        '1': 'bus',
                        '2': 'drive',
                        '3': 'walk'
                    };
                    var routeType = routeTypes[nav_type];

                    var _user_address = user_address || '',
                        _position_x = position && position.x || '',
                        _position_y = position && position.y || '';

                    if(use_loc_state && geolocation.state != 1){
                        _user_address = '';
                        _position_x = '';
                        _position_y = '';
                    }

                    //身边生活中使用客户端传的用户真实坐标
                    if(window.__clientMsoXY_R__ && __clientMsoXY_R__.x && __clientMsoXY_R__.y){
                        _user_address = '您现在的位置';
                        _position_x = __clientMsoXY_R__.x;
                        _position_y = __clientMsoXY_R__.y;
                    }

                    if (map_plugin_installed) {
                        So.goToHere(_user_address, _position_x, _position_y, c.name, c.x, c.y, routeType, 'wap_map_list');
                    }else{
                        So.Gcmd.changeHash('route/index', {
                            params:{
                                start: {
                                    name: _user_address,
                                    x: _position_x,
                                    y: _position_y
                                },
                                end: {
                                    name: c.name,
                                    x: c.x,
                                    y: c.y
                                },
                                city: currentCity,
                                autosearch: 1
                            }
                        });
                    }

                    break;
                case 7:
                    this.showAll();
                    break;
                case 8:
                    var poi_data = data_pois[c.index],
                        youjianfang = data_pois[c.index].detail.source.youjianfang,
                        part_data = youjianfang.rooms[0];
                    So.Gcmd.changeHash("search/hotel_hour", {
                        list_data: data,
                        hour_data: _.extend(part_data,{name:poi_data.name,hotelId:youjianfang.id,tel:poi_data.tel}),
                        from: 'list'
                    });
                    break;
                case 9:
                    var poi_data = data_pois[c.index];
                    var ext = poi_data.ext;
                    if(ext.buildid){
                        So.Gcmd.changeHash('search/indoor_zh', {
                            params:{
                                bid:ext.bid || '',
                                buildid:ext.buildid,
                                bounds:ext.bounds || '',
                                floors:'',
                                center:poi_data.y + "," +poi_data.x,
                                currentFloor:'F1'
                            }
                        });
                    }else{
                        So.Gcmd.changeHash('search/indoor', {
                            params:{
                                bid:ext.bid,
                                bounds:ext.bounds,
                                floors: ext.floors+'',
                                center:poi_data.y + "," +poi_data.x,
                                currentFloor:'F1'
                            }
                        });
                    }
                    break;
                case 10:
                    var keyword = c.name;
                    var evt = c.evt;
                    evt.stopPropagation();
                    So.Gcmd.changeHash("search/list", {
                        params: {
                            keyword: keyword
                        },
                        mustChangeHash: true
                    });
                    break;
                case 11:
                    var keyword = c.keyword;
                    So.Gcmd.changeHash("search/list", {
                        params: {
                            keyword: keyword,
                            groupid: params.groupid,
                            use_loc_state: params.use_loc_state
                        }
                    });
                    break;
                case 12:
                    var evt = c.evt;
                    evt.stopPropagation();
                    $('.poi-busline-hide').css('display','inline-block');
                    $('.poi-busline-btn').css('display','none');
                    break;
                case 13:
                    var btn = $(c.dom),
                        parent = btn.closest('ul'),
                        hide_li = parent.find('li[style="display:none"]');

                    hide_li.show();
                    btn.hide();
                    break;
                case 14:
                    window.__HaoSouFun__ && __HaoSouFun__.toWithdrawDeposit && __HaoSouFun__.toWithdrawDeposit()
                    break;
                case 15:
                    window.open('http://api.app.m.so.com/mhtml/fanbu/rules.html?v=17');
                    break;
                 case 16:
                    So.Gcmd.changeHash("search/list", {
                        params: c.params,
                        mustChangeHash: params.groupid == 7
                    });
                    break;
                case 17: //跳周边号落地页
                    var type = c.type,
                        tpl = c.tpl,
                        wd = c.wd,
                        city = position.city || So.CityData.citycode();

                    var urls = {
                        'article': '//m.map.so.com/app/shenbian/list/?atag=%E7%BE%8E%E9%A3%9F&city='+ city +'&mso_x='+ position.x +'&mso_y=' + position.y
                    };

                    if(type == 'activity'){
                        So.Gcmd.changeHash('activity/index');
                        return;
                    }

                    var test_url = "http://ptrunk.143.m.qss.test.so.com/",
                        normal_url = "//m.map.so.com/";

                    var url_params = [normal_url+'onebox/?act=list',
                               'type=super-map-' + type,
                               'user_tpl=more/list/m-' + tpl,
                               'query=' + wd,
                               'url=' + wd,
                               'mso_x=' + (position.x || ''),
                               'mso_y=' + (position.y || ''),
                               'pagesize=5',
                               'city=' + city,
                               'd=mobile'];
                    var url = urls[type] || url_params.join('&');

                    window.location.href = url;
                    break;
                case 18:
                    setTimeout(function(){
                        window.location.href = '//m.map.so.com/app/shenbian/qrcode?from=7';
                    },100)

                    break;
                case 19:
                    var _now_time_ = new Date();
                    _now_time_.setDate(_now_time_.getDate() + 1);
                    _now_time_.setHours(8,0,0,0);
                    $('.download-apk-banner').addClass('download-apk-banner_hide');
                    c.e && c.e.stopPropagation();
                    So.Cookie.set('download-apk-banner','1','','',_now_time_.toUTCString());
                    break;
                case 20:
                    var input = $(".fanbu_search .text_input"),
                        val = input.val() || '美食';
                    params.keyword = val;
                    delete params.page;

                    So.Gcmd.changeHash("search/list", {
                        params: params,
                        view_params: {
                            showkw: !c.noResult
                        }
                    });
                    break;
                case 999://qc
                    var loc = So.State.getLocation();
                    new So.Command.CitySearch({
                        keyword: c.kw,
                        mp: loc.y + ',' + loc.x,
                        use_loc_state:1,
                        qc : '0'
                    }).run()
                    break;
            }
        },
        quitToList:function(){
            $("CTextDiv").empty();
            So.Gcmd.changeHash("search/map", {
                params: a.view_data.params,
                data: a.view_data.data,
                index: 0,
                name: a.view_data.command.keyword,
                command: a.view_data.command
            });
        },
        resize: function() {
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

            //有折叠不加载数据;
            if(data.fold < poiNum){
                return;
            }


            //正在滚动加载;
            scrollLoading = true;
            this.cmd({id:1});
        },
        bindEvent: function(){
            var data = this.view_data && this.view_data.data || {};

            var search_con,
                search_btn,
                search_val,
                search_clear,
                search_input,
                active_class = 'fanbu_search_submit';
            $('body').delegate('.fanbu_search  .text_input','click', function(){
                var text_input = $(this);

                //if(!search_con){
                    search_con= text_input.closest('.fanbu_search');
                    sb_search_clear = $('.fanbu_search .sb_search_clear');
                    search_btn = $('.fanbu_search  .submit');
                    search_input = $('.fanbu_search  .text_input');
                //}


                if(!search_con.hasClass(active_class)){
                    search_con.addClass(active_class);
                }

                inputValChange();
            });
                     // $('body').delegate('.text_input','blur', function(){
            //     var text_input = $(this),
            //         container = text_input.closest('.fanbu_search');

            //     container.removeClass('fanbu_search_submit');
            // });

            // $('.text_input').on('change',function(){
            //     console.log('change');
            // });

            // $('.text_input').on('changed',function(){
            //     console.log('changed');
            // });

            var inputValChange = function(){
                var val = $.trim(search_input.val());

                search_val = val;

                if(val){
                    search_btn.html('确定');
                    sb_search_clear.show();
                }else{
                    search_btn.html('取消');
                    sb_search_clear.hide();
                }
            };

            $('body').delegate('.fanbu_search .text_input','input', function(){
                inputValChange();
            });

            $('body').delegate('.fanbu_search .submit','click', function(){
                var noResult = !search_val && !data.count;
                if(search_val || noResult){
                    So.Gcmd.cmd({id:20, noResult:noResult});
                }else{
                    search_con.removeClass(active_class);
                }
            });

            $('body').delegate('.fanbu_search  .sb_search_clear','click', function(){
                search_input.val('');
                search_input[0].focus();
                search_btn.html('取消');
                sb_search_clear.hide();
                search_val = '';
            });
        },
        scrollToTop: function(){
            var view_params = this.view_data.view_params || {};

            return !(view_params.from && view_params.from == 'scrollLoad');
        }
    };
    _.extend(a,listContent);

    //绑定事件
    a.bindEvent();

    return a;
});
