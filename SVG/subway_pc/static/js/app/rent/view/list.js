define(function(require) {
    var config = require('js/app/conf/config');
    var listObj = {
        _visible: false,
        _init: false,
        tpl: {
            rent_list: require('../../../templates/rent/list.html')
        },
        command: So.Command.RentSearch,
        name: "rent_list",
        logname: "rentlistpage",
        containMap: false,
        setBodyMainHeight: false,
        pageSize: 10,
        rate: 9 / 5,
        prepare: function(d) {
            this.view_data = d;
            d.isFold = d.count <= this.pageSize;
            d.pageCount = Math.ceil(d.count / this.pageSize);
            d.clk1 = '';
            d.clk2 = '';
            d.cls1 = 'poilist-page-btn-gray';
            d.cls2 = 'poilist-page-btn-gray';
            d.pageIndex = d.params.page;
            if (d.pageIndex > 1) {
                d.clk1 = 'So.Gcmd.cmd({id:0})';
                d.cls1 = ''
            }
            if (d.pageIndex < d.pageCount) {
                d.clk2 = 'So.Gcmd.cmd({id:1})';
                d.cls2 = '';
            }
            d.imgWidth = window.innerWidth;
            d.imgHeight = Math.round(d.imgWidth / this.rate);
            var html = So.View.template(this.tpl.rent_list, d);
            $('#CTextDiv').html(html);
            this.bindEvent();
        },
        bindEvent: function() {
            var me = this;
            $(window).on('orientationchange resize', function() {
                var imgWidth = window.innerWidth,
                    imgHeight = Math.round(imgWidth / me.rate);

                $('#rent-list li img.photo').css({
                    width: imgWidth,
                    height: imgHeight
                });
            });
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $('#CTextDiv').css("display", d);
        },
        cmd: function(c) {
            var me = this,
                view_data = this.view_data,
                page = view_data.params.page,
                pageCount = view_data.pageCount;

            switch (c.id) {
                case 0:
                    if (page < 2) {
                        return;
                    }
                    view_data.params.page = --page;
                    view_data.data = null;
                    So.Gcmd.changeHash("rent/list", view_data);
                    window.scroll(0, 1);
                    break;

                case 1:
                    if (page >= pageCount) {
                        return;
                    }
                    view_data.params.page = ++page;
                    view_data.data = null;
                    So.Gcmd.changeHash("rent/list", view_data);
                    window.scroll(0, 1);
                    break;

                case 4:
                    (So.State.lastSearchScene == 0 ? So.Gcmd.changeHash("search/index", {}) : So.Gcmd.changeHash("search/index", {}));
                    break;

                case 5:
                    So.Gcmd.changeHash("rent/map", _.extend(me.view_data, {
                        index: 0,
                        name: '短租民宿'
                    }));
                    break
            }
        }
    };
    return listObj;
});
