define(function(require) {
	require('js/app/gowhere/gowhere-service');
	var config = require('js/app/conf/config');

	So.Command.GowhereNearSports = So.Command.Base.extend({
		init: function(a) {
            this._super(a);
        },
		_run:function(){
			So.Waiting.show("正在加载 创意活动");
			var ck = function(d){
				So.Waiting.hide();
				if(d.status == 2){
					So.Gcmd.changeHash("search/index", {});
					alert("该城市不支持本活动!");
				}else if(d.status == 0){
					So.Gcmd.changeHash("search/index", {});
					alert("没有找到数据,请稍后重试");
				}else if(d.status == 1){
					So.Gcmd.changeHash("gowhere/index", d);
				}
			}
            var loc = So.State.getLocation(),
                c = loc.city,
                y = loc.y,
                x = loc.x,
			    i = this._params.cp||1;
			So.GowhereService.doGetNearSports({city:c,page:i,pagesize:10,y:y,x:x},ck);
		}
	});
	So.Command.GowhereHotSports = So.Command.Base.extend({
		_run:function(a){
			So.Waiting.show("正在加载 专题活动");
			var ck = function(d){
				So.Waiting.hide();
				if(d.status == 0){
					So.Gcmd.changeHash("search/index", {});
					alert("没有找到数据,请稍后重试");
				}else if(d.status == 1){
					So.Gcmd.changeHash("gowhere/hotSports", d);
				}
			}
            var loc = So.State.getLocation(),
                c = loc.city,
                y = loc.y,
                x = loc.x,
			    i = this._params.cp||1;
			So.GowhereService.gowhereProxy.hp = i;
			So.GowhereService.doGetHotSports({page:i,pagesize:10,city:c,y:y,x:x},ck);
		}
	});
    So.Command.GowhereSportsDetail = So.Command.Base.extend({
		_run:function(a){
			So.Waiting.show('正在努力加载...');
			var ck = function(d){
				So.Waiting.hide();
				if(d.att == "nearby")So.Gcmd.changeHash("gowhere/gowhere-detail", d);
				if(d.att == "hot")So.Gcmd.changeHash("gowhere/index",d);
			}
			var id = this._params.sid,from = this._params.from,data= {};
			if(from == "hot"){
				So.GowhereService.gowhereProxy.i = id;
				data.id = id;data.from = from;
                var loc = So.State.getLocation();
				data.x = loc.x;
				data.y = loc.y;
			}//如果是冲活动列表进入detail，就记录下当前的分类id
			if(from == "nearby"){
				So.GowhereService.gowhereProxy.p = this._params.page;
				data.id = id;data.from = from;
			}
			So.GowhereService.doGetSportDetail(data,ck);
		}
	});
});
