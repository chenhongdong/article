define(function(require){

	var config = require('js/nearby_app_orders/config');

	var tpl = {
		main : require('../../templates/nearby_app_orders/shangmen.html')
	}

	return {

		init: function (n,d){

			d.mode = config.checkUA();
			config.loadTpl(tpl.main,d);

			this.handleBanner();
		},
		prep : function (){
			monitor.log({type:"shangmen"},'srp');
		},
		handleResize: function(){

		},
		handleBanner: function(){

			var me = this;

			config.getCC(function(data){
				config.showLoading(0);
				var cc = String(data.adcode);
			});
		},
		onC : function(e){
			switch(e.action){
				case 1:
					window.history.back();
				break;
				case 2:
				    if(!config.tid_map[e.tid]){
				    	config.alert('此服务不可用');
				    	return;
				    }
				    if(e.p&&e.detail){
				    	e.from?recordPoint(e.p,e.detail,{from:e.from}):recordPoint(e.p,e.detail);
				    }
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
                    			config.tid_map[e.tid]['us'][1] = tmp1;
                    			config.tid_map[e.tid]['us'][2] = tmp2;
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
				case 3:
				    // if(e.p){
				    // 	var info = (e.detail)?{'type':'shangmen','p':e.p,'detail':e.detail}:{'type':'shangmen','p':e.p};
				    // 	if(e.from){
				    // 		info.from = e.from;
				    // 	}
				    // 	monitor.log(info,'click');
				    // }
				    if(e.p){
				    	e.from?recordPoint(e.p,e.detail||null,{from:e.from}):recordPoint(e.p,e.detail||null,null);
				    }
				    if(e.href){
				    	window.location.href = e.href;
				    }
				break;
				case 998:
				    var p_id = e.p_id*1;

					if(p_id){
						var qtokenInfo = ['pid=' + p_id, 'ufrom=c'];
						config.getQT(qtokenInfo, p_id, function(qt) {
						var href = e.url;

						href = href.replace(/([^?]*)\/?\??(.*)?/,function(url, path, params){
							params = params || '';

							var joiner = params&&params.indexOf('#') != 0 ? '&' : '';


							return path.replace(/\/$/,'') + '?qtoken=' + qt + joiner + params;
						});

						window.location.href = href;

						},e.qt_src);
					}else{
						window.location.href = e.url;
					}
				break;
			}
		}
	}

	function recordPoint(p,d,a){//分类，合作方，附加的参数比如from=shangmenindex从首页广告位
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
			info['data-md-client'] = '地图-上门服务';
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

    	if(a&&typeof(a)==='object'){
    		for(var i in a){
    			info[i] = a[i];
    		}
    	}
    	monitor.log(info,'click');
	}
});
