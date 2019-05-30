define(function(require){

	var config = require('js/nearby_app_orders/config'),
	    E = require('js/nearby_app_orders/event'),et = config.eventType;

	var t = "";

	var tpl = {
		main : require('../../templates/nearby_app_orders/order_center_meiwei.html')
	}

	return {
		init: function (n,d){

			d.mode = config.checkUA();
			d.list = d.list||[];

			for(var i =0, len = d.list.length; i < len;i++){
				d.list[i].title = d.list[i].title||"未知商家";
				d.list[i].addr = d.list[i].addr||"未知地址";
				d.list[i].updatetime = d.list[i].updatetime||"未知时间";
				switch(parseInt(d.list[i].state)){
					case 1:
					d.list[i].type = "取号中";
					d.list[i].timeType = "取号";
					break;
					case 2:
					case 3:
					d.list[i].type = "排队中";
					d.list[i].num = d.list[i].num||"未知编号";
					d.list[i].qname = d.list[i].qname||"未知桌型";
					d.list[i].wait = d.list[i].wait||"0";
					d.list[i].waittime = d.list[i].waittime||"--:--";
					d.list[i].order_id = d.list[i].order_id||"0";
					d.list[i].serialid = d.list[i].serialid||"0";
					d.list[i].timeType = "取号";
					break;
					case 4:
					d.list[i].type = "已到号";
					d.list[i].timeType = "叫号";
					break;
					case 5:
					d.list[i].type = "已到店";
					d.list[i].timeType = "到店";
					break;
					case 6:
					d.list[i].type = "已过号";
					d.list[i].timeType = "过号";
					break;
					case 7:
					d.list[i].type = "已取消";
					d.list[i].timeType = "取消";
					break;
					default:
					d.list[i].type = "取号失败";
					d.list[i].timeType = "取号";
					break;
				}
			}
			config.loadTpl(tpl.main,d);
		},
		prep : function (){
			E.unsubscribe(et.didCancelPaihao);
			E.subscribe(et.didCancelPaihao,handleCancel);
		},
		handleResize: function(){

		},
		onC : function(e){
			switch(e.action){
				case 1:
					window.history.back();
				break;
				case 2:
				    //
				break;
				case 3:
				    if($(".order_center_meiwei_suc_fixed_bottom_wrapper a[data-t="+e.orderid+"]").hasClass('no')){
				    	return false;
				    }
				    config.confirm("确定取消排号？",function(){
				    	t = e.orderid;
					    E.fire(et.cancelPaihao,{order_id:e.orderid,serialid:e.seid});
				    });
				break;
			}
		}
	}
	function handleCancel(data){
		if(data.errno == 0){
			$(".order_center_meiwei_suc_fixed_bottom_wrapper a[data-t="+t+"]").addClass('no').text('已取消');
			$(".order_center_meiwei_suc_main h1[data-t="+t+"]").addClass('no');
			$(".order_center_meiwei_suc_main .cancel[data-t="+t+"]").show();
			$(".order_center_meiwei_info .sign[data-t="+t+"]").text("已取消");
		}else{
			alert("取消排号失败");
		}
	}
});