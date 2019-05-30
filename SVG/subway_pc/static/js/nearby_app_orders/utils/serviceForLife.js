define(function(require){
	var config = require('js/nearby_app_orders/config'),
	    E = require('js/nearby_app_orders/event'),
	    et = config.eventType;

	var map = config.sfl_map;

	var tpl={
		main : require('../../templates/nearby_app_orders/serviceForLife.html')
	}  

	var sl,sr;

	return {
		lefts : null,
		rights : null,
		left_data : [],
        right_data : [],
        pause : false,
        tmp_left_y:0,
        tmp_right_y:0,
		sh : $(window).height(),
		hh : config.checkUA()=='b'||config.checkUA()=='h'?40:0,
		bh : 0,
		init : function(n,d){
			d.mode = config.checkUA();

			d.lc = [];d.rc = [];
			if(map){
				for(var i in map){
					d.lc.push(map[i]['label']);
					d.rc.push({sub : map[i]['sub'], type : map[i]['label']});
				}
			}else{
				return false
			}

			config.loadTpl(tpl.main,d);

			this.handleBanner();

			this.prepData();

		},
		prep : function(){

		},
		handleResize : function(h){

			var left = $(".frame .left-frame"),
			    right = $('.frame .right-frame'),
			    ad_height = $('.cats-wrapper').height();

			if(h && ad_height){
				var bizhi = 320/94;
				this.bh = $(window).width()/bizhi;
			}else{
				this.bh = 0;
			}

			this.sh = $(window).height();

			left.height(this.sh - this.bh - this.hh);
			left.css('top',this.bh+this.hh);
			right.height(this.sh - this.bh - this.hh);
			right.css({'top':this.bh+this.hh});

			this.lefts =  $(".left-frame li");
			this.rights = $(".right-frame .item-frame");
		},
		onC : function(e){
			switch(e.action){
				case 1:
				    if(window.__HaoSouFun__ && __HaoSouFun__.goback){
				    	__HaoSouFun__.goback();
				    }else{
				    	window.history.back();
                    }
				break;

				case 3:
					// $(window).off('resize');
					// this.resetScroller(false);
					if(e.detail == '美食外卖'){
						config.getCC(function(d){
					    	window.location.href=e.url+"&mso_x="+d.lon+"&mso_y="+d.lat+"&city="+d.city_name;
					    },1,function(){
					    	window.location.href=e.url+"&city=北京市";
					    });
					}else{
						window.location.href = e.url;
					}
				break;

				case 997:
					if(config.checkUA() == 'h'&&window.didisdk){
			    		if(!window.didisdk.DiDiCallTaxi())return;
			    	}
			    	config.getCC(function(data){
		    			config.showLoading(0);
		    			e.lat = data.lat||0;
		    			e.lon = data.lon||0;
		    			e.city = data.city_name;
		    			window.location.href = e.url+"&fromlat="+e.lat+"&fromlng="+e.lon+"&city="+e.city;
		    		},true,function(){
		    			config.showLoading(0);
		    			e.lat = 0;
		    			e.lon = 0;
		    			e.city = '北京市';
		    			window.location.href = e.url+"&fromlat="+e.lat+"&fromlng="+e.lon+"&city="+e.city;
		    		});
				break;

				case 998:

				    if(e.p_id&&e.p_id!='0'){
				    	e.url?config.needAddQT(e.p_id,e.url):config.needAddQT(e.p_id);
				    }else{
				    	window.location.href = e.url;
				    }
				break;
			}
		},
		handleBanner: function(){

			var me = this;

			config.getCC(function(data){
				config.showLoading(0);
				cc = String(data.adcode);


				me.handleResize(1);
				me.prepData();
				// me.resetScroller(true);
				me.bindEvent();
			},0,function(){
				me.bindEvent();
			});
		},
		prepData: function(){
			var me = this;
			$.each(this.lefts,function(i,v){
		        me.left_data[i] = {};
		        me.left_data[i]['top'] = $(v).offset().top;
		        me.left_data[i]['type'] = $(v).text();
		        me.right_data[i] = {};
		        me.right_data[i]['type'] = $(v).text();
		    });
		    $.each(this.rights,function(i,v){
		        me.right_data[i]['top'] = $(v).offset().top;
		    });
		},
		resetScroller: function(reset){
			var me = this;
			var right_part = $(".right-frame"),
			    right_ul = $(".right-frame ul"),
			    left_li = $(".left-frame li");

			sl&&sl.destroy();
		    sr&&sr.destroy();

			if(!reset)return;

			sl = new IScroll('.frame .left-frame', {scrollX: false,scrollY: true,
                momentum: false,keyBindings: true,click:true});

	        sr = new IScroll('.frame .right-frame', {scrollX: false,scrollY: true,
                momentum: false,keyBindings: true,click:true});

	        sr.on('scrollEnd',function(e){
	        	if(me.pause)return;
	        	var tmp_y = this.y;
	        	for(var i=0,len=me.rights.length;i<len;i++){
	        		var t = me.right_data[i]['top'];
		        	if(Math.abs(tmp_y) < t-(me.bh+me.hh)+$('.item-frame').eq(i).height()&&Math.abs(tmp_y) >= t-(me.bh+me.hh)){
		        		me.lefts.removeClass('select');
	        			me.lefts.eq(i).addClass('select');
	        			var sy = me.left_data[i]['top']-me.bh-me.hh;
	        			if(sy > -sl.maxScrollY){
	        				sy = -sl.maxScrollY;
	        			}
	        			sl.scrollTo(0,-sy,200);
	        			break;
		        	}
	        	}
	        });
		},
		bindEvent : function(){
			var me = this;
			var right_part = $(".right-frame"),
			    right_ul = $(".right-frame ul"),
			    left_li = $(".left-frame li");

			// $(window).on('resize',function(e){
			// 	window.location.reload();
			// });

	        this.resetScroller(true);

		    left_li.on('click',function(e){//左侧列表按钮点击
		    	me.pause = true;
		    	var $this = $(this);
		    	if(!$this.hasClass('select')){
		    		me.lefts.removeClass('select');
		    		$this.addClass('select');
		    		var index = parseInt($this.attr('data-index')),
		    		    d = me.right_data[index]['top']-me.bh-me.hh;
		    		if(d > -sr.maxScrollY){
        				d = -sr.maxScrollY;
        			}   
		    		sr.scrollTo(0,-d);
		    	}
		    	setTimeout(function(){me.pause = false;},50);
		    });
		}
	}
});