define(function(require) {
    var config = require('js/app/conf/config');
	var Hammer = require('js/lib/hammer'); 
    var mapObj = {
        _visible: false,
        _init: false,
        tpl:{
            map_top: require('../../../templates/search/map_top.html'),
            rent_map: require('../../../templates/rent/map.html')
        },
		command : So.Command.RentSearch,
        name: "rent_map",
        logname: "rentmappage",
        mPrefix: "rentmap_",
		labelArr: [],
		labelIndex : 0,
        containMap: true,
        _overlays: [],
        _selectPoi: null,
		preLabel : null,
        prepareInfo: function(f) {
            var e = this.filterData();
            var c = f.index;
            this.poiList = e.poi;
			this.view_data = f;
            if (c >= 0 && c < e.poi.length) {
                var d = e.poi[c],
					html = '';

				html = So.View.template(this.tpl.map_top, {
                    index: d.icon,
                    name: f.name,
                    distance: d.fdistance,
                    address: d.address,
                    pre_class: c == 0 ? "poi-map-pre-icon-gray" : "",
                    next_class: c == e.poi.length - 1 ? "poi-map-next-icon-gray" : "",
                    clk1: c == 0 ? "" : "So.Gcmd.cmd({id:0})",
                    clk2: c == e.poi.length - 1 ? "" : "So.Gcmd.cmd({id:1})"
                })
				html += So.View.template(this.tpl.rent_map, d);
                $("#CTextDiv1").html('');
                $("#CTextDiv").html(html);
				this.bindEvent();
            }
        },
        prepareMap: function(f) {
            var d = this.filterData();
            var c = f.index;
            var _fromPoiList = f._from == 'rentList';
            var e = So.UIMap.getObj();
            if (this._overlays.length > 0) {
                e.removeOverlays(this._overlays);
                this._overlays = []
            }
            _.each(d.poi, function(j, h) {
                var label = mapObj.createLabel(j, h);
                mapObj._overlays.push(label)
            });
            e.addOverlays(this._overlays);
            
            if(!_fromPoiList){
                this._selectPoi = d.poi[c];
            }            
        },
		//设置当前label的状态，标记当前label
		setLabel : function(label){
			var content = label.getContent();
			label.setContent(content.replace(/\"rent-label\s*\"/,'"rent-label cur"'));
			label.setZIndex(2);
		},
		//重置label的状态
		resetLabel : function(label){
			var content = label.getContent();
			label.setContent(content.replace(/\s+cur/,''));
			label.setZIndex(1);
		},
        createLabel: function(info, index) {
			var curLabel = index == 0 ? ' cur' : '';
            var label = new so.maps.Label({
				position: new so.maps.LatLng(info.y,info.x),
				map: null,
				content:'<div class="rent-label' + curLabel +'">¥' + info.avg_price + '</div>',
				style:{
					borderWidth:"0"
				},
				zIndex : index === 0 ? 2 : 1,
				clickable: true
			});
			if(index == 0){
				this.preLabel = label;
			}
            var me = this;
            label.on("click", function() {
				me.resetLabel(me.preLabel);
                me.update(index, true);
				me.setLabel(this);
				me.preLabel = this;
            });
			this.labelArr.push(label);
            return label;
        },
        prepare: function(c) {
            this.param = c;
            this.prepareInfo(c);
            this.prepareMap(c);
        },
        filterData: function(){
            var data = _.extend({},this.param);
            data.poi = data.data.slice(0, 10);
            return data;
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CTextDiv").css("display", d);
            $("#CTextDiv1").css("display", d);
            So.UIMap.visible(c);
            if (c) {
                So.UIMap.hideUserLocation()
            } else {
                if (c == false && this._overlays.length > 0) {
                    mapObj.clearMap()
                }
            }
        },
        clearMap: function() {
            So.UIMap.clearMap();
            this._overlays = []
        },
        update: function(index, panto) {
            if (index < 0 || index > this.poiList.length - 1) {
                return
            }
            
		    this.param.index = index;
            this.prepareInfo(this.param);
		    this.labelIndex = index;
		    
		    var map = So.UIMap.getObj();
		    var poi = this.poiList[index];
            if (panto) {
                map.panTo(new so.maps.LatLng(poi.y, poi.x))
            }
        },
        cmd: function(c) {
            switch (c.id) {
                case 0:
                    mapObj.update(this.param.index - 1, true);
                    break;
                case 1:
                    mapObj.update(this.param.index + 1, true);
                    break;
                case 2:
					window.history.back();
					break;
            }
        },
        updateCenter: function(overlays) {
            var map = So.UIMap.getObj();
            var _selectPoi = this._selectPoi;
            overlays = _.isArray(overlays) ? overlays : [overlays];
            So.UIMap.setFitView(overlays);            
            _selectPoi && map.setCenter(new so.maps.LatLng(_selectPoi.y, _selectPoi.x))
        },
        fitMapView: function(){
            var me = this;
            setTimeout(function(){
                me._overlays && me.updateCenter(me._overlays);
            },300)
        },
        mapheight: function(d) {
            
        },
		//滑动翻页
		swipePage : function(direction){
			var preLabel = this.labelArr[this.labelIndex];
			var curIndex = direction == 'right' ? --this.labelIndex : ++this.labelIndex;
			var curLabel = this.labelArr[curIndex];
			this.resetLabel(preLabel);
			this.update(curIndex, true);
			this.setLabel(curLabel);
			this.preLabel = curLabel;
		},
		bindEvent: function(){
		    var me = this,
				hammer = Hammer(document.querySelector('#rentDiv'),{
					prevent_default: true,
					drag: false,
					transform: false,
					tap: false
				}); 	

			hammer.on('swiperight',function(evt){
				if(me.labelIndex < 1){
					return;
				}	
				me.swipePage('right');
			});
			hammer.on('swipeleft',function(evt){
				if(me.labelIndex >= me.labelArr.length - 1){
					return;
				}	
				me.swipePage('left');
			});
		},
        resize:function(d){
        }
    };

    return mapObj;
});
