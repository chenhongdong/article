define(function(){
    var selectList = So.Command.Base.extend({
        _run:function(){
            var me = this,
                params = me._params,
                _callback = me._callback,
                keyword = params.keyword,
                page = params.page || 1,
                current_ui = So.State.currentUI,
                view_name = current_ui && current_ui.__view_name__ || 'select_list',
                loc = So.State.getLocation(),
                city = loc.city,
                mp = loc.y + ',' + loc.x;

            var callback = function(data){
                data.page = page;
                
                So.Gcmd.changeHash(view_name, {
                    data: data,
                    params: params,
                    noChangeUrl: true,
                    view_params: me._view_params || {},
                    callback: _callback
                })
            }


            So.PoiService.citySearch(keyword, city, page, 20, callback, true, city, {
                mp: mp
            });
        }
    });
    return selectList;
});