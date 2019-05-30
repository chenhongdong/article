define(function(require) {
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').search;
    var service = {
        formatData: function(data, type, opts){

            opts = opts || {};
            type = type || '';

            var rich_type_text = {
                1: '餐饮',
                2: '电影院',
                3: '酒店',
                5: '购物',
                6: '汽车4S',
                8: '景点',
                9: '房产小区',
                10: '教育',
                11: '医院',
                12: '停车场',
                13: '剧场',
                14: '演出',
                15: '美容',
                16: '美发',
                17: '租车',
                18: 'KTV'
            };
            var cat_type_text = {
                2: '电影院',
                3: '餐馆',
                4: 'const',
                6: '洗浴',
                7: '休闲',
                8: '美容',
                9: '网吧',
                10: '茶馆',
                11: '咖啡馆',
                12: '滑雪场',
                13: '温泉',
                14: '农家乐',
                15: '游乐场',
                16: '足疗按摩',
                17: '面包甜点',
                18: '外卖',
                19: '棋牌室',
                20: '夜店',
                24: '社区商业类',
                25: '小区',
                30: '停车场',
                31: '酒店',
                32: '洗手间',
                33: '售票厅',
                34: '银行',
                35: '交通',
                36: '运动场馆',
                37: '文化场馆',
                38: '商场',
                39: '超市',
                40: '加油站',
                42: '医院',
                43: '景点'
            };

            var types = {
                    '1006':1,
                    '1000':1,
                    '1002':1,
                    '1007':1
                },
                rich_type2cat = {
                    1: 3,
                    2: 2,
                    3: 31,
                    5: 38,
                    8: 43,
                    9: 25,
                    11: 42,
                    12: 30,
                    13: 37,
                    14: 37,
                    15: 8,
                    16: 8,
                    18: 4
                },
                search_type = data.cond && data.cond['class'] || '',
                dataFrom = opts.dataFrom || '',
                mp = opts.mp && opts.mp.split(','),
                mso_x = mp && mp[1],
                mso_y = mp && mp[0];

            if(!types[type]){
                return;
            }

            if(!(data && data.poi)){
                return;
            }

            var poi = data.poi;

            if(!_.isArray(poi)){
                poi = [poi];
            }

            try{
                if(data.content.query_parse.sortDefaultType == '景点'){
                    data.is_rich = 'spot';
                }else if(data.content && data.content.query_parse && data.content.query_parse.engine_type_path && _.indexOf(data.content.query_parse.engine_type_path.split(","), "8") != -1){
                    data.is_rich = 'bank';
                }
            }catch(e){}

            //console.log(poi);
            _.forEach(poi, function(item){
                var tel = item.tel;
                var detail = item.detail || (item.detail = {});
                var room_from = detail.primary || 'ctrip';
                var source = detail.source || {};
                var rooms = source[room_from] && source[room_from].rooms || [];
                var book_hour = !!(source.youjianfang && source.youjianfang.rooms);
                var ordering_murl = detail.ordering_murl;
                var coupons = [];
                var rich_type = detail.rich_type || '';
                rooms = _.clone(rooms);
				var hotelname = item.name;
                var cat_news = item.cat_new_path && item.cat_new_path.split(',');

                //console.log('');
                //console.log(item.name);
                //console.log('cat：' + (item.cat ? item.cat + '('+ cat_type_text[item.cat] +')' : ' ') + ',rich_type：' + rich_type + '('+ rich_type_text[rich_type] +')');

                item.cat = item.cat || rich_type && rich_type2cat[rich_type];

                //新增类别
                if(cat_news && _.indexOf(cat_news,"111") != -1){
                    item.category = 'bus';
                }

                //ext字段默认赋值
                if(!item.ext){
                   item.ext = {};
                }

                //转为数字;
                item.cat = +item.cat;
                //过滤没有book_url的预定信息;
                _.forEach(rooms, function(item, index){
                    if(!item.book_url){
                        rooms.splice(index, 1);
                    }
                });

                //星级评分最高5分
                if(detail.avg_rating > 5){
                    detail.avg_rating = 5;
                }

                detail.primary = room_from;
                detail._rooms = rooms;
                detail._book_hour = book_hour;
                //酒店预订地址
				if(detail.book_url){
                	detail._book_url = location.origin+'/hotel/?hotelid='+So.urltojson(detail.book_url).hotelid+'&hotelname='+encodeURIComponent(hotelname);
				}
                //detail.has_deal = detail.has_deal && detail.deal_url;

                //优惠、团购暂时下线
                //detail.has_deal = 0;
                //detail.has_coupon = 0;
               //  var rich_filed_num = 0;
               //  var rich_fields = ['review_count','avg_price','avg_rating','hours','star','level','department','hotel_star'];
               //  _.forEach(rich_fields,function(field,index) {
               //     if(detail[field]){
               //          if(field == 'department'){
               //              if(detail.department['特色科室']){
               //                  rich_filed_num++;
               //              }
               //          }else{
               //               rich_filed_num++;
               //          }
               //     }
               //  });
               //  //if深度数据字段少于2个，就不要图片
               // //console.log(rich_filed_num,item.name)
               // if(dataFrom != 'homePage' && (!detail.rich_type || rich_filed_num < 2)){
               //      detail.photo_url = '';
               // }

               if(detail.coupons){
                    //酒店数据单独处理
                    if(detail.coupons[0]){
                        coupons = detail.coupons;
                    }else{
                        var promotions_src = {
                            'meituan': '美团',
                            'nuomi': '糯米',
                            'lashou': '拉手',
                            'dianping': '点评',
                            'maoyan': '猫眼'
                        };
                        _.forEach(detail.coupons, function(item, index){
                            _.forEach(item, function(promotion, key){
                                promotion.source_name = key;
                                promotion.src_name = promotions_src[key];

                                if(!promotion.name && promotion.title){
                                    promotion.name = promotion.title;
                                }

                                if(!promotion.murl && promotion.dealUrl){
                                    promotion.murl = promotion.dealUrl;
                                }

                                coupons.push(promotion);
                            });
                        });
                    }
                }

                _.forEach(coupons, function(coupon, index){
                    if((coupon.source_name == 'meituan' || coupon.source_name == 'maoyan') && coupon.coupon_id){
                        //coupons.splice(index, 1); //何捷需求美团不优先展示
                        coupon.murl = "//m.map.so.com/app/tuan?id=tuangou_"+ window.md5("meituan_" + coupon.coupon_id) +"&pguid="+ item.pguid +"&mso_x="+mso_x+"&mso_y="+mso_y+"&origin_url="+encodeURIComponent(coupon.murl);
                        //coupons.unshift(item); //何捷需求美团不优先展示
                    }
                });



                detail._coupons = coupons;

                //如果搜索有间房，责将price重置
                if(data.cond && data.cond.cate == "钟点房" && source.youjianfang && source.youjianfang.rooms && source.youjianfang.rooms[0] && source.youjianfang.rooms[0].price){
                    detail.avg_price = source.youjianfang.rooms[0].price;
                }


                //电话号码格式化，数据中有以空格、分号 两种形式分隔的
                item.tel = tel && tel.replace(/ /g, ';');
                item.detail = detail;

                //清除厕所的电话;
                if(search_type == '厕所'){
                    item.tel = '';
                }

                //大麦网补充字段
                if(detail.primary == "damai"){
                    if(detail.tickets&&detail.tickets.length>0){
                        _.forEach(detail.tickets,function(t){
                            t.book_url = "http://item.damai.cn/"+t.id+".html";
                        });
                    }
                    detail.source[detail.primary].site = "大麦网";
                    detail.source[detail.primary].ename = "damai";
                }
            });

            //data.business = {"东城区":["鼓楼","东四","王府井","和平里","东单","北京站","安定门","东直门","前门","广渠门","天坛","灯市口","景山","雍和宫","光明楼","法华寺","沙滩","永定门","海运仓","体育馆路","天安门","光明路"],"西城区":["后海","长椿街","南菜园","陶然亭","马连道","大观园","红莲","白纸坊","天桥","广安门","西直门","月坛","什刹海","西单","复兴门","牛街","广内大街","广外大街","宣武门","德外大街","六铺炕","展览路","金融街","积水潭","南礼士路","三里河","官园","西便门","德胜门","百万庄","西客站"],"朝阳区":["国贸","CBD","望京","双井","亚运村","常营","三里屯","首都机场","十八里店","北苑","十里堡","建外大街","大望路","朝外","朝阳公园","团结湖","左家庄","亮马桥","燕莎","太阳宫","劲松","潘家园","安贞","建国门","对外经贸","大屯","百子湾","花家地","水碓子","和平街","石佛营","小红门","高碑店","十里河","定福庄","来广营","东坝","工体","呼家楼","豆各庄","红庙","大山子","国展","小关","柳芳","四惠","西坝河","甜水园","垡头","朝阳门","建国路","朝阳路"],"丰台区":["莲花池","右安门","北大地","刘家窑","青塔","方庄","丽泽桥","草桥","木樨园","蒲黄榆","西罗园","丰台体育馆","世界公园","菜户营","卢沟桥","岳各庄","宋家庄","长辛店","花乡","马家堡","大红门","角门","南苑","赵公口","成寿寺","科技园区","东高地","云岗"],"石景山区":["广宁","金顶街","永乐","八大处","古城"],"海淀区":["西山","圆明园","车公庄","小西天","中关村","上地","五棵松","五道口","公主坟","万寿路","远大路","清河","学院路","清华大学","西三旗","苏州街","世纪城","人民大学","皂君庙","万泉河","知春路","牡丹园","马连洼","双榆树","白石桥","北下关","西北旺","马甸","花园路","永定路","颐和园","香山","万柳","北京大学","西苑"],"门头沟区":["大峪","东辛房","军庄","永定"],"房山区":["窦店","良乡","长阳","房山城关","迎风"],"通州区":["果园","梨园","新华大街","八里桥","北关","九棵树","潞城","马驹桥","乔庄","土桥","武夷花园","新华联","永顺","玉桥","张家湾","中仓","通州西门"],"顺义区":["光明","李桥","马坡","南彩","仁和","胜利","石园","建新"],"昌平区":["昌平","天通苑","百善","昌平","长陵","城南","马池口","南口","南邵","沙河","小汤山","兴寿","阳坊"],"大兴区":["黄村","旧宫","海子角","林校路","庞各庄","清源","同兴园","西红门","兴丰大街","兴华大街","兴业大街","大兴"],"怀柔区":["北房","怀北","九渡河","庙城","桥梓","泉河","汤河口","雁栖","杨宋"],"平谷区":["东高村","黄松峪","金海湖","刘家店","马昌营","王辛庄","兴谷","渔阳"],"密云区":[],"延庆区":[]};

        }
    };
    So.PoiService = {
        ajax: function(d, e, c) {
            var logInfo = {
                oprCategory: "search",
                oprCmd: c == 0 ? "searchKeyword" : "searchCenKey",
                status: "request",
                keyword: d.keyword
            };
            if (c == 0) {
                logInfo.city = d.citycode
            } else {
                logInfo.latlon = d.CenY + "," + d.CenX
            }
            var a = this;
            var server_url = config.ASS_SERVER;
            var server_url = (d.keyword == "违章高发地")?config.WZGF_SERVER:config.ASS_SERVER;
            if(d.keyword == "违章高发地"&&!d.mp){
                d.mp = "39.90,116.39";
            }
            //调试代码
            /*if(d.src=='hotspot'){
                d.force = '{"poiRedis":"10.172.193.80:6469:15","engine":"i1241.se.zzzc.qihoo.net:9965"}';
                server_url = 'http://10.138.80.172/wufangjin/t/map_engine_so_com_hotspot/api/simple.php?jsoncallback=?'
            }else{
                d.force = '{"poiRedis":"10.172.193.80:6469:15","engine":"i1241.se.zzzc.qihoo.net:9966"}';
            }*/
            $.ajax({
                url: server_url,
                async: true,
                type: "GET",
                dataType: "jsonp",
                jsonp: "jsoncallback",
                data: d,
                cache: false,
                success: function(data) {
                    if(data.keyword == "违章高发地"){
                        var jilv = ['高','低'];
                        for(var i in data.poi){
                            data.poi[i].isWzgfPoi = true;
                            if(!data.poi[i].name)data.poi[i].name = data.poi[i].address;
                            data.poi[i].wzCount = data.poi[i].times;
                            data.poi[i].wzJilv = (data.poi[i].times > 50)?'高':'低';
                            data.poi[i].wzDetail = data.poi[i].detail;
                            data.poi[i].detail = {};
                        }
                        for(i in data.poi){
                            if(!isNaN(data.poi[i].address))data.poi.splice(i,1);
                        }
                    }else{
                        //格式化数据
                        //console.log(data);
                        //console.log(d);
                        //console.log(d.dataFrom);
                        //console.log(d.mp);
                        service.formatData(data, d.sid, {dataFrom: d.dataFrom,mp : d.mp});
                    }
                    //////////////////////////////////////////////
                    if (data.status == "E0") {
                        logInfo.status = "success"
                    } else {
                        //alert(logInfo.status,'success',data.poi[0].wzCount);
                        logInfo.status = "fail";
                        logInfo.code = data.status
                    }
                    // if (d.sid != '1014') {
                        // monitor.pv(logInfo);
                    // }
                    a.invokeCallback(data, e)
                },
                error: function(h, g, f) {
                    logInfo.status = "fail";
                    logInfo.code = g;
                    //alert(logInfo.status,'error');
                    // if (d.sid != '1014') {
                        // monitor.pv(logInfo);
                    // }
                    a.invokeCallback({
                        status: "E1"
                    }, e)
                }
            })
        },
        invokeCallback: function(a, b) {
            a.poi = a.list || a.poi || [];
            a.totalcount = a.total || a.totalcount || a.poi.length;
            a = _.omit(a, "list", "total", "count");
            b(a)
        },
        poiHints: function(a, city, c) {
            var _city = So.State.getLocation();
            if(city && city.city){
                _city = {
                    city: city.city || ''
                }
                if(city.x && city.y){
                    _city.x = city.x;
                    _city.y = city.y;
                }
            }
            this.ajax({
                keyword: a,
                city: _city.city,
                cityname: _city.city,
                mp: _city.x && _city.y ? (_city.y+',' + _city.x) : '',
                sid: 1014,
                mobile: 1
            }, c)
        },
        poiDetail: function(a, b) {
            this.ajax({
                pguid: a,
                sid: 1006
            }, b)
        },
        poiHotspot: function(a, b) {
            this.ajax({
                pguid: a,
                src:'hotspot',
                source:7,
                version:1,
                ext:-1,
                sid: 1006
            }, b)
        },
        citySearch: function(keyword, city, page, count, callback, qii, cityname, opts) {
            opts = opts || {};
            var loc = So.State.getLocation(),
                cityid = opts.cityid,
                sort = opts.sort || '',
                range = opts.range || '',
                order = opts.order || '',
                filter = opts.filter || '',
                price = opts.price || '',
                star = opts.star || '',
                params = {
                    keyword: keyword,
                    city: city,
                    cityname: cityname || (!opts.mp ? loc.city : ''),//传了mp没传city时不传city，防止city跟mp不一致
                    cityid: cityid,
                    batch: page,
                    number: count,
                    sid: 1000,
                    ext:1,
                    qii: qii,
                    routePoint: opts.routePoint || '',
                    routeType: opts.routeType || 0,
                    routeSelectPOI: opts.routeSelectPOI || 0,
                    mp: opts.mp || '',
                    sort:sort || '',
                    range:range || '',
                    order:order || '',
                    filter:filter||'',
                    price: price||'',
                    star: star||'',
                    dataFrom: opts.dataFrom || '',
                    src: opts.src || '',
                    filter_adcode: opts.filter_adcode || '',
                    qc : opts.qc || '',
                    usermp: opts.usermp || '',
                    business_area: opts.business_area || '',
                    business_name: opts.business_name || '',
                    business_switch: 1,
                    address_aggregation: opts.address_aggregation || '1'
                };
            if(!_.isUndefined(opts.locality_id)){
                params.locality_id = opts.locality_id;
            }

            //是否请求广告
            if(opts.map_cpc){
                params.map_cpc = opts.map_cpc;
            }

            if(opts.qp){
                params.qp = opts.qp;
            }

            this.ajax(params, callback, 0);
        },
        //通过pguid查询制定结果;
        searchByIds: function(ids, callback, opts){
            opts = opts || {};
            var params = {
                'keyword': ids,
                'sid': '1007',
                'mp': opts.mp || '',
            };
            this.ajax(params, callback)
        }
    };
});
