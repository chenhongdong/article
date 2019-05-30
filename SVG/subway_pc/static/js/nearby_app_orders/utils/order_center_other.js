define(function(require){

	var config = require('js/nearby_app_orders/config');

	var E = require('js/nearby_app_orders/event');
	var et = config.eventType;

	var tpl = {
		main : require('../../templates/nearby_app_orders/order_center_other.html'),
		spot_list:require('../../templates/nearby_app_orders/list/spot.html'),
		spot_item:require('../../templates/nearby_app_orders/items/spot.html'),
		// spot_detail:require('../../templates/nearby_app_orders/detail/spot.html'),
		shangmen_list : require('../../templates/nearby_app_orders/list/shangmen.html'),
		shangmen_item : require('../../templates/nearby_app_orders/items/shangmen.html'),
		coupon_list : require('../../templates/nearby_app_orders/list/coupon.html'),
		ticket_list : require('../../templates/nearby_app_orders/list/ticket.html'),
		// coupon_detail : require('../../templates/nearby_app_orders/detail/coupon.html'),
		coupon_item : require('../../templates/nearby_app_orders/items/coupon.html'),
		ticket_item : require('../../templates/nearby_app_orders/items/ticket.html'),
		hotel_list:require('../../templates/nearby_app_orders/list/hotel.html'),
		hotel_item:require('../../templates/nearby_app_orders/items/hotel.html'),
		hotel_detail:require('../../templates/nearby_app_orders/detail/hotel.html'),
		cinema_list:require('../../templates/nearby_app_orders/list/cinema.html'),
		cinema_item:require('../../templates/nearby_app_orders/items/cinema.html'),
		cinema_detail:require('../../templates/nearby_app_orders/detail/cinema.html'),
		yiyuanpai_list:require('../../templates/nearby_app_orders/list/yiyuanpai.html'),
		yiyuanpai_item:require('../../templates/nearby_app_orders/items/yiyuanpai.html'),
		reserve_list : require('../../templates/nearby_app_orders/list/reserve.html'),
		reserve_item : require('../../templates/nearby_app_orders/items/reserve.html'),
		reserve_detail : require('../../templates/nearby_app_orders/detail/reserve.html')
	}

	var type_map = {
		"order_center_reserve"  : ["我的餐厅预订",tpl['reserve_item'],tpl['reserve_list'],tpl['reserve_detail']],
		"order_center_cinema" : ["我的电影票",tpl['cinema_item'],tpl['cinema_list'],tpl['cinema_detail']],
		"order_center_hotel" : ["我的酒店预订",tpl['hotel_item'],tpl['hotel_list'],tpl['hotel_detail']],
		"order_center_spot" : ["我的景点门票",tpl['spot_item'],tpl['spot_list'],tpl['spot_detail']],
		"order_center_gift" : ["我的一元拍订单",tpl['yiyuanpai_item'],tpl['yiyuanpai_list']],
		"order_center_waimai" : ["我的外卖订单"],
		"order_center_thing" : ["我的实物订单"],
		"order_center_coupon" : ["我的收藏",tpl['coupon_item'],tpl['coupon_list']],
		"order_center_ticket" : ["我的优惠券",tpl['ticket_item'],tpl['ticket_list']],
		"shangmen_beauty":["美容化妆服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"shangmen_anmo":["按摩服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"shangmen_medicine":["送药上门服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
    "shangmen_fuwu":["家政服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"shangmen_fix":["电器维修服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"shangmen_drive":["代驾服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"shangmen_car":["汽车服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"shangmen_chongwu":["宠物服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"service_zufang":["租房服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"service_gongzuo":["工作服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"shangmen_teacher":["找老师服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"service_money":["金融服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"shangmen_fruit":["水果食品列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"service_yexiao":["夜宵服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"service_camera":["摄影写真服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"shangmen_lipin":["礼品服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"shangmen_banjia":["搬家服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"service_daikuan":["贷款服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"shangmen_xiyixixie":["洗衣洗鞋服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"shangmen_dache":["打车服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"shangmen_guahao":["挂号服务列表",tpl['shangmen_item'],tpl['shangmen_list']],
		"service_weizhang":["违章查缴服务列表",tpl['shangmen_item'],tpl['shangmen_list']]
	}

	var cp,type;

	var delA = [];

	return {
		init: function (n,d){

			if(!n||!type_map[n]||d.errno){
				config.alert("无此订单类型或服务列表");
				window.history.back();
				return false;
			}

			d.mode = config.checkUA();
			d.list = d.list||[];
			d.type_name = type_map[n][0];

			d.canEdit = (n == 'order_center_coupon');

			switch(n){
				
				case 'order_center_coupon'://收藏
				    d.detail_html = 0;
			    	d.tp = 1;//没有翻页
			    	d.list_html = getListHtml(d,n);
				break;
				case 'order_center_ticket': // 优惠券
					d.detail_html = 0;
					d.tp = 1;//没有翻页
					d.list_html = getListHtml(d,n);
				break;
				case 'order_center_reserve'://订餐小秘书
				case 'order_center_cinema'://格瓦拉-有详情
				case 'order_center_hotel'://艺龙-有详情、有间房-无详情
			    if(d.isDetail){
			    	d.list_html = 0;
			    	d.item.isDetail = 1;
			    	d.detail_html = _.template(type_map[n][3])(d.item);
			    }else{
			    	d.detail_html = 0;
				    d.list_html = getListHtml(d,n);
			    }
				break;
				case 'order_center_spot'://携程
				case 'order_center_gift'://一元拍无详情
			    d.detail_html = 0;
			    d.list_html = getListHtml(d,n);
				break;
				default://所有上门和便民服务的分类页都在这
				    d.tp = d.cp = false;
					d.detail_html = 0;
					d.list = [];
					for(var i in config.tid_map){
						var b = config.tid_map[i];
						b.type&&b.type == n?
						(function(){b.sub['b']=b['n'];b.sub['tid']=i;d.list.push(b.sub);})()
						:"";
					}
					if(!d.list.length){
						alert('无此订单类型或服务列表,请查询');
						window.history.back();
						return
					}
					if(config.checkUA() == 'a'){
				    	monitor.log({type:"shangmen",list_type:n,src:'360around'},'srp');
				    }else{
				    	monitor.log({type:"shangmen",list_type:n},'srp');
				    }
				    d.list_html = getListHtml(d,n);
				break;
			}

			E.unsubscribe(et.didGotMoreItem);
			E.unsubscribe(et.didDelFav);

			config.loadTpl(tpl.main,d);

			//延迟渲染，ios下safari网页显示不全的问题
			var c_e = $("#container")[0];
			setTimeout(function(){
				c_e.style.opacity = '1';
				c_e.style.display = 'block';
				$(window).scrollTop(0);

				if(d.tp > 1){
					cp = d.cp;
					type = d.type;
					E.subscribe(et.didGotMoreItem,addMoreItem);
					$(window).on('scroll',checkScroll);
				}
			},10);
			c_e.style.opacity = '0';
			c_e.style.display = '-webkit-box';
			$(window).scrollTop($('body').height());
		},
		prep : function (){

			E.subscribe(et.didCancelOrder,cancelSuccess);

			if($('.coupon-no-result').length){//收藏单独的no-result页面

				!$('.list-frame .tuangou').length?showNoResult('tuangou'):'';
				handleBorder('tuangou');

				E.subscribe(et.didDelFav,deleteSuccess);
			}
		},
		handleResize: function(){
			if($(".detail-hotel-info").length){
				$(".detail-hotel-info").height($(window).height() - 51 - 20 - 10 - $(".detail-footer").height());
			}
		},
		onC : function(e){
			switch(e.action){
				case 1:
					// window.history.back();
					window.history.go(-1);
				break;
				/*上门服务跳转第三方带Qtoken*/
				case 2:
				    if(!config.tid_map[e.tid]){
				    	config.alert('此服务不可用');
				    	return;
				    }
				    if(e.p&&e.detail){
				    	recordPoint(e.p,e.detail);
				    }
				    config.needAddQT(e.tid);
				break;
				/*直接跳转上门服务url*/
				case 3:
					if(e.p){
				    	e.detail?(recordPoint(e.p,e.detail)):(recordPoint(e.p));
				    }
				    if(e.detail == 'dididache'){
				    	if(config.checkUA() == 'h'&&window.didisdk){
				    		if(!window.didisdk.DiDiCallTaxi())return;
				    	}
				    	config.getCC(function(data){
			    			config.showLoading(0);
			    			e.lat = data.lat||0;
			    			e.lon = data.lon||0;
			    			e.city = data.city_name;
			    			window.location.href = e.href+"&fromlat="+e.lat+"&fromlng="+e.lon+"&city="+e.city;
			    		},true,function(){
			    			config.showLoading(0);
			    			e.lat = 0;
			    			e.lon = 0;
			    			e.city = '北京市';
			    			window.location.href = e.href+"&fromlat="+e.lat+"&fromlng="+e.lon+"&city="+e.city;
			    		});
				    }else{
				    	if(e.href)window.location.href = e.href;
				    }
				break;
				case 'c':
				    //所有详情页取消订单功能
				    config.confirm("确定取消订单？",function(){
				    	E.fire(et.doCancelAction,{order_id:e.order_id,scene:e.scene});
				    });
				break;
				case 4:
					//收藏tab分类选择显示
					$('.tab li').removeClass('select');
					$('.tab .'+e.type).addClass('select');

					$('.list-frame li').hide();
					$('.coupon-no-result').hide();
					if($('.list-frame .'+e.type).length){
						$('.list-frame .'+e.type).show();
						$('.list-frame').removeClass('tuangou').removeClass('didian').addClass(e.type);
						handleBorder(e.type);
					}else{
						showNoResult(e.type);
					}
				break;
				case 5://编辑
				    var z = [$('.list-frame li'),$('.list-frame'),$('.delBtn')],
				        $editBtn = $('.editBtn');
				    if($editBtn.text()=='编辑'){
				    	$editBtn.text('取消');
				    	delA=[];$('.editP').removeClass('select');
				    }else{
				    	$editBtn.text('编辑');
				    }
				    for(var i in z){
				    	var $e = z[i];
				    	if($e.length){
				    		$e.hasClass('edit')?$e.removeClass('edit'):$e.addClass('edit');
				    	}
				    }
				break;
				case 6://删除条目
				    if(delA.length){
				    	var tmp = delA.length == 1?delA[0]:delA.join(',');
				    	E.fire(et.doDelFav,{ids:tmp,type:e.type});
				    }else{
				    	config.alert('请选择删除的条目');
				    }
				break;
				case 7:
				    $('.list-frame').hasClass('edit')?handleSelect(e):handlePosition(e);
				break;
				case 8:
					// 获取跳转url
					config.needAddQT(e.pid||28,null, function (qt, cc) {
						location.href = e.url + '&qtoken=' + encodeURIComponent(qt) + ( cc ? '&city_name=' + encodeURIComponent(cc) : '' );
					});
			}
		}
	}
	function handleSelect(e){
		var $t_f = $('a[data-tid='+e._id+'] .editP-frame'),
            $t = $t_f.children('.editP');
	    if($t.hasClass('select')){
	    	$t.removeClass('select');
	    	delA.splice(delA.indexOf(e._id),1);
	    }else{
	    	$t.addClass('select');
	    	delA.push(e._id);
	    }
	}
	function handlePosition(e){

		if(!e.pguid&&e.url){
			window.location.href = e.url;
		}

		if(!e.url&&e.pguid){
			var lat,lon,city;

		    if(config.checkUA() == 'a'){
	    		JTN.getNative("getLocation",{"param":1},function(responseData){
	                eval("var j="+responseData);

	                e.lat = j.y||j.b||'';
	    			e.lon = j.x||j.a||'';
	    			e.city = j.city||j.c||'北京市';

	    			jumpTo(e);
	            });
	    	}else{
	    		config.getCC(function(data){
	    			config.showLoading(0);
	    			e.lat = data.lat||'';
	    			e.lon = data.lon||'';
	    			e.city = data.city_name;

	    			jumpTo(e);
	    		},1,function(){
	    			config.showLoading(0);
	    			e.lat = 0;
	    			e.lon = 0;
	    			e.city = '北京市';
	    			jumpTo(e);
	    		});
	    	}
		}
	}
	function jumpTo(data){
		window.location.href = "//m.map.so.com/onebox/?type=detail&d=mobile&src=map_wap&id="+data.pguid+"&mso_x="+data.lon+"&mso_y="+data.lat;
	}
	//混合不同类li中的问题
	function handleBorder(n){
		var a = $('.list-frame .'+n);
		a.eq(a.length-1).css('border-bottom','0');
	}
	//收藏用单独的no-result
	function showNoResult(n){
		var $cnr = $('.coupon-no-result');
		$cnr.children().hide();
		$cnr.show().children('.'+n).show();
	}
	function addMoreItem(data){
		for(var i = 0; i < data.list.length;i++){
			var item = _.template(type_map[data.type][1])(data.list[i]);
			$(item).appendTo($(".list-frame"));
		}
	    cp = data.cp;
	    if(data.cp == data.tp){
	    	$(".napp-load-more").hide();
	    }else if(data.cp < data.tp){
	    	$(window).on('scroll',checkScroll);
	    }
	}

	function checkScroll(e){

		var $lm = $(".napp-load-more"),
		    s = type,
		    t = "order_center_other";

		if($lm.offset().top - $(window).scrollTop() < $(window).height()+29){
			$(window).off('scroll',checkScroll);
			E.fire(et.doGetMoreItem,{scene:s,cp:cp,type:t});
		}
	}

	function recordPoint(p,d){
		var ua = navigator.userAgent,
    	    tmp = ua.toLowerCase(),t;
		if (/iphone|ipad|ipod/.test(tmp)) {
			t = 'iOS';
		} else if (/android/.test(tmp)) {
			t= 'Android';
		}

		var info = {
			'type':'shangmen',
    		'p':p
		};

		if(d){
			info['detail'] = d;
			info['data-md-p'] = p;
			info['data-md-client'] = '360地图-上门服务';
			info['data-md-system'] = t;
			info['data-md-partner'] = d;
		}

    	if(config.checkUA() == 'a'){
    		info.src = '360around';
    	}else if(config.checkUA() == 'h'){
    		info.src = 'haosou';
    	}else{
    		info.src = 'wap';
    	}
    	monitor.log(info,'click');
	}
	function deleteSuccess(data){
		window.location.reload();
	}
	function cancelSuccess(data){
		if($(".order-result").length&&$(".detail-frame").length){
			$(".order-result").show();
			$(".detail-frame").hide();
			return;
		}
		window.location.reload();
	}
	function getListHtml(d,n){
		d.items = [];
	    for(var i = 0,len = d.list.length; i < len;i++){
	    	d.list[i].isDetail = 0;
	    	d.items.push(_.template(type_map[n][1])(d.list[i]));
	    }
	    return _.template(type_map[n][2])(d);
	}
});
