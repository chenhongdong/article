define(function(require) {
    var config = require('js/app/conf/config');
    var data = {},timer,ov;
    var a = {
        _visible: false,
        tpl: {
            peilian_searchPoi: require('../../../templates/peilian/searchPoi.html')
        },
        name: "peilian_searchPoi",
        logname: "peiliansearpoipage",
        containMap: false,
        setBodyMainHeight: false,
        prepare:function(d){
        	data = d;
            var html = So.View.template(this.tpl.peilian_searchPoi,{});
            $('#CTextDiv').html(html);
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;

            var d = c ? "block" : "none";
            $('#CTextDiv').css("display",d);

            $('input[name="peilian-search"]').focusin(function(e){
                ov = $('input[name="peilian-search"]').val();
                timer = setInterval(checkValue,500);
            });
            $('input[name="peilian-search"]').focusout(function(e){
                clearInterval(timer);
            });
        },
        cmd:function(c){
        	switch(c.id){
        		case 44:
                clearInterval(timer);
                $("#poi-list").empty();
        		So.Gcmd.changeHash("peilian/order",data);
        		break;
                case 999:
                //
                break;
        	}
        }
    };
    function checkValue(){
        if($('input[name="peilian-search"]').val() == ov)return;
        ov = $('input[name="peilian-search"]').val();
        var parten = /^\s*$/;
        if(!ov||parten.test(ov)){$("#poi-list").empty();return;}
        sendReq(getKeywordData(),updateList);
    }
    function updateList(d){
        $("#poi-list").empty();
        var $f = $("<li></li>").addClass('list-item').appendTo($("#poi-list"));
        $("<p></p>").text($('input[name="peilian-search"]').val()).appendTo($f);
        $f.on("click",function(e){
            var t = $(this).find('p').eq(0).text(),
                parten = /^\s*$/;
            if(!parten.test(t))data.dest_address = t;
            a.cmd({id:44});
        });
        _.each(d.list,function(v,i){
            var $li = $("<li></li>").addClass('list-item').appendTo($("#poi-list"));
            $("<span></span").addClass("peilian-search-icon").appendTo($li);
            $("<p id="+'p'+i+" style='overflow:hidden;text-overflow:ellipsis;width: 100%;white-space:nowrap;'></p>").text(v.name).appendTo($li);
            v.district = v.district ||'未知区域';
            $("<p style='font-size:100%;color:gray;'></p>").text(v.district).appendTo($li);
            $li.on("click",function(e){
                var t = $(this).find('p').eq(0).text(),
                    parten = /^\s*$/;
                if(!parten.test(t))data.dest_address = t;//$(this).find('p').eq(0).text();
                a.cmd({id:44});
            });
        });
    }
    function getKeywordData(){
        var d = {},
            loc = So.State.getLocation();
        d.keyword = $('input[name="peilian-search"]').val();
        d.city = loc.city;
        d.cityname = loc.city;
        d.sid = 1014;
        return d;
    }
    function sendReq(d,c){
        if(!c)return;
        $.ajax({
            url: config.ASS_SERVER,
            async: true,
            type: "GET",
            dataType: "jsonp",
            jsonp: "jsoncallback",
            data: d,
            cache: false,
            success: function(f) {
                c(f);
            },
            error: function(h, g, f) {
                /*logInfo.status = "SearchKeywordPoi" + "_**peilian**fail**";
                logInfo.code = g;*/
            }
        });
    }
    return a;
});
