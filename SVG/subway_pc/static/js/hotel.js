define(function(require, exports) {
    require('js/lib/jCookie');
    var hotel = require('js/hotel/config');
    window.store = require('js/lib/store');
	//配置路由
	var autoRouter = Backbone.Router.extend({
		routes: {
			'': 'hotelList',
			'at/:module/:action(/*condition)': 'loadmodule',
			'order/': 'jumpOrder',
			'pay/': 'goToPay',
			'orderStatus/': 'orderStatus',
			'assure/': 'assure'
		},
        hotelList: function() {
            //config hotelList isDing func发送第一次请求查看该酒店是否可以预定
            //抱歉，该酒店暂时无法预定
			this.loadmodule('hotelList/index');
		},
        goToPay:function(){
            this.loadmodule('pay/index');
        },
        orderStatus:function(){
            this.loadmodule('orderStatus/index');
        },
        assure:function(){
            this.loadmodule('assure/index');
        },
        jumpOrder:function(){
            //var data = hotel.getParamObj(window.location.href);
            this.loadmodule('order/index');
        },
		//按照at/module/action(/conditions)格式的請求自動加載模塊
		loadmodule: function(md, con) {
			//将参数字符串'a:123/b:456'转换为json对象{a:123, b:456}
			var cj = con || {};
			//加载module目录下对应的模块
			require.async(['js/hotel', md].join('/'), function(cb) {
				if(cb) {
					cb(cj);
				} else {
					alert('模块加载失败！');
				}
			})
		}
	});



    window.requestAnimFrame = (function(){
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
    })();
    window.cancelAnimFrame = (function(){
        return window.cancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            window.oCancelAnimationFrame ||
            window.msCancelAnimationFrame ||
            function( callback ){
                window.clearTimeout(callback, 1000 / 60);
            };
    })();


	//定义全局变量App
	window.App = {
	    Models: {},
		Views: {},
		Collections: {},
		initialize: function() {
			new autoRouter();
	        Backbone.history.start();
	    }
	};
    window.hotel = hotel;

    _.templateSettings = {
        interpolate: /\{\{\=(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g,
        escape: /\{\{\-([\s\S]+?)\}\}/g
    };

	exports.run = App.initialize;
});