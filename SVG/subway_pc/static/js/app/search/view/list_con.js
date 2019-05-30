define(function (require) {
    var liConfig = {
        url: '',
        catType: {
            catering: {
                tpl: require('../../../templates/search/list_rich/catering.html'),
                pic: '//p0.ssl.qhimg.com/d/inn/79a456da/typeImg/catering.png',
                showsupend: 1
            },
            hotel: {
                tpl: require('../../../templates/search/list_rich/hotel.html'),
                pic: '//p0.ssl.qhimg.com/d/inn/79a456da/typeImg/hotel.png',
                showsupend: 1
            },
            cinema: {
                tpl: require('../../../templates/search/list_rich/movie.html'),
                pic: '//p0.ssl.qhimg.com/d/inn/79a456da/typeImg/movie.png'
            },
            spot: {
                tpl: require('../../../templates/search/list_rich/viewpoint.html'),
                pic: '//p0.ssl.qhimg.com/d/inn/79a456da/typeImg/spot.png'
            },
            leisure: {
                tpl: require('../../../templates/search/list_rich/leisure.html'),
                pic: '//p0.ssl.qhimg.com/d/inn/79a456da/typeImg/ktv.png',
                showsupend: 1
            },            
            bus: {
                tpl: require('../../../templates/search/list_rich/bus.html')
            },
            community_biz: {
                showsupend: 1
            },
            ticket_office: {
                showsupend: 1
            },
            bank: {
                showsupend: 1
            },
            sport_ground: {
                showsupend: 1
            },
            mall: {
                showsupend: 1
            },
            market: {
                showsupend: 1
            },
            pethospital: {
                showsupend: 1
            },
        },
        groupbar: require('../../../templates/search/groupbar.html'),        
    };
    var poiConfig = {};
    var listObj = {
        getGroupCon: function (poi) {
            //团购与优惠信息
            var detail = '', groupInfo = '', grounInfoData = '', preferentialInfo = '', preferentialInfoData = '',barInfo='', dataInfo = [],
                tempTpl = liConfig.groupbar,cat= poi.cat||'';
            if (poi.detail) {
                detail = poi.detail;
                if (detail.has_deal && detail.coupons && !_.isEmpty(detail.coupons) && detail.coupons[0]) {
                    grounInfoData = detail.coupons[0];
                    groupInfo = (grounInfoData.name && !_.isEmpty(grounInfoData.name)) ? grounInfoData.name : grounInfoData.detail;
                    groupInfo = '[' + grounInfoData.discount + '折,¥' + grounInfoData.price + ']' + groupInfo;
                }
            //以下是三种惠的规则
                //海报最新优惠与优惠券
                if(detail.promotion && (detail.promotion.posters && !_.isEmpty(detail.promotion.posters) || detail.promotion.imgs && !_.isEmpty(detail.promotion.imgs))){
                    cat==3 && (preferentialInfo = '优惠券');
                    cat==39 && (preferentialInfo = '促销海报');
                }
                //刷卡优惠
                if (detail.card_offers && !_.isEmpty(detail.card_offers) && detail.card_offers[0]) {
                    preferentialInfoData = detail.card_offers[0];
                    preferentialInfo = preferentialInfoData.datasite + ',' + preferentialInfoData.detail;
                }
                groupInfo && dataInfo.push({
                    info:groupInfo,
                    icon:'<em class="icon iconTuan">团</em>'
                });
                preferentialInfo && dataInfo.push({
                    info:preferentialInfo,
                    icon:'<em class="icon iconSale">惠</em>'
                });
                !_.isEmpty(dataInfo) && (barInfo = So.View.template(tempTpl, {
                    data: dataInfo
                }));
            }
            return barInfo;
        },
        setPoi: function (poi) {
            var photoUrl = '//p0.ssl.qhimg.com/t011487c64c6bd93a71.png';
            poiConfig.pic && (photoUrl = (poi.detail && poi.detail.photo_url) ? poi.detail.photo_url : poiConfig.pic);
            poi.isBusLine = (poi.category === 'bus' && poi.busline && poi.busline.length > 0) ? true : false;
            poi.photoUrl = photoUrl;
            poi.isShowPic = !!poiConfig.pic;
            poi.isShowTwoLine = !!poiConfig.pic;
        },
        getTextCon: function (poi, data) {
            var content = poi.category && poiConfig.tpl || '';
            var textCon = So.View.template(content, {
                poi: poi,
                class_type: data.cond && data.cond['class'] || ''
            });
            return textCon;
        },
        getIconCon: function (list) {
            var groupCon = [];
            var interven = list.interven && JSON.parse(list.interven);
            var detail = list.detail || '';
            var iconHtml = {
                video: '<span class="icon iconVideo">直播</span>',
                kitchenVideo: '<span class="icon iconKitchenVideo">明厨亮灶</span>',
                tuan: '<span class="icon iconTuan">团</span>',
                hui: '<span class="icon iconSale">惠</span>',
                seat: '<span class="icon iconSeat">座</span>',
                fan: '<span class="icon iconFan">返</span>',
                pai: '<span class="icon iconPai">排</span>',
                ding: '<span class="icon iconDing">订</span>',
                hours24: '<span class="icon iconHhours24">24小时</span>',
                atm: '<span class="icon iconAtm">ATM</span>',
                lobby: '<span class="icon iconLobby">营业厅</span>',
                yanchu: '<span class="icon iconYanchu">演出</span>',
                huodong: '<span class="icon iconHuodong">活动</span>',
                wai: '<span class="icon iconWai">外</span>',
                piao: '<span class="icon iconPiao">票</span>',
                zong: '<span class="icon iconZong">钟</span>',
                bus: '<span class="icon iconOrange">班车</span>',
                indoorMap: '<span class="icon iconOrange">室内图</span>',
                guahao: '<span class="icon iconOrange">挂号</span>',
                dao: '<span class="icon iconDao">导</span>',
                zuche: '<span class="icon iconLobby">租车</span>',
                suspend: '<span class="icon iconSuspend">已关闭</span>', //店铺已关闭
                etcp: '<span class="icon iconETCP">ETCP停车</span>',
                road: '<span class="icon iconRoad">道路</span>'
            };
            if(interven && interven.tips){
                groupCon.push('<span class="icon iconTips">'+interven.tips+'</span>');
            }else{
                //36:sport_ground  37:culture 43:spot  可能会显示演出与活动的icon
                var isActivity = _.contains([36,37,43], list.cat);
                //不显示订的icon cat
                var isNoShowDing = _.contains([36,24,34,39,40,37,25,7,43], list.cat);
                //不显示座的icon cat
                var isNoShowSeat = _.contains([31,38,39,0,36,37,25,7], list.cat);
                //不显示排的icon cat
                var isNoShowPai = _.contains([38,24,7,0,37], list.cat);
                //不显示票的icon cat
                var isNoShowPiao = _.contains([37], list.cat);
                //不显示钟的icon cat
                var isNoShowZong = _.contains([25], list.cat);

                //已关闭
                //list.suspend && poiConfig.showsupend && groupCon.push(iconHtml.suspend);

                list.category === 'bank' && (/自动提款机|atm/.test(list.type.toLowerCase())) && groupCon.push(iconHtml.atm);
                list.category === 'bank' && /营业厅/.test(list.type) && groupCon.push(iconHtml.lobby);

                (detail && detail.hospital_register_url || detail && detail.hospital_register_url_wap) && groupCon.push(iconHtml.guahao);
                detail && detail.guide_url && groupCon.push(iconHtml.dao);

                detail && detail.rooms_can_book && groupCon.push(iconHtml.ding);               

                detail && detail.movies && detail.movies[0] && detail.movies[0]['online_seat'] == 1 && groupCon.push(iconHtml.seat);
                
                detail && detail.is_can_booking && groupCon.push(iconHtml.piao);

                detail && detail.has_deal && groupCon.push(iconHtml.tuan);

                list.geoType && list.geoType == 'road' && groupCon.push(iconHtml.road);
                
            }
            //this.getIndoorMapIcon(list) && groupCon.push(iconHtml.indoorMap);
            list.groupIconHtml = groupCon.join('');
        },
        getIndoorMapIcon:function(list){
            //So.Gcmd.cmd({id:9,index:0})
            return (list.ext && (list.ext.bid || list.ext.buildid)) ? true : false;
        },
        getZongIcon:function(detail){
            var currentHours = parseInt((new Date()).getHours()),
                timeOut = (currentHours >=18 || currentHours < 8) ? false : true,
                isShowZongIcon = (timeOut && detail.source && detail.source.youjianfang) ? true : false;
            return isShowZongIcon;
        },
        getBoxType:function(poi){
            //cat:32为厕所  如果是厕所时样式改变
            poi.boxType = poi.cat=='32' ? 'wc' : 'default';
        },
        initList: function (poi, data) {
            var category = poi.category || '';
            poiConfig = category && liConfig.catType[category] || {};

            this.setPoi(poi);
            this.getIconCon(poi);
            this.getBoxType(poi);
        
            return this.getTextCon(poi, data);
        },
        getListItemCon:function(poi,data){
            return {
                twoLineInfo: this.initList(poi, data),
                barInfo: this.getGroupCon(poi)
            }
        }
    };
    return listObj;
});
