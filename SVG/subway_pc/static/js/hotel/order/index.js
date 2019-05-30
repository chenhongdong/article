define(function(require) {
    App.Models.order = Backbone.Model.extend({});
    App.Collections.order = Backbone.Collection.extend({
        model: App.Models.order
    });
    App.Views.order = Backbone.View.extend({
        el: '#orderBox',
        invoiceBox:'#invoiceBox',
        template:_.template(require('../../templates/hotel/order/index.html')),
        events:{
            'click .jsGoBack':hotel.goBack,
            'click #isNeedInvoice':'showInvoice',
            'click #invoiceBox #goOrderBack':'goOrderBack',
            'click #invoiceType':'invoiceType',
            'click #roomRetainTo':'roomRetainTo',
            'click #area':'area',
            'click #btnSubmitInvoiceForm':'getInvoiceFormData',
            'click #invoiceList':'invoiceList',
            'click #btnPrePay':'gotoPay',
            'click #btnSelfPay':'gotoSelfPay',
            'click *[data-md]':'addMonitor',
            'resize window':'resize'
        },
        addMonitor:function(e){
            var tag = $(e.currentTarget),md = tag.data('md'), info = {page:'order'};
            if(md){
                _.each(md,function(value, key){
                    info['data-md-'+key] = value;
                });       
                monitor.log(info,'click');
            }
            return;
        },
        invoiceType:function(e){
            $(e.currentTarget).find('input').blur();
            hotel.popWin('invoiceType');
        },
        resize:function(e){

            //alert(document.documentElement.clientHeight);
        },
        roomRetainTo:function(e){
            $(e.currentTarget).find('input').blur();
            hotel.popWin('roomRetainTo',this.GuaranteeCon);
        },
        area:function(e){
            $(e.currentTarget).find('input').blur();
            hotel.getAreaData(this.city);
            hotel.popWin('area');
        },
        initialize: function(opt) {
            $(this.el).off();
            store.remove('gotoPayData');
            hotel.trigger('showLoading');
            this.getData(this.render);
            this.Collections = opt;
            /*disp统计*/
            monitor.log({page:'order'},'disp');
        },
        isNeedGuaranteeRules:function(data){
            var self = this;
            var lastTime = data.lastTime;
            var guaranteeData = data.data[0];
            var startTime = Number(guaranteeData.StartTime.replace(/:/,''));
            var endTime = Number(guaranteeData.EndTime.replace(/:/,''));
            var isTomorrow = guaranteeData.IsTomorrow;
            var space = '',regularExp = /次/;
            var lastTimeArr = [];
            lastTime && (lastTimeArr = _.values(lastTime));
            var firstTime = Number(lastTimeArr[0].replace(/:/,''));//lastTime对象中的第一个时间
            var conLastTime = '';
            self.GuaranteeCon.GuaranteeType = guaranteeData.GuaranteeType;
            /*无条件担保，即必须担保*/
            if(!guaranteeData.IsAmountGuarantee && !guaranteeData.IsTimeGuarantee){
                $('#roomCon').text('间需担保');        
                hotel.IsAmountGuarantee = true;
                hotel.IsTimeGuarantee = true;
                hotel.trigger('changBtn');
                conLastTime = self.getLastTimeCon(lastTime,' 需担保');
            }
            /*房间数量需要担保*/
            if(guaranteeData.IsAmountGuarantee && !guaranteeData.IsTimeGuarantee){
                if(guaranteeData.Amount===0){
                    $('#roomCon').text('间需担保');
                    hotel.IsAmountGuarantee = true;
                }else{
                    self.GuaranteeCon.num = guaranteeData.Amount;
                }
                conLastTime = self.getLastTimeCon(lastTime,'');
            }
            /*到店时间需要担保*/   
            if(!guaranteeData.IsAmountGuarantee && guaranteeData.IsTimeGuarantee){       
                conLastTime = self.getLastTimeCon(lastTime,function(v){
                    var currentTime = v;
                    var v = Number(v.replace(/:/,'').match(/\d+/)[0]);
                    isTomorrow == 0 && v>=startTime && v<=endTime && (space = ' 需担保');
                    if(isTomorrow==1){
                        !regularExp.test(currentTime) && v>=startTime && (space = ' 需担保');
                        regularExp.test(currentTime) && v<=endTime && (space = ' 需担保');
                    }
                    return space;
                });
                console.log(firstTime,startTime);
                if (firstTime>startTime) {
                    hotel.IsTimeGuarantee = true;
                    hotel.trigger('changBtn');
                }
            }
            /*房量担保 或 到店时间担保 。*/
            if(guaranteeData.IsAmountGuarantee && guaranteeData.IsTimeGuarantee){ 
                if(guaranteeData.Amount===0){
                    $('#roomCon').text('间需担保');
                    hotel.IsAmountGuarantee = true;
                    hotel.trigger('changBtn');
                }else{
                    if (firstTime > startTime) {
                        hotel.IsTimeGuarantee = true;
                        hotel.trigger('changBtn');  
                    } 
                    self.GuaranteeCon.num = guaranteeData.Amount;
                }
                conLastTime = self.getLastTimeCon(lastTime,function(v){
                    var currentTime = v;
                    var v = Number(v.replace(/:/,'').match(/\d+/)[0]);
                    //当天不需要去判断明天的时间点
                    isTomorrow == 0 && v>=startTime && v<=endTime && (space = ' 需担保');
                    if(isTomorrow == 1){
                        !regularExp.test(currentTime) && v>=startTime && (space = ' 需担保');
                        regularExp.test(currentTime) && v<=endTime && (space = ' 需担保');
                    }
                    return space;
                });     
            }  
            conLastTime && (self.GuaranteeCon.con = conLastTime); 
        },
        
        getData:function(func){
            var self = this;
            var hotelList = store.get('hotelList')||{};
            var orderDetailData = store.get('orderDetailData')||{};
            var urlParamData = store.get('urlParamData')||{};
            var options = _.extend(hotelList,urlParamData);

            // console.log(options);
            if(!orderDetailData.errno){
                orderDetailData.orderInfo = {
                    startWeek:options.startWeek,
                    endWeek:options.endWeek,
                    totalDays:options.totalDays,
                    bedType:options.BedType,
                    paymentType:options.PaymentType || ''
                };
                self.orderdetailData = orderDetailData.data;
                self.ArrivalDate = orderDetailData.data.ArrivalDate;
                self.DepartureDate = orderDetailData.data.DepartureDate;
                var start = orderDetailData.data.ArrivalDate.split('-');
                var end = orderDetailData.data.DepartureDate.split('-');
                orderDetailData.data.ArrivalDate = Number(start[1]) + '月' + Number(start[2]) + '日';
                orderDetailData.data.DepartureDate = Number(end[1]) + '月' + Number(end[2]) + '日';
                self.city = orderDetailData.data.city;
                try{
                    self.totalrate = orderDetailData.data.Rooms.RatePlans.TotalRate;
                }catch(e){
                    self.totalrate = 0;
                }
                //self.room.price = self.totalrate;
            }
            func.call(self,orderDetailData);
        },
        GuaranteeCon:{
            num:0,
            con:''
        },
        getLastTimeCon:function(data,arg){
            var lastTime = data;
            var lastTimeArr = [],lastTimeCon='',lastTimeSn=1;
            _.each(lastTime,function(v,i){
                var con;
                _.isFunction(arg) && (con = arg(v));
                _.isString(arg) && (con = arg);
                con = v+con;
                lastTimeSn === 1 && ($('#roomRetainTo').find('input').val(con) && (hotel.lastTimeVal = i));
                lastTimeSn++;
                lastTimeArr.push('<li data-time="'+i+'">'+con+'</li>');
            });
            lastTimeCon = lastTimeArr.join('');
            return lastTimeCon;
        },
        render: function(data) {
            var self = this,maxRoomNum = '';
            this.$el.html(this.template(data));
            console.log('order form:')
            console.log(data);
            if(!data.errno){
                if(data.data && data.data.Rooms && data.data.Rooms.RatePlans){
                    maxRoomNum = data.data.Rooms.RatePlans.CurrentAlloment;
                    var orderStatusData = data.data;
                    var orderStatusDataIn = data.orderInfo;
                    store.set('orderStatus', {
                        HotelIds:orderStatusData.HotelIds,
                        HotelName:orderStatusData.HotelName,
                        Address:orderStatusData.Address,
                        roomsName:orderStatusData.Rooms.Name,
                        bedType:orderStatusDataIn.bedType,
                        RatePlanName:orderStatusData.Rooms.RatePlans.RatePlanName,
                        ArrivalDate:orderStatusData.ArrivalDate,
                        startWeek:orderStatusDataIn.startWeek,
                        DepartureDate:orderStatusData.DepartureDate,
                        endWeek:orderStatusDataIn.endWeek,
                        totalDays:orderStatusDataIn.totalDays,
                        type:orderStatusDataIn.paymentType
                    });

                }
                var lastTimeData = !_.isEmpty(data.data.lastTime) && data.data.lastTime || '';
                if(data.orderInfo.paymentType=='SelfPay' && !_.isEmpty(data.data && data.data.GuaranteeRules)){
                    self.isNeedGuaranteeRules({
                        lastTime: lastTimeData,
                        data: data.data.GuaranteeRules
                    });
                }else{
                    lastTimeData && (self.GuaranteeCon.con = self.getLastTimeCon(lastTimeData,''));
                }
                self.room.price = orderStatusData.Rooms.RatePlans.AverageRate;
                self.room.totalDays = orderStatusDataIn.totalDays;
                self.room.totalAccount = self.room.price * self.room.totalDays*self.room.num;
                if (self.GuaranteeCon.GuaranteeType == 'FirstNightCost') {
                    self.room.guaranteeAccount = self.room.price * self.room.num;                   
                }else if (self.GuaranteeCon.GuaranteeType == 'FullNightCost') {
                    self.room.guaranteeAccount = self.room.totalAccount;
                }
                    
                hotel.changeRooms({
                    add:$('.iconAdd'),
                    reduce:$('.iconReduce'),
                    suffix:'grayio',
                    roomBox:$('#roomBox'),
                    ulBox:$('#checkInBox'),
                    houseNum:$('#houseNum'),
                    totalDays:orderStatusDataIn.totalDays,//天数
                    price:orderStatusData.Rooms.RatePlans.AverageRate,//房间单价
                    maxRoomNum:maxRoomNum,
                    GuaranteeCon:self.GuaranteeCon,
                    cb:function(opt){
                        _.extend(self.room,opt);
                    }
                });
            }
            
            var ua = navigator.userAgent.toLowerCase();
            if (/aphone\s*browser/.test(ua)) {
                var boxHeight= document.documentElement.clientHeight||this.$el.height();
                var mainBoxBtHeight = this.$el.find('.mainBoxBt').height()+1;
                var toTop = boxHeight - mainBoxBtHeight;
                this.$('.mainBoxBt').css({'top':toTop+'px'});
                this.$el.css({'height':boxHeight+'px'});
                this.$(this.invoiceBox).css({'height':boxHeight+'px'});
                store.set('docEle',{height:boxHeight});
            }
            this.$el.show().siblings().hide();
            hotel.trigger('hideLoading');
        },
        room:{
            price:0,
            totalDays:0,
            guaranteeAccount:0,
            totalAccount:0,
            num:1
        },
        showInvoice:function(){
            var self = this;
            this.$el.find(this.invoiceBox).show();
            this.$el.find(this.invoiceBox).find('#invoiceBoxCon').addClass('animated fadeInRight');
            //animated fadeInRight
            setTimeout(function(){
                self.$el.find(self.invoiceBox).find('#invoiceBoxCon').removeClass('animated fadeInRight');
            },1000);
        },
        goOrderBack:function(){
            function goBack(){
                $('#invoiceBoxCon').removeClass('animated fadeInRight');
                $('#invoiceBox').hide();
            }
            if(!this.isFillInvoice){
                hotel.popWin('goOrderBack',goBack);
            }else{
                goBack();
            }
        },
        getInvoiceFormData:function(){
            var self = this;
            var formData = $('#invoiceForm').serializeArray();
            var first = ['Title-isEmpty','ItemName-isEmpty'];

            var invoiceFormData = {};
            var invoiceForm = {
                Recipient:{
                    Province:'',
                    City:'',
                    District:''
                }
            };
            invoiceFormData.rule = $.parseJSON(JSON.stringify(invoiceForm).replace(/""/g,'"isEmpty"'));

            _.each(formData,function(v,i){
                var name = '';
                if(_.contains(first, v.name)){
                    name = v.name.split('-');
                    invoiceForm[name[0]] = v.value;
                    invoiceFormData.rule[name[0]] =name[1];
                }else{
                    if(v.name !== 'address-isEmpty'){
                        name = v.name.split('-');
                        invoiceForm.Recipient[name[0]] = v.value;
                        invoiceFormData.rule.Recipient[name[0]] = name[1];
                    }
                    if(v.name == 'address-isEmpty' && v.value.indexOf('-')>-1){
                        var address = v.value.split('-');
                        invoiceForm.Recipient['Province'] = address[0] || '';
                        invoiceForm.Recipient['City'] = address[1] || '';
                        invoiceForm.Recipient['District'] = address[2] || '';
                    }
                }
            });

            invoiceFormData.data =invoiceForm;

            hotel.validator(invoiceFormData,function(data){
                _.extend(self.formInvoiceData,data);
                $('#invoiceBoxCon').removeClass('animated fadeInRight');
                $('#invoiceBox').hide();
                $('#invoiceMarkEl').html('已填写');
                self.isFillInvoice = true;
            });
        },
        isFillInvoice:false,
        formInvoiceData:{},
        //formInvoiceData:{list:false},
        invoiceList:function(e){
            $(e.currentTarget).toggleClass('invoiceClick');
            //this.formInvoiceData.list = $(e.currentTarget).hasClass('invoiceClick') ? true : false;
        },
        getBaseData: function (formId) {
            var self = this;
            var orderdetailData = self.orderdetailData;
            var rooms = orderdetailData.Rooms;
            var ratePlans = rooms.RatePlans;
            //  LatestArrivalTime
            var totalRate = ratePlans.TotalRate;
            var dataList = {
                HotelId: orderdetailData.HotelId,
                RoomTypeId: ratePlans.RoomTypeId,
                RatePlanId: ratePlans.RatePlanId,
                ArrivalDate: self.ArrivalDate,
                DepartureDate: self.DepartureDate,
                CustomerType:ratePlans.CustomerType,
                PaymentType: ratePlans.PaymentType,
                NumberOfRooms: self.room.num,
                NumberOfCustomers: self.room.num,
                CurrencyCode: ratePlans.CurrencyCode,
                TotalPrice: self.room.totalAccount,
                _room: self.room,//自定义房间预订信息
                OrderRooms: [],
                LatestArrivalTime:hotel.lastTimeVal || '',
                Invoice: '',
                Contact: {
                    Name: '',
                    Mobile: ''
                },
                CreditCard:'',
                OrderDetail: JSON.stringify(_.omit(orderdetailData,'city'))
            };

            if(self.isFillInvoice){
                self.formInvoiceData.Amount=self.room.totalAccount;
                dataList.Invoice = JSON.stringify(self.formInvoiceData);
            }

            var customers = {
                data: {},
                rule: {},
                status: false
            };
            var formData = $(formId).serializeArray();
            _.each(formData, function (obj, i) {
                var name = obj.name.split('-');
                customers.data[name[0]] = obj.value;
                customers.rule[name[0]] = name[1] || '';
            });

            hotel.validator(customers, function (data) {
                dataList.Contact.Mobile = data.mobile;
                _.each(data, function () {
                    for (var i in data) {
                        if (data.hasOwnProperty(i) && /room/.test(i)) {
                            var sn = i.match(/\d+/)[0];
                            dataList.OrderRooms[sn - 1] = {
                                Customers : [
                                    {
                                        Name:data[i],
                                        Mobile:'',
                                        Gender:'Unknown',
                                        Nationality:'中国'
                                    }
                                ]
                            };
                        }
                    }
                });
                dataList.Contact.Name = dataList.OrderRooms[0].Customers[0].Name;
                dataList.OrderRooms = JSON.stringify(dataList.OrderRooms);
                dataList.Contact = JSON.stringify(dataList.Contact);
                customers.status = true;
            });
            return {dataList: dataList, customers: customers};
        },
        gotoPay:function() {//预付
            var __ret = this.getBaseData('#roomInfo');
            var dataList = __ret.dataList;
            var customers = __ret.customers;
            if(customers.status){//去支付页面
                hotel.addInfo({type:'toPay',data:dataList});
                window.location.href = 'http://'+window.location.host+'/hotel/#pay/';
            }

            /*if (!self.isFillInvoice && customers.status) {
                hotel.popWin({
                    data: '请填写发票信息！', cb: function () {
                        $('#invoiceMarkEl').focus();
                    }
                });
            }*/
        },
        gotoSelfPay:function(){//现付
            var self = this;
            var __ret = this.getBaseData('#roomSelfInfo');//取订单的formData数据
            var dataList = __ret.dataList;
            var customers = __ret.customers;
            console.log('提交订单/去担保');
            console.log(dataList);//提交订单 to 订单状态(成功或失败)
            //提交订单 to 订单状态(成功或失败)

            if(customers.status){
                if(hotel.IsAmountGuarantee || hotel.IsTimeGuarantee) {//去担保页面
                    dataList.description = self.orderdetailData.GuaranteeRules[0].Description || '';
                    if(dataList.description){
                        dataList.description = dataList.description.split('。');
                    }
                    hotel.addInfo({type:'toPay',data:dataList});
                    window.location.href = 'http://'+window.location.host+'/hotel/#assure/';
                }else{//去提交订单
                    hotel.trigger('showLoading');
                    hotel.getData({data: dataList, url: '/elong/ordercreate', cb: function (data) {
                            console.log(data);
                            console.log('data.errno:' + data.errno);
                            hotel.addInfo({type: 'toOrderStatus', data: _.extend(store.get('orderStatus'), {
                                totalPrice: dataList.TotalPrice,
                                data:data})
                            });
                            window.location.href = 'http://' + window.location.host + '/hotel/#orderStatus/';
                        }
                    });
                }
            }
        }
    });

    return function(opt) {
        new App.Views.order();
    }
});
