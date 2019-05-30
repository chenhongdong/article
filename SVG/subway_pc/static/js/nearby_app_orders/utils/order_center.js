define(function(require){

	var config = require('js/nearby_app_orders/config'),
	    proxy = require('js/nearby_app_orders/proxy'),
	    E = require('js/nearby_app_orders/event'),
	    et = config.eventType;

	var qid  = null;

	var shanghu = proxy.shanghuList();

	var type_map = {};

	var tpl = {
		main : require('../../templates/nearby_app_orders/order_center.html')
	}

	return {
		init: function (n,d){

			d.mode = config.checkUA();
			d.isEmpty = '1';

			var tar = 'order_center_'

			for(var i in shanghu){
				if(i.indexOf(tar) > -1){
					var t = i.slice(i.indexOf(tar)+tar.length);
					t == 'gift'?t = 'yiyuanpai':t = t.toLowerCase();
					type_map[t] = shanghu[i][0]?shanghu[i][0].split(','):[];
				}
			}

			var me = this;

			config.checkLogin(function(data){
		    	qid = data.qid;
				me.checkListType(d,data.qid);
		    });
		},
		prep : function (){
			var h = (config.checkUA() == 'b')?"mso_wap_":"mso_app_";
			if(config.checkUA() == 'h'){
		    	h = "haosou_app_";
		    }
	        /*pv*/
		    monitor.log({
		    	mod: h+'around_meiwei_order',
		    	type: 'order_center'
		    },'srp');
		},
		handleResize: function(){

		},
		checkListType : function(d,qid){
			$.ajax({
	            type:"GET",dataType:"jsonp",
	            url:config.service_url+"/order/newOrder?ufrom=c",
	            jsonp:"callback",
	            success:function(data){
	                //console.log(data);
	                if(!data.data||!data.data.length){
	                	
	                }else{
		                d.isEmpty = '0';
		                //处理类型收集时间戳
		                d.typeList = {};
		                d.dateList = {};
		                for(var i in type_map){

		                	d.typeList[i] = '0';
		                	d.dateList[i] = [];
		                	if(type_map[i].length){
		                		for(var j = 0;j < data.data.length;j++){
		                			if(type_map[i].indexOf(String(data.data[j]['p_id'])) > -1){
		                				d.typeList[i] = '1';
		                				d.dateList[i].push(data.data[j]['create_time']);
		                				d.dateList[i].sort();
		                				d.dateList[i].reverse();
		                			}
		                		}
		                	}
		                }
		                //处理时间戳
		                for(var x in d.dateList){
		                	if(d.dateList[x].length){
		                		d[x + '_update'] = '0';
			                	if(!window.localStorage||!window.localStorage[qid+'_ts_'+x]||window.localStorage[qid+'_ts_'+x] < d.dateList[x][0]){
			                		d[x+'_update'] = '1';
			                	}
		                	}
		                }
	                }
	                config.loadTpl(tpl.main,d);
	            },
	            error:function(){
	                alert('接口故障');
	                window.history.back();
	            }
	        });
		},
		onC : function(e){
			switch(e.action){
				case 1:
					window.history.back();
				break;
				case 2:
				    var s = 'order_center_',
				        tmp = e.type.slice(s.length);
				    try { 
					    if(window.localStorage){
					    	window.localStorage[qid+'_ts_'+tmp] = e.ts;
					    }
					} catch (e) { 
					    //alert("您处于无痕浏览，无法为您保存"); 
					}
				    window.location.hash = "#scene="+e.type;
				break;
				case 3:
				    //
				break;
			}
		}
	}
});
