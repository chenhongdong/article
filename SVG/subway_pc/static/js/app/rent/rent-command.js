define(function(require) {
	var rentService = require('js/app/rent/rent-service');
	So.Command.RentSearch = So.Command.Base.extend({
		_run:function(){
			So.Waiting.show("正在加载 短租民宿");
			pageIndex = this._params.page || 1;
			var params = {};
			var me = this;
            var view_name = So.State.currentUI.__view_name__ || 'rent/list';
			var cb = function(data){
				So.Waiting.hide();
				if(data.status == 1){
					So.Gcmd.changeHash(view_name, _.extend(data,{
						command : me,
						params : params,
						index : 0,
						name : '短租民宿'
					}));
				}
			}
            var loc = So.State.getLocation(),
                c = loc.city,
			    y = loc.y,
			    x = loc.x,
				mp = y + ',' + x;
			
			params = {
				c : c,
				page : pageIndex,
				mp : mp
			};
			rentService.doGetRentList(params,cb);
		}
	});
});
