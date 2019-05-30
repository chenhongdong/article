define(function(require,exports,module){

     var E = require('js/nearby_app_orders/event'),
         config = require('js/nearby_app_orders/config'),
         et = config.eventType;

     var pguid = "",id="";
     var tmp,position = {mso_y:0,mso_x:0,mcity:"北京"};

     var d = {};

     var type_map = {
                    'order_center_meiwei' : ['12',''],//美味不用等
                    'order_center_meituan' : ['11,41',''],//美团、糯米
                    'order_center_shangmen' : ['67,28,10,16,15,14,23,24,13,22,25,18,21,30,19,32,33,38,40,44,45,50,51,52,54,53,56,57',''],
                    'order_center_reserve' : ['26','order_center_other'],//订餐
                    'order_center_cinema' : ['35,60','order_center_other'],//格瓦拉,猫眼
                    'order_center_hotel' : ['34,17','order_center_other'],//艺龙、有间房
                    'order_center_gift' : ['39','order_center_other'],//一元拍将
                    'order_center_spot' : ['31','order_center_other'],//携程
                    'order_center_waimai' : [0,'order_center_other'],//外卖
                    'order_center_thing' : [0,'order_center_other'],//实物
                    'order_center_coupon' : [0,'order_center_other']//收藏
                };
      var service_url_map = {
        'order_center_cinema' : {list:config.service_url+'/gewara/listOrder',detail:config.service_url+'/gewara/orderDetail'},
        'order_center_spot' : {list:config.service_url+'/ticket/listOrder'},
        'order_center_hotel' : {list:config.service_url+'/order/perList',
                                detail:config.service_url+'/elong/orderView',
                                cancel:config.service_url+"/elong/ordercancel"},
        'order_center_gift' : {
            list:'',
            detail:''
        },
        'order_center_coupon':{
            list : config.service_url+'/favorites/getlist',
            del : config.service_url+'/favorites/delete'
        },
        'order_center_reserve' : {
            list : config.service_url+'/xiaomishu/orderList',
            cancel : config.service_url+'/xiaomishu/orderCancel',
            detail : config.service_url+'/xiaomishu/orderInfo'
        }
      }

    module.exports = {
        init:function(token){
            E.subscribe(et.doGetInfo,hanldeInfo);
            E.subscribe(et.doPaihao,getPaihao);
            E.subscribe(et.cancelPaihao,doCancel);
            E.subscribe(et.doCheckOrder,doCheckOrder);
            E.subscribe(et.doCancelAction,doCancelAction);
            E.subscribe(et.doGetMoreItem,doGetMoreItem);
            E.subscribe(et.doDelFav,doDelFav);

            var p = (window.location.host.indexOf('haosou')>-1)?'haosou.com':'so.com';

            if($.cookie('__guid')){
                var tmp = $.cookie('__guid');
                $.removeCookie('__guid');
                $.cookie('__guid',tmp,{expires:365,path:'/',domain: p,secure: false,raw:false});
            }

            QHPass._hostCurr = p;
            //QHPass.resConfig.reloadAfterLogout = false;
        },
        shanghuList : function(){return type_map;}
    };
    function doGetService(t){
        $.ajax({
            type:"GET",dataType:"jsonp",
            url:t.url+t.detail,
            jsonp:"callback",
            success:function(data){
                
                t.cb(data);
            },
            error:function(){
                config.alert('接口故障');
                window.history.back();
            }
        });
    }

    function doDelFav(d){

        if(!d.ids)return;

        switch(d.type){
            case 'order_center_coupon':
                var detail = "?param="+d.ids;
                handleFav({action:'del',detail:detail});
            break
        }
    }
    function handleFav(data){

        var url = service_url_map['order_center_coupon'][data.action],
            detail = data.detail||"";

        $.ajax({
            type:'GET',dataType:'jsonp',
            jsonp:"callback",
            url:url + detail,
            success:function(d){
                if(d.errno == -9){
                    config.checkLogin(function(data){});
                    return;
                }
                if(d.errno){
                    config.alert('数据有误，请稍后重试!');
                    window.history.back();
                    return;
                }
                if(data.action == 'list'){
                    var list = [];
                    for(var i=0,len=d.data.length;i< len;i++){
                        var item = d.data[i];

                        if(item.type == '1'){
                            item.type = 'tuangou';
                            item.title = item['coupon'].poi_name||'未知地点';
                            item.detail = item['coupon'].detail||'暂无详情';
                            item.price = item['coupon'].price||0;
                            item.op = item['coupon'].market_price||0;
                            item.zhe = item['coupon'].discount||0;
                            item.url = item['coupon'].murl_q||null;
                            item.img_url = item['coupon'].photo_url||null;
                            item.itemId = item.id+'-1-'+item.pguid+'-'+item.coupon_id;
                        }else if(item.type == '2'){
                            item.type = 'didian';
                            item.pguid = item['poi'].pguid||0;
                            item.title = item['poi'].name||'未知地点';
                            item.city = item['poi'].city||'未知城市';
                            item.area = item['poi'].area||0;
                            item.itemId = item.id+'-2-'+item.pguid;
                        }
                        list.push(item);
                    }
                    E.fire(et.didGotInfo,{scene:'order_center_other',type:'order_center_coupon',list:list});
                }else if(data.action =='del'){
                    E.fire(et.didDelFav,{});
                }
            },
            error:function(){
                config.alert('接口故障');
                window.history.back();
            }
        });
    }
    function hanldeInfo(data){
        switch(data.scene){
            case "meiwei_order":
            var id = config.getQueryString('id')||0,
                pguid = config.getQueryString('pguid')||0;
                if(!id||!pguid){config.alert('缺少pguid或者商户id');return;}
                /*if(config.checkUA() == 'a')JTN.getNative("getWebName",{"param":"排队取号"});*/
                doGetPosition(function(){
                    getBizInfo({scene:data.scene,id:id,pguid:pguid});
                });
            break;
            case "meiwei_order_suc":
                if(config.getQueryString('debug')){
                    E.fire(et.didGotInfo,{scene:'meiwei_order_suc',errno:2});
                    return;
                }
                if(!tmp){
                    config.alert('无订单数据');
                    window.history.back();
                    return;
                }
                tmp.scene = data.scene;
                E.fire(et.didGotInfo,tmp);
            break;
            case "order_center_reserve":
                config.checkLogin(function(){
                    var type_scene = "order_center_other";
                    if(config.getQueryString('id')){
                        getReserveDetail({d_id:config.getQueryString('id'),scene:type_scene,type:"order_center_reserve"});
                    }else{
                        var url = null;
                        if(service_url_map[data.scene]['list']){
                            url = service_url_map[data.scene]['list'];
                        }
                        getReserveList({p_id:'26',scene:type_scene,type:'order_center_reserve',url:url});
                    }   
                });
            break;
            case "order_center_spot":
            case "order_center_cinema":
            case "order_center_meiwei":
            case "order_center_meituan":
            case "order_center_shangmen":
            case "order_center_hotel":
            case "order_center_waimai":
            case "order_center_thing":
            case "order_center_gift":

                var type_scene = type_map[data.scene][1]?type_map[data.scene][1]:data.scene,
                    type_id = type_map[data.scene][0];

                var me_scene = data.scene;

                config.checkLogin(function(){
                    if(type_scene == "order_center_other"){
                        if(config.getQueryString('id')){
                            getDetail({d_id:config.getQueryString('id'),scene:type_scene,type:data.scene});
                        }else{
                            var url = null;
                            if(service_url_map[data.scene]){
                                url = service_url_map[data.scene]['list'];
                            }
                            getList({p_id:type_id,scene:type_scene,type:data.scene,url:url});
                        }
                    }else{
                        getList({p_id:type_id,scene:type_scene});
                    }
          		  });
            break;
            case "serviceForLife":
            case "order_center":
            case "user_panel":
                E.fire(et.didGotInfo,{scene:data.scene});
            break;
            case "order_center_coupon":
                handleFav({action:'list'});
            break;
            case "order_center_ticket":
                getUserTickets({scene:data.scene})
            break;
            default://所有上门和便民服务的sub直接跳转
                if(data.scene.indexOf('service_')||data.scene.indexOf('shangmen_')){
                  getList({p_id:0,scene:"order_center_other",type:data.scene,url:null});
                  return;
                }
                try{
                    window.history.replaceState('/orders/#scene='+config.mainPage);
                }catch(e){
                    window.location.replace('/orders/#scene='+config.mainPage);
                }
                // console.log('没有对应scene的处理信息，proxy - hanldeInfo');
            break;
        }
    }
    function getReserveDetail(data){
        if(!type_map[data.type][0]){
            E.fire(et.didGotInfo,{scene:data.scene,type:data.type,isDetail:1,item:{}});
            return;
        }
        var url = service_url_map[data.type]['detail'],
            detail = "?orderid="+config.getQueryString('id');

        doGetService({url:url,detail:detail,cb:function(d){
            if(d['orderInfo'].errno == -9){
                config.checkLogin(function(data){});
                return;
            }
            if(d['orderInfo'].errno){
                config.alert('数据有误，请稍后重试!');
                window.history.back();
                return;
            }
            d.scene = data.scene;
            d.type = data.type||"";
            if(d['orderInfo'].errno!= 0){
              E.fire(et.didGotInfo,d);
              return false;
            }
            try{
                var item = d['orderInfo'].data;
                item['OrderID']=item['OrderID']||'未知ID';
                item['StatusIns']=item['StatusIns']||'未知状态';
                item['title']=(item['POrder']&&item['POrder']['xiaomishu']&&item['POrder']['xiaomishu']['title'])||'未知餐厅';
                item['sDinningTime']=(item['POrder']&&item['POrder']['xiaomishu']&&item['POrder']['xiaomishu']['sDinningTime'])||'未知时间';
                item['nPeopleCount']=(item['POrder']&&item['POrder']['xiaomishu']&&item['POrder']['xiaomishu']['nPeopleCount'])+'人'||'未知人数';
                item['people']=(item['POrder']&&item['POrder']['xiaomishu']&&item['POrder']['xiaomishu']['sBookName'])||'未知';
                if(item['POrder']&&item['POrder']['xiaomishu']&&item['POrder']['xiaomishu']['sBookSex']){
                    item['people']+=item['POrder']['xiaomishu']['sBookSex'];
                }
                item['sBookMobile']=(item['POrder']&&item['POrder']['xiaomishu']&&item['POrder']['xiaomishu']['sBookMobile'])||'未知';
                item['OrderStatus']=(item['POrder']&&item['POrder']['xiaomishu']&&item['POrder']['xiaomishu']['OrderStatus'])||0;
                E.fire(et.didGotInfo,{scene:data.scene,type:data.type,isDetail:1,item:item});
            }catch(err){
                E.fire(et.didGotInfo,d);
            }
        }});
    }
    //订餐小秘书单独一个取list的方法
    function getReserveList(data){

        if(!data.p_id){
            E.fire(et.didGotInfo,{scene:data.scene,type:data.type||0});
            return;
        }

        var url = data.url||config.service_url+"/order/perList";
        var cp = data.cp||config.getQueryString('cp')||1;
        var detail = "?p_id="+data.p_id+"&pageno="+cp;

        doGetService({url:url,detail:detail,cb:function(d){
            if(d['orderListri'].errno == -9){
                config.checkLogin(function(data){});
                return;
            }
            if(d['orderListri'].errno){
                config.alert('数据有误，请稍后重试!');
                window.history.back();
                return;
            }
            d.scene = 'order_center_other';
            d.type = 'order_center_reserve';
            d.list = [];
            try{
                for(var i =0,len = d['orderListri'].data.list.length;i < len;i++){

                    var item = d['orderListri'].data.list[i];

                    if(typeof(item)!='object')continue;

                    item['OrderID']=item['OrderID']||'未知ID';
                    item['StatusIns']=item['StatusIns']||'未知状态';
                    item['title']=(item['POrder']&&item['POrder']['title'])||'未知餐厅';
                    item['sDinningTime']=(item['POrder']&&item['POrder']['sDinningTime'])||'未知时间';
                    item['nPeopleCount']=(item['POrder']&&item['POrder']['nPeopleCount'])+'人'||'未知人数';
                    item['updatetime']=item['PlayTime']||'未知时间';

                    d.list.push(item);
                }
                d.cp = d.tp = 1;
                if(d['orderListri'].data['page']){
                    d.cp = d['orderListri'].data['page']['PageNo'];
                    d.tp = Math.ceil(d['orderListri'].data['page']['Total']/10);
                }
                if(data.loadMore){
                    E.fire(et.didGotMoreItem,d);
                }else{
                    E.fire(et.didGotInfo,d);
                }
            }catch(e){
                console.log(e);
                E.fire(et.didGotInfo,d);
            }

        }});
    }
    //获取详情
    function getDetail(data){
        if(!type_map[data.type][0]){
            E.fire(et.didGotInfo,{scene:data.scene,type:data.type,isDetail:1,item:{}});
            return;
        }
        var url = service_url_map[data.type]['detail'],
            detail = "?order_id="+config.getQueryString('id');

        switch(data.type){//格瓦拉 用的orderid 艺龙用的order_id
            case "order_center_cinema":
            detail = "?orderid="+config.getQueryString('id');
            break;
        }

        doGetService({url:url,detail:detail,cb:function(d){
            if(d.errno == -9){
                config.checkLogin(function(data){});
                return;
            }
            if(d.errno){
                config.alert('数据有误，请稍后重试!');
                window.history.back();
                return;
            }
            d.scene = data.scene;
            d.type = data.type||"";
            if(d.errno!= 0){
              E.fire(et.didGotInfo,d);
              return false;
            }
            try{
                eval("var item = "+ d.data['p_order']);
                item.updatetime = d.data['update_time'];
                item.p_id = d.data['p_id']||"-1";
                item.order_id = d.data['id'];
                item.p_status = d.data['p_status']||"200";
                item.scene_type = d['type'];

                switch(item.p_id){
                    case '34'://艺龙
                    item.p_status_show = item.p_status_show||"";
                    item.bid = item.OrderId||'0';
                    item.price = item.TotalPrice||'0';
                    item.haveBreakfast = 0;
                    if(item.OrderDetail){
                        item.h_name = item.OrderDetail.HotelName||'未知酒店名称';
                        item.r_name = item.OrderDetail.Rooms.Name||'未知房型';
                        if(item.OrderDetail.Rooms&&item.OrderDetail.Rooms.RatePlans){
                            item.haveBreakfast = item.OrderDetail.Rooms.RatePlans.RatePlanName||0;
                        }
                    }
                    item.who = '未知姓名';
                    item.phone = '未知号码';
                    if(item.Contact){
                        item.who = item.Contact.Name||item.who;
                        item.phone = item.Contact.Mobile||item.phone;
                    }
                    item.LatestArrivalTime = item.LatestArrivalTime||'0';
                    item.CancelTime = item.CancelTime||'0';
					if(item.CancelTime&&item.CancelTime!='0'){
                        if(/-/g.test(item.CancelTime)){
                            item.CancelTime = item.CancelTime.replace(/-/g,'/');
                        }
                        var cTime = new Date(item.CancelTime);
                        item.CanCancel = (cTime.getTime()>new Date().getTime())?'1':'0';
					}else{
                        item.CanCancel = '0';
                    }
                    break;
                    case '35'://格瓦拉
                    item.detail_state = d.data['step']||'timepast';
                    item.last_time_tmp = item['Gewara']['validtime']||'0';
                    item.movie_name = item['Gewara']['moviename']||'未知电影名称';
                    item.order_time = item['Gewara']['playtime']||'未知时间';
                    item.cinema_name = item['Gewara']['cinemaname']||'未知影院名称';
                    item.room_id = item['Gewara']['roomname']||'未知播放厅';
                    item.seat_id = item['Gewara']['seat']||'未知座位号';
                    item.unit_price = item['Gewara']['unitprice']||'0';
                    item.num = item['Gewara']['quantity']||'0';
                    item.total_price = item['Gewara']['totalAmount']||'0';
                    item.bid = d.data['id']||'0';
                    item.address = d.data['address']||'未知地址';
                    item.locationUrl = d.data['locationUrl']||'0';
                    item.tel = item['Gewara']['mobile']||'未知手机号码';
                    item.sid = item['Gewara']['tradeno']||'0';
                    item.vid = d.data['checkpass']||'0';
                    item.pic_url = d.data['logo']||'';
                    item.servicetel = d.data['servicetel']||'0';
                    item.can_payback = '0';//没有退款功能
                    item.payback_progress = '0';//没有退款进度

                    item.pft_price = (d.data.pft_price&&d.data.pft_price!='0')?d.data.pft_price:0;
                    item.price = d.data.price||0;
                    item.fanbu = 0;

                    if(item.pft_price&&item.pft_price != item.price){
                        item.fanbu = item.price - item.pft_price;
                    }

                    if(item.last_time_tmp){

                        var f = item.last_time_tmp;

                        if(/-/g.test(item.last_time_tmp)){
                            f = item.last_time_tmp.replace(/-/g,'/');
                        }

                        var vd = new Date(f),cd = new Date();
                        if(vd.getTime() > cd.getTime()){
                            var v_d = vd.getDate() - cd.getDate();
                            v_d = (v_d < 0)?0:v_d;
                            var v_h = v_d * 24 + vd.getHours() - cd.getHours();
                            var v_m;
                            if(vd.getMinutes() >= cd.getMinutes()){
                                v_m = vd.getMinutes() - cd.getMinutes();
                            }else{
                                v_h--;
                                v_m = 60 + vd.getMinutes() - cd.getMinutes();
                            }
                            item.last_time = v_h+'小时'+v_m+'分钟';
                        }else{
                            item.last_time = '0';
                        }
                    }

                    break;
                }
                E.fire(et.didGotInfo,{scene:data.scene,type:data.type,isDetail:1,item:item});
            }catch(err){
                // console.log(err);
                E.fire(et.didGotInfo,d);
            }
        }});
    }
    function doGetMoreItem(data){

        if(!data.scene||!type_map[data.scene]||!data.cp)return;

        var url = (service_url_map[data.scene]&&service_url_map[data.scene]['list'])||config.service_url+"/order/perList",
            cp = data.cp+1,
            p_id= type_map[data.scene][0],
            scene = data.type||data.scene,
            type = data.scene;//data.type||null;

        if(data.scene == 'order_center_reserve'){
            getReserveList({url:url,p_id:p_id,cp:cp,loadMore:true,scene:scene,type:type})
        }else{
            getList({url:url,p_id:p_id,cp:cp,loadMore:true,scene:scene,type:type});
        }
    }
    //获取列表
    function getList(data){

        if(!data.p_id){
            E.fire(et.didGotInfo,{scene:data.scene,type:data.type||0});
            return;
        }

        var url = data.url||config.service_url+"/order/perList";
        var cp = data.cp||config.getQueryString('cp')||1;
        var detail = "?p_id="+data.p_id+"&page_no="+cp;
        if(data.p_id == 12){//美味不用等过滤状态10000
          detail+="&p_status=10000&p_status_op=!";
        }
        if(data.p_id == '34,17'){//艺龙有间房过滤状态1000
            detail+="&p_status_op=!&p_status=1000";
        }
        doGetService({url:url,detail:detail,cb:function(d){
            if(d.errno == -9){
                config.checkLogin(function(data){});
                return;
            }
            if(d.errno){
                config.alert('数据有误，请稍后重试!');
                window.history.back();
                return;
            }
            d.scene = data.scene;
            d.type = data.type||"";
            d.list = [];
            try{
                for(var i =0,len = d.data.data.length;i < len;i++){

                    if(!d.data.data[i]['p_order'])continue;

                    // eval("var item = "+ d.data.data[i]['p_order']);
                    var item = JSON.parse(d.data.data[i]['p_order']);

                    if(typeof(item)!='object')continue;

                    item.updatetime = d.data.data[i]['update_time'];
                    item.p_id = d.data.data[i]['p_id']||"-1";
                    item.p_status = d.data.data[i]['p_status']||"200";
                    item.sinfo = item['sinfo']||null;
                    item.u_addr = item['u_addr']||null;
                    item.marktype = item['marktype']||null;
                    item.smType = "已下线服务商";

                    item.price = item['price']||'0';
                    item.p_status_show = item.p_status_show||null;

                    if(config.tid_map[item.p_id]){
                        item.smType = config.tid_map[item.p_id]['n'];
                    }

                    switch(item.p_id){
                        case "30":
                            item.cartype = item.cartype||'未知车型';
                            item.gearbox = item.gearbox||'未知';
                            item.timelength = item.timelength||0;
                        break;
                        case "32":
                            item.b_otime = item.b_otime||'未知';
                        break;
                        case "11"://美团，糯米
                            item.bid = d.data.data[i]['bid'];
                            item.price = d.data.data[i]['price'];
                            item.type = '美团';
                            item.state = null;
                            item.order_id = item.orderid||'未知id';
                            item.quantity = item.quantity||'未知数量';
                            item.smstitle = item.smstitle||'未知项目';
                        break;
                        case '41':
	                        var status = {'100':'下单成功','202':'付款成功','300':'消费完成','402':'退款成功'};
                            item.type = '糯米';
                            item.smstitle = item['short_title']||'未知项目';
                            item.quantity = item['count']||'未知数量';
                            item.price = item['price']||'0';
                            item.stat_num = d.data.data[i]['status']||'100';
							item.state = status[d.data.data[i]['status']]||status['100'];
                        break;
                        case "33":
                            item.goods_name = item.goods_name||'未知';
                            item.u_addr = item.u_addr||'未知地址';
                            item.goods_code = item.goods_code||'未知';
                        break;
                        case "10":
                            item.smstitle = "代驾服务";
                            item.partner_name = item.partner_name||'未知';
                            item.pft_price = item.pft_price||'0';
                        break;
                        case "15":
                            item.smstitle = "美容服务";
                        break;
                        case "16":
                            item.smstitle = "点到按摩";
                            item.sqid = d.data.data[i]['sqid'];
                        break;
                        case "18":
                            item.uid = hex_md5_fix(item.uid);
                        break;
                        case "21":
                            item.qt = d.data.data[i].sqid+"_"+d.data.data[i].token+"_0";
                            item.cq = hex_md5_fix("d470d951c53e1206746abbc55ca732b4"+item.bid);
                            item.hospital_name = item.hospital_name||'未知医院';
                            item.room = item.room||'未知科室';
                            item.doctor_name = item.doctor_name||null;
                        break;
                        case "28":
                            item.qid = d.data.data[i].sqid;
                            item.ordertime = item.ordertime||'未知';
                            item.total_fee = item.total_fee||'0';
                        break;
                        case "19":
                            item.price = item.b_price||'0';
                            item.b_otime = item.b_otime||'未知';
                        break;
                        case "17":
                            item.smType = "有间房";
                            item.NumberOfRooms = item.NumberOfRooms||'0';
                            item['h_name'] = item['h_name']||'未知酒店';
                            item['r_name'] = item['r_name']||'未知房型';
                        break;
                        case "34":
                            item.smType = "艺龙";
                            item.p_status_show = item.p_status_show||"";
                            item.bid = d.data.data[i].id||'0';
                            item.price = item.TotalPrice||'0';
                            item.h_name = '未知酒店名称';
                            item.r_name = '未知房型';
                            item.elongId = item.OrderId||'0';
                            item.NumberOfRooms = item.NumberOfRooms||'0';
                            if(item.OrderDetail){
                                item.h_name = item.OrderDetail.HotelName||'未知酒店名称';
                                if(item.OrderDetail.Rooms){
                                    item.r_name = item.OrderDetail.Rooms.Name||'未知房型';
                                }
                            }
                        break;
                        case "31"://携程
                            item.price = d.data.data[i].amount;
                            item.step = d.data.data[i].step;
                            item.usedate = d.data.data[i].usedate;
                            item.bid = d.data.data[i].id;
                            item.payinfo = d.data.data[i].status;
                            item['t'] = '未知活动';
                            if(item['XieChengData']&&item['XieChengData']['TICKET_INFO']){
                                item['t'] = item['XieChengData']['TICKET_INFO']['name']||item['t'];
                            }
                            item['p_state'] = item.step;
                            item['date'] = item.usedate;
                        break;
                        case "35"://格瓦拉
                            item.state = d.data.data[i].step;
                            item.title = item['Gewara']['moviename']||'未知电影名称';
                            item.num = item['Gewara']['quantity']||'未知数量';
                            item.playtime = item['Gewara']['playtime']||'未知时间';
                            item.cname = item['Gewara']['cinemaname']||'未知影院名称';
                            item.sid = item['Gewara']['tradeno']||'0';
                            item.vid = d.data.data[i]['checkpass']||'0';
                            item.bid = d.data.data[i].id;
                        break;
                        case "60":
                            item.title = item['smstitle']||'未知电影名称';
                            item.num = item['quantity']||'1';
                            item.cname = item['cinemaname']||'未知影院名称';
                            var sid = d.data.data[i].sid||0,
                                u = "http://i.meituan.com/order/view/"+d.data.data[i].bid||0+"?/nodown&webview",
                                url = "http://r.union.meituan.com/url/visit/"+
                            "?a=1&key=22646fa1b3bde0cc63b49c128b43173a145&sid="+sid+"&url="+u;
                            item.detail_url = url;
                        break;
                        case "39"://一元拍
                            item.sinfo = item.sinfo||'未知信息';
                            item.pay_url = item.pay_url||null;
                            item.title = '一元拍奖';
                            item.address =  item.u_addr||'未知地址';
                            item.price = item.price||'0';
                            item.goods_code = item.goods_code||'0';
                        break;
                        case "50"://点秒手
                            item.price = item.price||'0';
                        break;
                        case "44"://短租
                            item.price = item.Price||'0';
                            item.goods_name = item.goods_name||'未知服务项目';
                        break;
                        case "45"://宵夜
                            item.price = item.price||'0';
                        break;
                        case "51"://宠时代
                            item.goods_name = item.goods_name||'未知服务项目';
                        break;
                        case "56":
                        case "57":
                            item.orderdetail_url = item.orderdetail_url||'javascript:void(0);';
                        break;
                        default:
                        break;
                    }
                    d.list.push(item);
                }
                d.cp = d.tp = 1;
                if(d.data['page']){
                    d.cp = d.data['page']['cur_page_no'];
                    d.tp = Math.ceil(d.data['page']['total_cnt']/10);
                }
                if(data.loadMore){
                    E.fire(et.didGotMoreItem,d);
                }else{
                    E.fire(et.didGotInfo,d);
                }
            }catch(e){
                // console.log(e);
                // alert(e);
                E.fire(et.didGotInfo,d);
            }

        }});
    }
    // 获取用户优惠券信息
    function getUserTickets(data) {
      $.ajax({
        type:'GET',
        dataType:'jsonp',
        jsonp: 'callback',
        url: config.service_url+'/coupon/getUserList?ufrom=c',
        data: {
          Q: $.cookie('Q'),
          T: $.cookie('T'),
          page: 1,
          page_size: 10
        },
        success:function(d){
          if(d.errno == -9){
            config.checkLogin(function(data){});
            return;
          }
          if(d.errno){
            config.alert('数据有误，请稍后重试!');
            window.history.back();
            return;
          }
          var ticketList = d.data || [];
          if(ticketList.length){
            ticketList.sort(function (opt1,opt2) {
                return new Date(opt2.end_time) - new Date(opt1.end_time);
            }).sort(function (opt1, opt2) {
                if(opt1.status === 9) return 1
                return 0;
            });
          }
          E.fire(et.didGotInfo,{scene:'order_center_other',type:'order_center_ticket',list:ticketList});
        }
      });
    }
    //以下为美味不用等相关的服务
    function doCheckOrder(data){
        var url = config.service_url+"/meiweipai/usrqueue",
            detail = "?order_id="+data.order_id;
        doGetService({url:url,detail:detail,cb:function(d){
            tmp = d;
            /*if(tmp.errno == 2||tmp.errno == 3){
                JTN.getNative("getWebName",{"param":tmp.errmsg});
            }*/
            E.fire(et.didCheckOrder,d);
        }});
    }
    function doCancelAction(data){
        var url = service_url_map[data.scene]['cancel'],
            order_id = data.order_id;
        if(!url||!order_id){
            config.alert('取消订单服务失败');
            return false;
        }
        var detail = "?OrderId="+order_id;
        switch(data.scene){
            case 'order_center_reserve':
                detail = "?orderid="+order_id;
            break;
        }
        doGetService({url:url,detail:detail,cb:function(d){
            if(d.errno == 0){
                E.fire(et.didCancelOrder,d);
            }else{
                config.alert(d.errmsg||'取消订单失败');
            }
        }});
    }
    function doCancel(data){
        var url = config.service_url+"/meiweipai/cancel";
        var detail = "?order_id="+data.order_id+"&serialid="+data.serialid;
        doGetService({url:url,detail:detail,cb:function(d){
            if(d.errno == 0){
                var h = (config.checkUA() == 'b')?"mso_wap_":"mso_app_";
                if(config.checkUA() == 'h'){
                    h = "haosou_app_";
                }
                monitor.log({
                    mod: h+'around_meiwei_order',
                    type: 'orderCancel'
                },'disp');
                E.fire(et.didCancelPaihao,d);
            }else{
                config.alert('取消订单失败');
            }
        }});
    }
    function doGetPaihao(data){
        doGetPosition(function(){
            getPaihao(data);
        });
    }
    function getPaihao(data){
        var url = config.service_url+"/meiweipai/req";
        var detail = "?pguid="+pguid+"&pai_biz_id="+id+"&mso_x="+position.mso_x+"&mso_y="+position.mso_y;
        detail += "&mobile="+data.phone+"&pnum="+data.num;
        doGetService({url:url,detail:detail,cb:function(d){
            tmp = d;
            /*if(tmp.errno == 2||tmp.errno == 3){
                JTN.getNative("getWebName",{"param":"取号成功"});
            }*/
            E.fire(et.didGotPaihao,tmp);
        }});
    }
    function getBizInfo(data){
        var url = config.service_url+"/meiweipai/bizqueue";
        var detail = "?";
        pguid = data.pguid;
        id = data.id;
        detail += "pguid="+data.pguid+"&pai_biz_id="+data.id+"&mso_x="+position.mso_x+"&mso_y="+position.mso_y;
        doGetService({url:url,detail:detail,cb:function(d){
            d.scene = data.scene;
            E.fire(et.didGotInfo,d);
        }});
    }
    function doGetPosition(cb){
        if(config.checkUA() == "a"){
            JTN.getNative("getLocation",{"param":1},function(responseData){
                eval("var j="+responseData);
                var mx = j.x||j.a||0,
                    my = j.y||j.b||0,
                    mc = j.city||j.c||"北京";
                position = {mso_x:mx,mso_y:my,mcity:mc};
                cb&&cb();
            });
        }else{
            var mso_x = config.getQueryString('mso_x')||0;
            var mso_y = config.getQueryString('mso_y')||0;
            position = {mso_x:mso_x,mso_y:mso_y};
            cb&&cb();
        }
    }
});
