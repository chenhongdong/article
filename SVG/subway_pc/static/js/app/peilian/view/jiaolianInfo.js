define(function(require) {
	var config = require('js/app/conf/config');
    var currentJiaolian;
    var a = {
        _visible: false,
        _init: false,
        tpl: {
            peilian_jiaolianinfo: require('../../../templates/peilian/jiaolianInfo.html')
        },
        name: "peilian_jiaolianinfo",
        logname: "peilianjiaolianinfopage",
        containMap: false,
        setBodyMainHeight: false,
        prepare:function(d){
        	d.coachinfo.wd = "教练详情";//console.log(d);
            d.coachinfo.pinglun = d.commentlist;
            d.coachinfo.g = d.good;d.coachinfo.m = d.middle;d.coachinfo.b = d.bad;
            if(d.coachinfo.carphoto){
                var temp = d.coachinfo.carphoto.split(',');
                temp.pop();
                if(temp.length > 3){temp = temp.slice(0,3);}
            }
            d.coachinfo.cp = temp;
            currentJiaolian = d.coachinfo.name;
            var html = So.View.template(this.tpl.peilian_jiaolianinfo,d.coachinfo);
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
        		case 44:
                new So.Command.JiaolianListHandler({}).run();
        		break;
                case 0:
                c.jn = currentJiaolian;
                c.youxianid = So.PeilianProxy.jid;
                So.Gcmd.changeHash("peilian/order",c);
                break;
        	}
        }
    };
    return a;
});