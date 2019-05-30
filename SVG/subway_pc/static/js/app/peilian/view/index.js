define(function(require) {
	var config = require('js/app/conf/config');

    var lng,lat,city;

    var a = {
        _visible: false,
        _init: false,
        tpl: {
            peilian_index: require('../../../templates/peilian/index.html')
        },
        name: "peilian_index",
        logname: "peilianindexpage",
        containMap: false,
        setBodyMainHeight: false,
        prepare:function(d){
            d.wd = "陪练";

            if(d.courses){
                var html = So.View.template(this.tpl.peilian_index,d);
                $('#CTextDiv').html(html);
                return;
            }

            if(!d.citylist){
                new So.Command.PeilianCityListHandler(d).run();
                return;
            }

            var me = this;

            if(navigator.userAgent.indexOf('360around') > -1 || navigator.userAgent.indexOf('360shenbian') > -1){
                JTN.getNative("getLocation",{"param":1},function(responseData){
                    eval("var j="+responseData);
                    lng = j.x||j.a;
                    lat = j.y||j.b;
                    city = j.c||j.city;
                    me.checkFuwu(d,city+'市');
                });
            }else{
                So.GeolocationService.getPosition(function(pt) {
                    lng = pt.lng;
                    lat = pt.lat;

                    $.ajaxJSONP({
                          url: So.serviceUrl.rgeocoder_url + "?sid=7001&x="+lng+"&y="+lat+"&callback=?",
                          success: function(data){
                             me.checkFuwu(d,data.city_name);
                          },
                          complete:function(data){
                            /*zepto 报错complete.call*/
                          }
                    });
                }, function(d) {
                    me.checkFuwu(d,'未知城市');
                }, null)
            }
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $('#CTextDiv').css("display",d);
        },
        cmd:function(c){
        	switch(c.id){
        		case 44:
            		window.history.back();
        		break;
                case 999:
                    new So.Command.JiaolianListHandler({lng:lng,lat:lat}).run();
                break;
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                    So.Gcmd.changeHash("peilian/order",c);
                break;
        	}
        },
        checkFuwu:function(d,cn){

            var kc = [],
                city = cn||'未知城市';

            for(var i = 0; i < d.citylist.length;i++){
                kc.push(d.citylist[i].cityname);
            }

            if(kc.indexOf(city)==-1){
                alert('您所在区域没有服务');
                window.history.back();
            }else{
                new So.Command.CarTypeListHandler({wd:'车型',city:city}).run();
            }
        }
    };
    return a;
});