define(function(require){
    var config = require('js/app/conf/config');
    var a = {
        _visible: false,
        _init: false,
        tpl:{
            MoreCat: require('../../../templates/MoreCat.html')
        },
        name: "search_morecat",
        logname: "categorypage",
        containMap: false,
        lastSelectItem: null,
        setBodyMainHeight: false,
        prepare: function(d) {
            if(!this._init){
                $("#CategoryDiv").append(So.View.template(this.tpl.MoreCat, {}));
                var d = document.getElementsByName("categoryName");
                for (var c = 0; c < d.length; c++) {
                    d[c].onclick = this.onClickItem
                }
                this.top = 41;
            }
            this._init = true
        },
        onClickItem: function(e) {
            var c = a.lastSelectItem;
            var d = "";
            var f = e.target.id;
            if (f != null && f.length > 2) {
                f = f.substring(0, 2)
            }

            if (f == "") {
                d = e.target.innerText;
                    var mp = '',
                        loc = So.State.getLocation(),
                        x = loc.x,
                        y = loc.y;
                    if (x && y) {
                        mp = y + ',' + x;
                    }
                    new So.Command.CitySearch({
                        keyword: d,
                        mp: mp
                    }).run()
                e.stopPropagation()
            }
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CategoryDiv").css("display", d);
            $("#CategoryDiv .m-cat").css("display", d);
            $("#CategoryDiv .cat").css("display", 'none');
        },
        resize: function() {
        },
        cmd: function(c) {
            switch (c.id) {
                case 0:
                case 1:
                case 2:
                case 3:
                    So.SearchScene.cmd(c);
                    break;
                case 4:
                    So.Gcmd.changeHash("search/nearby", {});
                    break;
            }
        }
    };

    return a;
})
