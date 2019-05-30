define(function(require){

	var config = require('js/nearby_app_orders/config');

	var tpl = {
		main : require('../../templates/nearby_app_orders/service.html')
	}

	return {
		init: function (n,d){

			d.mode = config.checkUA();

			var is_ver = /.*Android.*360around \([2-9].*\)|.*Android.*360around \([1-9]\d*\.[6-9].*\)|.*Android.*360around \([1-9]\d*\.[5-9]\d*\.[1-9].*\)|.*Android.*360around \([1-9]\d*\.[5-9]\d*\.[0-9]\d*\.([2-9]\d{3,}|1[1-9]\d{2,}|10[1-9]\d|100[1-9])\)/.test(navigator.userAgent);

			d.show360Chongzhi = !!(d.mode === 'a'&&(is_ver || navigator.userAgent.indexOf('360shenbian') > -1));

			config.loadTpl(tpl.main,d);
		},
		prep : function (){
			monitor.log({type:"service"},'srp');
		},
		handleResize: function(){

		},
		onC : function(e){
			switch(e.action){
				case 1:
					window.history.back();
				break;
				case 2://需要qtoken服务的
				    if(!config.tid_map[e.tid]){
				    	config.alert('此服务不可用');
				    	return;
				    }
				    // if(e.p&&e.detail){
				    // 	var info = {
				    // 		'type':'shangmen',
				    // 		'p':e.p,
				    // 		'detail':e.detail
				    // 	};
				    // 	if(config.checkUA() == 'a')info.src = '360around';
				    // 	monitor.log(info,'click');
				    // }
				    var tmp1 = config.tid_map[e.tid]['us'][1];
				    if(config.tid_map[e.tid]['cc']){
                    	config.getCC(function(data){
                    		config.showLoading(0);
                    		var cc = String(data.adcode)||'110000',
                    		    p = ['pid='+e.tid,'ufrom=c'],url = "";
                    		if(e.tid == '22'){
                    			if(cc.indexOf('310')>-1&&cc.indexOf('310') == 0){
						    		cc = 310000;
						    	}else{
						    		cc = 110000;
						    	}
                    		}
                    		if(config.tid_map[e.tid]['cname']){
                    			cc = data.city_name;
                    		}
                    		var tmp2 = config.tid_map[e.tid]['us'][2];
                    		config.tid_map[e.tid]['us'][2]+=cc;
                    		config.getQT(p,e.tid,function(qt){
                    			config.tid_map[e.tid]['us'][1]+=qt;
                    			for(var i = 0; i < config.tid_map[e.tid]['us'].length;i++){
                    				url += config.tid_map[e.tid]['us'][i];
                    			}
                    			config.tid_map[e.tid]['us'][2] = tmp2;
                    			config.tid_map[e.tid]['us'][1] = tmp1;
                    			window.location.href = url;
                    		});
                    	});
                    }else{
                    	var p = ['pid='+e.tid,'ufrom=c'],url = "";
                    	config.getQT(p,e.tid,function(qt){
                			config.tid_map[e.tid]['us'][1]+=qt;
                			for(var i = 0; i < config.tid_map[e.tid]['us'].length;i++){
                				url += config.tid_map[e.tid]['us'][i];
                			}
                			config.tid_map[e.tid]['us'][1] = tmp1;
                			window.location.href = url;
                		});
                    }
				break;
				case 3://直接跳转的
				    if(e.url){
				    	window.location.href = e.url;
				    }
				break;
				case 4://需要定位服务的

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
			    		var pos = config.getCC(function(data){
			    			config.showLoading(0);
			    			e.lat = data.lat||'';
			    			e.lon = data.lon||'';
			    			e.city = data.city_name;

			    			jumpTo(e);
			    		},1);
			    	}
				break;
				case 5://需要app服务配合的
				    
				    if(!JTN)return;
				    switch(e.detail){
				    	case "手机充值":
					    	JTN.getNative("charge",{"param":1},function(responseData){
						    	//alert(responseData);
						    });
					    break;
				    }
				break;
			}
		}
	}

	function jumpTo(data){
		switch(data.type){
			case 'didi':
				window.location.href = data.url + "&fromlat="+data.lat+"&fromlng="+data.lon+"&city="+data.city;
			break;
			case 'chongwujiaoyi':
			    window.location.href = data.url + "?city_name="+data.city;
			break;
		}
	}
});
