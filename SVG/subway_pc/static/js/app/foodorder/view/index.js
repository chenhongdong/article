define(function(require) {
    var tpl = require('../../../templates/foodorder/index.html');
    var Selector = require('../../widget/selector');
    var config = require('js/app/conf/config'); 
    var param = So.urltojson(location.href);
    var isSubmit = false;

    var a = {
        init:function() {
            a.cmFuncs.checkLogin();
            $("#CTextDiv").html(So.View.template(tpl, {
                data:{
                    nPeopleCount:4,
                    currentDate:a.cmFuncs.formatDay(new Date()),
                    currentTime:a.cmFuncs.formatTime(a.cmFuncs.getCurrentTime()),
                    paramTime:a.cmFuncs.formDateTime([a.cmFuncs.formatDay(new Date()),a.cmFuncs.formatTime(a.cmFuncs.getCurrentTime())]),
                    title:param.title
                }
            }));
            a.bindEvent();
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CTextDiv").css("display", d)
        },
        cmFuncs:{
            getCurrentTime:function() {
                var date = new Date();
                var minutes = date.getMinutes();
                var hours = date.getHours();
                if(hours < 10){
                    date.setHours(10);
                    date.setMinutes(0);
                }
                else if(hours > 22) {
                    date.setHours(22);
                    date.setMinutes(0);
                }
                else {
                    date.setMinutes(minutes + (15-minutes % 15) + 15);
                }
                return date;
            },
            formatDay:function(date) {
                var month = (date.getMonth() + 1);
                var day =  date.getDate();
                if(month < 10){
                    month = "0" + month;
                }
                if(day < 10){
                   day = "0" + day;
                }
                return month  + "月" + day + "日";
            },
            formatTime:function(date) {
               var hours = date.getHours();
                var minutes = date.getMinutes();
                if(hours < 10){
                    hours = "0" + hours;
                }
                if(minutes < 10){
                    minutes = "0" + minutes;
                }
                return hours + ":" + minutes; 
            },
            peopleNum:function(num) {
                $(".selector-mask").show();
                $("#selector").show();
                var selector = Selector({
                    dom:$("#selector"),
                    start:[1],
                    end:[50],
                    current:[num],
                    opeartorFunc:[function(start,type) {
                        if(!start) return "";
                        start = Number(start);
                        if(type === "add"){
                            return start + 1;
                        }
                        else {
                            return start - 1;
                        }      
                    }
                    ],
                    cancelClick:function() {
                        $(".selector-mask").hide();
                        $("#selector").html("");
                        $("#selector").hide();

                    },
                    sunmitClick:function(data) {
                        $(".selector-mask").hide();
                        $("#selector").html("");
                        $("#selector").hide();
                        $("#peopleNum").html(data[0]);
                    }
                });
            },
            eatTime:function(day,time) {
                $(".selector-mask").show();
                $("#selector").show();
                var selector = Selector({
                    dom:$("#selector"),
                    start:[a.cmFuncs.formatDay(new Date()),"10:00"],
                    current:[day,time],
                    end:[a.cmFuncs.formatDay(new Date((new Date()).getYear(),(new Date()).getMonth(),(new Date()).getDate() + 50)),"22:00"],
                    opeartorFunc:[function(start,type) {
                        if(!start) return "";
                        var date = start.split(/月|日/);
                        var day = Number(date[1]);
                        var month = Number(date[0]) - 1;
                        var year = (new Date()).getFullYear();

                        if(type === "add") {
                            var rdate = new Date(year,month,day + 1);
                            return a.cmFuncs.formatDay(rdate);
                        }
                        else {
                            var rdate = new Date(year,month,day - 1);
                            return a.cmFuncs.formatDay(rdate);
                        }      
                    },function(start,type) {
                        if(!start) return "";
                        var day = (new Date()).getDate();
                        var month = (new Date()).getMonth();
                        var year = (new Date()).getFullYear();
                        var time = start.split(":");
                        var hours = Number(time[0]);
                        var minutes = Number(time[1]);
                        if(type === "add"){
                            var rdate = new Date(year,month,day,hours,minutes + 15);
                            return a.cmFuncs.formatTime(rdate);
                        }
                        else {
                            var rdate = new Date(year,month,day,hours,minutes - 15);
                            return a.cmFuncs.formatTime(rdate);
                        }      
                    }],
                    cancelClick:function() {
                        $(".selector-mask").hide();
                        $("#selector").html("");
                        $("#selector").hide();

                    },
                    sunmitClick:function(data) {
                        $(".selector-mask").hide();
                        $("#selector").html("");
                        $("#selector").hide();
                        $("#eatDay").html(data[0]);
                        $("#eatTime").html(data[1]);

                        var date = new Date();
                        var day = date.getDate();
                        var year = date.getFullYear();
                        var month = date.getMonth();

                        var eatInfo = "";
                        if(a.cmFuncs.formatDay(date) == data[0]){
                            eatInfo = "今天";
                        }
                        else if(a.cmFuncs.formatDay(new Date(year,month,day+1)) == data[0]){
                            eatInfo = "明天";
                        }
                        $("#eatInfo").html(eatInfo);

                        var paramTime = a.cmFuncs.formDateTime(data);
                        $("#eatDateTime").attr("data-time",paramTime);

                        if(a.cmFuncs.validateTime()){
                            $.ajax({
                                url: "//shenbian.haosou.com/xiaomishu/getResRoomState",
                                async: true,
                                type: "GET",
                                dataType: "jsonp",
                                jsonp: "cb",
                                data: {
                                    sresid:param.sResId,
                                    sdiningtime:paramTime
                                },
                                success: function(d) {
                                    if(!d) return;
                                    var diningAddrs =  $("#dining-info-address").children('li');
                                    var romStates = d.getResRoomState.data.objInfo[0].RoomStateList;
                                    if(!(romStates[0].StatusName == "有空位")) {
                                       $(diningAddrs[0]).removeClass("active");
                                       $(diningAddrs[0]).addClass("noSelect");
                                       $(diningAddrs[2]).removeClass("active");
                                       $(diningAddrs[2]).addClass("noSelect");
                                       $(diningAddrs[3]).removeClass("active");
                                       $(diningAddrs[3]).addClass("noSelect");
                                    }
                                    if(!(romStates[1].StatusName == "有空位")) {
                                       $(diningAddrs[1]).removeClass("active");
                                       $(diningAddrs[1]).addClass("noSelect");
                                       $(diningAddrs[2]).removeClass("active");
                                       $(diningAddrs[2]).addClass("noSelect");
                                       $(diningAddrs[3]).removeClass("active");
                                       $(diningAddrs[3]).addClass("noSelect");
                                    }
            
                                },
                                error: function() {
                                    
                                }
                            });
                        }

                    }
                });                
            },
            cmd:function(data_action) {
                switch(data_action) {
                    case "goBack":
                        history.back();
                        break;
                    case "peopleNum":
                        a.cmFuncs.peopleNum(Number($('#peopleNum').html()));
                        break;
                    case "eatTime":
                        a.cmFuncs.eatTime($("#eatDay").html(),$("#eatTime").html());
                        break;
                    case "submit":
                        a.cmFuncs.submitForm();
                        break;    
                }
            },
            validateTime:function() {
                var now = new Date();
                var date = $("#eatDay").html();
                var time = $("#eatTime").html();

                var date = date.split(/月|日/);       
                var day = Number(date[1]);
                var month = Number(date[0]) - 1;
                var time = time.split(":");
                var hours = Number(time[0]);
                var minutes = Number(time[1]);

                var selectDate = new Date(now.getFullYear(),month,day,hours,minutes);
                var restTime = (selectDate - now) / 1000 / 60;
                if(restTime < 15) {
                    alert("抱歉，我们只能接受15分钟以后的预约！");
                    return false;
                }
                return true;
            },
            validateSubmit:function() {
                if(!a.cmFuncs.validateTime()){
                    return false;
                }
                if($.trim($(".user-name").val()) == "") {
                    alert("您尚未输入姓名");
                    return false;
                }
                if($.trim($(".tel").val()) == "") {
                    alert("您尚未输入手机号");
                    return false;
                }  
                if(!/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/.test($.trim($(".tel").val()))){
                    alert("请您输入正确的手机号码");
                    return false;
                }
                return true;


            },
            submitForm:function() {
                if(!a.cmFuncs.validateSubmit()) return;

                if(isSubmit) {
                    alert("订单正在创建中，请不要重复提交");
                }
                isSubmit = true;
                var data = {};
                data.sresid = param.sResId;
                data.npeoplecount = Number($("#peopleNum").html());
                data.sdinningtime = $("#eatDateTime").attr("data-time");
                data.nisroom = $("#dining-info-address").children("li.active").attr("data-data");
                data.sbookmobile = $("#user-info-tel").val();
                data.sbooksex = $("#dining-user-sex").children("li.active").attr("data-data");
                data.sbookname = $("#user-info-name").val();
                data.title = param.title;

                $.ajax({
                        url: "//shenbian.haosou.com/xiaomishu/createOrder",
                        type: "GET",
                        dataType: "jsonp",
                        jsonp: "cb",
                        data: data,
                        success: function(d) {
                            if(!d.createOrder.data){
                                alert(d.createOrder.ext.result.sMessage);
                                isSubmit = false;
                                return;
                            }
                            alert("预约成功，要准时到达哦");
                            history.back();
                            isSubmit = false;

            
                        },
                        error: function() {
                            isSubmit = false;
                            alert("预约失败了，再试一次吧");        
                        }
                });
                
            },
            formDateTime:function(data) {
                var date = data[0].split(/月|日/);
                var day = date[1];
                var month = date[0];
                var time = data[1].split(":");
                var hours = time[0];
                var minutes = time[1];

                var now = new Date();
                var selectTime = new Date(now.getFullYear(),Number(month) - 1,day,hours,minutes);
                if(selectTime.getTime() < now.getTime()) {
                    selectTime.setYear(now.getFullYear() + 1);
                }
                return "" + selectTime.getFullYear() + month + day  + hours + minutes;
            },
            checkLogin:function() {
                var ua = navigator.userAgent;
                QHPass.getUserInfo(function(data){
                    
                },function(){
                    if(window.__HaoSouFun__ && __HaoSouFun__.login){
                        __HaoSouFun__.login();
                    }else if(ua.indexOf('360around') > -1 || ua.indexOf('360shenbian') > -1){
                        JTN.getNative("goLogin",{},function(d){});
                    }else{
                        window.location.replace("//i.360.cn/login/wap/?src=mpw_around&destUrl="+
                        encodeURIComponent(window.location.href));
                    }
                });
            },

        },
        eventFunc:{
           clickEvent:function() {
                var data_action = $(this).attr('data-action');
                a.cmFuncs.cmd(data_action);
           },
           diningAddrSelect:function() {
              $(".dining-info-address li.active").removeClass("active");
              $(this).addClass("active");
           },
           userSexSelect:function() {
              $("#dining-user-sex li.active").removeClass("active");
              $(this).addClass("active");
           }
        },
        bindEvent:function() {
            $(document.body).on("tap",".operator-btn",a.eventFunc.clickEvent);
            $("#dining-info-address").on("tap","li:not(.noSelect)",a.eventFunc.diningAddrSelect);
            $("#dining-user-sex").on("tap","li",a.eventFunc.userSexSelect);
        }
    }

    a.init();
    return a;
});
