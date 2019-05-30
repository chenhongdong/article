define(function (require, exports, module) {

    var hotel = {};
    hotel.IsAmountGuarantee = false;
    hotel.IsTimeGuarantee = false;

    _.extend(hotel, Backbone.Events);
    hotel.on('showLoading', function () {
        hotel.loadingEl.show();
    });
    hotel.on('hideLoading', function () {
        hotel.loadingEl.hide();
    });
    hotel.on('changBtn', function () {
        if(hotel.IsAmountGuarantee || hotel.IsTimeGuarantee){
            $('#btnSelfPay').text('去担保'); 
        }else{
            $('#btnSelfPay').text('提交订单');
        }
    });
    hotel.on('guaranteBtn', function () {
    });
    _.extend(hotel,{
        loadingEl: $('#effect-dialog'),
        totalDays:1,
        service_url:"//shenbian.so.com",
        getParamObj: function (params) {
            var paramObj = {};
            var url = params.split('?');
            if (/http\:\/\//.test(url[0])) {
                paramObj['host'] = url[0];
                params = url[1];
            }
            if (params) {
                var i, item, params = params.split('&');
                var length = params.length;
                for (i = 0; i < length; i++) {
                    item = params[i].split('=');
                    item[0] = decodeURIComponent(item[0]);
                    item[1] = item[1] ? decodeURIComponent(item[1]) : true;
                    paramObj[item[0]] = item[1];
                }
            }
            return paramObj;
        },
        goBack:function(){
            window.history.back();
        },
        getCookie:function(){
            var cookieEl = {};
            if(document.cookie.length!==0){
                _.each(document.cookie.split('; '),function(v,i){
                    var temp = v.split('=');
                    cookieEl[temp[0]] = temp[1]
                })
            }
            return cookieEl;
        },
        getData: function (t) {
            /*$.ajax({ 这种post也会自动改为get
                 type: 'post', dataType: "jsonp",
                 url: hotel.service_url+ t.url,
                 data: t.data,
                 jsonp: "callback",
                 success: function (data) {
                 t.cb(data);
             },
             error:function(){
                 alert('接口故障');
                 //window.history.back();
                 }
             });*/

            //Access-Control-Allow-Origin : http://swx.hotel.m.map.test.haosou.com
            //Access-Control-Allow-Credentials:true
            //Access-Control-Allow-Headers:x-requested-with,content-type
            //Access-Control-Allow-Methods:POST
            //Access-Control-Allow-Origin:http://swx.hotel.m.map.test.haosou.com

            /*$.ajax({ 不带Cookie
                type: 'post', dataType: "json",
                url: hotel.service_url+ t.url,
                data: t.data,
                crossDomain: true,  //这个是重点及Access-Control-Allow-Origin
                success: function (data) {
                    t.cb(data);
                },
                error:function(){
                    alert('接口故障');
                    //window.history.back();
                }
            });*/
            $.ajax({
                type: 'post', dataType: "json",
                url: hotel.service_url+ t.url,
                data: t.data,
                xhrFields: { //这个是重点 及Access-Control-Allow-Credentials与Access-Control-Allow-Origin
                    withCredentials: true
                },
                success: function (data) {
                    t.cb(data);
                },
                error:function(){
                    //alert('接口故障');
                    //window.history.back();
                }
            });
        },
        changeRooms:function(opt){
            var a = _.extend({
                init:function(){
                    //当大于0小于5时，表示目前仅剩的房量;0表示房量充足
                    this.maxRoomNum = opt.maxRoomNum == 0 ? 5 : opt.maxRoomNum;
                    this.num = this.ulBox.find('li').length;
                    this.price = opt.price || 0;
                    this.GuaranteeCon = opt.GuaranteeCon;
                    this.cb = opt.cb;
                    this.text = 1;
                    this.liTemp = '<li><div class="g-cl-999 cap">入住人(房间{{=index}})</div><div class="cell"><input type="text" name="room{{=index}}-isRepeat" required placeholder="请填写入住人姓名"/></div></li>';
                    this.bindEvent();
                },
                extracted: function (currentNum,sign) {
                    var num = eval(currentNum + sign + 1);
                    this.text = num;
                    this.roomBox.html(num);
                    this.houseNum.html(num);
                    if(this.GuaranteeCon.num>0){
                        if(this.GuaranteeCon.num <= this.text){
                            $('#roomCon').text('间需担保');
                            hotel.IsAmountGuarantee = true;
                        }else{
                            $('#roomCon').text('间');
                            hotel.IsAmountGuarantee = false;
                        }
                        hotel.trigger('changBtn');
                    }
                    var guaranteeAccount = this.price*num;
                    var totalAccount = this.price * this.totalDays*num;
                    $('#btnPrePaytotalPrice').html(totalAccount);

                    if (this.GuaranteeCon.GuaranteeType == 'FirstNightCost') {
                         guaranteeAccount = this.price*num;                   
                    }else if (this.GuaranteeCon.GuaranteeType == 'FullNightCost') {
                         guaranteeAccount = totalAccount;
                    }
                    this.cb({
                        totalAccount:totalAccount,
                        guaranteeAccount:guaranteeAccount,
                        num: this.text
                    });
                    return num;
                },
                addFunc:function(){
                    var self = this;
                    var currentNum = this.text;
                    if(currentNum<this.maxRoomNum){
                        var num = this.extracted(currentNum,'+');
                        if(num>1 && this.reduce.hasClass(this.suffix)){
                            this.reduce.removeClass(this.suffix);
                        }
                        var con = '';
                        _(this.num).times(function(){
                            con += _.template(self.liTemp)({index:num});
                        });
                        this.ulBox.append(con);
                        if(num==this.maxRoomNum){
                            this.add.addClass(this.suffix);
                        }
                    }
                },
                reduceFunc:function(){
                    var self = this;
                    var currentNum = this.text;
                    if(currentNum>1){
                        var num = this.extracted(currentNum,'-');
                        if(num<this.maxRoomNum && this.add.hasClass(this.suffix)){
                            this.add.removeClass(this.suffix);
                        }
                        _(this.num).times(function(){
                            self.ulBox.find('li:last-child').remove();
                        });
                        if(num==1){
                            this.reduce.addClass(this.suffix);
                        }
                    }
                },
                bindEvent:function(){
                    var self = this;
                    this.add.on('click',function(){
                        if(!$(this).hasClass(self.suffix)){
                            self.addFunc.call(self);
                        }
                    });
                    this.reduce.on('click',function(){
                        if(!$(this).hasClass(self.suffix)){
                            self.reduceFunc.call(self);
                        }
                    });
                }
            },opt);
            a.init();
        },
        areaHtml:'',
        cityObj:{},
        getAreaData:function(data){
            var provinceNameStr = [];
            var temp = '<li data-id="{{=province_id}}">{{=province_name}}</li>';
            _.each(data,function(t){
                provinceNameStr.push(_.template(temp)(_.pick(t,'province_name','province_id')));
                var provinceId = _.pick(t,'province_id').province_id;
                hotel.cityObj[provinceId] = {};
                hotel.cityObj[provinceId].arr = [];
                var cityes = _.pick(t,'cities').cities;
                _.each(cityes,function(d){
                    hotel.cityObj[provinceId].arr.push(_.pick(d,'city_name','city_id'));
                    var regions = _.pick(d,'regions').regions;
                    var cityId = _.pick(d,'city_id').city_id;
                    hotel.cityObj[provinceId][cityId] = {};
                    hotel.cityObj[provinceId][cityId].regionsArr = [];
                    _.each(regions,function(k){
                        hotel.cityObj[provinceId][cityId].regionsArr.push(k);
                    })
                });
            });
            hotel.areaHtml = '<div class="popCon"><div class="row citySlectBox">' +
            '<ul class="cell provinceUl">'+provinceNameStr.join('')+'</ul>' +
            '<ul class="provinceUl"></ul>' +
            '<ul class="provinceUl"></ul>' +
            '</div></div>';
        },
        getTempl:function(obj,id,name){
            return '{{_.each('+obj+',function(v,i){}}' +
                '<li data-id="{{=v.'+id+'}}">{{=v.'+name+'}}</li>'+
                '{{})}}';
        },
        activeHove:[],
        getCityData:function(sn,box){
            var index = box.index(),nextUl = box.next();
            if(index==0){
                hotel.activeHove = [sn];
                box.siblings().empty();
                nextUl.addClass('cell animated fadeInRight').html(_.template(hotel.getTempl('arr','city_id','city_name'))(hotel.cityObj[sn]));
            }
            if(index==1){
                hotel.activeHove[1] = sn;
                nextUl.empty();
                nextUl.addClass('cell animated fadeInRight').html(_.template(hotel.getTempl('regionsArr','region_id','region_name'))(hotel.cityObj[hotel.activeHove[0]][hotel.activeHove[1]]));
            }
        },
        alert:function(msg,cb){
            var con = msg; 
            con = '<div class="alertBody row verCenter horCenter"><div class="alertCon">'+con+'</div></div>';
            $('#alertId').append(con).show().find('.alertCon').addClass('animated bounceInDown');
            $('#alertId').on('click',function(){
                $(this).hide().empty();
                cb && (typeof cb == 'function') && cb();
            });
        },
        popWin:function(type,cb){
            var obj = type;
            var roomRetainToObj = arguments[1] || '';
            var a = {
                init:function(){
                    if(_.isObject(type)){
                        this.alert(type.data);
                        return;
                    }
                    this.showPop();
                    this.bindEvent();
                },
                alert:function(opt){
                    var el = '',con='';
                    if(opt.indexOf(':')>-1){
                        var data = opt.split(':');
                        _.contains(['Province-isEmpty','City-isEmpty','District-isEmpty'],data[0]) && (data[0] = 'address-isEmpty');
                        _.contains(['credentialscode-isIdentityCard','credentialscode-isPassport','credentialscode-isOther'],data[0]) && (data[0] = 'credentialscode-isCredentialsCode');
                        el = $('input[name="'+data[0]+'"]');
                        var caption = el.closest('li').find('.cap').html();
                        con = caption +'：'+ data[1];
                    }else{
                        con = opt;
                    }
                    con = '<div class="alertBody row verCenter horCenter"><div class="alertCon">'+con+'</div></div>';
                    $('#alertId').append(con).show().find('.alertCon').addClass('animated bounceInDown');
                    $('#alertId').on('click',function(){
                        $(this).hide().empty();
                        el && el.focus();
                        obj.cb && obj.cb();
                    });
                },
                con:{
                    invoiceType:'<div class="popCon invoiceTypePop">' +
                    '<ul id="invoiceTypeBox" class="invoiceTypeCon">' +
                    '<li>房费</li><li>会务费</li><li>会议费</li><li>旅游费</li> <li>差旅费</li><li>服务费</li>' +
                    '</ul></div>',
                    area:hotel.areaHtml,
                    goOrderBack:'<div class="hasGiveUp">确定要放弃填写发票信息吗？</div>',
                    certificatesType:'<div class="popCon height100">' +
                    '<ul id="certificatesTypeBox" class="invoiceTypeCon">' +
                    '<li>身份证</li><li>护照</li><li>其他</li>' +
                    '</ul></div>',
                    roomRetainTo:'<div class="popCon height200">' +
                    '<ul id="roomRetainToBox" class="invoiceTypeCon">' +
                    roomRetainToObj.con +
                    '</ul></div>'
                },
                showPop:function(){
                    var popConHtml = this.con[type];
                    if(!popConHtml) return;
                    var con = '<div class="popConBox">' +
                        '<div class="popTop row">' +
                        '<div class="cell popCancel">取消</div>' +
                        '<div class="cell popOk" data-type="'+type+'">确定</div>' +
                        '</div>' +
                        popConHtml +
                        '</div>';
                    $('#popBox').append(con).show();
                    $('#popBox').find('.popConBox').addClass('animated fadeInUp');

                    type == 'area' && this.selectCity();
                    _.contains(['invoiceType','certificatesType','roomRetainTo'], type) && this.selectType();
                },
                selectCity:function(){
                    $('#popBox').on('click','.provinceUl li',function(){
                        $(this).addClass('active').siblings().removeClass('active');
                        var sn = $(this).data('id');
                        var box = $(this).closest('ul');
                        hotel.getCityData(sn,box);
                    });
                },
                selectType:function(){
                    $('#invoiceTypeBox,#certificatesTypeBox,#roomRetainToBox').on('click','li',function(){
                        $(this).addClass('active').siblings().removeClass('active');
                    })
                },
                hidePop:function(){
                    $('#popBox').find('.popConBox').addClass('animated fadeOutDown');
                    setTimeout(function(){
                        $('#popBox').hide();
                        $('#popBox').find('.popConBox').prop('class','popConBox');
                        $('#popBox').empty();
                    },400)
                },
                bindEvent:function(){
                    var self = this;
                    //$('#popBox').on('click','.popCancel,.popOk',function(){
                    //    self.hidePop.call(self);
                    //});
                    function addVal(opt) {
                        var el = $('#'+opt.id).find('.active');
						/*修复选择发票类型时，房间预留时间被修改的问题*/
                        (opt.type === 'roomRetainTo') && (hotel.lastTimeVal = el.data('time'));
                        var con = el.html();
                        $('#' + opt.type).find('input').val(con);
                        if(opt.id==='roomRetainToBox'){
                            hotel.IsTimeGuarantee = /担保/.test(con) ? true : false;
                            hotel.trigger('changBtn');
                        }
                        self.hidePop.call(self);
                    }

                    $('.popOk').on('click',function(){
                        var type = $(this).data('type');
                        if(type==='area'){
                            var con = [];
                            $.each($('.citySlectBox').find('.active'),function(){
                                con.push($(this).html());
                            });
                            $('#'+type).find('input').val(con.join('-'));
                            self.hidePop.call(self);
                        }
                        if(type==='goOrderBack'){
                            self.hidePop.call(self);
                            setTimeout(function(){
                                if(cb) cb();
                                $('#invoiceMarkEl').html('未填写');
                            },500);
                        }
                        type==='invoiceType' && addVal({type: type, id: 'invoiceTypeBox'});
                        type==='certificatesType' && addVal({type: type, id: 'certificatesTypeBox'});
                        type==='roomRetainTo' && addVal({type: type, id: 'roomRetainToBox'});
                    });
                    $('#popBox,.popCancel').on('click',function(e){
                        e.preventDefault();
                        e.stopPropagation();
                        if(event.target==this){
                            self.hidePop.call(self);
                        }
                    });
                }
            };
            a.init();
        },
        validator:function(opt,func){
            var data = '';
            var a = {
                init:function(){
                    data = opt.data;
                    this.config = opt.rule;
                    this.messages = [];
                    this.validate(data);
                    if(!this.hasErrors()){
                        func(data);
                    }else{
                        hotel.popWin({data:this.messages[0]});
                    }
                },
                types:{
                    isEmpty: {
                        validate: function (value) {
                            return value !== '';
                        },
                        instructions: '不能为空！'
                    },
                    isRepeat:{
                        validate: function (arr,value) {
                            if (value=='') {
                                this.instructions = '不能为空！';
                                return false;
                            }
                            if (arr.length>0&&_.indexOf(arr,value)!=-1) {
                                this.instructions = '入住人不能重复！';
                                return false;//重复    
                            }
                            arr.push(value);
                            console.log(arr,value);  
                            return true; 
                        },
                        instructions: 'default！'
                    },
                    isTel: {
                        validate: function (value) {
                            return /^13[0-9]{9}$|15[0-9]{9}$|18[0-9]{9}$|17[0-9]{9}$/.test(value);
                        },
                        instructions: '格式不正确或为空！'
                    },
                    isCard: {
                        validate: function (value) {
                            return /^[0-9]{13,16}$/.test(value);
                        },
                        instructions: '格式不正确或为空！'
                    },
                    isValidDate: {
                        validate: function (value) {
                            var a = /^(0[1-9]|1[0-2])[\d]{2}$/.test(value);
                            var b = new Date();
                            var c = String(b.getFullYear()).substr(0,2);

                            var d = b.getFullYear() + ''+ ('0'+(b.getMonth()+1)).substr(-2);
                            var e = c + ''+ value.substr(-2)+''+ value.substr(0,2);
                            if(a&&e-d>0){
                                return true;
                            }
                            return false;
                        },
                        instructions: '格式不对'
                    },
                    isSafeCode: {
                        validate: function (value) {
                            return /^[0-9]{3}$/.test(value);
                        },
                        instructions: '格式不正确或为空！'
                    },
                    isCredentialsCode: {
                        validate: function (value) {
                            return /^\d+$/.test(value);
                        },
                        instructions: '格式不正确或为空！'
                    },
                    isIdentityCard: {
                        validate: function (value) {
                            //return /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/.test(value);
							return /(^\d{15}$)|(^\d{17}([0-9]|X|x)$)/.test(value);
                        },
                        instructions: '身份证证件格式不正确！'
                    },
                    isPassport: {
                        validate: function (value) {
                            return value !== '';
                        },
                        instructions: '护照证件不能为空！'
                    },
                    isOther: {
                        validate: function (value) {
                            return value !== '';
                        },
                        instructions: '证件不能为空！'
                    }
                },
                validateStaus:true,
                validate:function(data){
                    var i,msg,type,checker,result_ok,persons=[];
                    if(!this.validateStaus) return;
                    for(i in data){
                        if(data.hasOwnProperty(i)){
                            if(_.isObject(data[i])){
                                this.validate(data[i],i);
                            }else{
                                type = arguments[1] ? this.config[arguments[1]][i] : this.config[i];
                                checker = this.types[type];
                                if(!type){
                                    continue;
                                }
                                if(!checker){
                                    throw  {
                                        name:'ValidationError',
                                        message:'缺少验证类型：'+type
                                    }
                                }
                                data[i] = _.escape($.trim(data[i]));
                                
                                if (/room/.test(i)) {
                                    //persons.push(data[i]);    
                                    result_ok = checker.validate(persons,data[i]);               
                                }else{
                                    result_ok = checker.validate(data[i]);  
                                }
                                if(!result_ok){  
                                    console.log(persons,data[i]);                                 
                                    //msg = i+'-'+type +':'+ this.types['isRepeat'].instructions;
                                    persons = [];
                                    msg = i+'-'+type +':'+ checker.instructions; 
                                    
                                    this.messages.push(msg);
                                    this.validateStaus = false;
                                    break;
                                }
                            }
                        }
                    }
                },
                hasErrors:function(){
                    return this.messages.length !==0;
                }
            };
            a.init();
        },
        isAndroid: function() {  
            return /Android/i.test(navigator.userAgent);  
        },
        info:{},
        addInfo:function(opt){
            this.info[opt.type]=opt.data;
        },
        getInfo:function(type){
            return this.info[type];
        }
    });
    module.exports = hotel;
});
