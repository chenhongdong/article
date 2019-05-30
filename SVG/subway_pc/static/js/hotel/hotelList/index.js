define(function(require) {
    require('/css/hotel/jquery.ui.css');
    require('/css/hotel/datepicker.css');
    require('/js/hotel/hotelList/time/jquery.ui.js');
    require('/js/hotel/hotelList/time/moment.min.js');
    var timeDate = require('/js/hotel/hotelList/time/stay.js');

    var userAgent = navigator.userAgent;
    var hide_goback_btn = userAgent.indexOf('360shenbian') > -1 || userAgent.indexOf('360around') > -1 || userAgent.indexOf('360HY') > -1 || userAgent.indexOf('360map') > -1;

	App.Models.Home = Backbone.Model.extend({
        defaults: function() {
            return {
            };
        },
        initialize: function() {
        }
    });

	App.Collections.Home = Backbone.Collection.extend({
		model: App.Models.Home
	});

	App.Views.Home = Backbone.View.extend({
		el: '#hotleListBox',
        template:_.template(require('../../templates/hotel/hotleList/hotleList.html')),
        templateItem:_.template(require('../../templates/hotel/hotleList/item.html')),
        events:{
            'click .jsGoBack':'goBack',
            'click #timeStartEnd li':'goTime',
            'click .hotelList li':'showMore',
             'click *[data-md]':'addMonitor',
            'click .btnBook':'getOrderData'
        },
        hotelList:'#hotelListUl',
        addMonitor:function(e){
            var tag = $(e.currentTarget),md = tag.data('md'), info = {page:'roomlist'};
            if(md){
                _.each(md,function(value, key){
                    info['data-md-'+key] = value;
                });       
                monitor.log(info,'click');
            }
        },
		initialize: function() {
            $(this.el).off();
            hotel.trigger('showLoading');
            this.render();
            this.$el.show().siblings().hide();
            hotel.trigger('hideLoading');
		},
        render:function(){
            /*disp统计*/
            monitor.log({page:'roomlist'},'disp');
            this.renderTop();
            this.renderItem();
        },
        renderTop:function(){
            this.$el.html(this.template({
                hide_goback_btn: hide_goback_btn
            }));
            timeDate.init();
        },
        renderItem:function(){
            //var html = '';
            //this.collection.models
            //this.Collections.each(function(m) {
            //html += '<div><a class="aaaa" href="' + m.get('link') + '">' + m.get('name') + '</a></div>';
            //});
            //this.$el.html(html);

            //{data:$.parseJSON(JSON.stringify(this.Collections.models))}
            this.getListData(this.appendData);
        },
        /*点击预订后，在调往订单页之前验证是否有房可预订。*/
        getOrderData:function(e){
            hotel.trigger("showLoading");
            var ele = $(e.target);
            var urlParamData = {
                RoomTypeId:ele.data('roomtypeid'),
                RatePlanId:ele.data('rateplanid'),
                PaymentType:ele.data('paymenttype'),
                BedType:ele.data('bedtype')
            };
            var hotelList = store.get('hotelList')||{};
            var options = _.extend(hotelList,urlParamData);
            hotel.getData({data:options,url:'/elong/orderdetail',cb:function(data){
                hotel.trigger("hideLoading");
                if (data.errno==0) {
                    store.set('orderDetailData',data); 
                    store.set('urlParamData',urlParamData);
                    location.href = "/hotel/#order/" ;               
                }else{
                    hotel.alert(data.errmsg);  
                }  
            }});
        },
        getListData:function(fuc){
            //模拟数据
            var self = this;
            var options = {
                ArrivalDate:$('#startDate').val(),
                DepartureDate:$('#endDate').val(),
                HotelIds:hotel.getParamObj(window.location.href).hotelid || ''
            };
            hotel.getData({data:options,url:'/elong/hoteldetail',cb:function(data){
                data.options = options;
                fuc.call(self,data);
                (data.errno===0) && data.data && data.data.Rooms && (self.data = data.data.Rooms);
            }});
        },
        appendData:function(data){
            var opt = '';
            if(data.errno===0 && data.data){
                var dataCon = data.data;
                opt = {
                    ArrivalDate : data.ArrivalDate || data.options.ArrivalDate || '',
                    DepartureDate : dataCon.DepartureDate || data.options.ArrivalDate || '',
                    HotelIds : dataCon.HotelIds || '',
                    startWeek:$('#startDate').next().html(),
                    endWeek:$('#endDate').next().html(),
                    totalDays:$('#endDate').siblings('.numDays').html().replace(/.*?(\d+).*/,function(){return arguments[1];})
                };
            }else{
                data.startTimeVal = $('#startDate').val();
                data.endTimeVal = $('#endDate').val();
                data.hotelname = hotel.getParamObj(window.location.href).hotelname || '本酒店';
            }
            store.set('hotelList',opt);
            this.$el.find(this.hotelList).html(this.templateItem(data));
        },
        goBack:function(){
            window.history.back();
        },
        goTime:function(e){
            var inputEl = $(e.currentTarget).find('input');
            inputEl.trigger('focus');
        },  
        showMore:function(e){
			var $elMore = $(e.currentTarget).find('.hotelListMore');
            $elMore.hide().next().show();
        }
	});
    return function() {
		window.hotelListPage = new App.Views.Home();
	}
});
