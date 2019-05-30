define(function(require) {
    require('js/app/core/core-service');
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').subway;
    var util = require('js/subway/common/util');
    var Line = require('js/subway/entity/line');
    var Station = require('js/subway/entity/station');
    var Size = require('js/subway/base/size');
    var Position = require('js/subway/base/position');
    var Renderer = require('js/subway/renderer/canvas');
    var Subway = require('js/subway/subway');
    var store = require('js/lib/store');
    var Hammer = require('js/lib/hammer');
    var popup = require('js/subway/widget/popup');

	var cityMaps = {'beijing':'北京','shanghai':'上海','guangzhou':'广州','shenzhen':'深圳','xianggang':'香港','nanjing':'南京','chengdu':'成都','chongqing':'重庆','tianjin':'天津','shenyang':'沈阳','hangzhou':'杭州','wuhan':'武汉','suzhou':'苏州','dalian':'大连','changchun':'长春','xian':'西安','kunming':'昆明','foshan':'佛山','zhengzhou':'郑州','haerbin':'哈尔滨','changsha':'长沙','ningbo':'宁波','wuxi':'无锡','nanchang':'南昌','nanning':'南宁','fuzhou':'福州','hefei':'合肥','qingdao':'青岛','dongguan':'东莞','guiyang':'贵阳','shijiazhuang':'石家庄','xiamen':'厦门'}

    function Widget() {
        this.div = document.getElementById("map_canvas");
        this.renderer = new Renderer(this.div);
        this.init();
        this.bindEvent();
    }
    var p = Widget.prototype;

	p.prepUI = function(city,error){
		var sb = $(".subway-select ul.select-box"),
			wb = $(".subway-select div.error-warning"),
			ib = function(k,v,city){
				k = k?k:'alt';
				v = v?v:"";
				if(k === city){
					return $("<li class='select-item selected' data-k="+k+"><a href='/subway/index.html?city="+k+"'>"+v+"</a></li>")
				}else{
					return $("<li class='select-item' data-k="+k+"><a href='/subway/index.html?city="+k+"'>"+v+"</a></li>")
				}
			},
			eb = function(){
				return $("<div class='warn-frame'><h1 class='big-warn'>未开通地铁！</h1><p>您可以点击切换城市查看其他城市地铁线路</p></div>")
			}

		var ks = Object.keys(cityMaps);
		var l = ks.length%3?ks.length+(3-ks.length%3):ks.length;
		for(var i=0;i<l;i++){
			ib(ks[i],cityMaps[ks[i]],city).appendTo(sb);
		}
		$("<div style='clear:both;'></div>").appendTo(sb);
		if(error){
			$("#map_canvas").hide();
			$("#subway_zoom").hide();
			eb().appendTo($("body"));
		}
	}
    p.init = function() {
        var city = util.queryStrings('city') || 'beijing',
        x = util.queryStrings('x'),
        y = util.queryStrings('y');
        this.city = city;
        var renderer = this.renderer;
        var self = this;
        var $subwayDefer = Subway.fetchData(city, function(data) {
            self.subway = data;
			self.prepUI(city);
            renderer.addEntity(data);
            renderer.setSize({
                width: data.width,
                height: data.height
            });
            renderer.draw();
            $('.subway-nav .title span').text(data.fullName+'地铁');
        }, function() {
			self.prepUI(city,'err');
            console.log('error')
        }),
        $geoDefer = $.Deferred(),
        $stationDefer = $geoDefer.pipe(function(lnglat){
            var cityname = config.SUBWAY_CITIES[self.city] || '';
            cityname && (cityname = cityname.split(',')[1]);
            var para = {
                restType: 'json',
                mobile: 1,
                flag: 'callback',
                encode: 'UTF-8',
                keyword: '地铁',
                batch: 1,
                number: 2,
                sid: 1000,
                ext: 1,
                cityname: cityname,
                qii: 'false',
                mp: lnglat['lat']+','+lnglat['lng']
            };
            return $.ajax({
                url: config.REST_API_URL,
                dataType: 'jsonp',
                jsonp: 'jsoncallback',
                data: para
            });
        }).pipe(function(data){
            //restapi data
            if(data.status && data.status == 'E0' && data.querytype == '5' && data.poi.length > 0){
                return data.poi;
            }else{
                return '';
            }
        });
        var isFirst = window.location.hash.indexOf('reload') < 0,
            cookieTime = 1000 * 60 * 60 * 24 * 360,
            timeOut = 1000 * 60 * 2;
        if(x && y){
            if(isFirst){
                util.setCookie('_ENTERTIME',+new Date(),cookieTime);
                window.location.hash += 'reload=1';
                $geoDefer.resolve({lat:y,lng:x});
            }else{
                var enterTime = parseInt(util.getCookie('_ENTERTIME')),
                    currentTime = +new Date();
                if(!isNaN(enterTime) && (currentTime - enterTime) < timeOut){
                    $geoDefer.resolve({lat:y,lng:x});
                }else{
                    So.GeolocationService.getPosition($geoDefer.resolve);
                }
            }
        }else{
            So.GeolocationService.getPosition($geoDefer.resolve);
        }
        $.when($stationDefer,$subwayDefer).done(function(pois){
            var hasFindStation = false;
            $.each(pois, function(key, poi){
                var stationName = poi.name.replace(/\(.*\)/,'').replace(/\w+/,'');
                var station = Subway.findNearestStationByName(stationName);
                if(!hasFindStation && station && poi.distance < 20000){
                    self.popupStationWindow(station,'nearest_template');
                    renderer.zoomMax();
                    hasFindStation = true;
                }
            });
        });

        if(config.ISANDROID){
            $('.app_download_con').show();

            monitor.disp.subway_download_fc();

            //5s后隐藏下载提示
            setTimeout(function(){
                $('.app_download_con .app_download_tip_con').addClass('app_download_tip_hide');
                setTimeout(function(){
                    $('.app_download_con .app_download_tip_con').hide();
                },1000);
            },5000);

        }
        
    };

    p.bindEvent = function() {
        if (this.hammer) {
            this.hammer.off("transformstart transform transformend dragstart drag dragend tap");
            this.renderer.locked = false;
        }
        var self = this;
        var renderer = this.renderer;
        var scaleRatio,
            hammer = this.hammer = Hammer(this.div, {
                prevent_default: true,
                drag: true,
                drag_block_vertical: true,
                drag_block_horizontal: true,
                drag_min_distance: 10,
                transform: true,
                transform_always_block: true,
                tap: true
            });

        hammer.on("transformstart", function() {
            renderer.locked = true;
        });
        hammer.on("transform", function(evt) {
            evt.gesture && evt.gesture.preventDefault();
            scaleRatio = renderer.scaleRatio * evt.gesture.scale;
            renderer.setCSSTransform(0, 0, evt.gesture.scale)
        });
        hammer.on("transformend", function(evt) {
            renderer.locked = false;
            evt.gesture && evt.gesture.preventDefault();
            evt.gesture.stopDetect();
            renderer.clearCSSTransform();
            var point = renderer.getPointFromPixel(new Position(renderer.deviceWidth / 2, renderer.deviceHeight / 2));
            renderer.zoom(point.x, point.y, scaleRatio);
            if (self.popupWindow) {
                var pixel = renderer.getPixelFromPoint(self.popupWindow.getPoint());
                self.popupWindow.setPosition(pixel.x, pixel.y)
            }     
   
            self.clearZoomState();
        });

        var origin_x, origin_y;
        hammer.on("dragstart", function(evt) {
            renderer.locked || (evt.gesture && evt.gesture.preventDefault(), origin = renderer.getOriginPoint(), origin_x = origin.x, origin_y = origin.y)
        });

        hammer.on("drag", function(evt) {
            renderer.locked || (evt.gesture && evt.gesture.preventDefault(), renderer.move(evt.gesture.deltaX, evt.gesture.deltaY))
        })
        hammer.on("dragend", function(evt) {
            if (!renderer.locked) {
                evt.gesture && evt.gesture.preventDefault();
                if (null == origin_x || null == origin_y) {
                    renderer.clearCSSTransform();
                    return
                }
                var n = renderer.isOutOfBounds(origin_x, origin_y, evt.gesture.deltaX, evt.gesture.deltaY);
                n && (evt.gesture.deltaX = n.delta_x, evt.gesture.deltaY = n.delta_y);
                var o = origin_x + renderer.getPointUnitFromPixelValue(evt.gesture.deltaX),
                    r = origin_y + renderer.getPointUnitFromPixelValue(evt.gesture.deltaY);
                self.popupWindow && self.popupWindow.move(evt.gesture.deltaX, evt.gesture.deltaY);
                renderer.moveTo(o, r);
                origin_x = null;
                origin_y = null
            }
        })

        hammer.on("tap", function(evt) {
            evt.gesture && evt.gesture.preventDefault();
            if ((!evt.target || !(evt.target.handled || $(evt.target).parents("#sw_pw").size() > 0)) && evt.gesture && 1 === evt.gesture.touches.length) {
                var rect = self.div.getBoundingClientRect(),
                    touch = evt.gesture.touches[0],
                    position = new Position(touch.clientX - rect.left, touch.clientY - rect.top);
                self.hidePopupWindow();
                var point = renderer.getPointFromPixel(position),
                    station = Subway.findNearestStation(point, renderer.tolerance || 16);
                station && self.popupStationWindow(station);
            }
        })

        function zoomout(evt) {
            $("#subway_zoomout").removeClass("disable_zoom_btn");
            $("#subway_zoomin").removeClass("disable_zoom_btn");
            !renderer.isMinScale() && renderer.zoomOut();
            var popupWindow = self.popupWindow;
            if(popupWindow){
                var pixel = renderer.getPixelFromPoint(popupWindow.getPoint());
                popupWindow.setPosition(pixel.x, pixel.y)
            }
            renderer.isMinScale() && $("#subway_zoomout").addClass("disable_zoom_btn");
        }

        function zoomin(evt) {
            $("#subway_zoomin").removeClass("disable_zoom_btn");
            $("#subway_zoomout").removeClass("disable_zoom_btn");
            !renderer.isMaxScale() && renderer.zoomIn();
            var popupWindow = self.popupWindow;
            if(popupWindow){
                var pixel = renderer.getPixelFromPoint(popupWindow.getPoint());
                popupWindow.setPosition(pixel.x, pixel.y)
            }
            renderer.isMaxScale() && $("#subway_zoomin").addClass("disable_zoom_btn")
        }

        $("#subway_zoomout").on("touchstart", function(evt) {
            $("#subway_zoomout").addClass("zoom_btn_tap");
            evt.target.handled = true;
            zoomout(evt);
        });

        $("#subway_zoomout").on("click", function(evt) {
            $("#subway_zoomout").removeClass("zoom_btn_tap");
            zoomout(evt);
        });

        $("#subway_zoomin").on("touchstart", function(evt) {
            $("#subway_zoomin").addClass("zoom_btn_tap");
            evt.target.handled = true
            zoomin(evt);
        });

        $("#subway_zoomin").on("click", function(evt) {
            $("#subway_zoomin").removeClass("zoom_btn_tap");
            zoomin(evt);
        });

		$(".subway-select").on("click",
				function(e){
					$(".subway-select ul.select-box").toggle();
					$(".subway-select div.select-mask").toggle();
					$(".subway-select .select-title").hasClass("selected")?$(".subway-select .select-title").removeClass("selected"):$(".subway-select .select-title").addClass("selected");
				});

        $(".subway-nav .goback").on("click", function(evt) {
           history.back();
           return false;
        });

        $('.app_download_icon'). on("click", function(){
            monitor.click.subway_download_icon();
            setTimeout(function(){
                window.location.href = "https://ditu.so.com/zt/app/?from=subway_download_icon";    
            },100);
            
        });

        $('.app_download_con .app_download_tip_con').on("click", function(){
            monitor.click.subway_download_fc();
            setTimeout(function(){
                window.location.href = "https://ditu.so.com/zt/app/?from=subway_download_fc";
            },100);
            
        });        
        

        if(window.onorientationchange){
            window.addEventListener("orientationchange", self.resize, false);
            util.isAndroid() && window.addEventListener("resize", self.resize, false);
        }else{
            window.addEventListener("resize",function(evt){
                        self.resize(evt)
            }, false)
        }
    }

    p.resize= function(evt) {
        var self = this;
        function changeSize() {
            setTimeout(function() {
                $(document.body).css("min-height", window.innerHeight)
            }, 1);
            self.onSizeChange({
                width: evt.target.innerWidth,
                height: evt.target.innerHeight
            })
        }
        var evtType = evt.type,
            evtObj = {
                orientationchange: function() {
                    setTimeout(function() {
                        changeSize()
                    }, 1000)
                },
                resize: function() {
                    changeSize()
                }
            };
        evtType = evtType.replace(/^on/, "");
        evtType && evtObj[evtType]()
    }

    p.onSizeChange = function(size){
        var renderer = this.renderer,
            popupWindow = this.popupWindow,
            width = size ? size.width : window.innerWidth
            height= size ? size.height : window.innerHeight;
            nav_height = height - $(".common-widget-nav").height();
        $(this.div).css("height", nav_height + "px");
        $(this.div).css("height", height + "px");
        renderer && renderer.resize(width, height);
        if (popupWindow) {
            var pixel = renderer.getPixelFromPoint(popupWindow.getPoint());
            popupWindow.setPosition(pixel.x, pixel.y)
        }
    }

    p.clearZoomState=function(){
        var renderer = this.renderer;
        $("#subway_zoomout").removeClass("disable_zoom_btn");
        $("#subway_zoomin").removeClass("disable_zoom_btn");  
        renderer.isMaxScale() && $("#subway_zoomin").addClass("disable_zoom_btn");            
        renderer.isMinScale() && $("#subway_zoomout").addClass("disable_zoom_btn");
    };

    p.showPopupWindow = function(data,tpl) {
        var renderer = this.renderer;
        this.popupWindow = this.popupWindow || popup;
        this.popupWindow.init({data:data,tplname:tpl});
        this.popupWindow.show({
            x: renderer.deviceWidth / 2,
            y: renderer.deviceHeight / 2
        }, function(offsetWidth, offsetHeight) {
            renderer.moveTo(-data.x, -data.y + renderer.getPointUnitFromPixelValue(offsetHeight))
        })
    }

    p.hidePopupWindow = function() {
        this.popupWindow && this.popupWindow.destroy()
    }

    p.popupStationWindow = function(station,tpl) {
        var self = this;
        var city = this.city;
        var renderer = this.renderer;
        renderer.locked || Subway.getStationExt({
            c: city,
            s: station.sid
        }, function(data) {
            renderer.locked = true;
            if (data) {
                for (var index in data) {
                    for (var i = 0; i < self.subway.lines.length; i++) {
                        var line = self.subway.lines[i];
                        var ext = data[index];
                        if (line.lid == ext.linename) {
                            ext.lc = line.lc;
                        }
                    }
                }
                data = {
                    x: station.x,
                    y: station.y,
                    name:station.sid,
                    lines: data
                };
                self.showPopupWindow(data,tpl);
                renderer.locked = false;
                self.clearZoomState();
            }
        }, function() {});
    }

    new Widget();
});
