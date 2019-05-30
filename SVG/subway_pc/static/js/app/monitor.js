define(function(require) {
  var monitor;
  if (typeof window.monitor !== 'undefined') {
    monitor = window.monitor
    monitor.setProject('QH_92_2').getTrack().getClickAndKeydown().getClickHeatmap(10, 1);
    var _getText = monitor.util.getText;//将原有方法备份，以便恢复
    monitor.util.getText = function(el) {
        if(el.dataset.type) {//当url中包含特殊字符串时，
            return el.dataset.type; //返回元素className；
        }
        return _getText(el);//否则，采用默认策略
    };

    monitor.setConf('wpoUrl', '//s.360.cn/so/wpo.gif');


    window.monitor = undefined;
  }

  // disp log sugar
  function tlog(type) {
    if ( !monitor ) return function () {};
    var params = { type: 'sh_' + type }
    return function (opts) {
      // debugger
      if ( opts ) opts = $.extend(opts, params)
      monitor.log(opts||params, 'click')
    }
  }
  // click log sugar
  function clog(type) {
    if ( !monitor ) return function () {};
    var params = { type: 'cl_' + type }
    return function ( opts ) {
      // debugger
      if ( opts ) opts = $.extend(opts, params)
      monitor.log(opts||params, 'click')
    }
  }

  return {
    performance: function () {
      //性能打点统计;
      var wpo_time = So._time;
      monitor.log({
          pro: 'map_wap',
          pid: 'home',
          mod: 'firstview',
          view_name: wpo_time.view.name,
          _p_a: (wpo_time.based - wpo_time.load) || 0, //基础库加载时间
          _p_b: (wpo_time.view.tpl - wpo_time.based) || 0, //hashchange消耗时间
          _p_c: (wpo_time.view.tpled - wpo_time.view.tpl) || 0, //模板加载消耗时间
          _p_d: (wpo_time.view.dataed - wpo_time.view.data) || 0, //数据请求消耗时间
          _p_e: (wpo_time.view.visibled - wpo_time.view.dataed) || 0, //模板渲染消耗时间
          _p_t1: (wpo_time.before_main_load - wpo_time.load) || 0, //备用测试预留字段
          _p_t2: (wpo_time.main_init - wpo_time.main_load) || 0, //备用测试预留字段，统计报表有问题，该字段目前无用
          _p_z: (wpo_time.view.visibled - wpo_time.load) || 0//总时间
      }, 'wpo');
    },
    index: {
      disp: {
        // 首页 展示次数 search/index.js
        enter: tlog("index_clear"),
        //APP下载tips展现量
        home_download_fc: tlog("home_download_fc"),
        //二维码扫描下载提示框展现量
        scan_download: tlog("scan_download"),
        //短信url打开地图后下载提示框展现量
        mapp_download_message: tlog("mapp_download_message"),
      },
      click: {
        // 首页  输入框点击次数 cl_input
        input: clog("input"),
        // 首页  路线按钮点击次数    cl_route
        route: clog("route"),
        // 首页  路况按钮点击次数    cl_tmc
        tmc: clog("tmc"),
        // 首页  周边按钮点击次数    cl_cross
        cross: clog("cross"),
        // 首页  我的按钮点击次数    cl_myall
        myall: clog("myall"),
        //首页APP下载
        home_download_icon: clog("home_download_icon"),
        //首页APP tips下载
        home_download_fc: clog("home_download_fc"),
        //列表页APP下载
        list_download_xd: clog("list_download_xd"),
        //列表页APP下载
        list_download_xd_close: clog("list_download_xd_close"),
        //二维码扫描下载提示下载
        scan_download: clog("scan_download"),
        //二维码扫描下载提示取消
        scan_download_cancel: clog("scan_download_cancel"),
        //短信url打开地图后下载提示下载
        message_download: clog("message_download"),
        //短信url打开地图后下载提示取消
        message_download_cancel: clog("message_download_cancel"),
        //onebox到这里去打开地图后的下载提示 下载
        onebox_goto_download_open: clog("onebox_goto_download_open"),
        //onebox到这里去打开地图后的下载提示 取消
        onebox_goto_download_close: clog("onebox_goto_download_close"),
        //onebox到这里去打开地图后的下载提示 下载
        mapp_download_goto_open: clog("mapp_download_goto_open"),
        //onebox到这里去打开地图后的下载提示 取消
        mapp_download_goto_cancel: clog("mapp_download_goto_cancel"),
        //驾车导航打开下载提示 下载
        route_car_download_open: clog("route_car_download_open"),
        //驾车导航打开下载提示 取消
        route_car_download_close: clog("route_car_download_close"),
        //步行导航打开下载提示 下载
        route_walk_download_open: clog("route_walk_download_open"),
        //步行导航打开下载提示 取消
        route_walk_download_close: clog("route_walk_download_close"),
      }
    },
    search: {
      disp: {
        // 搜索 历史展示次数
        history: tlog("history"),
        // 搜索 sug展示次数
        sug: tlog("sugg"),
        // 搜索 结果展示次数
        list: tlog("list"),
        // 搜索 结果下拉加载次数
        list_scroll: tlog("list_scroll"),
        // 搜索 公交线路展示次数
        bus: tlog("list_bus"),
        // 搜索 无结果页展示
        no: tlog("list_no"),
        // 搜索 广告展示
        cpc_all: tlog("list_cpc_all"),
        //搜索 广告展现显示 pv（在可见区域显示后）
        cpc: tlog("list_cpc"),
        //列表页APP下载展示量
        list_download_xd: tlog("list_download_xd")
      },
      click: {
        // 搜索  搜索历史点击次数 cl_history
        history: clog("history"),
        // 搜索  搜索suug点击次数  cl_sugg
        sug: clog("sugg"),
        // 搜索  搜索次数 cl_search
        search: clog("search"),
        // 搜索  搜索结果点击次数  cl_list
        list: clog("list"),
        // 搜索  搜索结果上划次数    cl_list_up
        listUp: clog("list_up"),
        // 搜索  搜索结果下划次数    cl_list_down
        listDown: clog("list_down"),
        // 搜索  搜索结果气泡点击次数  cl_list_pao
        listPao: clog("list_pao"),
        // 搜索筛选点击次数 map_list.js
        scr: clog("list_scr"),
        // 查看查看更多点击次数 map_list.js
        more: clog("list_more"),
        //广告点击
        cpc: clog("cpc")
      }
    },
    detail: {
      disp: {
        // 详细信息展示次数
        enter: tlog("details"),
        // 地图aoi展示次数
        aoi: tlog("details_aoi"),
        //android 下到这里去展示量
        mapp_download_goto: tlog("mapp_download_goto")
      },
      click: {
        // 详细信息    详细信息—到这去    cl_details_end
        end: clog("details_end"),
        // 详细信息    详细信息—附近找    cl_details_cross
        cross: clog("details_cross"),
        // 详细信息    详细信息—纠错 cl_details_cuo
        cuo: clog("details_cuo"),
        // 详细信息    详细信息—评论 cl_details_ping
        ping: clog("details_ping"),
        // 详细信息    详细信息—全部分店   cl_details_fendian
        fendian: clog("details_fendian"),
        // 详细信息    详细信息—团购 cl_details_tuan
        tuan: clog("details_tuan"),
        // 详细信息    详细信息—室内图    cl_details_nei
        nei: clog("details_nei"),
        // 详细信息    详细信息—选座 cl_details_zuo
        zuo: clog("details_zuo"),
        // 详细信息    详细信息—购票——格瓦拉    cl_details_buy_gewara
        gewara: clog("details_gewara"),
        // 详细信息    详细信息—购票——猫眼 cl_details_buy_maoyan
        maoyan: clog("details_maoyan"),
        // 详细信息    详细信息—搜索 cl_details_search
        search: clog("details_search"),
        // 详细信息    详细信息—地址 cl_details_address
        address: clog("details_address"),
        // 详细信息    详细信息—AOI子点  cl_details_aoip
        aoip: clog("details_aoip"),
        //android 下到这里去展示量
        mapp_download_goto: clog("mapp_download_goto")
      }
    },
    route: {
      disp: {
        // 路线页面展示次数    sh_route
        enter: tlog("route"),
        // 路况页面展示次数    sh_tmc
        tmc: tlog("tmc"),
        //app下载展示次数
        route_download: tlog("route_download"),
        //导航详情页APP下载点击次数
        route_detail_download_xd: tlog("route_detail_download_xd")
      },
      click: {
        // 路线  路线规划的次数 cl_route_all
        all: clog("route_all"),
        // 路线  路线——交换起终点   cl_route_ex
        ex: clog("route_ex"),
        // 公交路线    公交按钮点击次数    cl_route_bus
        bus: clog("route_bus"),
        // 驾车路线    驾车按钮点击次数    cl_route_car
        drive: clog("route_car"),
        // 步行路线    路线——步行规划点击次数    cl_route_walk
        walk: clog("route_walk"),
        // 飞机路线    路线——飞机规划次数  cl_route_plane
        plane: clog("route_plane"),
        // 火车路线    路线——火车规划次数  cl_route_train
        train: clog("route_train"),
        // 自行车路线    路线——火车规划次数  cl_route_train
        bike: clog("route_bike"),
        //途经点添加
        point_add: clog("Vpoint_add"),
        //途经点删除
        point_delet: clog("Vpoint_delet"),
        //修改起终点
        route_edit: clog("route_edit"),
        //app下载点击次数
        route_download: clog("route_download"),
        //导航详情页APP下载点击次数
        route_detail_download_xd: clog("route_detail_download_xd"),
        //驾车、步行 底部的导航按钮点击量
        route_download_navigation: clog("route_download_navigation")
      },
      bus: {
        disp: {
          // 公交结果展示次数    sh_route_bus
          enter: tlog("route_bus"),
          // 公交详情展示次数    sh_route_bus_detail
          detail: tlog("route_bus_detail"),
          // 公交分段展示次数    sh_route_bus_sub
          sub: tlog("route_bus_sub"),
          // 公交无结果展示次数   sh_route_bus_no
          no: tlog("route_bus_no"),
          //APP下载banner展示量
          bus_download_app: tlog("bus_download_app"),
        },
        click: {
          // 公交路线    公交结果—时间点击   cl_route_bus_time
          time: clog("route_bus_time"),
          // 公交路线    公交结果—方案切换   cl_route_bus_rule
          ex: clog("route_bus_ex"),
          // 公交路线    公交结果—结果点击   cl_route_bus_list
          list: clog("route_bus_list"),
          // 公交路线    公交结果—分段查看点击 cl_route_bus_sub
          sub: clog("route_bus_sub"),
          //APP下载banner展示量
          bus_download_app: clog("bus_download_app"),
        }
      },
      drive: {
        disp: {
          // 驾车结果展示次数    sh_route_car
          enter: tlog("route_car"),
          // 驾车详情展示次数    sh_route_car_detail
          detail: tlog("route_car_detail"),
          // 驾车分段展示次数    sh_route_car_sub
          sub: tlog("route_car_sub"),
          // 驾车无结果展示次数   sh_route_car_no
          no: tlog("route_car_no"),
          //导航按钮展示量 android下，没插件
          route_car_download: tlog("route_car_download"),
        },
        click: {
          // 驾车路线    驾车结果—偏好选择次数 cl_route_car_pre
          pre: clog("route_car_pre"),
          // 驾车路线    驾车结果—结果点击次数 cl_route_car_list
          list: clog("route_car_list"),
          // 驾车路线    驾车结果—详情点击入口次数   cl_route_car_detail
          detail: clog("route_car_detail"),
          // 驾车路线    驾车结果—详情列表点击次数   cl_route_car_list
          list: clog("route_car_list"),
          // 驾车路线    驾车结果——分段查看的次数   cl_route_car_sub
          sub: clog("route_car_sub"),
          // 开启导航
          navi: clog("route_car_navi"),
          //导航按钮点击量 android下，没插件
          route_car_download: clog("route_car_download"),
        }
      },
      walk: {
        disp: {
          // 步行结果展示次数    sh_route_walk
          enter: tlog("route_walk"),
          // 步行详情展示次数    sh_route_walk_detail
          detail: tlog("route_walk_detail"),
          // 步行分段展示次数    sh_route_walk_sub
          sub: tlog("route_walk_sub"),
          // 步行无结果展示次数   sh_route_walk_no
          no: tlog("route_walk_no"),
          //导航按钮展示量 android下，没插件
          route_walk_download: tlog("route_walk_download"),
        },
        click: {
          // 步行路线    步行结果—列表点击   cl_route_walk_list
          list: clog("route_walk_list"),
          // 步行路线    步行结果—分段查看次数 cl_route_walk_sub
          sub: clog("route_walk_sub"),
          // 开启导航
          navi: clog("route_walk_navi"),
          //导航按钮点击量 android下，没插件
          route_walk_download: clog("route_walk_download"),
        }
      },
      bike: {
        disp: {
          // 骑行结果展示次数    sh_route_bike
          enter: tlog("route_bike"),
          // 骑行详情展示次数    sh_route_bike_detail
          detail: tlog("route_bike_detail"),
          // 骑行分段展示次数    sh_route_bike_sub
          sub: tlog("route_bike_sub"),
          // 骑行无结果展示次数   sh_route_bike_no
          no: tlog("route_bike_no")
        },
        click: {
          // 骑行路线    步行结果—列表点击   cl_route_walk_list
          list: clog("route_bike_list"),
          // 骑行路线    步行结果—分段查看次数 cl_route_walk_sub
          sub: clog("route_bike_sub")
        }
      },
      train: {
        disp: {
          // 火车结果展示次数    sh_route_train
          enter: tlog("route_train"),
          // 火车详情展示次数    sh_route_train_detail
          detail: tlog("route_train_detail"),
          // 火车分段展示次数    sh_route_train_sub
          sub: tlog("route_train_sub"),
          // 火车无结果展示次数   sh_route_train_no
          no: tlog("route_train_no")
        },
        click: {
          // 火车路线    火车结果—方案切换   cl_route_train_rule
          rule: clog("route_train_rule"),
          // 火车路线    火车结果—结果点击   cl_route_train_list
          list: clog("route_train_list"),
          // 火车路线    火车结果—分段 cl_route_train_sub
          sub: clog("route_train_sub")
        }
      },
      plane: {
        disp: {
          // 飞机结果展示次数    sh_route_plane
          enter: tlog("route_plane"),
          // 飞机详情展示次数    sh_route_plane_detail
          detail: tlog("route_plane_detail"),
          // 飞机分段展示次数    sh_route_plane_sub
          sub: tlog("route_plane_sub"),
          // 飞机无结果展示次数   sh_route_plane_no
          no: tlog("route_plane_no")
        },
        click: {
          // 飞机路线    飞机结果—方案切换   cl_route_plane_rule
          rule: clog("route_plane_rule"),
          // 飞机路线    飞机结果—结果点击   cl_route_plane_list
          list: clog("route_plane_list"),
          // 飞机路线    飞机结果—分段 cl_route_plane_sub
          sub: clog("route_plane_sub")
        }
      }
    },
    location:{
      disp: {
        //定位  定位成功次数  sh_location_all
        success: tlog("location_all"),
        //定位  定位气泡展示次数  sh_location_detail
        detail: tlog("location_detail"),
        //定位  定位总次数 sh_location_all_all
        all: tlog("location_all_all")
      },
      click: {
        //定位  定位按钮点击次数  cl_location_all
        all: clog("location_all")
      }
    },
    user_poi:{
      click:{
        //个人中心 家点击次数（只包括已经设置家，点击家进行导航的）
        home_ponit: clog("home_ponit"),
        //路线 家点击次数（只包括已经设置家，点击家进行导航的）
        home_his: clog("home_his"),
        //个人中心 公司点击次数（只包括已经设置公司，点击公司进行导航的）
        company_ponit: clog("company_ponit"),
        //路线 公司点击次数（只包括已经设置公司，点击公司进行导航的）
        company_his: clog("company_his"),
        //家的添加 （包括路线页面、个人中心，未设置家时候的点击）
        home_add: clog("home_add"),
        //家的编辑 （包括路线页面、个人中心）
        home_edit: clog("home_edit"),
        //公司的添加 （包括路线页面、个人中心，未设置公司时候的点击）
        company_add: clog("company_add"),
        //公司的编辑 （包括路线页面、个人中心）
        company_edit: clog("company_edit"),
      }
    },
    user_index:{
      click: {
        //我的 我的收藏点击次数
        myfar: clog("myfar")
      }
    },
    user_favorite:{
      click: {
        //我的收藏 列表点击次数
        myfar_list: clog("myfar_list"),
        //我的收藏 删除按钮点击次数
        myfar_del: clog("myfar_del")
      }
    },
    subway:{
      disp: {
        //地铁图app浮窗广告展示
        subway_download_fc: tlog("subway_download_fc"),
        //地铁图子点窗app广告展示
        subway_download_ditie: tlog("subway_download_ditie")
      },
      click: {
        //地铁图app浮窗广告点击
        subway_download_fc: clog("subway_download_fc"),
        //地铁图app图标广告点击
        subway_download_icon: clog("subway_download_icon"),
        //地铁图子点窗app广告点击
        subway_download_ditie: clog("subway_download_ditie")
      }
    },
    categories: {
      disp: {
        //APP下载吸底条展现量
        cross_download_xd_test1: tlog("cross_download_xd_test1")
      },
      click: {
        //APP下载吸底条点击量
        cross_download_xd_test1: clog("cross_download_xd_test1")
      }
    },
    mall_list: {
      disp: {
        //商场子点展现量
        detail_malllist: tlog("detail_malllist")
      },
      click: {
        //商场子点点击量
        detail_malllist: clog("detail_malllist")
      }
    },
    similar: {
      disp: {
        detail_tuijian_kindlist: tlog("detail_tuijian_kindlist")
      },
      click: {
        detail_tuijian_kindlist: clog("detail_tuijian_kindlist")
      }
    }
  }
});

// search-service.js 325 搜索请求日志
// map_list.js 871 跳转onebox详情页
// map_list.js 907 后退
// map_list.js 1112
