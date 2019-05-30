define(function(require){

	var config = require('js/nearby_app_orders/config'),
	    E = require('js/nearby_app_orders/event'),et = config.eventType;

	var tpl = {
		main : require('../../templates/nearby_app_orders/meiwei_order_suc.html')
	}

	return {
		init: function (n,d){

			d.mode = config.checkUA();
			if(config.getQueryString('debug')){
				d.name = '未知商家';
				d.address = '未知地址';
				d.distance = 0;
				d.orderid = 'debug';
				d.tableType = '未知桌型';
				d.wait = '0';
				d.waittime = '--:--';
				d.order_id = '0';
				d.serialid = '0';
				d.isCancel = false;
			}else{
				d.name = d.data.biz.title||'未知商家';
				d.address = d.data.biz.addr||'未知地址';
				d.distance = config.unitChange(d.data.biz.distance)||0;

				if(d.errno == 2||d.errno == 3){
					d.orderid = d.data.queue.num||'未知排号';
					d.tableType = d.data.queue.qname||'未知桌型';
					d.wait = d.data.queue.wait||'0';
					d.waittime = d.data.queue.waittime||'--:--';
					d.order_id = d.data.queue.order_id||'0';
					d.serialid = d.data.queue.serialid||'0';
					d.isCancel = d.isCancel||false;
				}
			}

			config.loadTpl(tpl.main,d);
		},
		prep : function (){

			var h = (config.checkUA() == 'b')?"mso_wap_":"mso_app_";
			if(config.checkUA() == 'h'){
		    	h = "haosou_app_";
		    }
	        /*pv*/
	        if(!config.getQueryString('debug')){
	        	monitor.log({
			    	mod: h+'around_meiwei_order',
			    	type: 'result_suc'
			    },'srp');
	        }
			E.unsubscribe(et.didCancelPaihao);
			E.subscribe(et.didCancelPaihao,handleCancel);
		},
		handleResize: function(){
			if($(".sc-frame").length){
				$(".sc-frame").height($(window).height()-60-51-75-10);
			}
		},
		onC : function(e){
			switch(e.action){
				case 1:
					window.history.back();
				break;
				case 2:
				    window.location.hash = "#scene=order_center";
				break;
				case 3:
				    if($(".meiwei_order_suc_fixed_bottom_wrapper a").hasClass('no')){
				    	return false;
				    }
				    config.confirm("确定取消排号？",function(){
				    	E.fire(et.cancelPaihao,{order_id:e.orderid,serialid:e.seid});
				    });
				break;
			}
		}
	}
	function handleCancel(data){
		if(data.errno == 0){
			$(".meiwei_order_suc_fixed_bottom_wrapper a").addClass('no').text('已取消');
			$(".meiwei_order_suc_main h1").addClass('no');
			$(".meiwei_order_suc_main .cancel").show();
		}else{
			alert("取消排号失败");
		}
	}
});