define(function(require) {
	var config = require('js/app/conf/config');
    var dataList = [],info,ci,tempP;//数据包 ，infoLabel气泡 ，currentIndex当前id
    var marker_origin = {'yidong':[1,1],'liantong':[1,41.5],
            'dianxin':[1,81.5],'default':[1,121.5]};
    var a = {
        _visible: false,
        _init: false,
        tpl: {
            freewifi_index: require('../../../templates/freewifi/index.html')
        },
        name: "freewifi_index",
        logname: "freewifiindexpage",
        containMap: true,
        setBodyMainHeight: false,
        _overlays : [],
        prepare:function(d){
            d.wd = "附近的免费WIFI";
            d.c = d.count||20;
            jiagongData(d);
    		var html = So.View.template(this.tpl.freewifi_index,d);
            $('#CTextDiv').html(html);

            this.prepareMap();
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $('#CTextDiv').css("display",d);
            So.UIMap.visible(c);
        },
        restoreMap:function(){//恢复加载地图之前的样式
            $(".mapToolsLefCon").off('click',backToO);
            $(".mapToolsLefCon").css({'bottom':10,'left':10,'top':'auto','right':'auto'});
            $("#mapTraffic").show();
            $('.mapZoomCon').css({
                'bottom':'10px',
                'top':'auto'
             });
        },
        cmd:function(c){
        	switch(c.id){
        		case 44:
                $(window).off('resize',handleResize);
                So.UIMap.getObj().off('dragend',calCenter);
                this.clearMap();
                this.restoreMap();
        		So.Gcmd.changeHash("search/index", {});
        		break;
                case 999:
                this.handleContent();
                break;
        	}
        },
        prepareMap:function(){//加载地图后进行样式处理，清楚overlay和添加resize
             $(".mapToolsLefCon").css({'top':10,'right':10,'left':'auto','bottom':'auto'});
             $(".mapToolsLefCon").on('click',backToO);
             $("#mapTraffic").hide();
             $("#footer-wrapper").css("top",$(window).height() - 50);

             $('.mapZoomCon').css({
                'bottom':'auto',
                'top':'55px'
             });

             this.clearMap();
             this.prepareMarkers(true);

             $(window).on('resize',handleResize);

             tempP = new so.maps.LatLng(So.UIMap.getObj().center.lat,So.UIMap.getObj().center.lng);

             So.UIMap.getObj().on('dragend',calCenter);
        },
        clearMap: function() {//清空地图overlays，清楚定时器

            if(info){info.setMap(null);info = null;}
            if (this._overlays.length > 0) {
                //So.UIMap.getObj().removeOverlays(this._overlays)
                for(var i in this._overlays){
                    if(this._overlays[i]){
                        this._overlays[i].setMap(null);this._overlays[i] = null;
                    }
                }
            }
            this._overlays = []
        },
        prepareMarkers:function(t){//添加 markers
            var max = this.calMax(),
                len = Math.min(dataList.length,max);
            for(var i = 0; i < len;i++){
                var m = this.makeMarkers(dataList[i]);
                m.mid = i;
                m.on('click',function(e){
                    ci = this.mid;
                    showInfo();
                });
                this._overlays.push(m);
            }
            if(t)So.UIMap.setFitView(this._overlays);
        },
        makeMarkers:function(v){//生成不同类型的markers
            var anchor = new so.maps.Point(14, 19),
                size = new so.maps.Size(28, 39),
                origin = new so.maps.Point(marker_origin[v.carrier][0], marker_origin[v.carrier][1]),
                scaleSize = new so.maps.Size(30.5,161.5),
                icon = new so.maps.MarkerImage(
                        "img/freewifi-markers.png",
                        size,
                        origin,
                        anchor,
                        scaleSize
                );
            return new so.maps.Marker({map:So.UIMap.getObj(),
                position:new so.maps.LatLng(v.lat,v.lng),
                icon:icon,clickable:true});
        },
        calMax:function(){//min 11 max 18 根据地图的zoom来进行渲染数量的计算
            var z = So.UIMap.getObj().getZoom(); 
            if(z < 11) z = 11;
            if(z > 18) z = 18;
            var bizhi = (z - 10)/(18 - 10);
            return Math.ceil(50 * bizhi);
        },
        handleContent:function(keepHide){//控制下方list展开，收回
            if($("#footer-main-content").height() == 0){
                if(keepHide)return;
                $("#footer-main-content").height(180);
                $("#footer-wrapper").height(230);
                if(this.getAllItems()){
                    $("#footer-wrapper").animate({'top':$(window).height()-230},400,'swing');
                    $("#footer-top-content span").removeClass('trigon-up').addClass('trigon-down');
                }
            }else{
                $("#footer-wrapper").animate({'top':$(window).height()-50},400,'swing',function(e){
                    $("#footer-top-content span").removeClass('trigon-down').addClass('trigon-up');
                    $("#main-content-ul").empty();
                    $("#footer-wrapper").height("auto");
                    $("#footer-main-content").height(0);
                });
            }
        },
        getAllItems:function(){//整理下方list中的item
            if(!dataList||dataList.length == 0){
                this.handleContent();
                return false;
            }
            for(var i in dataList){
                var $v = this.getListItem(dataList[i]);
                $v.data('mid',i);
                $v.on('click',function(e){
                    ci = $(this).data('mid');
                    if(a._overlays[ci]){
                        showInfo();
                    }else{
                        a._overlays[ci] = a.makeMarkers(dataList[ci]);
                        a._overlays[ci].mid = ci;
                        a._overlays[ci].on('click',function(e){
                            ci = this.mid;
                            showInfo();
                        });
                        showInfo();
                    }
                    a.handleContent();
                });
                $v.appendTo($("#main-content-ul"));
            }
            return true;
        },
        getListItem:function(v){//获取单个list item，并填充单个list item内容
            var icon = v.carrier;
            var $item = $("<li></li>").addClass('main-content-item');
           
            $("<span></span>").addClass('item-icon '+icon).appendTo($item);
            $("<p></p>").text(v.ssid).addClass("item-title").appendTo($item);
            $("<p></p>").text(v.desc).addClass("item-desc").appendTo($item);

            var $dis = $("<div></div>").addClass("item-dis").appendTo($item);
            $("<span></span>").addClass('human-icon').appendTo($dis);
            $("<span></span>").addClass('human-txt').appendTo($dis).text(v.distance + 'm');

            return $item;
        }
    };
    function jiagongData(d){//加工原始数据
        dataList = d.aps;
        if(!dataList||dataList.length==0){
            alert("无有效数据，请稍后再试!");
            So.Gcmd.changeHash("search/index", {});
            return;
        }
        for(var i in dataList){
            var v = dataList[i];
            var loc = So.State.getLocation();
            var y = loc.y||39.90,
                x = loc.x||116.39;
            var o = new so.maps.LatLng(y,x);
            v.distance = Math.round(o.distanceTo(new so.maps.LatLng(v.lat,v.lng)));
            if(!v.address||v.address==""){
                v.address = "暂无地理位置信息";
            }
            switch(v.carrier){
                case 'CMCC':
                v.carrier = "yidong";
                break;
                case '':
                v.carrier = "default";
                break;
                case 'ChinaUnicom':
                v.carrier = "liantong";
                break;
                case 'ChinaNet':
                v.carrier = "dianxin";
                break;
            }
        }
    }
    function dataCallback(d){//更新数据后的回调

        jiagongData(d);//加工数据
        a.clearMap();//清空地图
        a.prepareMarkers(false);//是否需要定位
        a.handleContent(true);//收缩列表
        $("#footer-title").text("附近"+d.aps.length+"个免费WiFi");
    }
    function calCenter(){//计算中心点和之前的点位之间的距离如果大于200m更新数据
        So.UIMap.getObj().off('center_changed',calCenter);
        if(!tempP){
            tempP = new so.maps.LatLng(So.UIMap.getObj().center.lat,So.UIMap.getObj().center.lng);
            return;
        }else{
            var n = new so.maps.LatLng(So.UIMap.getObj().center.lat,So.UIMap.getObj().center.lng);
            if(tempP.equals(n)||tempP.distanceTo(n) < 200){return;}//console.log("no move");
            else{tempP = n;}
            new So.Command.freeWifiListRefreshHandler({ck:dataCallback}).run();
        }
    }
    function handleResize(e){//控制横竖屏的操作
        $("#footer-wrapper").animate({'top':$(window).height()-50},400,'swing',function(e){
            $("#main-content-ul").empty();
            $("#footer-wrapper").height("auto");
            $("#footer-main-content").height(0);
        });
    }
    function showInfo(){//生成info窗口
        if(So.UIMap.geoIW){So.UIMap.geoIW.setVisible(false);}
        if(info){info.setMap(null);info = null;}
        a._overlays[ci].setZIndex(a._overlays.length);
        var p = new so.maps.LatLng(dataList[ci].lat,dataList[ci].lng);
        So.UIMap.getObj().setCenter(p);
        info = new so.maps.Label({
            position: p,
            map: So.UIMap.getObj(),
            content:getContent(),
            style:{},
            offset:new so.maps.Size(-125,-175)
        });
        info.on('domready',function(e){

            $("<span></span>").addClass('item-icon '+dataList[ci].carrier).appendTo($("#info-title"));
            $("<p></p>").text(dataList[ci].ssid).addClass("item-title").appendTo($("#info-title"));
            $("<p></p>").text(dataList[ci].desc).addClass("item-desc").appendTo($("#info-title"));
            var $closeBtn = $("<span></span>").text("关闭").css({
                'display':'inline-block',
                'height':'60px','width':'60px',
                'text-align':'center',
                'position':'absolute',
                'right':'0px',
                'top':0,
                'border-left':"1px solid #eee",
                'line-height':'60px'
            }).appendTo($("#info-title")).click(function(e){
                $("#info-btn").off('click');
                info.setMap(null);info = null;
            });
            //
            $("<span></span>").addClass('info-address-loc-icon').appendTo($("#info-address"));
            var $p_address = $("<p></p>").text(dataList[ci].address).appendTo($("#info-address"));
            //console.log($p_address.height());
            if($p_address.height() == 25){
                $p_address.css({'height':'40px','line-height':'40px'});
            }else{
                $p_address.css({'height':'40px','line-height':'20px'});
            }
            var $distance_txt = $('<span></span>').css({
                'display':'inline-block',
                'height':'40px',
                'position':'absolute',
                'right':'10px',
                'top':0,
                'line-height':'40px',
                'color':'#1ecd0c'
            }).text(dataList[ci].distance+'m').appendTo($('#info-address'));
            //console.log($distance_txt.offset(),$distance_txt.width(),10);
            $("<em></em>").addClass('human-icon').css({
                'position':'absolute',
                'left':250-$distance_txt.width()-9-15,
                'top':'50%','margin-top':'-7.5px'
            }).appendTo($('#info-address'));
            
            //
            $("<a href = 'javascript:void(0)'>下载客户端，免费WiFi随便连</a>").appendTo($("#info-btn"));
            $("<em></em>").addClass('trigon').appendTo($("#info-btn"));
             $("#info-btn a").on('click',function(e){
                e.preventDefault();
                checkIfAndroid();
            });
        });
    }
    function getContent(){//info窗口content的基础样式
        var html = "<div style='background-color:#fff;width:250px;border:1px solid #eee'><ul><li id='info-title'></li><li id='info-address'></li><li id='info-btn'></li></ul></div>";
        return html;
    }
    function checkIfAndroid(){//根据是否是安卓手机来定义页面链接
        var u = navigator.userAgent, app = navigator.appVersion;
        if(u.indexOf('Android') > -1 || u.indexOf('Linux') > -1){
            window.open("http://down.360safe.com/360ap/360freewifi_360ditu_web.apk");
        }else{
            window.open("http://freewifi.360.cn/");
        }
    }
    function backToO(e){
        So.UIMap.getObj().on('center_changed',calCenter);
    }
    return a;
});
