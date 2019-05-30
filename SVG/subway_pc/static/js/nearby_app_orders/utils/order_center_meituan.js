define(function(require){

	var config = require('js/nearby_app_orders/config');
	var E = require('js/nearby_app_orders/event'),
	    et = config.eventType;

	var tpl = {
		main : require('../../templates/nearby_app_orders/order_center_meituan.html'),
		item : require('../../templates/nearby_app_orders/items/tuangou.html')
	}
	var status = {'100':'创建订单','200':'支付成功','300':'消费完成','400':'取消订单'};

	var cp;

	return {
		init: function (n,d){
			d.mode = config.checkUA();
			d.list = d.list||[];

			E.unsubscribe(et.didGotMoreItem);
			if(d.tp > 1){
				cp = d.cp;
				E.subscribe(et.didGotMoreItem,addMoreItem);
				$(window).on('scroll',checkScroll);
			}
			d.items = [];
		    for(var i = 0,len = d.list.length; i < len;i++){
		    	d.items.push(_.template(tpl['item'])(d.list[i]));
		    }

			config.loadTpl(tpl.main,d);
		},
		prep : function (){
			
		},
		handleResize: function(){

		},
		onC : function(e){
			switch(e.action){
				case 1:
				    if(window.__HaoSouFun__){
				    	window.__HaoSouFun__.goback();
				    }else{
				    	window.history.back();
				    }
				break;
				case 2:
				    var sid = e.sid,
				        u = "http://i.meituan.com/order/view/"+e.bid+"?/nodown&webview",
				        url = "http://r.union.meituan.com/url/visit/"+
				    "?a=1&key=09501ebe35c4f794731f3c539095601f627&sid="+sid+"&url="+u;
				    window.location.href = url;
				break;
				case 3:
				    var url = e.stat_num == '100'?"http://m.nuomi.com/webapp/user/orderdetail?type=1&orderId=":"http://m.nuomi.com/webapp/user/orderdetail?orderId=",
				        order_id = e.order_id.split('_')[0];
				    window.location.href = url+order_id;
				break;
			}
		}
	}
	function addMoreItem(data){
		for(var i = 0; i < data.list.length;i++){
			var item = _.template(tpl['item'])(data.list[i]);
			$(item).appendTo($(".order_center_meituan_wrapper"));
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
		    s = "order_center_meituan",
		    t = "order_center_meituan";

		if($lm.offset().top - $(window).scrollTop() < $(window).height()+29){
			$(window).off('scroll',checkScroll);
			E.fire(et.doGetMoreItem,{scene:s,cp:cp,type:t});
		}
	}
});
