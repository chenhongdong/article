define(function(require){
	/*废弃文件，暂时无用*/
	var config = require('js/nearby_app_orders/config');

	var tpl = {
		main : require('../../templates/nearby_app_orders/shangmen_frame.html')
	}

	return {
		init: function (n,d){
			d.mode = config.checkUA();

			var bis_name = config.getQueryString('bis')||0;
			switch(bis_name){
				case 'wdj':
					d.bis_name = "微代驾";
					d.bis_url = "http://m.weidaijia.cn/mx/?source=360";
				break;
				case 'diandao':
				    d.bis_name = "点到";
				    d.bis_url = "http://m.diandao.org/";
				break;
				default:
					config.alert('无此上门服务');
				break;
			}
			config.loadTpl(tpl.main,d);
		},
		prep : function (){
			//
		},
		handleResize: function(){

		},
		onC : function(e){
			switch(e.action){
				case 1:
					window.location.href = "http://trunk.143.m.map.so.com/shangmen.html";
				break;
				case 2:
				    //
				break;
				case 3:
				    //
				break;
			}
		}
	}
});