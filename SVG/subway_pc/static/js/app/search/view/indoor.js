define(function(require) {
    var config = require('js/app/conf/config');
    var a = {
        _visible: false,
        _init: false,
        highPolygons:[],
        tpl: {
            map_top: require('../../../templates/search/indoor/map_top.html'),
            map_bottom: require('../../../templates/search/indoor/map_bottom.html'),
            map_floors: require('../../../templates/search/indoor/map_floors.html')
        },
        name: "indoor_index",
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
            view_data.buildid=null;
            this.view_data = view_data;

            var me = this,
                map = So.UIMap.getObj(),
                data = this.view_data.data,
                params = this.view_data.params,
                lnglat,
                marker,
                showMk = params.showmk,
                center = /\d+,\d+/.test(params.center) ? params.center.split(',') : '',
                bid = params.bid,
                bounds = params.bounds,
                floors = params.floors,
                currentFloor = params.currentFloor,
                zoom = parseInt(params.zoom || 19);
            /*console.log(parseFloat(center[0]),parseFloat(center[1]))
            if(center[0] && center[1]){
                lnglat = new so.maps.LatLng(parseFloat(center[0]),parseFloat(center[1]));
            }*/
            // lnglat = new so.maps.LatLng(39.968639,116.485357);
            // lnglat && map.setCenter(lnglat);
            bounds = bounds.split(';');
            var sws = bounds[0].split(",");
            var nes = bounds[1].split(",");
            //bounds = new so.maps.LatLngBounds(new so.maps.LatLng(sws[1], sws[0]),new so.maps.LatLng(nes[1], nes[0]));
            bounds = new so.maps.LatLngBounds(new so.maps.LatLng(sws[1], sws[0]),new so.maps.LatLng(nes[1], nes[0]));
            //console.log(bounds)
            map.setCenter(bounds.getCenter());
            map.setBoundary(bounds);
            me.changeMapFloor(bid,currentFloor || 'F1');

            map.on('click',function(e){
               me.showShopInfo(e.latLng);
            })

            var html = So.View.template(this.tpl.map_top,view_data);
            $('#CTextDiv').html(html);
            var html = So.View.template(this.tpl.map_bottom,view_data);
            $('#CTextDiv1').html(html);
            floors = floors.split(',').reverse();
            var html = So.View.template(this.tpl.map_floors,{bid:bid,floors:floors,currentFloor:currentFloor});
            this.floors = floors;
            this.currentFloor = currentFloor;
            $('.mapToolsBox.maptools.indoorMap').html(html);

            $(".mapToolsBox .arrow.top").on('click',function(){
                So.is.prev();
            })
            $(".mapToolsBox .arrow.bottom").on('click',function(){
                So.is.next();
            })
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $('#CTextDiv').css("display",d);
            $("#CTextDiv1").css("display", d);
            So.UIMap.visible(c);
            //So.State.showLocation();
            $(".mapToolsLefCon").css("display","none");
            $(".mapToolsBox.maptools.mapTraffic").css('display','none');
        },
        cmd: function(c) {
            var loc = So.State.getLocation();
            switch (c.id) {
                case 2:
                    window.history.back();
                    break;
                case 3: 
                    var params = this.view_data.params;
                    So.Gcmd.changeHash('search/indoor', {
                        params:{
                            bid:params.bid,
                            bounds:params.bounds,
                            floors: params.floors+'',
                            center:params.center,
                            currentFloor:c.floor || 'F1'
                        }
                    });
                   /* this.changeMapFloor(c.bid,c.floor);
                    var lis = $('#floors-scroller ul li');
                    for(var i=0;i<lis.length;i++){
                        if(i == c.index){
                            $(lis[i]).addClass('select')
                        }else{
                            $(lis[i]).removeClass('select')
                        }
                    }*/
                    break;
            }
        },
        clearMap: function() {
            if (this._overlays.length > 0) {
                So.UIMap.getObj().removeOverlays(this._overlays)
            }
            this._overlays = []
        },
        mapheight: function() {
            return So.Main.pageheight() - $("#navToolBarDiv").height() - $("#CTextDiv").height() - $("#CTextDiv1").height()
        },
        resize: function() {

             window.scrollTo(0, config.RouteTop);  

            if(So.is){So.is.destroy();So.is = null;}
            var selectFloorIndex = 0;
            this.maxFloorNum = this.floors.length;
            for(var i=0;i<this.maxFloorNum;i++){
                var floor = this.floors[i];
                if(floor == this.currentFloor){
                    selectFloorIndex = i;
                }
            }
            var startY = 0;
            if(selectFloorIndex < this.maxFloorNum - 4){
                startY = -(selectFloorIndex) * 40
            }
            if(selectFloorIndex >= 4){
                startY = -(this.maxFloorNum - 4) * 40
            }
            So.is = new IScroll('#floors-scroller',{startY:startY,click:true,snap: true});          
        },
        changeMapFloor:function(bid,floor){
            this.clearHighPolygon();
            this.bid = bid;
            this.floor = floor;
            var map = So.UIMap.getObj();
            map.setMaxZoom(21);
            map.setMinZoom(19);
            var defaultPixelRatio = 1.5;
            var devicePixelRatio = window.devicePixelRatio;
            var maxDevicePixelRatio = 2;
            if(devicePixelRatio){
                if(devicePixelRatio <= 1){
                    devicePixelRatio = defaultPixelRatio;
                }else{
                    devicePixelRatio = Math.min(devicePixelRatio,maxDevicePixelRatio);
                }
            }else{
                 devicePixelRatio = defaultPixelRatio
            }
            floor = floor || 'F1';
            this.getIndoorData(bid,floor);
            var indoorLayer = new so.maps.TileLayer({
                map:map,scheme:'xyz',
                pixelRatio:devicePixelRatio,
                baseLayer:true,
                enableWebGL:false,
                minZoom:19,
                maxZoom:21,
                tileUrlFunc:function(tile,zoom){
                //-8.370382572398768, 5.330951988780043
                    var x = tile.x;
                    var y = tile.y;    
                    var z = zoom;
                    var index = (x+y)%5;
                    var blockx = Math.floor(x/16);
                    var blocky= Math.floor(y/16);

                    var url = 'http://map0.qhmsg.com/indoor/ver1/'+z+'/'+blockx+'/'+blocky+'/'+x+'_'+y+'_'+floor+'.png';
                    return url
            }});

            var indoorMapType = new so.maps.MapType({
                scheme:'xyz',
                pixelRatio:devicePixelRatio,
                name : '室内图',
                alt : '室内图',
                tileSize: new so.maps.Size(384 / devicePixelRatio, 384 / devicePixelRatio),
                layers : [indoorLayer]
            });
            map.mapTypes.set('indoormap'+floor,indoorMapType);
            map.setMapTypeId('indoormap'+floor);
            map.setZoom(19, true);

            var zoominCon = $('.maptools .mapZoomin');
            var zoomoutCon = $('.maptools .mapZoomout');
            zoominCon.removeClass('mapNoZoom');
            zoomoutCon.addClass('mapNoZoom');
        },
        pointInPolygon:function(point,vs){
            var x = point.lng, y = point.lat;
    
            var inside = false;
            for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                var a = vs[i].split(",");
                var b = vs[j].split(",");

                var xi = parseFloat(a[0]), yi = parseFloat(a[1]);
                var xj = parseFloat(b[0]), yj = parseFloat(b[1]);
                
                var intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            
            return inside;
        },
        getIndoorData:function(bid,floor){
            var self = this;
            if(window['indoor_'+bid+'_'+floor]) return;
            this.loadJs('http://map0.qhmsg.com/indoor/ver1/'+bid+'_'+floor+'.json?t='+(+new Date),function(){
                if(!self.indoorData){
                    self.indoorData = {};
                }
                self.indoorData[bid+'_'+floor] = window['indoor_'+bid+'_'+floor];
            })
        },
        clearHighPolygon:function(){
            var highPolygons = this.highPolygons;
            if(highPolygons.length){
                _.each(highPolygons,function(v,k){
                   v.setMap(null)
                })
            }
        },
        showShopInfo:function(latlng){
            this.clearHighPolygon();
            var map = So.UIMap.getObj();
            var mapTypeId = map.getMapTypeId();
            var bid = this.bid;
            var floor = this.floor;
            if(mapTypeId.indexOf('indoormap') >-1 ){
                var indoorData = this.indoorData[bid+'_'+floor];
                if(indoorData){
                    for(var i = 0,l = indoorData.length; i<l ; i++){
                        var data = indoorData[i];
                        var inside = this.pointInPolygon(latlng,data.XY);
                        if(inside && data.name!=""){
                            //console.log(inside,i,data.name)
                            $('#indoor_map_info .info_wrap .title').text(data.name);
                            $('#indoor_map_info .floor').text(floor+'层'+(data.boothnum ? data.boothnum +'号':''));
                            $('#indoor_map_info .info_wrap .link').css('display','none');
                            if(data.poiid){
                                 So.PoiService.poiHotspot(data.poiid, function(g) {
                                    var pguid;
                                    if(g.poi){
                                        if(_.isObject(g.poi)){
                                            pguid = g.poi.pguid;
                                        }else if(g.poi.length){
                                            pguid = g.poi[0].pguid;
                                        }
                                    }
                                    if(pguid){
                                        $('#indoor_map_info .info_wrap .link a').attr('href','//map.so.com/onebox/?type=detail&id='+pguid+'&mso_x='+g.poi.x+'&mso_y='+g.poi.y+'&d=mobile&src=map_wap')
                                        $('#indoor_map_info .info_wrap .link').css('display','block');
                                    }
                                 })
                            }else{
                                $('#indoor_map_info .info_wrap .link').css('display','none');
                            }
                            var xys = data.XY;
                            var path = [];
                            for(var j=0,n=xys.length;j<n;j++){
                                var xy = xys[j].split(",");
                                var x = xy[0];
                                var y = xy[1];
                                path.push(new so.maps.LatLng(y,x));
                            }
                            var highPolygon = new so.maps.Polygon({
                                path: path,
                                strokeWeight:0,
                                fillColor:'#00f',
                                fillOpacity:0.3
                            });
                            highPolygon.setMap(map);
                            this.highPolygons.push(highPolygon);
                        }
                    }
                }
               $('#indoor_map_info').css('display','block');
            }else{
               $('#indoor_map_info').css('display','none');
            }
        },
        loadJs:function(url, callback){
            var f = arguments.callee;
            if (!f.queue){
                f.queue = {};
            }
            var queue = f.queue;
            if (url in queue) { // script is already in the document
                if (callback) {
                    if (queue[url]) // still loading
                        queue[url].push(callback);
                    else // loaded
                        callback();
                }
                return;
            }
            queue[url] = callback ? [callback] : [];
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.onload = script.onreadystatechange = function(){
                if (script.readyState && script.readyState != "loaded" && script.readyState != "complete")
                    return;
                script.onreadystatechange = script.onload = null;
                script.src = '';
                script.parentNode.removeChild(script);
                script = null;
                while (queue[url].length){
                    queue[url].shift()();
                }
                queue[url] = null;
            };
            script.src = url;
            document.getElementsByTagName("head")[0].appendChild(script);
           
        }
    };
    a.init();
    return a;
});
