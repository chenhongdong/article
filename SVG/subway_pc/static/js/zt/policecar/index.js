(function() {
    var map,
        videoMarkerId = {},
        mapIdleFun,
        mapClickFun,
        videoBtn,
        playLayer,
        videoTileFun,
        activeMk,
        currentMks={};



    var video = {
        init: function() {
            var me = this;
            this.initMap();
            this.addButton();
            this.addPlayLayer();
            this.bindEvent();
            setInterval(function(){
               me.loadVideoData();
            },30000);
        },
        initMap: function() {
            var HEADERHEIGHT = 70;
            var bodyHeight = $(document).height();
            $('.map-containter').height(bodyHeight - HEADERHEIGHT);
            this.initialize();

        },
        initialize: function() { //地图初始化
            var me = this;
            var mapOptions = {
                zoom: 13,
                center: new so.maps.LatLng('39.904520', '116.407250'),
                disableDefaultUI: true,
                mapTypeId: so.maps.MapTypeId.ROADMAP
            };
            map = new so.maps.Map(document.getElementById('map-containter'), mapOptions);
            mapIdleFun = function() {
                setTimeout(function() {
                    me.openVideo();
                }, 0)
            }
            map.on('idle', mapIdleFun);
        },
        addButton: function() {
            videoBtn = $('<div class="mapToolsBox maptools mapVideo"><em></em></div>');
            $('#mapDiv .mapToolsTopCon').append(videoBtn);
        },
        addPlayLayer: function() {
            playLayer = $('<div style="position:fixed;bottom:0;left:0;width:100%;z-index:1000;display:none;height:250px;"><div style="position:relative;"><div style="position:absolute;width:100%;height:100%;top:0;left:0;background-color:#000;opacity:0.8;z-index:-1"></div><div class="frame" style="position:relative;top:40px;left:0;"></div><div style="position:absolute;width:100%;height:40px;top:0;left:0;background-color:#000;opacity:0.6;"></div><div style="position:absolute;width:100%;height:40px;top:0;left:0;color:#fff;font-size:12px;line-height:40px;text-indent:10px;" class="video-title"><span class="title"></span><em class="close" style="position:absolute;top:0;right:0;width:80px;height:40px;background:url(\'//p0.ssl.qhimg.com/t01bb1930496dc94103.png\') no-repeat 45px center;background-size:12px;"></em></div></div>');
            $(document.body).append(playLayer);
        },
        openVideo: function() {
            var me = this;
            // mapIdleFun = function(){
            //  me.showVideo();
            // };
            map.off('idle', mapIdleFun);
            mapClickFun = function() {
                playLayer && playLayer.hide();

                //移除iframe;
                playLayer.find('.frame').html('');
            };
            videoTileFun = function(event) {
                event.stopPropagation();
            };
            //map.on('idle', mapIdleFun);
            //map.on('zoomend', mapIdleFun);

            $('body').on('click', mapClickFun);
            $('.video-title').on('click', videoTileFun);

            $('.video-title .close').on('click', mapClickFun);
            map.on('click', mapClickFun);
            this.showVideo();
        },
        closeVideo: function() {
            var me = this;
            //map.off('idle', mapIdleFun);
            //map.off('zoomend', mapIdleFun);
            $('body').off('click', mapClickFun);
            $('.video-title').off('click', videoTileFun);
            $('.video-title .close').off('click', mapClickFun);
            map.off('click', mapClickFun);
            this.clearVideoMk();
            playLayer.hide();
        },
        bindEvent: function() {
            var me = this;

            $('#nav').on('click', 'li', function() {
                var btn = $(this),
                    active = btn.hasClass('active');
                if (active) {
                    return;
                }
                var type = btn.attr('data-type');
                if (type == 'list') {
                    $('#map-containter').hide();
                    $('#list-containter').show();
                    $('#nav li').removeClass('active');
                    btn.addClass('active');
                } else {
                    $('#map-containter').show();
                    $('#list-containter').hide();
                    $('#nav li').removeClass('active');
                    btn.addClass('active');
                }
            });
            $('#type').on('change', function() {
                me.showVideo();
            })
            $('#list-containter').on('click','li',function(event) {

                var btn = $(this),
                    carid = btn.attr('data-carid');
                        console.log(carid)
                so.maps.event.trigger(currentMks[carid].mk,'click');
                videoTileFun(event);
    
            })
        },
        getTileKey: function(tile, zoom) {
            var _tile = tile.split(','),
                x = _tile[0],
                y = _tile[1],
                key = zoom + '_' + x + '_' + y;

            return key;
        },
        clearVideoMk: function() {
            map.removeOverlays(videoMarker);
            videoMarker = [];
            videoMarkerId = {};
        },
        createVideoMk: function(poi) {
            var me = this;
            var mks = [];
            if(!poi.location) return;
            var locations = poi.location && poi.location.split(',');


            if(currentMks[poi.carid]){ //判断已存在的车辆直接修改位置
                currentMks[poi.carid].mk.setPosition(new so.maps.LatLng(locations[1],locations[0]));
                currentMks[poi.carid].label.setPosition(new so.maps.LatLng(locations[1],locations[0]));
                return;
            }

            var tempMk = {};
            var icon = new so.maps.MarkerImage(
                    '//p0.ssl.qhimg.com/t0151a6cda41ff2229c.png',
                    new so.maps.Size(34, 34),
                    new so.maps.Point(0, 0),
                    new so.maps.Point(0,0),
                    new so.maps.Size(34, 34)
                );
            tempMk.mk = new so.maps.Marker({
                position: new so.maps.LatLng(locations[1],locations[0]),
                icon: icon,
                zIndex: 10,
                map:map,
                visible:true
            })

            tempMk.label = new so.maps.Label({
                position:new so.maps.LatLng(locations[1],locations[0]),
                content:poi.carid + '',
                map:map,
                style:{
                    background:"#fff",
                    color:'#333',
                    fontSize:"12px",
                    padding:"0 5px"
                },
                offset:new so.maps.Size(0, -28)
            })
            so.maps.event.addListener(tempMk.mk,'click',function(e){
                try {
                    e.__event__.stopPropagation();
                } catch (e) {}

                var dateTime = me.formatDate(new Date(Number(poi.updatetime + '000')),'yyyy-MM-dd hh:mm:ss');
                playLayer.show();
                playLayer.find('.frame').html('<iframe class="player-frame" width="100%" height="210px" src="/videoiframe.html?sn=' + poi.sn + '&position=fixed&zhibo=1"></iframe>');
                playLayer.find('.video-title .title').html(poi.carid + "<span style='margin-left:5px;'>最后更新时间: </span>" + dateTime);

                activeMk = this;

                return false;
            })

            currentMks[poi.carid] = tempMk;
        },
        showVideo: function() {
             this.loadVideoData(true);
        },
        loadVideoData: function(isFirst) {
            var me = this;
            $.ajax({
                url: '//map.haosou.com/app/poc/list/',
                type: 'GET',
                dataType: "jsonp",
                data: {
                },
                timeout: 5000,
                success: function(res) {
                    var latLngs = [];
                    var poiCarIDs = [];
                   _.forEach(res.list, function(poi) {
                        me.createVideoMk(poi);
                        poiCarIDs.push(poi.carid);
                        if(poi.location) {
                            var locations = poi.location.split(',');
                            latLngs.push(new so.maps.LatLng(locations[1], locations[0]))
                        }
                    });
                   _.forEach(currentMks,function(mk,k){
                       if(!_.contains(poiCarIDs,k)){
                          mk.mk.setMap(null);
                          mk.label.setMap(null);
                       }
                       
                   });
                   me.initList(res.list);
                   if(!isFirst) {
                    return;
                   }
                    if(latLngs.length > 0) {
                        if(latLngs.length == 1){
                            map.setCenter(latLngs[0]);
                        }
                        else {
                            var latLngBounds = new so.maps.LatLngBounds();
                            for(var i = 0;i < latLngs.length; i ++) {
                                latLngBounds.extend(latLngs[i]);
                            }
                            map.fitBounds(latLngBounds);
                        }
                    }
                },
                error: function() {}
            });
        },
        initList:function(pois) {
            var me = this;
            var listLis = '';
            _.forEach(pois, function(poi) {
                listLis += '<li class="list-item" data-carid="' + poi.carid + '">' +
                    '<img class="list-item-img" src="' + poi.thumburl + '"/>' +
                    '<p class="list-item-title">' + poi.carid + '<span class="address">'+ (poi.address || '') +'</span></p>' +
                    '</li>';
            });
            $('#list-containter').html(listLis);
        },
        formatDate:function(date,fmt)   
        { //author: meizz   
          var o = {   
            "M+" : date.getMonth()+1,                 //月份   
            "d+" : date.getDate(),                    //日   
            "h+" : date.getHours(),                   //小时   
            "m+" : date.getMinutes(),                 //分   
            "s+" : date.getSeconds(),                 //秒   
            "q+" : Math.floor((date.getMonth()+3)/3), //季度   
            "S"  : date.getMilliseconds()             //毫秒   
          };   
          if(/(y+)/.test(fmt))   
            fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
          for(var k in o)   
            if(new RegExp("("+ k +")").test(fmt))   
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
          return fmt;   
        } 
    };
    video.init();
})()
