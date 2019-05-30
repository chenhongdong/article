define(function(require) {
	require('js/app/peilian/peilian-service');
	var config = require('js/app/conf/config');

	So.Command.PeilianCityListHandler = So.Command.Base.extend({
		_run:function(){
			So.Waiting.show("正在搜索服务开通的城市");

			var ck = function(d){
				So.Waiting.hide();
				So.Gcmd.changeHash("peilian/index",d);
			}
			So.PeilianService.doGetCityList({},ck);
		}
	});

	So.Command.CarTypeListHandler = So.Command.Base.extend({
		init: function(a) {
            this._super(a);
        },
		_run:function(){
			So.Waiting.show("正在搜索 " + this._params.wd);
			var ck = function(d){
				So.Waiting.hide();
				So.Gcmd.changeHash("peilian/index",d);
			}
			So.PeilianService.doGetCarTypeList({cityname:this._params.city},ck);
		}
	});

	So.Command.JiaolianListHandler = So.Command.Base.extend({
		_run:function(a){
			So.Waiting.show("正在搜索 附近的教练");
			var ck = function(d){
				So.Waiting.hide();
				So.Gcmd.changeHash("peilian/jiaolian", d);
			}
            var lat = this._params.lng,
                lng = this._params.lat;
			var cp = (this._params&&this._params.cp)?this._params.cp:1;
			So.PeilianService.doGetJiaolianList({page:cp,pagesize:10,lat:lat,lon:lng},ck);
		}
	});

	So.Command.JiaolianInfoHandler = So.Command.Base.extend({
		_run:function(a){
			So.Waiting.show('获取教练信息');
			var ck = function(d){
				So.Waiting.hide();
				So.Gcmd.changeHash("peilian/jiaolianInfo", d);
			}
			So.PeilianService.doGetJiaolianInfo({id:this._params.jid},ck);
		}
	});

	So.Command.OrderService = So.Command.Base.extend({
		_run:function(a){
			So.Waiting.show("正在提交订单");
			var ck = function(d){
				//console.log(d);return
				So.Waiting.hide();
				So.Gcmd.changeHash('peilian/result', d);
			}
			So.PeilianService.doGetOrderService(this._params,ck);
		}
	});
});
