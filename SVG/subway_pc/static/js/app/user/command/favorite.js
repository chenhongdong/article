define(function(require){
    var service_favorite = require('../services/favorite');
    var pagesize = 10;
    var Favorite = So.Command.Base.extend({
        _run:function(){
            var me = this,
                params = me._params,
                page = params.page || 1;

            var callback = function(info){
                info = info || {};
                info.pagesize = pagesize;

                //记录当前页码;
                info.page = page;

                var pageCount = parseInt(info.total / info.pagesize) + (info.total % info.pagesize == 0 ? 0 : 1);
                pageCount = pageCount == 0 ? 1 : pageCount;

                //记录翻页总数;
                info.pageCount = pageCount;

                So.Gcmd.changeHash('user/favorite', {
                    params: {
                        page: page
                    },
                    data: info,
                    view_params: me._view_params || {},
                    noChangeUrl: true
                });
            };

            //请求数据;
            service_favorite({
                page:page
            }, callback);
        }
    });
    return Favorite;
});