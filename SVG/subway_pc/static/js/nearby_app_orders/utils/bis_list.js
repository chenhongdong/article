define(function(require){

	var config =require('js/nearby_app_orders/config'),
	    E = require('js/nearby_app_orders/event'),
	    et = config.eventType;
	var as = require('./advance_sort');

	var tpl = {
		main : require('../../templates/nearby_app_orders/bis_list.html')
	}

	return {
		init : function(n,d){

    		d.mode = config.checkUA();
    		d.list = [];
    		var kw = config.getQueryString('kw')||'0_0',
				range = config.getQueryString('r')||'0',
				sort = config.getQueryString('s')||'0',
				filter = config.getQueryString('f')||'',
				prize = config.getQueryString('p')||'0';

			this.prep();
    		as.init("#attach-container",{kw:kw,range:range,sort:sort,filter:filter,prize:prize});
		},
		onC : function(d){
			switch(d.action){
				case 'p':
				case 'n':
					E.fire(et.doPage,{type:'bis_list',action:d.action});
				break;
				case 'd':
					window.location.href = config.detail_url_out+"onebox/?type=detail&id="+d.pguid+"&mso_x=&mso_y=&center_x=&center_y=&d=mobile"
				break;
			}
		},
		prep : function(){
			E.unsubscribe(et.didGotBizInfo);
			E.subscribe(et.didGotBizInfo,handleData);
			$(".listContainer").scrollTop(0);
		}
	}
	function handleData(data){
		var d = {list : data.info.poi,cp:data.info.cp,tp:data.info.tp};
		config.loadTpl(tpl.main,d);
	}
});