define(function(require) {
	require('js/app/freewifi/freewifi-service');
	var config = require('js/app/conf/config');

	So.Command.freeWifiListHandler = So.Command.Base.extend({
		_run:function(){
			So.Waiting.show("正在搜索 " + this._params.wd);
			var ck = function(d){
				So.Waiting.hide();
				So.Gcmd.changeHash("freewifi/index", d);
			}
            var loc = So.State.getLocation();
			So.FreeWifiService.doGetFreeWifiList({
                x:loc.x || 116.39,
                y:loc.y || 39.90
            },ck);
		}
	});
	So.Command.freeWifiListRefreshHandler = So.Command.Base.extend({
		_run:function(){
			//So.Waiting.show("正在刷新数据");
			var y = So.UIMap.getObj().center.lat,
			    x = So.UIMap.getObj().center.lng;
			So.FreeWifiService.doGetFreeWifiList({x:x,y:y},this._params.ck);
		}
	});
});
