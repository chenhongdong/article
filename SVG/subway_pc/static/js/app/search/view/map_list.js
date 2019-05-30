define(function(require) {
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').search;
    var listContent = require('js/app/search/view/list_con');
    var categories = require('../categories');
    var selectSort = require('../../../lib/filterSort');
    var scroll = require('../scroll');
    var qt, selectSortObj;
    var urlArgs = So.urltojson(location.href);
    var scrollLoading = false;
    var data_pois = [];
    var map;
    var userAgent = navigator.userAgent;
    var body_offset = $('html').offset();
    var mapListHeight = 0; //地图模式下列表的高度，用于计算marker显示的区域
    var scrollLoadCallback;
    var iscroll;
    var ad_result; //记录第一页的广告结果
    var has_monitor_app_show = false;
    var has_monitor_cpc_all = false;
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
        mPrefix: "poimaplist_",
        _overlays: [],
        tpl: {
            list: require('../../../templates/search/map_list/list.html'),
            list_servicelife: require('../../../templates/search/list_servicelife.html'),
            list_qc : require('../../../templates/search/list-qc-frame.html'),
            map_top: require('../../../templates/search/map_top.html'),
            list_item: {
                def: require('../../../templates/search/list_item.html'),
                wzgf: require('../../../templates/search/list_item_wzgf.html'),
                ad: require('../../../templates/search/list_item_ad.html')
            }
        },
        name: "search_map_list",
        logname: "poilistpage",
        containMap: true,
        setBodyMainHeight: false,
        command: So.Command.CitySearch,
        prepare: function(view_data) {

            map = So.UIMap.getObj();
            this.view_data = view_data;

            var me = this,
                data = this.view_data.data,
                params = this.view_data.params,
                command = this.view_data.command||this.command,
                view_params = this.view_data.view_params || {},
                fold = data.page == 1 && _.isNumber(data.fold) && data.fold ? data.fold : data.poi && data.poi.length || command.pageSize,
                city_name = data.firstCity && data.firstCity.replace(/市$/,''),
                sortType = data.is_rich,
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
                loadType = "first",
                show_data = this.filterData();

            //当只有1条结果的时候隐藏下载条
            if(fold == 1){
                $('body').addClass('__map_list_fold1');
            }

            //设置输入框内容
            if( params.local )
                $('#header-nav-query').prev().html('<span>'+params.local+'附近的'+params.keyword+'</span>').show()
            else if( params.keyword ){
                $('#header-nav-query').val(params.keyword)
                $('#header-nav-query').prev().hide()
            } else {
                $('#header-nav-query').prev().show()
            }

            if(!(view_params.from && view_params.from == 'scrollLoad')){
                $('body').removeClass("list_expanded");
                $("#CTextDiv").html(So.View.template(this.tpl.map_top, {
                    name: show_data.keyword || params._keyword,
                    show_result_header_bar: true
                }));
            }

            if(params.show_center_mk == 1){
                this.createCenterMk();
            }



            command.isLoading = false;
            var error = function() {
                console.log('error:goto list page');
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

                var header_bar = $('#super_map_sort1');
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
                            // 筛选点击monitor log
                            monitor.click.scr({
                                cat: sortType,
                            })

                        selectSortObj.removeDropdown();
                        me.iscrollUnload()

                        new So.Command.CitySearch(_params).run();
                    });
                }else{
                    header_bar.hide();
                }
            }
            if (data.status == "E0") {
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



                if (data.count > 0 || data.busline.length > 0) {

                    var list_htmls = [];
                    var ad_htmls = [];
                    var groupInfo = {};
                    var url_src = urlArgs.src || '';
                    //var show_num = body_offset.height > 600 ? 3 : 2; //屏幕高度大于600时显示3条，否则2条
                    var show_num = 10;

                    //存储第一页请求的广告数据;
                    if(data.map_busniess && data.map_busniess.data){
                        ad_result = data.map_busniess.data;
                        if(ad_result && ad_result.ads && ad_result.ads.length && ad_result.click_js && ad_result.pv_js){
                            ad_htmls.push(ad_result.click_js);
                            ad_htmls.push(ad_result.pv_js);

                            if(!has_monitor_cpc_all){
                                //广告展现PV打点
                                has_monitor_cpc_all = true;
                                monitor.disp.cpc_all({
                                    keyword: params.keyword
                                });
                            }
                            
                        }
                    }else{
                        //清空广告
                        ad_result = {};
                    }


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
                    var visibleAd = false;
                    var remove_ad_to_last = false;
                    var ad_count = 0;
                    pageCount = pageCount == 0 ? 1 : pageCount;

                    data.pageCount = pageCount;
                    
                    


                    _.each(data.poi, function(poi, index){
                        var listItemCon = me.getListItemCon(poi,data);
                        var list_item = me.tpl.list_item['def'];
                        var ad_item = me.tpl.list_item['ad'];
                        var ads_length; //广告数量
                        var ad_index;
                        var ad_obj;
                        var _remove_ad_to_last = false; //是否将广告移至最后
                        //违章高发单独使用一套模板
                        if(data.keyword == "违章高发地") list_item = me.tpl.list_item['wzgf'];

                        //判断ad_htmls.length >0 才出广告是因为 ad_htmls是广告点击打点脚本，如果没有脚本，只展示广告是没有收益的
                        //没有打点脚本的情况在测试环境出现过，因此添加的这个逻辑
                        if(ad_result && ad_result.click_js && ad_result.pv_js && ad_result.ads && (ads_length = Math.min(ad_result.ads.length, 2)) && (
                            //结果数量大于3条，没页第1、6展示广告
                            data.count > 3 && (index == 0 || index == 5) ||
                            //结果数量小于等于3条，在最后面显示一条广告
                            data.count <= 3 && index == (data.count - 1)
                        )){
                            //有3条广告时：
                            //第一页第一条取第一条广告 0
                            //第一页取第二条广告 1
                            //第二页取第三条广告 2
                            //第三页取第一条广告 0

                            //有2条广告时：
                            //第一页第一条取第一条广告 0
                            //第一页取第二条广告 1
                            //第二页取第三条广告 0
                            //第三页取第一条广告 1

                            //有1条广告时：

                            ad_index = ad_count % ads_length;

                            if(data.count >3){
                                if(data.page == 1 && index == 0){
                                    ad_index = 0;
                                }
                            }else{
                                ad_index = 0;

                                //将广告移至最后
                                _remove_ad_to_last = true;
                            }
                            
                            ad_obj = ad_result.ads[ad_index];
                            //用于计算默认展示的高度
                            var _visibleAd = data.page == 1 && index == 0;
                            if(!visibleAd && _visibleAd){
                                visibleAd = _visibleAd;
                            }
                            ad_obj["display"] = _visibleAd;
                            //广告所在poi索引
                            ad_obj["_index"] = index + 1 + (data.page - 1) * data.pageSize;

                            //广告向后移时调整打点记录位置
                            if(_remove_ad_to_last){
                                ad_obj["_index"] += 1;
                            }

                            //广告使用的广告索引
                            ad_obj["_cpc_index"] = ad_index + 1;
                            list_htmls.push(So.View.template(ad_item, ad_obj));

                            //记录本次结果显示的广告个数;
                            ad_count++;
                        }

                        if(poi.index < 26){
                            poi.name = String.fromCharCode(65 + poi.index) + "." + poi.name;    
                        }
                        
                        list_htmls.push(So.View.template(list_item,{
                            poi: poi,
                            twoLineInfo: listItemCon.twoLineInfo,
                            barInfo: listItemCon.barInfo,
                            display: data.page == 1 ? index+1 > fold || index > show_num - 1 ? false : true : true,
                            src: url_src
                        }));

                        //将广告移至后面
                        if(_remove_ad_to_last){
                            var list_length = list_htmls.length;
                            var removed_ad_info = list_htmls[list_length-2];
                            list_htmls[list_length-2] = list_htmls[list_length-1];
                            list_htmls[list_length-1] = removed_ad_info;

                            remove_ad_to_last = _remove_ad_to_last;
                        }


                    });

                    //广告展现后打点
                    if(visibleAd){
                        monitor.disp.cpc({
                            keyword: params.keyword,
                            index: !remove_ad_to_last ? 1 : 2,
                            cpc_index: 1
                        });
                    }
                    
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
                            listClassName: '',
                            fanbu_banner_height: document.body.clientWidth / 2.676579925650558,
                            tpl_style: params.style,
                            show_apk_banner: showDownloadApkBanner,
                            fb_showkw: view_params.showkw,
                            isMapMode : config.isMapMode,
                            hasQC : qc_part_html || null,
                            hideBackBtn: hideBackBtn
                        });

                        $("#CTextDiv1").html(html);                        


                        genSortBar();

                        if (params.view == 1) {
                            So.Gcmd.cmd({
                                id: 5
                            })
                        }

                        data_pois = [];
                        this.prepareMap({
                            showoutline: fold <= 3 && data.poi[0].bounds//当有折叠并且第一条数据有轮廓，则显示轮廓
                        });

                        if(fold > 1){
                            monitor.disp.list_download_xd();
                            has_monitor_app_show = true;
                        }

                        var loc = So.State.getLocation();
                        // monitor log
                        monitor.disp.list({
                            loadType: loadType,
                            keyword: params.keyword,
                            city:loc.city,
                            city_id:loc.adcode
                        });

                    }else{
                        $('#CTextDiv1 #poi-content .newTemplate').append(list_htmls.join(''));

                        //滚动加载完毕;
                        scrollLoading = false;

                        scrollLoadCallback && scrollLoadCallback();

                        monitor.disp.list_scroll({
                            keyword: params.keyword
                        });
                    }

                    $("#e_map_idea_script").html(ad_htmls.join(''));

                    //广告pv_js中不会自动执行 sendlog方法，需要调用方自己手动调用
                    //不执行该方法广告，广告点击会命中反作弊;
                    if(ad_htmls.length){
                        eLogAndPv.sendlog("e_map_idea");
                    }

                    if(data.page >= pageCount){
                        $('#poi-wrapper .load-more').hide();
                    }                    


                    data_pois = data_pois.concat(data.poi);

                } else {
                    error()
                }
            } else {
                error()
            }
        },
        createCenterMk: function(){
            var data = this.view_data.data,
                params = this.view_data.params,
                params_mp = params.mp || '',
                params_loc = params_mp.split(',');

            if(!(params_loc[0] && params_loc[1])){
                return false;
            }

            var mk = So.Util.createMarker("center", {
                x: params_loc[1],
                y: params_loc[0],
                markerid: 'center_mk_1'
            });

            map.addOverlays(mk);
        },
        filterData: function(){
            var data = _.extend({},this.view_data.data),
                fold = data.fold || 10;


            data.poi = data.poi.slice(0, fold);

            return data;
        },
        showOutline: function(){
            var data = this.view_data.data,
                areas = data.poi[0].bounds,
                coords = areas.split(';'),
                path = [],
                polygon;

            for (var n = coords.length, j = 0; j < n; j++) {
                var coord = coords[j].split(',');
                var latlng = new so.maps.LatLng(coord[0], coord[1]);
                path.push(latlng);
            }

            polygon = new so.maps.Polygon({
                    id: 'outline_polygon',
                    map: map,
                    path: path,
                    strokeColor: '#7299e4',
                    strokeWeight: 2,
                    fillColor: '#7299e4',
                    fillOpacity: 0.3,
                    cursor: 'default'
                });

            this._overlays.push(polygon);
        },
        createMarker: function(info, d) {
            var mk = So.Util.createMarker("poi", info);
            mk._pguid = info.pguid;
            mk._name = info.name;
            var me = this;
            mk.on("click", function() {
                So.Gcmd.changeHash("search/map_detail", {
                    params: {
                        ids: this._pguid,
                        _keyword: this._name
                    }
                });
                monitor.click.listPao()
            });
            return mk;
        },
        prepareMap: function(params){
            params = params || {};
            var view_data = this.view_data;
            var data = this.filterData();
            var showoutline = params.showoutline || false;
            var me = this;

            if (this._overlays.length > 0) {
                map.removeOverlays(this._overlays);
                this._overlays = []
            }
            _.each(data.poi, function(j, h) {
                j.markerid = me.mPrefix + h;
                j.flag = h;
                j.highlight = false
                var g = me.createMarker(j, h);
                me._overlays.push(g)
            });
            map.addOverlays(this._overlays);
            if(showoutline){
                me.showOutline();
            }
            this.updateCenter(this._overlays);
        },
        updateCenter: function(overlays) {
            if(!overlays){
                return;
            }

            var view_data = this.view_data;

            var _selectPoi = view_data._selectPoi;

            overlays = _.isArray(overlays) ? overlays : [overlays];
            if(overlays.length > 1){
                So.UIMap.setFitView(overlays,{'left':50,'right':50,'bottom':mapListHeight});
            }else{
                try{
                    So.UIMap.setZoomAndCenter(16, overlays[0].getPosition())    
                }catch(e){
                    console.log(overlays);
                }                
            }

            _selectPoi && map.setCenter(new so.maps.LatLng(_selectPoi.y, _selectPoi.x))
        },
        fitMapView: function(){
            var me = this;
            setTimeout(function(){
                me._overlays && me.updateCenter(me._overlays);
            },300)
        },
        visible: function(c) {
            this._visible = c;
            var d = c ? "block" : "none";
            var view_data = this.view_data || {},
                data = view_data.data || {},
                page = data.page;
            $("#CTextDiv").css("display", d);
            $("#CTextDiv1").css("display", d);            

            So.UIMap.visible(c);
            scrollLoading = false;
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
          if(c){
            if(page == 1){
                this.initScroll();
                has_monitor_cpc_all = false;
            }
          }else{
            if(selectSortObj) selectSortObj.removeDropdown();
            this.clearMap();
            this.iscrollUnload();
            $("#CTextDiv1").css("top", "auto");
            $('body').removeClass('__map_list_fold1');
            has_monitor_app_show = false;
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
                if(geolocation.state == 1){
                    position = geolocation;
                    user_address = geoaddress;
                }else{
                    position = {x:'',y:''};
                    user_address = '';
                }

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

                    (new So.Command.CitySearch(view_data.params, view_data.view_params)).run()

                    //So.Gcmd.changeHash("search/map_list", view_data);
                    //window.scroll(0, 1);
                    break;
                case 2:
                    var _data = data_pois[c.index] || {},
                        _detail_src = urlArgs.src || 'map_wap';

                    _data.firstCity = data.firstCity;
                    //测试地址，上线时请切回正式地址http://m.map.so.com
                    var openType = window.__targetBlank__ ? '_blank' : '_self',
                        href = c.href || '/onebox/?type=detail&id='+_data.pguid+'&mso_x='+ position.x+'&mso_y='+position.y+'&d=mobile&src=' + _detail_src + '&fields=movies_all';

                    monitor.click.list({
                        name: params.keyword,
                        detil: c.href ? 'coupon' : 'poi',
                        pguid: c.href ? '' : _data.pguid,
                        cityname: geolocation.city,
                        number: c.index + 1
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
                    //window.open(href, openType);
                    setTimeout(function(){window.location.href = href},100);
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
                    var cpc_info = $(c.eve.target).closest('.cpc_info');
                    var index = cpc_info.data('index');
                    monitor.click.cpc({
                        keyword: params.keyword,
                        index: index,
                        cpc_index: c.cpc_index
                    });
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
                    debugger
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
                case 13:
                    var btn = $(c.dom),
                        parent = btn.closest('ul'),
                        hide_li = parent.find('li[style="display:none"]');

                    hide_li.show();
                    btn.hide();
                    break;
                case 14:
                    window.__HaoSouFun__ && __HaoSouFun__.toWithdrawDeposit && __HaoSouFun__.toWithdrawDeposit()
                    // monitor.log({
                    //     mod: 'search_list',
                    //     type: 'towithdrawdeposit'
                    // }, 'click');
                    break;
                case 15:
                    window.open('http://api.app.m.so.com/mhtml/fanbu/rules.html?v=17');
                    // monitor.log({
                    //     mod: 'search_list',
                    //     type: 'torules'
                    // }, 'click');
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
                case 21://qc
                    var loc = So.State.getLocation();
                    view_data.params.mp = loc.y + ',' + loc.x;
                    So.Gcmd.changeHash("search/map_list", {
                        params: view_data.params
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
            var top = mapListHeight + 20;
            $(".mapToolsLefCon").css("bottom",top + "px");
            $(".mapZoomCon").css("bottom",top + "px");
        },
        clearMap: function(){
            So.UIMap.clearMap();
            this._overlays = []
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
            this.cmd({id:1});
        },
        bindEventOnce: function(){
            var me = this;
            $('body').on('map_list-loadmore', function(e, callback){
                me.scrollLoad();
                callback && (scrollLoadCallback = callback);
            });

            $('body').on('map_list-updateListHei', function(e, opts){
                opts = opts || {};
                var curListHeight = opts.curListHeight;

                mapListHeight = curListHeight;
            });

            $('body').on('map_list-touchend', function(e, opts){
                opts = opts || {};
                var curListHeight = opts.curListHeight;

                mapListHeight = curListHeight;

                me.updateCenter(me._overlays);
                me.resize();
            });

            $('body').on('research_by_new_position', function(){
                me.cmd({
                    id:21
                })
            });

        },
        initScroll: function(){
            var view_data = this.view_data,
                data = view_data.data
                params = view_data.params;

            var app = {
                init: function(){
                    this.initScroll();
                },
                initScroll: function(){
                    iscroll = new scroll('.__view__name__search_map_list #CTextDiv1', {
                        click: true,
                        mousedown: true,
                        mouseup: true,
                        _poi_count: data.poi.length
                    });
                    iscroll.on('scrollEnd', function(){
                        var all_cpc_info = $('#CTextDiv1 .cpc_info[data-not-displayed="1"]');
                        all_cpc_info.forEach(function(item){
                            item = $(item);
                            var offset = item.offset();
                            var index = item.index() + 1;

                            //修改广告index为在列表中的顺序;
                            item.data('index', index);

                            if(offset.top > 145 && offset.top < 654){
                                item.data('not-displayed', "0");

                                //广告展现后的打点统计
                                monitor.disp.cpc({
                                    keyword: params.keyword,
                                    index: index,
                                    cpc_index: item.data('cpc-index')
                                });
                            }
                        });
                        
                        if(iscroll.directionY == 1){
                            monitor.click.listUp()
                        }else if(iscroll.directionY == -1){
                            monitor.click.listDown()
                        }

                        //只有一条结果时默认不显示下载APP按钮，滑动后显示，并发送打点
                        if($('body').hasClass('list_expanded') && !has_monitor_app_show){
                            monitor.disp.list_download_xd();
                            has_monitor_app_show = true;
                        }
                    });
                }
            };

            app.init();
        },
        iscrollUnload: function(){
            iscroll && iscroll.destroy();
        }
    };
    _.extend(a,listContent);

    //绑定事件
    a.bindEventOnce();

    return a;
});
