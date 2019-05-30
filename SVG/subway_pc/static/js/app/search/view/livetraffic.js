define(function(require) {
    var config = require('js/app/conf/config');
    var a = {
        _visible: false,
        _init: false,
        highPolygons:[],
        tpl: {
            map_top: require('../../../templates/search/livetraffic/traffic_top.html'),
            traffic_info: require('../../../templates/search/livetraffic/traffic_info.html')
        },
        name: "livetraffic_index",
        logname: "indoorpage",
        maxHintCount: 6,
        localStorageName: "searchKey",
        containMap: true,
        setBodyMainHeight: false,
        _overlays: [],
        init: function() {
            if (!this._init) {}
            this._init = true;
            this.top = 41;
        },
        prepare: function(view_data){
            this.view_data = view_data;

            var me = this,
                map = So.UIMap.getObj(),
                data = this.view_data.data,
                params = this.view_data.params;

            var html = So.View.template(this.tpl.map_top,view_data);
            $('#CTextDiv').html(html);
            var html = So.View.template(this.tpl.traffic_info,params);
            $("#CTextDiv1").html(html);
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $('#CTextDiv').css("display",d);
            $("#CTextDiv1").css("display", d); 
            $(".mapToolsLefCon").css("display","none");
            //So.State.showLocation();
        },
        cmd: function(c) {
            var loc = So.State.getLocation();
            switch (c.id) {
                case 2:
                    window.history.back();
                    break;
            }
        },
        clearMap: function() {
            /*if (this._overlays.length > 0) {
                So.UIMap.getObj().removeOverlays(this._overlays)
            }
            this._overlays = []*/
        },
        mapheight: function() {
            return So.Main.pageheight() - $("#navToolBarDiv").height() - $("#CTextDiv").height() - $("#CTextDiv1").height()
        },
        resize: function() {
        }
    };
    a.init();
    return a;
});
