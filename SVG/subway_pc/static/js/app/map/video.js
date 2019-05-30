define(function(require){
	var map,
		videoData = {}, //小水滴视频数据
    	videoMarker = [],
    	videoMarkerId = {},
    	mapIdleFun,
    	mapClickFun,
    	videoBtn,
    	playLayer,
        videoTileFun,
        activeMk,
        defaultIcon,
        activeIcon;

    var video = {
    	init: function(){
    		map = So.UIMap.getObj();
    		this.addButton();
    		this.addPlayLayer();
    		this.bindEvent();

            defaultIcon = So.Util.createIcon('video'),
            activeIcon = So.Util.createIcon('video', 'active');
    	},
    	addButton: function(){
    		videoBtn = $('<div class="mapToolsBox maptools mapVideo"><em></em></div>');
    		$('#mapDiv .mapToolsTopCon').append(videoBtn);
    	},
    	addPlayLayer: function(){
    		playLayer = $('<div style="position:absolute;bottom:0;left:0;width:100%;z-index:1000;display:none;"><div style="position:absolute;width:100%;height:100%;top:0;left:0;background-color:#000;opacity:0.8;z-index:-1"></div><div class="frame"></div><div style="position:absolute;width:100%;height:40px;top:0;left:0;background-color:#000;opacity:0.6;"></div><div style="position:absolute;width:100%;height:40px;top:0;left:0;color:#fff;font-size:12px;line-height:40px;text-indent:10px;" class="video-title"><span class="title"></span><em class="close" style="position:absolute;top:0;right:0;width:80px;height:40px;background:url(\'//p0.ssl.qhimg.com/t01bb1930496dc94103.png\') no-repeat 45px center;background-size:12px;"></em></div>');
    		$('body').append(playLayer);
    	},
    	openVideo: function(){
    		var me = this;
    		mapIdleFun = function(){
    			me.showVideo();
    		};
    		mapClickFun = function(){
    			playLayer && playLayer.hide();
                
                //移除iframe;
                playLayer.find('.frame').html('');

                activeMk && activeMk.setIcon(defaultIcon);
    		};
            videoTileFun = function(event){
                event.stopPropagation();
            };
    		map.on('idle', mapIdleFun);
            map.on('zoomend', mapIdleFun);

    		$('body').on('click', mapClickFun);
            $('.video-title').on('click', videoTileFun);
            $('.video-title .close').on('click', mapClickFun);
            map.on('click', mapClickFun);
    		this.showVideo();

            //隐藏地图定位提示条;
            So.UIMap.hideUserLocation();
    	},
    	closeVideo: function(){
    		var me = this;
    		map.off('idle', mapIdleFun);
            map.off('zoomend', mapIdleFun);
    		$('body').off('click', mapClickFun);
            $('.video-title').off('click', videoTileFun);
            $('.video-title .close').off('click', mapClickFun);
            map.off('click', mapClickFun);
    		this.clearVideoMk();
    		playLayer.hide();
    	},
    	bindEvent: function(){
    		var me = this;

            $(videoBtn).on('click', function(){
            	var btn = $(this),
            		active = btn.hasClass('active');

            	btn.toggleClass('active');

            	if(!active){
            		me.openVideo();
            	}else{
            		me.closeVideo();
            	}
            });
    	},
    	getTileKey: function(tile, zoom){
            var _tile = tile.split(','),
                x = _tile[0],
                y = _tile[1],
                key =zoom + '_' +  x + '_' + y;

            return key;
        },
        clearVideoMk: function(){
            map.removeOverlays(videoMarker);
            videoMarker = [];
            videoMarkerId = {};
        },
        createVideoMk: function(tile){
            var mks = [];
            _.forEach(tile, function(poi, key){

                if(!videoMarkerId[poi.sn]){
                    var mk = So.Util.createMarker('video', {
                        id: 'video_' + poi.sn,
                        x: poi.x,
                        y: poi.y
                    });

                    mk.on('click', function(e){
                        try{
                            e.__event__.stopPropagation();
                        }catch(e){}

                        activeMk && activeMk.setIcon(defaultIcon);
                        
                    	playLayer.show();
                    	playLayer.find('.frame').html('<iframe class="player-frame" width="100%" height="210px" src="http://jia.360.cn/jia_player_autosize.html?sn='+ poi.sn +'&autostart=true&channel=hide"></iframe>');
                        playLayer.find('.video-title .title').html(poi.title);

                        this.setIcon(activeIcon);
                        activeMk = this;

                        //将页面滚动至最底部，防止视频显示不完整
                        setTimeout(function(){
                            window.scrollTo(0,10000);
                        },1000);
                        

                        return false;
                    });
                    mks.push(mk);

                    //标记当前视频已经在地图上展示
                    videoMarkerId[poi.sn] = 1;
                }
                
            });

            videoMarker = videoMarker.concat(mks);

            map.addOverlays(mks);
        },
        showVideo: function(){
            var me = this,
                tiles = map.getViewTiles(),
                zoom = map.getZoom(),
                needLoadTiles = [];

            _.forEach(tiles, function(tile, key){
                var key = me.getTileKey(tile, zoom);

                if(videoData[key]){
                    me.createVideoMk(videoData[key]);
                    
                }else{
                    videoData[key] = '1'; //正在加载中;
                    needLoadTiles.push(tile);
                }
            });
            if(needLoadTiles.length){
                this.loadVideoData(needLoadTiles, zoom);
            }
        },
        loadVideoData: function(tiles, zoom){
            var me = this;
            var errorFun = function(){
                //加载失败删除占位符;
                _.forEach(tiles, function(tile){
                    var key = me.getTileKey(tile, zoom);
                    if(videoData[key] == '1'){
                        delete videoData[key];
                    }
                });
            };

            $.ajax({
                url: '//map.so.com/app/video/tile?jsoncallback=?',
                type: 'GET',
                dataType: "jsonp",
                data: {
                    tiles: tiles.join(';'),
                    z: zoom
                },
                timeout:5000,
                success: function(res){
                    _.extend(videoData, res);

                    _.forEach(res, function(tile){
                        me.createVideoMk(tile);
                    });                    
                },
                error: errorFun
            });
        }
    };

    return video;
});


