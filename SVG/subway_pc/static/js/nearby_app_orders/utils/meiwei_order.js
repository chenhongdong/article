define(function(require){

	var config = require('js/nearby_app_orders/config'),
	    E = require('js/nearby_app_orders/event'),et = config.eventType;
	var jg;

	var tpl = {
		main : require('../../templates/nearby_app_orders/meiwei_order.html')
	}

	return {
		init: function (n,d){
			if(!d.data && d.errno == '1001'){
				alert(d.errmsg);
				window.history.back();
				return;
			}
			if(!d.data.biz){
				alert('商户id有误');
				window.history.back();
				return;
			}

			d.mode = config.checkUA();
			d.name = d.data.biz.title||'未知商家';
			d.address = d.data.biz.addr||'未知地址';
			d.distance = config.unitChange(d.data.biz.distance)||0;

			switch(d.errno){
				case 0:
				d.queues = d.data.bizqueue.queues||[];
				d.discount = (!d.data.bizqueue.distant||d.data.bizqueue.distant == -1)?'暂无等位优惠':d.data.bizqueue.distant;
				d.notice = "立即取号";
				break;
				case 24:
				d.queues = [];
				d.discount = '暂无等位优惠';
				d.notice = '商家离线';
				d.phone = d.data.biz.tel||'';
				break;
				default:
				d.queues = [];
				d.discount = '暂无等位优惠';
				d.notice = d.errmsg||'暂无排号信息';
				if(d.notice=="不用排队"){
					d.notice = "本店现在有空位无需排队";	
				}
				break;
			}
			config.loadTpl(tpl.main,d);
		},
		prep : function (){

			var h = (config.checkUA() == 'b')?"mso_wap_":"mso_app_";
				if(config.checkUA() == 'h'){
			    	h = "haosou_app_";
			    }
		        /*pv*/
			    monitor.log({
			    	mod: h+'around_meiwei_order',
			    	type: 'detail'
			    },'srp');

			$("input[name='num']").focusin(function(e){
				if($("input[name='num']").val() == '请正确填写用餐人数'){
					$("input[name='num']").val('');
				}
			});
			$("input[name='phone']").focusin(function(e){
				if($("input[name='phone']").val() == '请正确填写手机号码'){
					$("input[name='phone']").val('');
				}
			});
			E.unsubscribe(et.didGotPaihao);
			E.subscribe(et.didGotPaihao,handlePaihao);
			E.unsubscribe(et.didCheckOrder);
			E.subscribe(et.didCheckOrder,handlePaihao);
		},
		handleResize: function(){
			if($(".sc-frame").length){
				$(".sc-frame").height($(window).height()-60-51-75);
			}
		},
		onC : function(e){
			switch(e.action){
				case 1:
				    if(jg){
				    	clearTimeout(jg);
				    }
					window.history.back();
				break;
				case 2:
				    var h = (config.checkUA() == 'b')?"mso_wap_":"mso_app_";

				    if(config.checkUA() == 'h'){
				    	h = "haosou_app_";
				    }
			        /*click*/
				    monitor.log({
				    	mod: h+'around_meiwei_order',
				    	type: 'orderAction'
				    },'click');
				    if($(".orderAction").hasClass('wait')){
				    	return false;
				    }
				    var $num_input = $("input[name='num']"),
				        $phone_input = $("input[name='phone']");
				    if(!$num_input.val()||$num_input.val() == '请正确填写用餐人数'){
				    	$num_input.val('请正确填写用餐人数');
				    	return false;
				    }
				    var phone_reg = /^(((13[0-9]{1})|177|(14[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
				    if(!$phone_input.val()||$phone_input.val() == '请正确填写手机号码'||!phone_reg.test($phone_input.val())){
				    	$phone_input.val('请正确填写手机号码');
				    	return false;
				    }
				    $(".orderAction").text('正在取号...').addClass('wait');
				    $(".meiwei_order_pop .cancelBtn").hide();
				    E.fire(et.doPaihao,{phone:$phone_input.val(),num:$num_input.val()});
				break;
				case 3:
				    $(".meiwei_order_pop").css('display','-webkit-box');
				break;
				case 4:
				    $(".meiwei_order_pop").css('display','none');
				break;
			}
		}
	}

	function handlePaihao(data){
		if(data.errno == 2||data.errno == 3){
			E.fire(et.doGetInfo,{scene:"meiwei_order_suc"});
		}else if(data.errno == 1){
			$(".orderAction").text('取号中...');
			jg = setTimeout(function(){
				checkOrder(data.data.queue.order_id);
			},3000);
		}else{
			$(".meiwei_order_pop").hide();
			$(".orderAction").text('确认').removeClass('wait');
			$(".meiwei_order_pop .cancelBtn").show();
			if(data.errmsg.indexOf("您已经取号") > -1){
				data.errmsg = "您之前已经领取了一个号正在排队中";
			}
			config.alert(data.errmsg);
		}
	}
	function checkOrder(order_id){
		E.fire(et.doCheckOrder,{order_id:order_id});
	}
});