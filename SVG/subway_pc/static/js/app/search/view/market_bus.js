define(function(require) {
    var config = require('js/app/conf/config');
    var command = require('../command/market_bus');
    var selectSort = require('../../../lib/selectSort_market');

    var a = {
        _visible: false,
        tpl:{
            market_bus: require('../../../templates/search/market_bus.html')
        },
        name: "search_market_bus",
        containMap: false,
        command: command,
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                data = this.view_data.data,
                params = this.view_data.params;
            $("#CTextDiv").html(So.View.template(this.tpl.market_bus,_.extend({
                data: this.view_data.data
            })));
            this.bindEvents();

            var rt = this.view_data.data,
                bus = [],
                stop_time = [];
            for(var i =0 , len = rt.length; i < len;  i++){
                stop_time = [];
                for(var j =0, lenj = rt[i].stop_time.length; j < lenj; j++) {
                    stop_time.push({
                        label: '第'+(j+1)+'班车',
                        value: rt[i].stop_time[j]
                    });
                }
                bus.push({
                    label: '第1班车',
                    children: stop_time,
                    isMulti: 0
                });
            }

            $('.change_bus').each(function(index){
                var  $this = $(this);
                var instance = new selectSort({
                    element: $this,
                    updateHeader: 1,
                    items: [bus[index]]
                });
                (function(instance){
                    instance.on('item.click', function(data){
                        var $dom = instance.getDom();
                        var arr = data.value,
                            $trs = $dom.parents('.bus_item').find('tr');
                        for(var i = 0, len = arr.length; i < len; i++) {
                            if(/不到/.test(arr[i])){
                                $trs.eq(i+1).addClass('notStop').find('td').eq(1).html(arr[i]);
                            } else {
                                $trs.eq(i+1).removeClass('notStop').find('td').eq(1).html(arr[i]);
                            }
                        }
                    });
                })(instance);
            });
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CTextDiv").css("display", d);
            var self = this;
            setTimeout(function(){
                self.skip();
            }, 300)
        },
        cmd: function(d) {
            var view_data = this.view_data,
                data = view_data.data;

            switch (d.id) {
                case 0:
                    window.history.back();
                    break;
            }
        },
        resize: function() {
        },
        bindEvents: function(){
	    return ;
            $('#CTextDiv .change_bus').on('change', function(){
                var arr = $(this).val().split(','),
                    $trs =  $(this).parents('.item').find('tr');
                for(var i = 0, len = arr.length; i < len; i++) {
                    $trs.eq(i+1).find('td').eq(1).html(arr[i]);
                }
            });
        },
        skip: function(){
            var hashId = location.href.match(/bus\_hash\=([\S]*)\&/);
            if(hashId && hashId.length > 0){
                var top = $('#'+hashId[1])[0].offsetTop - 44;
                window.scroll(0,top);
            }
            return ;
        }
    };

    return a;
});
