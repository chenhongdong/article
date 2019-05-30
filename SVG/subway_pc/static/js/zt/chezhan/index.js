(function() {
    var map,
        videoMarkerId = {},
        mapIdleFun,
        mapClickFun,
        videoBtn,
        playLayer,
        videoTileFun,
        activeMk,
        defaultIcon,
        activeIcon,
        currentMks={};



    var video = {
        init: function() {
            this.initMap();

            this.addButton();
            this.addPlayLayer();
            this.bindEvent();
    
            defaultIcon = So.Util.createIcon('video');
            activeIcon = So.Util.createIcon('video', 'active');

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

                activeMk && activeMk.setIcon(defaultIcon);
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
                    sn = btn.attr('data-sn');
                so.maps.event.trigger(currentMks[sn],'click');
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
            var mks = [];

            var mk = So.Util.createMarker('video', {
                id: 'video_' + poi.sn,
                x: poi.road_loc[0],
                y: poi.road_loc[1]
            });
            so.maps.event.addListener(mk,'click',function(e){
                try {
                    e.__event__.stopPropagation();
                } catch (e) {}

                activeMk && activeMk.setIcon(defaultIcon);

                playLayer.show();
                playLayer.find('.frame').html('<iframe class="player-frame" width="100%" height="210px" src="/videoiframe.html?sn=' + poi.sn + '&position=fixed"></iframe>');
                playLayer.find('.video-title .title').html(poi.name);

                this.setIcon(activeIcon);
                activeMk = this;



                return false;
            })

            mks.push(mk);
            currentMks[poi.sn] = mk;
            map.addOverlays(mks);
        },
        showVideo: function() {
            var me = this,
                region = map.getBounds(),
                needLoadBounds = [];
            var minBounds = region.lngSpan.minX + ',' + region.latSpan.minY;
            var maxBounds = region.lngSpan.maxX + ',' + region.latSpan.maxY;
            needLoadBounds.push(minBounds);
            needLoadBounds.push(maxBounds);

            if (needLoadBounds.length) {
                this.loadVideoData(needLoadBounds);
            }
        },
        loadVideoData: function(bounds) {
            var me = this;

            var type = $('#type').val();

            $.ajax({
                url: '//map.so.com/app/shuidi/list',
                //url:'//map.so.com/app/shuidi/video?region=116.35945207379149,39.891924687244256;116.43455392620848,39.93386089374698&src=xiaoshuidi',
                type: 'GET',
                dataType: "jsonp",
                data: {
                    tag: type
                },
                timeout: 5000,
                success: function(res) {
                    map.clearOverlays();
                    var latLngs = [];
                    _.forEach(res.data, function(poi) {
                        me.createVideoMk(poi);
                        latLngs.push(new so.maps.LatLng(poi.road_loc[1], poi.road_loc[0]))
                    });
                    me.initList(res.data);
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
            var listLis = '';
            _.forEach(pois, function(poi) {
                listLis += '<li class="list-item" data-sn="' + poi.sn + '">' +
                    '<img class="list-item-img" src="' + poi.thumbnail + '"/>' +
                    '<p class="list-item-title">' + poi.name + '</p>' +
                    '</li>';
            });
            $('#list-containter').html(listLis);
        }
    };
    video.init();
})()
