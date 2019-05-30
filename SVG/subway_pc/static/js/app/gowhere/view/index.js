define(function(require) {
	var config = require('js/app/conf/config');
    var ct,da,ci,page;//当前类别，全部数据，当前页面序列（是首页列表，还是精选活动列表）,页数
    var enabled = false;
    var a = {
        _visible: false,
        _init: false,
        tpl: {
            gowhere_index: require('../../../templates/gowhere/index.html')
        },
        name: "gowhere_index",
        logname: "gowhereindexpage",
        containMap: false,
        setBodyMainHeight: false,
        prepare:function(d){
            if(!d.att||d.att != "hot"){
                d.wd = "创意活动";
                ci = "index";
                var temp,cats = ["全部"];
                ct = "全部";
                for(var i in d.result){
                    d.result[i].address = d.result[i].poi_name||"未知场所";
                    d.result[i].category = d.result[i].category||"未知分类";
                    d.result[i].dis = (d.result[i].distance!=-1)?d.result[i].distance.toFixed(2)+'KM':'';

                    if(temp!= d.result[i].category){
                        temp = d.result[i].category;
                        var n = d.result[i].category;
                        cats.push(n);
                    }
                }
                for(var j in cats){
                    var e = cats[j];
                    for(var m in cats){
                        if(m!= j){
                            if (e == cats[m]) {cats.splice(m,1);};
                        }
                    }
                }
                d.cats = cats;
                if(!d.att){
                    d.att = {
                        cp : 1
                    }
                }
                page = d.att.cp;
                d.totalPages = Math.ceil(d.total/10);
                da = d.result;
            }else if(d.att&&d.att == "hot"){
                if(d.result.ap_list){
                    var ta = d.result.ap_list;
                    d.wd = "活动列表";
                    ci = "list";
                    d.result = [];
                    //console.log(ta);
                    for(var j in ta){
                        d.result.push({
                            id:ta[j].id,
                            title:ta[j].title,
                            title_vice:ta[j].title_vice,
                            address:ta[j].poi_name||"未知场所",
                            dis : (ta[j].distance!=-1)?ta[j].distance.toFixed(2)+'KM':'',
                            category : ta[j].category||"未知分类",
                            pic:ta[j].img
                        });
                    }
                    d.cats = null;
                }
            }
            enabled = true;
    		var html = So.View.template(this.tpl.gowhere_index,d);
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
        		if(ci == 'index'){
                    /*if(page == 1)So.Gcmd.changeHash("search/nearby", {});
                    else{
                        enabled = false;
                        window.scroll(0,1);
                        page-=1;
                        c.cp = page;
                        new So.Command.GowhereNearSports(c).run();
                    }*/
                    So.Gcmd.changeHash("search/index", {});
                }else{
                    c.cp = So.GowhereService.gowhereProxy.hp||1;
                    new So.Command.GowhereHotSports(c).run();
                }
        		break;
                case 55:
                new So.Command.GowhereHotSports(c).run();
                break;
                case 66:
                updateSportsList(c.type);
                break;
                case 666:
                So.GowhereService.gowhereProxy.t = ci;//分辨是从首页还是从活动列表页进入detail的
                var data = {sid:c.sid,from:'nearby'};
                if(ci == "index")data.page = page;
                new So.Command.GowhereSportsDetail(data).run();
                break;
                case 1://prev
                if(!enabled)return;
                enabled = false;
                window.scroll(0,1);
                c.cp-=1;
                new So.Command.GowhereNearSports(c).run();
                break;
                case 2://next
                if(!enabled)return;
                enabled = false;
                window.scroll(0,1);
                c.cp+=1;
                new So.Command.GowhereNearSports(c).run();
                break;
        	}
        }
    };
    function updateSportsList(type){
        if(ct == type)return;
        var f = [];
        for(var i in da){
            if(da[i].category == type){
                var o = da[i];
                f.push(o);
            }
        }
        if(type == "全部")f = da;
        $("#sports-list").empty();
        for(var j in f){
            var $li = $("<li style='background-image:url("+f[j].pic+");position:relative;background-size: 100% auto;'></li>")
            .appendTo("#sports-list").on('click',function(e){
                So.Gcmd.cmd({id:666,sid:f[j].id});
            });
            var $div = $("<div style='position:absolute;bottom:0px;width:100%;text-indent:15px;background-color:rgba(0,0,0,0.4);padding:10px 0;'></div>")
            .appendTo($li);
            $("<p style='color:#fff;font-size:16px;' class='gowhere-text-desc'></p>").text(f[j].title)
            .appendTo($div);
            if(f[j].title_vice){
                $("<p style='color:#999;font-size:14px;' class='gowhere-text-desc'></p>").text(f[j].title_vice)
                .appendTo($div);
            }
            $("<p class='gowhere-text-desc' style='color:#3eaf1e;font-size:14px;'>")
            .html(f[j].address +" , "+ f[j].dis+
            '<span style="display:inline-block;width:20px;height:10px;"></span>' + f[j].category).appendTo($div);
        }
        ct = type;
        $("#cats-list li").removeClass("gowhere-cats-selected");
        $("#cats-list li[data-type = "+ct+"]").addClass("gowhere-cats-selected");

        if(ct!= "全部"){$("#pg-control").hide();}
        else {$("#pg-control").show();}
    }
    return a;
});