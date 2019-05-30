define(function(require){

	var E = require('js/nearby_app_orders/event'),et = require('js/nearby_app_orders/config').eventType;
	var config = require('js/nearby_app_orders/config');

	return {
		init : function(){

			$('#goto-top').bind('click',function(e){
				e.stopPropagation();
			    var t = $(window).scrollTop(),b = 0,e = 100;
			    function run(){
			    	$(window).scrollTop(Math.ceil(config.easeOut(b,t,-t,e)));
			    	if(b < e){b++;setTimeout(run,10);}
			    }
			    run();
			});

			defaultAction();
			handleViewPart();
		},
		updateMediator : function(){
			config.showLoading(true);
			handleViewPart();
		}
	}
	function handleViewPart(){
		var scene = config.getQueryString('scene')||config.mainPage;

		var regex = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");

		var r = "";
		for (var i = 0; i < scene.length; i++) { 
			r = r+scene.substr(i, 1).replace(regex, ''); 
		} 
		E.fire(et.doGetInfo,{scene:r});
	}
	function defaultAction(){
		E.subscribe(et.didGotInfo,handleData);
	}
	function handleData(data){

		require.async('js/nearby_app_orders/utils/'+ data.scene +'.js',function(view){
            //视图文件不存在 容错处理;
            if(!view){
                config.alert('无此页面 - '+data.scene);
                window.history.back();
                return;
            }

			$('#container').empty();
			$(window).scrollTop(0).off('scroll').on('scroll',showTop);

            NAPP.cu = view;
            if(data.scene == "order_center_other"){
            	NAPP.cu.init(data.type,data);
            }else{
            	NAPP.cu.init(data.scene,data);
            }
			
			 config.showLoading(false);
        });
	}
	function showTop(e){
		if($(window).scrollTop() > $(window).height()/3){
			if(!$("#goto-top").hasClass('show')){
				$("#goto-top").addClass('show');
			}
		}else{
			if($("#goto-top").hasClass('show')){
				$("#goto-top").removeClass('show');
			}
		}

	}
});