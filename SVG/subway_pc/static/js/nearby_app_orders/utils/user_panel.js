define(function(require){

	var config = require('js/nearby_app_orders/config'),
	    E = require('js/nearby_app_orders/event'),
	    et = config.eventType;

	var tpl = {
		main : require('../../templates/nearby_app_orders/user_panel.html')
	}

	var url_map = {
		login:"//i.360.cn/login/wap/",
		reg:"//i.360.cn/reg/wap/"
	}

	return {
		init: function (n,d){

			d.mode = config.checkUA();

			var bizhi = 720/280;
			d.w = $(window).width();
			d.h = d.w/bizhi;

			this.checkInfo(d);
		},
		checkInfo : function(d){
			QHPass.getUserInfo(function(data){
				d.userName = data.userName;
				config.loadTpl(tpl.main,d);
	        },function(){
	        	d.userName = null;
	        	config.loadTpl(tpl.main,d);
	        });
		},
		prep : function (){
			var h = (config.checkUA() == 'b')?"mso_wap_":"mso_app_";
			if(config.checkUA() == 'h'){
		    	h = "haosou_app_";
		    }
	        /*pv*/
		    monitor.log({
		    	mod: h+'360around',
		    	type: 'user_panel'
		    },'srp');
		},
		handleResize: function(){

		},
		onC : function(e){
			switch(e.action){
				case '1':
			        window.history.go(-1);
				break;
				case '2':
				    if(e.type=='reg'||e.type=='login'){
				    	if(window.__HaoSouFun__ && __HaoSouFun__.login){
				    		if(e.type == 'login'){
				    			__HaoSouFun__.login();
				    		}else if(e.type == 'reg'){
				    			__HaoSouFun__.register();
				    		}				    		
				    	}else{
				    		window.location.href = url_map[e.type]+"?src=mpw_around&destUrl="+
		                   encodeURIComponent(window.location.href);
				    	}
				    	
				    }else{
				    	//调用好搜APP中的退出登录
				    	if(window.__HaoSouFun__ && __HaoSouFun__.logout){
				    		 __HaoSouFun__.logout();
				    	}
				    	
				    	QHPass&&QHPass.logout(function(){
				    		window.location.reload();
				    	});
				    }
				break;
				case '3':
				    e.url?window.location.href=e.url:'';
				break;
				case '4'://需要login
				    config.checkLogin(function(data){
				    	e.url?window.location.href=e.url:'';
				    });
				break;
			}
		}
  }
});
