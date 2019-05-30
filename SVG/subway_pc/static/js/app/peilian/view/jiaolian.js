define(function(require) {
	var config = require('js/app/conf/config');
    var a = {
        _visible: false,
        _init: false,
        tpl: {
            peilian_jiaolian: require('../../../templates/peilian/jiaolian.html')
        },
        name: "peilian_jiaolian",
        logname: "peilianjiaolianpage",
        containMap: false,
        setBodyMainHeight: false,
        prepare:function(d){

            if(!d.list){
                window.location.href = "/orders/#scene=service";
            }

        	d.wd = "附近教练";//console.log(d.att.cp);
            if(!d.att){
                d.att = {
                    cp : 1
                }
            }
            if(d.count <= 10){d.totalPages = 1;}
            else{d.totalPages = Math.ceil(d.count/10);}
            _.each(d.list,function(p,i){
                if(p.distance > 0){
                    p.distance = (p.distance > 100)?'>100':p.distance;
                    p.dis= '距离 : '+p.distance+ '公里';}
                else{p.dis = '未知距离';}
            });
            var html = So.View.template(this.tpl.peilian_jiaolian,d);
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
                if(!c.cp||(c.cp&&c.cp == 1)){
                    //new So.Command.CarTypeListHandler({id:9,cat:'jt',wd:'陪练'}).run();
                    So.Gcmd.changeHash("peilian/index",{});
                }
                if(c.cp&&c.cp > 1){
                    c.cp -=1;
                    window.scroll(0, 1);
                    new So.Command.JiaolianListHandler({cp:c.cp}).run();
                }
                //if(!c.cp)new So.Command.CarTypeListHandler({id:9,cat:'jt',wd:'陪练'}).run();
        		break;
                case 0:
                //console.log('jiaolian' + c.jid);
                new So.Command.JiaolianInfoHandler(c).run();
                break;
                case 1://prev
                if(c.cp == 1)return;
                else c.cp -=1;
                window.scroll(0, 1);
                new So.Command.JiaolianListHandler({cp:c.cp}).run();
                break;
                case 2://next
                if(c.cp == c.totalPages)return;
                else c.cp +=1;
                window.scroll(0, 1);
                new So.Command.JiaolianListHandler({cp:c.cp}).run();
                break;
        	}
        }
    };
    return a;
});