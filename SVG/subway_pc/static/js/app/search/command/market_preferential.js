define(function(){
    var Detail = So.Command.Base.extend({
        _run:function(){
            var me = this,
                params = me._params,
                current_ui = So.State.currentUI,
                view_name = current_ui && current_ui.__view_name__ || 'search/market_preferential';

            var sendData = {
                pguid: params.pguid,
                act: 'detail',
                field: 'promotion',
                type: 'super-map-market',
                d: 'mobile'
            }

            $.ajax({
                dataType: 'jsonp',
                data: sendData,
                url: '//map.so.com/onebox/',
                success: function(data) {
                    if(data && data.data && data.data.posters && data.data.posters.length > 0) {
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
