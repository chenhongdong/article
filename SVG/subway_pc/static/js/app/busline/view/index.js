define(function(require) {
    var a = {
        _visible: false,
        _init: false,
        tpl:{
            PoiList: require('../../../templates/search/list.html')
        },
        name: "busline_index",
        logname: "buslinelistpage",
        containMap: false,
        setBodyMainHeight: false,
        prepare: function(d) {
            this.param = d;
            this.param.from = "busline/index";
            var c = function() {
                var g = "";
                var f = _.escape(d.cmd.keyword);
                g = "抱歉，没有搜索到'" + f + "'车次";
                $("#CTextDiv").html(So.View.template(So.Tpl.error, {
                    msg: g
                }))
            };
            if (d.status == "E0") {
                d.busline = d.busline || [];
                _.each(d.busline, function(g, f) {
                    g.type = g.name.indexOf("地铁") < 0 ? "bus" : "subway"
                });
                if (d.count > 0) {
                    var e = parseInt(d.count / d.pageSize) + (d.count % d.pageSize == 0 ? 0 : 1);
                    $("#CTextDiv").html(So.View.template(this.tpl.PoiList, {
                        keyword: d.cmd.keyword,
                        pageIndex: d.page,
                        pageCount: e,
                        buses: d.busline,
                        display: d.poi ? "" : "display:none",
                        pois: d.poi,
                        cls1: d.page == 1 ? "poilist-page-btn-gray" : "",
                        cls2: d.page == e ? "poilist-page-btn-gray" : "",
                        clk1: d.page == 1 ? "" : "So.Gcmd.cmd({id:0})",
                        clk2: d.page == e ? "" : "So.Gcmd.cmd({id:1})"
                    }))
                } else {
                    c()
                }
            } else {
                c()
            }
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CTextDiv").css("display", d);
        },
        cmd: function(c) {
            switch (c.id) {
                case 0:
                    this.param.cmd.pre();
                    window.scroll(0, 1);
                    break;
                case 1:
                    this.param.cmd.next();
                    window.scroll(0, 1);
                    break;
                case 2:
                    So.Gcmd.changeHash("search/detail", {
                        data: this.param,
                        index: c.index
                    });
                    break;
                case 3:
                    So.Gcmd.changeHash("busline/busline", {
                        data: this.param,
                        index: c.i
                    });
                    break;
                case 4:
                    (So.State.lastSearchScene == 0 ? So.Gcmd.changeHash("search/index", {}) : So.Gcmd.changeHash("search/nearby", {}));
                    break;
                case 5:
                    So.Gcmd.changeHash("search/map", {
                        data: this.param,
                        index: 0
                    });
                    break
            }
        }
    };
    return a;
});