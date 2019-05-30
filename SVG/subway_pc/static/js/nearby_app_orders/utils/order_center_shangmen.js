define(function(require){

	var config = require('js/nearby_app_orders/config'),et = config.eventType,
	    E = require('js/nearby_app_orders/event');

	var tpl = {
		main : require('../../templates/nearby_app_orders/order_center_shangmen.html'),
		item : require('../../templates/nearby_app_orders/items/shangmen_order.html')
	},
	cp;

	return {
		init: function (n,d){

			d.mode = config.checkUA();
			d.list = d.list||[];

			d.items = [];

			E.unsubscribe(et.didGotMoreItem);

			for(var i = 0,len = d.list.length; i < len;i++){
		    	d.items.push(_.template(tpl.item)(d.list[i]));
		    }
			config.loadTpl(tpl.main,d);

			if(d.cp < d.tp){
				cp = d.cp;
				E.subscribe(et.didGotMoreItem,addMoreItem);
				$(window).on('scroll',checkScroll);
			}
		},
		prep : function (){
			//
		},
		handleResize: function(){
			//
		},
		onC : function(e){
			switch(e.action){
				case 1:
					window.history.back();
				break;
				case 2:
				    config.getCC(function(data){
				    	config.showLoading(0);
				    	var cc = String(data.adcode)||'110000';
				    	if(cc.indexOf('310')>-1&&cc.indexOf('310') == 0){
				    		cc = 310000;
				    	}else{
				    		cc = 110000;
				    	}
				    	window.location.href="http://m.meililai.com/meililai/360/order/orderdetail.html?channel=10014&oid="+e.bid+"&citycode="+cc;
				    });
				break;
				case 'p':
				case 'n':
				    E.fire(et.doPage,{type:'order_center_shangmen',action:e.action,cp:e.cp});
				break;
			}
		}
	}

	function addMoreItem(data){

		for(var i = 0,len = data.list.length; i < len;i++){
	    	var item = _.template(tpl.item)(data.list[i]);
	    	$(item).appendTo($(".order_center_shangmen_wrapper"));
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
		    scene = "order_center_shangmen";

		if($lm.offset().top - $(window).scrollTop() < $(window).height()+29){
			$(window).off('scroll',checkScroll);
			E.fire(et.doGetMoreItem,{scene:scene,cp:cp});
		}
	}
});