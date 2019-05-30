// 轻便弹窗 by xiao ma yi
;(function($){
    var ie6 = $.browser.msie&&($.browser.version == "6.0");
    //弹窗关闭插件
    $.fn.closePop=function(){
        return this.each(function(){
            $.rr.close($(this));
        })
    }
    //弹窗弹出插件
    $.fn.showPop=function(o){
		var opt = $.extend({
			scrollable:false,
            overlay:50
		},o||{});
        return this.each(function(){
            $.rr.open($(this),opt);
        })
    }
    $.rr = {
        open : function(p,opt){
            var c=opt, z=9999,
            o=$('<div></div>').css({height:'100%',width:'100%',position:'fixed',left:0,top:0,'z-index':z-1,opacity:c.overlay/100});
            p.css({'z-index':z,position:'fixed'});
            o.addClass("rrOverlay").prependTo('body');
            p.show();
            if(c.scrollable){
                p.css({position:'absolute'});
            }
            if(ie6){
                if(!c.scrollable){
                    $('html,body').css({height:'100%',width:'100%'});
                    o=o.css({position:'absolute'})[0];
                    for(var y in {Top:1,Left:1}){
                        o.style.setExpression(y.toLowerCase(),"(_=(document.documentElement.scroll"+y+" || document.body.scroll"+y+"))+'px'")
                    }
                }
            }
        },
        close : function(p){
            $(".rrOverlay").remove();
            p.hide();
        }
    }
})(jQuery)
