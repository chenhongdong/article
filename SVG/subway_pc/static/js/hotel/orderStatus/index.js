define(function(require) {

    App.Models.orderstatus = Backbone.Model.extend({});

    App.Collections.orderstatus = Backbone.Collection.extend({
        model: App.Models.orderstatus
    });

    App.Views.orderstatus = Backbone.View.extend({
        el: '#orderStatus',
        template:_.template(require('../../templates/hotel/orderStatus/index.html')),
        events:{
            'click *[data-md]':'addMonitor'
            //'click #orderStatusBack':hotel.goBack//////////////////////////////////////////////////////////
        },
        addMonitor:function(e){
            var tag = $(e.currentTarget),md = tag.data('md'), info = {page:'orderStatus'};
            if(md){
                _.each(md,function(value, key){
                    info['data-md-'+key] = value;
                });       
                monitor.log(info,'click');
            }
            return;
        },
        initialize: function(opt) {
            $(this.el).off();
            var self = this;

            this.data = hotel.getInfo('toOrderStatus');

            if(!this.data){
                this.$el.html('').hide();
                window.history.back();
                return;
            }

            hotel.trigger('showLoading');
            this.render();
            /*disp统计*/
            monitor.log({page:'orderStatus'},'disp');
            hotel.trigger('hideLoading');
        },
        render:function(){
            var self = this;
            this.$el.html(this.template(this.data));
            this.$el.show();
            this.$el.find('.mainBox').addClass('animated fadeInRight');
            setTimeout(function(){
                self.$el.siblings().hide();
            },500);
        }
    });

    return function(opt) {
        new App.Views.orderstatus(opt);
    }
});