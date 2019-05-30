define(function(require) {
	var config = require('js/app/conf/config');
    require('../../../app/common/swipe');
    var p = {},info;
    var a = {
        _visible: false,
        _init: false,
        tpl: {
            gowhere_sportsDetail: require('../../../templates/gowhere/gowhere-detail.html')
        },
        name: "gowhere_sportsDetail",
        logname: "gowheresportsDetailpage",
        containMap: true,
        setBodyMainHeight: false,
        prepare:function(d){
            d.wd = "活动详情";
            //console.log(d, So.GowhereService);
            if(!d.lastTime){
                if(d.result.show_time){
                    d.lastTime = d.result.show_time;
                }else{
                    d.lastTime = formateDate(d.result.start_time,d.result.end_time);
                }
            }
    		var html = So.View.template(this.tpl.gowhere_sportsDetail,d);
            $('#CTextDiv').html(html);
            updateMap(d.result.lat,d.result.lon,d.result.poi_name);
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $('#CTextDiv').css("display",d);

            $('#gowhere-swipe').Swipe({
                continuous: true,
                transitionEnd: function(index,elem){
                    if(index > ($('#gowhere-dot>div').length-1)){index = index -$('#gowhere-dot>div').length;}
                    $("#gowhere-dot>div").removeClass('active');
                    $("#gowhere-dot>div").eq(index).addClass('active');
                }
            });
            $('.swipe-dot').css('margin-left',-$('.swipe-dot').width()/2);
            $('#detail-list li div').css('width',$('#detail-list li').width()-40);
            var ih = $('.detail-banner img').height();
            if(ih > 200){
                $('.detail-banner img').css('margin-top',-(ih -200)/2);
            }
        },
        cmd:function(c){
        	switch(c.id){
        		case 44:
                if(So.GowhereService.gowhereProxy.t == "index"){
                    c.cp = So.GowhereService.gowhereProxy.p;
                    new So.Command.GowhereNearSports(c).run();
                }else if(So.GowhereService.gowhereProxy.t == "list"){
                    new So.Command.GowhereSportsDetail({
                        sid:So.GowhereService.gowhereProxy.i,
                        from:"hot"
                    }).run();
                }
        		break;
                case 666:
                resizeMap();
                break;
                case 777:
                window.open(c.url);
                break;
        	}
        }
    };
    function formateDate(t1,t2){
        if(t2-t1 <= 0){
            return '未知时段';
        }
        var dif = t2-t1;
        var t11 = tToObj(t1),t21 = tToObj(t2);
        if(dif/86400 < 1){
            if(t11.day != t21.day){
                return [t11.year,t11.month,t11.day].join('/') + ' - ' + [t21.month,t21.day].join('/');
            }else{
                return [t11.year,t11.month,t11.day].join('/') + ' ' + t11.hour + ':00'+ (t11.hour == t21.hour ? '' : ' 至 ' + t21.hour + ':00点');
            }
        }else{
            return [t11.year,t11.month,t11.day].join('/') + ' - ' + [t21.month,t21.day].join('/');
        }
        function tToObj(t){
            var d = new Date(t*1000);
            return {
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                day: d.getDate(),
                hour: d.getHours()
            }
        }
    }
    function resizeMap(){
        if($("#d-map").css('display') == 'none'){
            $("#d-map").css({
                'position':'fixed',
                'margin-top':0,
                'z-index':999,
                'top':0,'left':0,
                'height':'100%',    
                'width':$(window).width(),
                'display':'block'
            });
            info.setMap(map);
        }else{
            $("#d-map").css({
                'position':'relative',
                'margin-top':10,
                'width':$(window).width(),
                'height':140,
                'display':'none'
            });
            info.setMap(null);
        }
    }
    function updateMap(x,y,n){
        var mapOptions = {
            zoom: 17,
            __hideLogo__: true,
            __hideCopyRight__: true,
            center: new so.maps.LatLng(x,y),
            mapTypeId: so.maps.MapTypeId.ROADMAP
        };
        map = new so.maps.Map(document.getElementById('d-map'), mapOptions);
        map.on('click',function(e){resizeMap();});

        var anchor = new so.maps.Point(13, 34),
            size = new so.maps.Size(52, 68),
            origin = new so.maps.Point(0, 0),
            scaleSize = new so.maps.Size(26,34);
            icon = new so.maps.MarkerImage(
                    "img/icon.png",
                    size,
                    origin,
                    anchor,
                    scaleSize
            );
        var marker = new so.maps.Marker({map:map,position:new so.maps.LatLng(x,y),icon:icon,clickable:false});

        info = new so.maps.Label({
            position: new so.maps.LatLng(x,y),
            map: null,
            content:'<div style="position:relative;left:-50%;background-color:#fff;border:1px solid #eee;padding:5px;">'+n+'</div>',
            offset: new so.maps.Size(0,-70),
            style:{
                color:"#333333",padding:"2px",lineHeight:"1.2em",
                borderWidth:"0"
            },
            clickable:false
        });

        $("#d-map").css('display','none');
    }
    return a;
});