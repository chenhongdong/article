define(function(){
    var Detail = So.Command.Base.extend({
        _run:function(){
            var me = this,
                params = me._params,
                current_ui = So.State.currentUI,
                view_name = current_ui && current_ui.__view_name__ || 'search/mall_shop';

            var sendData = {
                pguid: params.pguid,
                act: 'detail',
                field: 'floors',
                type: 'super-map-mall',
                d: 'mobile'
            }
            $.ajax({
                dataType: 'jsonp',
                data: sendData,
                url: '//map.so.com/onebox/',
                success: function(data) {
                    if(data.data && $.isArray(data.data) && data.data.length > 0) {
                        So.Gcmd.changeHash(view_name, {
                            data: data.data,
                            params: params,
                            command: me
                        });
                    }
                },
                error: function() {
                    console.log('error');
                }

            });
        }
    });
    return Detail;
});
