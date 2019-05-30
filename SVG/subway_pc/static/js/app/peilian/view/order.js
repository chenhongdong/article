define(function(require) {
    var config = require('js/app/conf/config');
    require('js/lib/dt/ms');
    var data = {};
    var WARNING_DATE = "请正确选择陪练日期",WARNING_PHONE = "请正确输入电话号码",WARNING_LOC_FAIL = '定位失败,请搜索地址',
        WARNING_LOC_WRONG = "请正确选择接送地址";
    var a = {
        _visible: false,
        tpl: {
            peilian_order: require('../../../templates/peilian/order.html')
        },
        name: "peilian_order",
        logname: "peilianorderpage",
        containMap: false,
        setBodyMainHeight: false,
        prepare:function(d){
        	var g = {},
                loc = So.State.getLocation();
                g.wd = "车型预订";
                g.car_type = d.id||d.car_type||-1;
                g.currentLocation = d.dest_address||loc.address||WARNING_LOC_FAIL;
                g.selectdate = d.selectdate||'请选择陪练时间';
                g.sel_time = d.sel_time||2;
                g.gearbox = d.gearbox||'自动挡';
                g.d_phone = d.d_phone||'';
                g.jn = d.jn;
                g.jid = d.youxianid;
                g.note = d.note||'';
                var html = So.View.template(this.tpl.peilian_order,g);
                $('#CTextDiv').html(html);

                handleDt();
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $('#CTextDiv').css("display",d);

            c?$('#selectdate').mobiscroll('enable'):$('#selectdate').mobiscroll('disable');
        },
        cmd:function(c){
        	switch(c.id){
        		case 44:
            		//new So.Command.CarTypeListHandler({id:9,cat:'jt',wd:'陪练'}).run();
                    window.history.back();
                break;
                case 999:
                if(c.action == 'searchPoi'){
                    saveCurrent();
                    So.Gcmd.changeHash("peilian/searchPoi",data);
                }
                if(c.action == "postOrder"){
                    saveCurrent();
                    checkPost();
                }
                break;
        	}
        }
    };
    function checkPost(){
        if(!data)return;
        if(!data.selectdate||data.selectdate == '请选择陪练时间'){alert(WARNING_DATE);return}
        if(!data.dest_address||data.dest_address == WARNING_LOC_FAIL){alert(WARNING_LOC_WRONG);return}
        var partten=/^1[3|4|5|8][0-9]\d{8}$/;
        if(!partten.test(data.d_phone)){alert(WARNING_PHONE);return}

        delete data.jn;
        if(data.car_type == '-1')delete data.car_type;
        if(data.youxianid == undefined)delete data.youxianid;

        new So.Command.OrderService(data).run();
        //So.Gcmd.changeHash("peilian/result",{state:1});
    }
    function saveCurrent(){
        data = {
            selectdate:$('#selectdate').text(),
            sel_time:$("input[name='long']:checked").val(),
            dest_address:$("span[name='location']").text(),
            gearbox:$("input[name='auto']:checked").val(),
            d_phone:$("input[name='phone']").val(),
            note:$("input[name='note']").val(),
            jn:$("input[name='jn']").val(),
            youxianid:$("input[name='jn']").data('jid'),
            car_type:$(".main-table").data('cid')
        }
        if(data.jn)data.jn = data.jn.slice(0,data.jn.length - 2);
    }
    function handleDt(){
        var u = navigator.userAgent, app = navigator.appVersion; 
        var isIos = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        var _maxDate = new Date();
        _maxDate.setDate(new Date().getDate()+10);
        var currDate = new Date();
        var opt = {
                preset: 'datehour',
                theme:'android-ics light',
                mode:'scroller',
                display:'modal',
                lang:'zh',
                rows:3,
                showLabel:true,
                sht: true
         }; 
         $('#selectdate').val('').mobiscroll(opt);
    }
    return a;
});
