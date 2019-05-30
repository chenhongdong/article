define(function(){
    var Detail = So.Command.Base.extend({
        _run:function(){
            var me = this,
                params = me._params,
                current_ui = So.State.currentUI,
                view_name = current_ui && current_ui.__view_name__ || 'search/detail';

            var href = 'https://m.map.so.com/onebox/?type=detail&id='+ params.pguid +'&d=mobile&src=map_wap_detail_jump&fields=movies_all'

            //wap中的详情页已废弃，跳转至onebox详情页
            window.location.replace(href);
            return false;

            So.PoiService.poiDetail(params.pguid, function(data){
                var poi;
                if(data && data.poi && data.poi.pguid){
                    poi = data.poi;
                }else{
                    poi = {
                        failure : 1
                    };
                }
                //poi结果中city为 北京城区 bug处理;
                if(poi.province && poi.province.indexOf('市') > -1){
                    poi.city = poi.province;
                }
                poi.firstCity = data.firstCity;
                So.Gcmd.changeHash(view_name, {
                    data: poi,
                    params: params,
                    command: me
                })
            })
        }
    });
    return Detail;
});