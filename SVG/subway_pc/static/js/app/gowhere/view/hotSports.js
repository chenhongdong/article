define(function(require) {
	var config = require('js/app/conf/config');
    var enabled = false;
    var page;
    var a = {
        _visible: false,
        _init: false,
        tpl: {
            gowhere_hotSports: require('../../../templates/gowhere/hotSports.html')
        },
        name: "gowhere_hotSports",
        logname: "gowherehotSportspage",
        containMap: false,
        setBodyMainHeight: false,
        prepare:function(d){
            d.wd = "创意活动";
            //console.log(d);
            if(!d.att){
                d.att = {
                    cp : 1
                }
            }
            page = d.att.cp;
            d.totalPages = Math.ceil(d.total/10);
            enabled = true;
    		var html = So.View.template(this.tpl.gowhere_hotSports,d);
            $('#CTextDiv').html(html);
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
                case 444://从按钮直接回精彩活动
                c.cp = 1;
                new So.Command.GowhereNearSports(c).run();
                break;
        		case 44://从后退按钮分页上翻，直到回精彩活动
                /*if(page == 1)new So.Command.GowhereNearSports(c).run();
                else{
                    enabled = false;
                    window.scroll(0,1);
                    page-=1;
                    c.cp = page;
                    new So.Command.GowhereHotSports(c).run();
                }*/
                new So.Command.GowhereNearSports(c).run();
        		break;
                case 666://console.log(c.sid);
                c.from = "hot";
                new So.Command.GowhereSportsDetail(c).run();
                break;
                case 1://prev
                if(!enabled)return;
                enabled = false;
                window.scroll(0,1);
                c.cp-=1;
                new So.Command.GowhereHotSports(c).run();
                break;
                case 2://next
                if(!enabled)return;
                enabled = false;
                window.scroll(0,1);
                c.cp+=1;
                new So.Command.GowhereHotSports(c).run();
                break;
        	}
        }
    };
    return a;
});