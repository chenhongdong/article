define(function(require) {
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').index;
    var map;
    var a = {
        _visible: false,
        _init: false,
        name: "search_index",
        logname: "searchpage",
        maxHintCount: 6,
        localStorageName: "searchKey",
        containMap: true,
        setBodyMainHeight: false,
        tpl: {
            bottom_tab_item: require('../../../templates/search/index/index.html')
        },
        _overlays: [],
        init: function() {
            if (!this._init) {}
            this._init = true;
            this.top = 41
        },
        prepare: function(view_data) {
            var me = this;

            map = So.UIMap.getObj();

            //开启地图模式
            config.setApptoMapMode();

            this.view_data = view_data;

            var me = this,
                data = this.view_data.data,
                params = this.view_data.params,
                lnglat,
                marker,
                showMk = params.showmk,
                center = /\d+,\d+/.test(params.center) ? params.center.split(',') : '',
                zoom = parseInt(params.zoom || 10);

            if (center[0] && center[1]) {
                lnglat = new so.maps.LatLng(center[1], center[0]);
                lnglat && map.setCenter(lnglat);
                zoom && map.setZoom(zoom, true);

                //添加marker
                if (lnglat && showMk) {
                    marker = So.Util.createMarker("point", {
                        markerid: 'point',
                        x: center[0],
                        y: center[1]
                    });
                    marker.setMap(map);
                }
            }

            map.on('idle', a.changeHash);
            $('body').on('change_map_center', a.changeHash);
            // map.on('zoom_changed', a.changeHash);


            $('#header-nav-query').prev().show()

            // monitor log
            monitor.disp.enter()
        },
        changeHash: function(){
            var data = a.view_data.data,
                params = a.view_data.params;

            var center = map.getCenter();
            var zoom = map.getZoom();

            So.Gcmd.changeHash('search/index', {
                params: _.extend(params, {
                    center: center.lng + ',' + center.lat,
                    zoom: zoom
                }),
                onlySetParams: true
            });
        },
        visible: function(c) {

            if (this._visible == c) {
                return
            }
            if (c) {
                setTimeout(function(){
                    $('html').height(0);
                },100);
            }else{
                map.off('idle', a.changeHash);
                $('body').off('change_map_center', a.changeHash);
                //map.off('zoom_changed', a.changeHash);
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $("#navToolBarDiv").css("display", 'none');
            $("#searchDiv").css("display", d);
            So.UIMap.visible(c);
            $("#mapRoute").show();
            //合并身边生活与地图
            this.handleCTextDiv1(c);
        },
        handleCTextDiv1: function(on) {
            if (on) {
                $("#CTextDiv1").css({display: 'block'}).html(So.View.template(this.tpl.bottom_tab_item));
            } else {
                $("#CTextDiv1").empty();
            }
            var adjust = $("#CTextDiv1").css('display') == 'none' ? 0 : +$("#CTextDiv1").height();
            $(".mapToolsBox.maptools.mapZoomCon").css({ 'bottom': (30 + adjust) + 'px' });
            //                  $(".mapToolsBox.maptools.mapRoute").css({'bottom' : (99 + adjust)+'px'});
            $(".mapToolsLefCon").css({ 'bottom': (30 + adjust) + 'px' });
            setTimeout(function(){
                So.UIMap.mapObj.notify('overlayRedraw')
            },200)
        },
        cmd: function(c) {
            switch (c.id) {
                case 1:
                    monitor.click.myall();
                    So.Gcmd.changeHash('user/index');
                    break;
                case 6:
                    monitor.click.cross();
                    So.Gcmd.changeHash('search/categories');
                    break;
            }
        },
        mapheight: function() {
            return So.Main.pageheight() + this.top - $("#navToolBarDiv").height() - $("#searchDiv").height() //- $("#CTextDiv1").height()
        },
        resize: function() {}
    };
    a.init();
    return a;
});
