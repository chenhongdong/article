define(function(require){
    var service = require('../services/similar');
    var pagesize = 100;
    var Command = So.Command.Base.extend({
        _run:function(){
            var me = this,
                params = me._params,
                page = params.page || 1,
                tags = params.tags,
                cityname = params.cityname,
                id = params.id,
                cenx = params.cenx,
                ceny = params.ceny;

            var callback = function(info){
                info = info || {};
                info.pagesize = pagesize;

                //记录当前页码;
                info.page = page;

                var pageCount = parseInt(info.totalcount / info.pagesize) + (info.totalcount % info.pagesize == 0 ? 0 : 1);
                pageCount = pageCount == 0 ? 1 : pageCount;

                //由于数据质量不好，目前强制只请求1页，暂时屏蔽翻页功能
                pageCount = 1;

                //记录翻页总数;
                info.pageCount = pageCount;

                So.Gcmd.changeHash('recommend/similar', {
                    params: {
                        id: id,
                        page: page,
                        tags: tags,
                        cityname: cityname,
                        cenx: cenx,
                        ceny: ceny
                    },
                    data: info,
                    view_params: me._view_params || {},
                    noChangeUrl: true
                });
            };

            //请求数据;
            service({
                id: id,
                pagesize: pagesize,
                page: page,
                tags: tags,
                cityname: cityname,
                cenx: cenx,
                ceny: ceny
            }, callback);
        }
    });
    return Command;
});