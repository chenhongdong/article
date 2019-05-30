define(function(require) {
    var So_key = 'b24749be1d26f9706cc4a9b132ae6de0';
    var userAgent = navigator.userAgent;
    var MSO_APP_VERSION = /.* mso_app\s?\(([\d.]+)\)/i.exec(userAgent);
    var config = {
        userAgent: userAgent,
        IS_HTTPS: location.protocol == 'https:',
        ISFROMLOGIN: document.referrer.indexOf('i.360.cn/login/wap/?src=mpw_around') > -1,
        ROUTE: {
            ACTION: {
                '直行': 0,
                '调头': 1,
                '左转': 2,
                '右转': 3,
                '向左前方': 4,
                '向右前方': 5,
                '靠左': 6,
                '靠右': 7
            }
        },
        STORAGE_KEYS: {
            HOME: 'home',
            COMPANY: 'company',
            POIHISTORY: 'poiHistory',
            ROUTEHISTORYBUS: 'routeHistoryBus',
            ROUTEHISTORYDRIVE: 'routeHistoryDrive',
            ROUTEHISTORYWALK: 'routeHistoryWalk',
            ROUTEHISTORYBIKE: 'routeHistoryBike'
        },
        APP_CLIENT: function () {
            var client = 'other';
            if (userAgent.indexOf('mso_app') > -1) {
                client = '360搜索app'
            }else if (userAgent.indexOf('360shenbian') > -1) {
                client = '身边生活插件'
            }else if (userAgent.indexOf('360around') > -1) {
                client = '身边生活'
            }else if ((userAgent.indexOf('360 Aphone Browser') > -1) || (userAgent.indexOf('360browser') > -1) || (userAgent.indexOf('QHBrowser') > -1)) {
                client = '360浏览器'
            }
            return client;
        }(),
        APP_SYSTEM: function () {
            var system = 'other';
            if (userAgent.indexOf('iPhone') > -1) {
                system = 'ios';
            } else if (userAgent.indexOf('Android') > -1) {
                system = 'Android'
            };
            return system;
        }(),
        ISANDROID: userAgent.indexOf('Android') > -1,
        ISIPHONE: userAgent.indexOf('iPhone') > -1,
        STOPSCHEME: /micromessenger/i.test(userAgent),
        APPLOADTIMEOUT: 2000,
        MSOAPP: MSO_APP_VERSION && MSO_APP_VERSION[1],
        MAIN_PAGE: "search/index",
        initCallback: function(a) {},
        QII: true,
        heightMin: 0,
        CHANGECITYCBK: function(b, a) {
            if (a == "1") {
                $(".js-locationTips").html(b);
            }
        },

        REST_API_URL: "//restapi.map.so.com/api/simple?",
        //RGEOCODE_SERVICE_URL: "http://restapi.amap.com/v3/geocode/regeo?extensions=all&ia=1&id360=cae64dd9df591d351466a2a5190&key=" + So_key,
        RGEOCODE_SERVICE_URL: So.serviceUrl && So.serviceUrl.rgeocoder_url + "?sid=7001&mobile=1&addr_desc=true&&show_addr=true&formatted=true&jsoncallback=?",
        //GEOCODE_SERVICE_URL: "http://restapi.amap.com/v3/geocode/geo?key=" + So_key,
        GEOCODE_SERVICE_URL: So.serviceUrl && So.serviceUrl.geocoder_url + "?sid=7000&mobile=1&formatted=true&jsoncallback=?",
        BUS_SERVER: So.serviceUrl && So.serviceUrl.busroute_url + "?sid=7003&mobile=1&jsoncallback=?&output=json&jambus=true",
        //BUS_SERVER: "http://haosou.m.map.test.so.com/rest/api/simple.php?sid=7003&mobile=1&jsoncallback=?&output=json&jambus=true",
        //BUS_SERVER: "http://haosou.m.map.test.so.com/rest/api/simple.php?sid=7003&mobile=1&jsoncallback=?&output=json&jambus=true",
        DRIVE_SERVER: So.serviceUrl && So.serviceUrl.driveroute_url + "?sid=7004&mobile=1&jsoncallback=?&output=json&origin_mark=true",
       // DRIVE_SERVER: "http://haosou.m.map.test.so.com/rest/api/simple.php?sid=7004&mobile=1&jsoncallback=?&output=json",
        //WALK_SERVER: "http://restapi.amap.com/v3/direction/walking?callback=?&output=json&key=" + So_key,
        WALK_SERVER: So.serviceUrl && So.serviceUrl.walkroute_url + "?sid=7005&mobile=1&jsoncallback=?&output=json&origin_mark=true",
        BIKE_SERVER: So.serviceUrl && So.serviceUrl.walkroute_url + "?sid=7011&mobile=1&jsoncallback=?&output=json&origin_mark=true",
        GEO_DEV_SERVER: "//restapi.map.so.com/tools/geo/wgs2gcj/?",
        //ASS_SERVER: "http://default.143.m.qss.test.so.com/tools/map_engine/api/simple.php?force=%7B%22qp%22%3A%22%22%2C%22redis%22%3A%22%22%2C%22engine%22%3A%22%22%2C%22poiRedis%22%3A%22sweb11.safe.zzbc.qihoo.net%3A6399%22%2C%22mongo%22%3A%22%22%7D&resType=json&mobile=1&flag=callback&encode=UTF-8&jsoncallback=?",
        ASS_SERVER: "//restapi.map.so.com/api/simple?resType=json&mobile=1&flag=callback&encode=UTF-8&jsoncallback=?",
        //ASS_SERVER: "//restapi.liudaiming.merger_test.m.map.test.so.com/api/simple?merger_ip=10.16.29.188&merger_port=21659resType=json&mobile=1&flag=callback&encode=UTF-8&jsoncallback=?",
        //ASS_SERVER: "http://restapi.f2.so.com/api/simple.php?resType=json&flag=callback&encode=UTF-8&jsoncallback=?",
        //ASS_SERVER: "http://restapi.f2.m.qss.test.so.com/api/simple.php?resType=json&flag=callback&encode=UTF-8&jsoncallback=?",
        //ASS_SERVER: "http://default.143.m.qss.test.so.com/tools/map_engine/api/simple.php?force=%7B%22qp%22%3A%2210.16.28.19%3A9010%22%2C%22redis%22%3A%22%22%2C%22engine%22%3A%22mapd02.qss.zzbc2.qihoo.net%3A8360%22%2C%22poiRedis%22%3A%22%22%2C%22mongo%22%3A%22%22%7D&resType=json&mobile=1&flag=callback&encode=UTF-8&jsoncallback=?",
        MAX_HINT_NUMBER: 6,
        MAP_CTRL_V: "1,1,1,1,1",

        //WZGF
        WZGF_SERVER: "//map.so.com/app/weizhang/?jsoncallback=?",

        //58代练
        PEILIAN_SERVICE: "//peilian.58.com",//"http://peilian.58.com", //http://peilian.test.58v5.cn",//demo地址 //正式地址 http://peilian.58.com
        CAR_TYPE_LIST: "/qh/mapindex",
        JIAOLIAN_LIST: "/qh/nearcoach",
        JIAOLIAN_INFO: "/qh/ccinfo",
        ORDER_SERVICE: "/qh/placeorder",
        CITY_LIST: "/qh/citylist",

        FAVORITE_GETLIST: "/app/favorite/getlist",
        FAVORITE_DELETE: "/app/favorite/delete",
        USERINFO_SYNC: "/app/favorite/sync",
        HOMECOMPANY_SYNC: "/app/favorite/homeCompany",
        HISTORY_SYNC: "/app/favorite/history",
        MALL_LIST: "/app/mall/list",
        RECOMMEND_SIMILAR: "/app/recommend/similar",

        //免费wifi
        //FREEWIFI_SERVICE: "http://map.flj.m.qss.test.so.com/app/wifi?cb=?", //x=116.39&y=39.90&//demo

        //大麦网
        //http://default.143.m.qss.test.so.com/tools/map_engine/api/simple.php?force=%7B%22qp%22%3A%22%22%2C%22redis%22%3A%22%22%2C%22engine%22%3A%22%22%2C%22poiRedis%22%3A%22sweb11.safe.zzbc.qihoo.net%3A6399%22%2C%22mongo%22%3A%22%22%7D

        //周末去哪儿
        //GOWHERE_SERVICE: "http://restapi.map.so.com/api/wanzhoumo/", //测试接口/正式接口http://restapi.map.so.com

        ACTIVITY_SERVICE: '//m.map.so.com/app/activity',
        //短租民宿
        //RENT_SERVICE: "//m.map.so.com/app/rent", //短租数据接口
        NEAR_SPORTS: "Nearby",
        NEAR_SPORTS_DETAIL: "NearbyDetail",
        HOT_SPORTS: "JingXuan",
        HOT_SPORTS_DETAIL: "JingXuanDetail",
        //外卖城市
        WAIMAI_CITIES: {
            beijing: "beijing,北京",
            foshan: "foshan,佛山",
            shenzhen: "shenzhen,深圳",
            dongguan: "dongguan,东莞",
            nanning: "nanning,南宁",
            kunming: "kunming,昆明",
            hefei: "hefei,合肥",
            xiamen: "xiamen,厦门",
            shenyang: "shenyang,沈阳",
            xining: "xining,西宁",
            nanchang: "nanchang,南昌",
            wuxi: "wuxi,无锡",
            huhehaote: "huhehaote,呼和浩特",
            tianjin: "tianjin,天津",
            changchun: "changchun,长春",
            wuhan: "wuhan,武汉",
            dalian: "dalian,大连",
            suzhou: "suzhou,苏州",
            yantai: "yantai,烟台",
            jinan: "jinan,济南",
            guiyang: "guiyang,贵阳",
            lanzhou: "lanzhou,兰州",
            taiyuan: "taiyuan,太原",
            haerbin: "haerbin,哈尔滨",
            qingdao: "qingdao,青岛",
            xian: "xian,西安",
            chengdu: "chengdu,成都",
            fuzhou: "fuzhou,福州",
            wulumuqi:"wulumuqi,乌鲁木齐",
            shijiazhuang:"shijiazhuang,石家庄",
            yinchuan:"yinchuan,银川",
            zhengzhou: "zhengzhou,郑州",
            hangzhou: "hangzhou,杭州",
            ningbo: "ningbo,宁波",
            shanghai: "shanghai,上海",
            chongqing: "chongqing,重庆",
            changsha: "changsha,长沙",
            haikou:"haikou,海口",
            nanjing: "nanjing,南京",
            jining:"jining,济宁",
            zhuhai:"zhuhai,珠海",
            guangzhou: "guangzhou,广州"
        },
        //地铁城市
        SUBWAY_CITIES: {
            beijing: "beijing,北京",
            shanghai: "shanghai,上海",
            guangzhou: "guangzhou,广州",
            shenzhen: "shenzhen,深圳",
            hongkong: "hongkong,香港",
            chengdu: "chengdu,成都",
            changchun: "changchun,长春",
            chongqing: "chongqing,重庆",
            dalian: "dalian,大连",
            foshan: "foshan,佛山",
            hangzhou: "hangzhou,杭州",
            kunming: "kunming,昆明",
            nanjing: "nanjing,南京",
            shenyang: "shenyang,沈阳",
            suzhou: "suzhou,苏州",
            tianjin: "tianjin,天津",
            wuhan: "wuhan,武汉",
            xian: "xian,西安",
            haerbin: "haerbin,哈尔滨",
            zhengzhou: "zhengzhou,郑州",
            changsha: "changsha,长沙",
            ningbo: "ningbo,宁波",
            wuxi: "wuxi,无锡",
            nanchang: "nanchang,南昌",
            fuzhou: "fuzhou,福州",
            hefei: "hefei,合肥",
            qingdao:"qingdao,青岛"
        },
        sortType: {
            catering: [{
                "label": "排序",
                "log": "sorting",
                "children": [{
                    "label": "智能排序",
                    "active": 1,
                    "params": {
                        "sort": "",
                        "order": ""
                    }
                },{
                    "label": "离我最近",
                    "params": {
                        "sort": "distance",
                        "order": "asc"
                    }
                }, {
                    "label": "评分最高",
                    "params": {
                        "sort": "rate",
                        "order": "desc"
                    }
                }, {
                    "label": "人气最高",
                    "params": {
                        "sort": "review_count",
                        "order": "desc"
                    }
                }, {
                    "label": "人均最低",
                    "params": {
                        "sort": "price",
                        "order": "asc"
                    }
                }, {
                    "label": "人均最高",
                    "params": {
                        "sort": "price",
                        "order": "desc"
                    }
                }],
            }, {
                "label": "类别",
                "log": "category",
                "children": [{
                    "label": "不限",
                    "active": 1,
                    "params": {
                        "keyword": "美食"
                    }
                }, {
                    "label": "川菜",
                    "params": {
                        "keyword": "川菜"
                    }
                }, {
                    "label": "湘菜",
                    "params": {
                        "keyword": "湘菜"
                    }
                }, {
                    "label": "粤菜",
                    "params": {
                        "keyword": "粤菜"
                    }
                }, {
                    "label": "云南菜",
                    "params": {
                        "keyword": "云南菜"
                    }
                }, {
                    "label": "东北菜",
                    "params": {
                        "keyword": "东北菜"
                    }
                }, {
                    "label": "江浙菜",
                    "params": {
                        "keyword": "江浙菜"
                    }
                }, {
                    "label": "火锅",
                    "params": {
                        "keyword": "火锅"
                    }
                }, {
                    "label": "海鲜",
                    "params": {
                        "keyword": "海鲜"
                    }
                }, {
                    "label": "快餐",
                    "params": {
                        "keyword": "快餐"
                    }
                }, {
                    "label": "自助餐",
                    "params": {
                        "keyword": "自助餐"
                    }
                }, {
                    "label": "家常菜",
                    "params": {
                        "keyword": "家常菜"
                    }
                }, {
                    "label": "清真菜",
                    "params": {
                        "keyword": "清真菜"
                    }
                }, {
                    "label": "西餐",
                    "params": {
                        "keyword": "西餐"
                    }
                }, {
                    "label": "日本料理",
                    "params": {
                        "keyword": "日本料理"
                    }
                }, {
                    "label": "韩国料理",
                    "params": {
                        "keyword": "韩国料理"
                    }
                }, {
                    "label": "东南亚菜",
                    "params": {
                        "keyword": "东南亚菜"
                    }
                }, {
                    "label": "面包甜点",
                    "params": {
                        "keyword": "面包甜点"
                    }
                }],
                "isMulti": 0
            }, {
                "label": "范围",
                "disable": false,
                "log": "distance",
                "children": [{
                    "label": "不限",
                    "active": 1,
                    "params": {
                        "range": ""
                    }
                }, {
                    "label": "500米",
                    "params": {
                        "range": "500"
                    }
                }, {
                    "label": "1千米",
                    "params": {
                        "range": "1000"
                    }
                }, {
                    "label": "2千米",
                    "params": {
                        "range": "2000"
                    }
                }, {
                    "label": "5千米",
                    "params": {
                        "range": "5000"
                    }
                }],
                "isMulti": 0
            },  {
                "label": "筛选",
                "log": "preferential",
                "children": [{
                    "label": "有团购",
                    "type": "checkbox",
                    "icon": "tuan",
                    "params": {
                        "filter": "groupon"
                    }
                }, {
                    "label": "可排号",
                    "type": "checkbox",
                    "icon": "pai",
                    "params": {
                        "filter": "no-wait",
                    }
                }, {
                    "label": "优惠活动",
                    "type": "checkbox",
                    "icon": "sale",
                    "params": {
                        "filter": "creditcard",
                    }
                }, {
                    "label": "人均",
                    "type": {
                        "type": "range",
                        "scope": [0, 300],
                        "min": "¥0",
                        "max": "不限"
                    },
                    "params": {
                        "price": "0,300"
                    }
                }, {
                    "label": "确认",
                    "type": "button",
                    "params": {
                        "filter": "",
                        "price": "0,300"
                    }
                }],
                "isMulti": 0
            }],
            hotel: [{
                "label": "排序",
                "children": [{
                    "label": "综合",
                    "active": 1,
                    "params": {
                        "sort": "",
                        "order": ""
                    },
                    "monitor": "sort-all"
                }, {
                    "label": "离我最近",
                    "sort": "sortAsc",
                    "value": "sort=distance&order=asc",
                    "params": {
                        "sort": "distance",
                        "order": "asc"
                    },
                    "monitor": "distance"
                }, {
                    "label": "价格最低",
                    "sort": "sortAsc",
                    "value": "sort=price&order=asc",
                    "params": {
                        "sort": "price",
                        "order": "asc"
                    },
                    "monitor": "price"
                }, {
                    "label": "评分最高",
                    "sort": "sortDesc",
                    "value": "sort=rate&order=desc",
                    "params": {
                        "sort": "rate",
                        "order": "desc"
                    },
                    "monitor": "score"
                }],
                "isMulti": 0
            }, {
                "label": "等级",
                "children": [{
                    "label": "全部",
                    "active": 1,
                    "params": {
                        "star": ""
                    },
                    "monitor": "star-all"
                }, {
                    "label": "经济型",
                    "value": "star=1",
                    "params": {
                        "star": "1"
                    },
                    "monitor": "one"
                }, {
                    "label": "舒适型",
                    "value": "star=3",
                    "params": {
                        "star": "3"
                    },
                    "monitor": "two"
                }, {
                    "label": "高档型",
                    "value": "star=4",
                    "params": {
                        "star": "4"
                    },
                    "monitor": "three"
                }, {
                    "label": "豪华型",
                    "value": "star=5",
                    "params": {
                        "star": "5"
                    },
                    "monitor": "four"
                }],
                "isMulti": 0
            }, {
                "label": "筛选",
                "children": [{
                    "label": "有wifi",
                    "filter": "wifi",
                    "type": "checkbox",
                    "params": {
                        "filter": "wifi"
                    }
                }, {
                    "label": "可停车",
                    "filter": "park",
                    "type": "checkbox",
                    "params": {
                        "filter": "park"
                    }
                }, {
                    "label": "钟点房",
                    "filter": "hour",
                    "type": "checkbox",
                    "params": {
                        "filter": "hour"
                    }
                }, {
                    "label": "临近铁站",
                    "filter": "near_subway",
                    "type": "checkbox",
                    "params": {
                        "filter": "near_subway"
                    }
                },{
                    "label": "有团购",
                    "filter": "groupon",
                    "type": "checkbox",
                    "params": {
                        "filter": "groupon"
                    }
                },{
                    "label": "人均",
                    "filter": "price",
                    "type": {
                        "type": "range",
                        "scope": [0,300],
                        "min": 0,
                        "max": "不限"
                    },
                    "params": {
                        "price": "0,300"
                    }
                }, {
                    "label": "确定",
                    "type": "button",
                    "params": {
                        "filter": "",
                        "price": "0,300"
                    }
                }]
            }],
            groupon:[{
                "label": "类别",
                "log": "category",
                "children": [{
                    "label": "全部",
                    "active": 1,
                    "params": {
                        "keyword": "团购商户"
                    }
                }, {
                    "label": "美食",
                    "params": {
                        "keyword": "美食"
                    }
                }, {
                    "label": "电影院",
                    "params": {
                        "keyword": "电影院"
                    }
                }, {
                    "label": "酒店",
                    "params": {
                        "keyword": "酒店"
                    }
                }],
                "isMulti": 0
            },{
                "label": "范围",
                "disable": false,
                "log": "distance",
                "children": [{
                    "label": "不限",
                    "active": 1,
                    "params": {
                        "range": ""
                    }
                }, {
                    "label": "500米",
                    "params": {
                        "range": "500"
                    }
                }, {
                    "label": "1000米",
                    "params": {
                        "range": "1000"
                    }
                }, {
                    "label": "2000米",
                    "params": {
                        "range": "2000"
                    }
                }, {
                    "label": "5000米",
                    "params": {
                        "range": "5000"
                    }
                }],
                "isMulti": 0
            }],
            spot: [{
                "label": "范围",
                "disable": false,
                "log": "distance",
                "children": [{
                    "label": "不限",
                    "active": 1,
                    "params": {
                        "range": ""
                    }
                }, {
                    "label": "1千米",
                    "params": {
                        "range": "1000"
                    }
                }, {
                    "label": "3千米",
                    "params": {
                        "range": "3000"
                    }
                }, {
                    "label": "5千米",
                    "params": {
                        "range": "5000"
                    }
                }, {
                    "label": "1万米",
                    "params": {
                        "range": "10000"
                    }
                }],
                "isMulti": 0
            },{
                "label": "排序",
                "log": "sorting",
                "children": [{
                    "label": "智能排序",
                    "active": 1,
                    "params": {
                        "sort": "",
                        "order": ""
                    }
                },{
                    "label": "离我最近",
                    "params": {
                        "sort": "distance",
                        "order": "asc"
                    }
                }, {
                    "label": "评分最高",
                    "params": {
                        "sort": "rate",
                        "order": ""
                    }
                }],
                "isMulti": 0
            }],
            bank: [{
                "label": "范围",
                "disable": false,
                "log": "distance",
                "children": [{
                    "label": "全城",
                    "active": 1,
                    "params": {
                        "range": ""
                    }
                },{
                    "label": "500米",
                    "params": {
                        "range": "500"
                    }
                }, {
                    "label": "1千米",
                    "params": {
                        "range": "1000"
                    }
                }, {
                    "label": "5千米",
                    "params": {
                        "range": "5000"
                    }
                }],
                "isMulti": 0
            }, {
                "label": "所有银行",
                "log": "category",
                "children": [{
                    "label": "全部银行",
                    "active": 1,
                    "params": {
                        "keyword": "银行"
                    }
                }, {
                    "label": "工商银行",
                    "params": {
                        "keyword": "工商银行"
                    }
                }, {
                    "label": "建设银行",
                    "params": {
                        "keyword": "建设银行"
                    }
                }, {
                    "label": "农业银行",
                    "params": {
                        "keyword": "农业银行"
                    }
                }, {
                    "label": "中国银行",
                    "params": {
                        "keyword": "中国银行"
                    }
                }, {
                    "label": "招商银行",
                    "params": {
                        "keyword": "招商银行"
                    }
                }, {
                    "label": "交通银行",
                    "params": {
                        "keyword": "交通银行"
                    }
                }, {
                    "label": "邮政储蓄",
                    "params": {
                        "keyword": "邮政储蓄"
                    }
                }, {
                    "label": "农村信用社",
                    "params": {
                        "keyword": "农村信用社"
                    }
                }, {
                    "label": "中信银行",
                    "params": {
                        "keyword": "中信银行"
                    }
                }, {
                    "label": "民生银行",
                    "params": {
                        "keyword": "民生银行"
                    }
                }, {
                    "label": "光大银行",
                    "params": {
                        "keyword": "光大银行"
                    }
                }, {
                    "label": "广发银行",
                    "params": {
                        "keyword": "广发银行"
                    }
                }, {
                    "label": "北京银行",
                    "params": {
                        "keyword": "北京银行"
                    }
                }, {
                    "label": "浦发银行",
                    "params": {
                        "keyword": "浦发银行"
                    }
                }, {
                    "label": "平安银行",
                    "params": {
                        "keyword": "平安银行"
                    }
                }, {
                    "label": "兴业银行",
                    "params": {
                        "keyword": "兴业银行"
                    }
                }, {
                    "label": "华夏银行",
                    "params": {
                        "keyword": "华夏银行"
                    }
                }]
            },{
                "label": "营业厅/ATM",
                "disable": false,
                "log": "distance",
                "children": [{
                    "label": "不限",
                    "active": 1,
                    "params": {
                        "filter": ""
                    }
                },{
                    "label": "ATM",
                    "params": {
                        "filter": "ATM"
                    }
                }, {
                    "label": "营业厅",
                    "params": {
                        "filter": "营业厅"
                    }
                }],
                "isMulti": 0
            }],
            mall_list: []
        }
    }
    config.HEADER_HEIGHT = $('#navToolBarDiv').height();
    config.RouteTop = config.HEADER_HEIGHT;
    config.detailToApp = /.*Android.*360around \(((([2-9]|\d{2,})([^)]+))|(1\.([7-9]+|\d{2,})([^)]+))|(1\.6\.([1-9]+|\d{2,})([^)]+))|(1\.6\.0\.(([2-9]+([^)]+))|1[1-9]+([^)]+)|10[1-9]+([^)]+)|100[1-9]+)))\)/.test(userAgent);
    config.detailToApp1 = /.*Android.*360shenbian/.test(userAgent);
    config.isMapMode = false;
    config.setApptoMapMode = function(){
        config.isMapMode = true;
        document.title = "360地图";
    }

    if(So.__mapModeType__){
        config.MAIN_PAGE = 'search/index';
        config.setApptoMapMode();
    }

    window.iosMsoAppBridgeInit = 0;
    config.connectWebViewJavascriptBridge = function(callback){
        var cbk = function(){
            if(!window.iosMsoAppBridgeInit){
                window.iosMsoAppBridgeInit = 1;

                try{
                    WebViewJavascriptBridge.init(function(message, responseCallback) {
                        if (responseCallback) {
                            responseCallback("Right back atcha")
                        }
                    });    
                }catch(e){
                }
            }

            WebViewJavascriptBridge.send('NeedLocation', callback);
        }
        if (window.WebViewJavascriptBridge) {
            cbk();
        } else {
            document.addEventListener('WebViewJavascriptBridgeReady', function() {
                cbk();
            }, false)
        }
    };

    config.getMapPluginInstalled = function(){
        var ua,
            map_plugin_installed = window.map_plugin_installed || window.map_plugin_110_installed;

        if(navigator.userAgent.indexOf('360map')>-1 || navigator.userAgent.indexOf('360shenbian')>-1 || navigator.userAgent.indexOf('360around')>-1&&!/.*Android.*360around \([2-9].*\)|.*Android.*360around \([1-9]\d*\.[5-9].*\)|.*Android.*360around \([1-9]\d*\.[4-9]\d*\.[1-9].*\)|.*Android.*360around \([1-9]\d*\.[4-9]\d*\.[0-9]\d*\.([2-9]\d{3,}|1[1-9]\d{2,}|10[1-9]\d|100[1-9])\)/.test(navigator.userAgent)){
            map_plugin_installed = true;
            ua = '360around';
        }

        return {
            plugin: map_plugin_installed,
            ua: ua
        }
    }

    config.makeSign = function(params){
        var keys = [];
        var params_str = [];
        var sn;

        for(var i in params){
            keys.push(i);
        }

        keys.sort();

        for(var i=0,l=keys.length;i<l;i++){
            var _key = keys[i];
            params_str.push(_key + '=' + params[_key]);
        }
        params_str.push('sk=b69ed2538337afa80dbb10e71814b152');

        params_str = params_str.join('&');
        
        sn = md5(params_str);
        return sn;
    };
    return config;
})
