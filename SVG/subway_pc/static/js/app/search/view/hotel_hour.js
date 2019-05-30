define(function(require) {
    var config = require('js/app/conf/config');
    //是否启用房间可否预订检测
    var part_house_check = So.module.part_house && So.module.part_house.check && So.module.part_house.check == "1" || false;
    var a = {
        _visible: false,
        tpl:{
            hotel_hour: require('../../../templates/search/hotel_hour.html'),
            hotel_hour_ok: require('../../../templates/search/hotel_hour_ok.html')
        },
        name: "search_hotel_hour",
        logname: "search_hotel_hour",
        containMap: false,
        prepare: function(data) {

            var me = this;

            if(me.getQueryString('pguid')){
                 me.doGetRoomData(me.getQueryString('pguid'));
            }else{
                alert('找不到对应的信息');
                window.history.back();
                return;
            }
        },
        didGetRoomInfo : function(info){

            var me = this;

            var id = me.getQueryString('id')||0,
                type = '未知房型';

            for(var i = 0; i < info.youjianfang.rooms.length; i++){
                var rt = info.youjianfang.rooms[i];
                if(rt.id == id){
                    type = rt.type;
                    break;
                }
            }

            var info_data = {};
            info_data.hour_data = {

                name:info.name||'未知酒店',
                type : type,
                id:id,
                hotelId:me.getQueryString('hotelId')||0,
                price:me.getQueryString('price')||'未知价格',
                duration:me.getQueryString('duration')||'未知时长',
                tel:info.tel||'0'
            }
            me.handleRoomData(info_data);
        },
        getQueryString : function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.hash.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
        },
        doGetRoomData: function(pguid){
            var me = this;
             $.ajax({
                type:'GET',
                url:'/app/hour/roominfo?pguid='+pguid,//'//m.map.so.com/app/hour/order',
                success: function(info){
                    try{
                        info = JSON.parse(info);
                        me.didGetRoomInfo(info);
                    }catch(e){
                        window.__errorReport__ && window.__errorReport__.report(e,1096);
                    }

                },
                error: function(){
                    //
                }
            });
        },
        handleRoomData: function(data){
            var me = this;
            this.param = data;
            $("#CTextDiv").html(So.View.template(this.tpl.hotel_hour, _.extend({
                time: me.getTimeToShop(),
                part_house_check: part_house_check
            },data)));

            if(part_house_check){
                this.checkRoom();
            }
        },
        checkRoom: function(){
            var me = this,
                hour_data = this.param.hour_data;

            $.ajax({
                async: true,
                type: "GET",
                dataType: "jsonp",
                url:'//m.map.so.com/app/hour/check?cb=?',
                data: {
                    'hotelId': hour_data.hotelId,
                    'saleId': hour_data.id
                },
                success: function(info){
                    me.changeRoomStats(info);
                },
                error: function(info){
                    me.changeRoomStats(info);
                }
            })
        },
        changeRoomStats: function(info){
            info = info || {
                succ: 1,
                rest: false
            };

            if(info.rest){
                $('#checkRoomIng').hide();
                $('#hotel_hour_form').show();
            }else{
                $('#checkRoomIng').html('房间已满，请更换其他房间');
            }
        },
        getTimeToShop: function(){
            //So.now = new Date('2014-10-20 23:31').getTime();
            var time = new Date(So.now),
                hour = time.getHours(),
                minute = time.getMinutes(),
                day = 0,
                minute1 = minute == 0 ? 1 : minute == 30 ? 0 : parseInt(minute / 30),
                show_day = ['当天','次日'],
                show_hour = minute == 0 ? hour : hour + 1,
                show_minute = ['00','30'];

            if(show_hour > 23){
                show_hour = show_hour %24;
                day = 1;
            }

            return show_day[day] + show_hour + ':'+ show_minute[minute1] +'之前';
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CTextDiv").css("display", d)
        },
        checkForm: function(){
            var form = $('#hotel_hour_form'),
                requiredItem = form.find('input[data-required]'),
                isFirst = true,//判断是否是第一个验证不通过的input，是第一个时input focus
                verified = true;//from表单验证是否通过;

            var rules = {
                'name': function(val){
                    return /^[\u4E00-\u9FA5\uF900-\uFA2D]{2,5}$/.test(val);
                },
                'phone': function(val){
                    return /^1[34578]\d{9}$/.test(val);
                }
            }

            var validationFailed = function(input){
                input = input || {};
                var type = input.attr('type'),
                    val = $.trim(input.val()),
                    faild = false;

                if(type && rules[type]){
                    faild = !(rules[type](val));
                }

                return faild;
            }


            _.forEach(requiredItem, function(item){

                var input = $(item),
                    val = $.trim(input.val()),
                    errorMsg = input.data('errormsg');

                if(!val || validationFailed(input)){
                    //input.addClass('error');
                    //input.attr('placeholder', errorMsg);
                    if(isFirst){
                        alert(errorMsg);
                        input.focus();
                        isFirst = false;
                    }

                    verified = false;
                }
            })

            return verified;
        },
        submitInfo: function(){
            var isOk = this.checkForm(),
                me = this;

            if(!isOk){
                return false;
            }
            //请求发出后不可再点击，防止网速慢时用户多次点击
            var submit_button = $('input[name=hour_submit]');

            submit_button.attr('disabled','disabled').val('正在提交中，请稍后...').css({'backgroundColor':'#999'});

            // monitor.log({
            //     'pro':'map_onebox',
            //     'pid':'detail',
            //     'data-md-p': 'hotel_hour',
            //     'data-md-client':config.APP_CLIENT,
            //     'data-md-system':config.APP_SYSTEM,
            //     'data-md-partner': '有间房',
            // }, 'click');

            $.ajax({
                type:'POST',
                url:'/app/hour/order',//'//m.map.so.com/app/hour/order',
                data: $('#hotel_hour_form').serialize(),
                success: function(info){
                    try{
                        info = JSON.parse(info);
                        me.showOk(info);
                    }catch(e){
                        window.__errorReport__ && window.__errorReport__.report(e,1095);
                    }
                },
                error: function(){
                    me.showOk();
                }
            });
        },
        showOk: function(info){
            info = _.extend({
                'succ': 0,
                'error': '订单提交失败，请稍后重试'
            },info);

            _.extend(info, {
                tel: this.param.hour_data.tel
            })

            $("#CTextDiv").html(So.View.template(this.tpl.hotel_hour_ok, info));
        },
        cmd: function(c) {
            switch (c.id) {
                case 1:
                    window.history.back()
                    break;
                case 2:
                    this.submitInfo();
                    break;
                case 999:
                    window.location.reload(true);
                    break;
            }
        },
        resize: function() {
        }
    };
    return a;
});
